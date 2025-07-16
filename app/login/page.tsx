"use client"

import { useState } from "react"
import { OTPInputModal } from "@/components/otp-input-modal"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff } from "lucide-react"
import { login, authRequest, AuthResponse, UserData } from "@/lib/api"
import { useRouter, usePathname } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [otpError, setOtpError] = useState<string>("")

  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const isEmailMode = e.currentTarget.getAttribute('data-mode') === 'email'
      setLoginMethod(isEmailMode ? 'email' : 'phone')
      let data: AuthResponse;
      if (isEmailMode) {
        data = await login({ email, password });
      } else {
        data = await authRequest<AuthResponse>('login/phoneNumber/customer', { phoneNumber: phone });
      }
      if (data.authToken) {
        setAuthToken(data.authToken)
        try {
          const userData = await authRequest<UserData>('me', {}, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.authToken}`,
            }
          });
          setUserData(userData)
          setOtpError("")
          setShowOTP(true)
        } catch (userDataError) {
          setOtpError("")
          setShowOTP(true);
        }
      } else {
        if (data.message) {
          setError(data.message)
        } else if (isEmailMode) {
          setError("Invalid email or password")
        } else {
          setError("Invalid phone number")
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (otp: string) => {
    try {
      const endpoint = loginMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber';
      const payload = loginMethod === 'email'
        ? {
            OTP: parseInt(otp),
            type: true,
            contact: email
          }
        : {
            OTP: parseInt(otp),
            contact: phone
          };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.otpValidate === 'otpFound') {
        localStorage.setItem('authToken', authToken);
        let finalUserData = userData;
        if (!finalUserData && authToken) {
          try {
            const userResponse = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              }
            });
            if (userResponse.ok) {
              finalUserData = await userResponse.json();
            }
          } catch {}
        }
        if (finalUserData) {
          localStorage.setItem('userData', JSON.stringify(finalUserData));
        }
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
            router.push('/restaurants');
          }
        }
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to verify code. Please try again.');
    }
  };

  if (showOTP) {
    return (
      <OTPInputModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        onVerify={handleOTPVerification}
        email={loginMethod === 'email' ? email : undefined}
        phone={loginMethod === 'phone' ? phone : undefined}
        signupMethod={loginMethod}
        errorMessage={otpError}
      />
    )
  }

  if (showForgotPassword) {
    return (
      <ForgotPasswordModal
        isOpen={true}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 w-full min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-6 text-center">Login to your account</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start mb-4">
          <div className="h-5 w-5 text-red-500 mr-2">⚠️</div>
          {error}
        </div>
      )}
      <Tabs defaultValue="email" className="w-full" onValueChange={() => setError("")}> 
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <form onSubmit={handleSubmit} data-mode="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                required
                className={error ? "border-red-300 focus:ring-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  required
                  className={`pr-10 ${error ? "border-red-300 focus:ring-red-500" : ""}`}
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
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Logging in...
                </>
              ) : (
                "Login with Email"
              )}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="phone">
          <form onSubmit={handleSubmit} data-mode="phone" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setError("")
                }}
                required
                className={error ? "border-red-300 focus:ring-red-500" : ""}
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
                  Logging in...
                </>
              ) : (
                "Login with Phone"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
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