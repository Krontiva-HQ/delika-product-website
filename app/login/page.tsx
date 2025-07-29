"use client"

import { useState } from "react"
import { OTPInputModal } from "@/components/otp-input-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff } from "lucide-react"
import { authRequest, UserData } from "@/lib/api"
import { useRouter, usePathname } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [otpError, setOtpError] = useState<string>("")
  const [error, setError] = useState<string>("")

  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const isEmailMode = e.currentTarget.getAttribute('data-mode') === 'email'
      setLoginMethod(isEmailMode ? 'email' : 'phone')

      let data: any;
      if (isEmailMode) {
        // Email login
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password
          })
        })

        data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
      } else {
        // Phone login
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/login/phoneNumber/customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phone
          })
        })

        data = await response.json()
      }
      
      // Handle different response structures for email vs phone login
      let token: string;
      let phoneUserData: UserData | null = null;
      
      if (isEmailMode) {
        // Email login returns: { authToken: "...", ... }
        if (data.authToken) {
          token = data.authToken;
        } else {
          if (data.message) {
            setError(data.message)
          } else {
            setError("Invalid email or password")
          }
          return;
        }
      } else {
        // Phone login returns: [{ id: "...", OTP: "token...", role: "Customer", ... }]
        if (Array.isArray(data) && data.length > 0) {
          const userData = data[0] as UserData;
          
          // Check if user role is Customer
          if (userData.role !== 'Customer') {
            setError('Invalid credentials');
            return;
          }
          
          // Extract token from OTP field
          token = userData.OTP || '';
          phoneUserData = userData;
          
          if (!token) {
            setError('Authentication failed. Please try again.');
            return;
          }
        } else {
          setError('Sorry, you do not have an account with this phone number as a customer.');
          return;
        }
      }
      
      if (token) {
        setAuthToken(token)
        
        if (phoneUserData) {
          // For phone login, we already have user data
          setUserData(phoneUserData)
          setOtpError("")
          setShowOTP(true)
        } else {
          // For email login, try to fetch user data
          try {
            const userResponse = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            })
            
            if (userResponse.ok) {
              const userData = await userResponse.json()
              setUserData(userData)
              setOtpError("")
              setShowOTP(true)
            } else {
              setError('Failed to fetch user data. Please try again.');
            }
          } catch (error) {
            setError('Failed to fetch user data. Please try again.');
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (otp: string) => {
    try {
      setOtpError("")
      setIsLoading(true)

      let endpoint: string;
      let payload: any;

      if (loginMethod === 'email') {
        endpoint = 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code';
        payload = {
          OTP: parseInt(otp),
          type: true,
          contact: email
        };
      } else {
        endpoint = 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber';
        payload = {
          OTP: parseInt(otp),
          contact: phone
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.otpValidate === 'otpFound' && userData) {
        // Store authentication data
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setShowOTP(false);
        
        // Redirect logic
        const redirectUrl = localStorage.getItem('loginRedirectUrl');
        if (redirectUrl) {
          localStorage.removeItem('loginRedirectUrl');
          window.location.href = redirectUrl;
        } else {
          if (pathname.startsWith('/checkout')) {
            window.location.reload();
          } else {
            router.push('/vendors');
          }
        }
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false)
    }
  };

  if (showOTP) {
    return (
      <OTPInputModal
        isOpen={true}
        onClose={() => setShowOTP(false)}
        onVerify={handleOTPVerification}
        email={email}
        phone={phone}
        signupMethod={loginMethod}
        errorMessage={otpError}
      />
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 w-full min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome back</h1>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <form onSubmit={handleSubmit} data-mode="email" className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Signing in...
                </>
              ) : (
                'Sign in with Email'
              )}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="phone">
          <form onSubmit={handleSubmit} data-mode="phone" className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Signing in...
                </>
              ) : (
                'Sign in with Phone'
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">Don't have an account? </span>
        <a
          href="/signup"
          className="text-sm font-medium text-orange-500 hover:text-orange-600"
        >
          Sign up
        </a>
      </div>
    </div>
  )
} 