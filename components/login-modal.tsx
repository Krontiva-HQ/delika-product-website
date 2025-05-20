"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OTPInputModal } from "@/components/otp-input-modal"
import { Eye, EyeOff } from "lucide-react"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"
import { login, authRequest, AuthResponse, UserData } from "@/lib/api" // Remove OTPResponse from imports
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: (userData: UserData) => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignup, onLoginSuccess }: LoginModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Determine login method based on active tab
      const isEmailMode = e.currentTarget.getAttribute('data-mode') === 'email'
      setLoginMethod(isEmailMode ? 'email' : 'phone')

      let data: AuthResponse;
      if (isEmailMode) {
        // Use our login utility function for email login
        data = await login({ email, password });
      } else {
        // Use our authRequest utility function for phone login
        data = await authRequest<AuthResponse>('login/phoneNumber/customer', { phoneNumber: phone });
      }
      
      if (data.authToken) {
        setAuthToken(data.authToken)
        console.log('Auth token received:', data.authToken.substring(0, 10) + '...');
        
        try {
          // Use our authRequest utility function to get user data
          console.log('Fetching user data with /me endpoint');
          const userData = await authRequest<UserData>('me', {}, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.authToken}`,
            }
          });
          
          console.log('User data received:', userData ? 'success' : 'null');
          setUserData(userData)
          setOtpError("")
          setShowOTP(true)
        } catch (userDataError) {
          console.error('Error fetching user data:', userDataError);
          // Even if we can't fetch user data, we can still show OTP
          // since we have the auth token
          setOtpError("")
          setShowOTP(true);
        }
      } else {
        // Handle specific error messages
        if (data.message) {
          setError(data.message)
        } else if (isEmailMode) {
          setError("Invalid email or password")
        } else {
          setError("Invalid phone number")
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (otp: string) => {
    try {
      console.log('Starting OTP verification process...');
      console.log('Login method:', loginMethod);
      console.log('Contact:', loginMethod === 'email' ? email : phone);
      
      // Prepare the verification payload
      const payload = {
        OTP: parseInt(otp),
        contact: loginMethod === 'email' ? email : phone
      };
      
      console.log('Verification payload:', payload);

      // Make the API call to verify OTP
      console.log('Making API call to verify OTP...');
      const endpoint = loginMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber';
      console.log('Using endpoint:', endpoint);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('OTP verification response:', data);

      if (data.otpValidate === 'otpFound') {
        console.log('OTP verification successful!');
        // Store auth token in localStorage
        localStorage.setItem('authToken', authToken);
        
        // If we don't have userData yet, try to fetch it again
        let finalUserData = userData;
        if (!finalUserData && authToken) {
          try {
            console.log('Fetching user data again after OTP verification');
            
            // Use direct fetch instead of authRequest to avoid potential issues
            const response = await fetch('/api/auth/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              }
            });
            
            if (response.ok) {
              finalUserData = await response.json();
              console.log('User data received after OTP:', finalUserData ? 'success' : 'null');
            } else {
              console.error('Failed to fetch user data:', response.status);
            }
          } catch (userDataError) {
            console.error('Error fetching user data after OTP:', userDataError);
          }
        }
        
        if (finalUserData) {
          // Store user data in localStorage and trigger a custom event
          localStorage.setItem('userData', JSON.stringify(finalUserData));
          window.dispatchEvent(new Event('userDataUpdated'));
          
          // Call the success handler with full user data
          onLoginSuccess(finalUserData);
        } else {
          // If we still don't have user data, create a minimal user object
          const minimalUserData = {
            id: 'temp-id',
            fullName: loginMethod === 'email' ? email : phone,
            email: loginMethod === 'email' ? email : '',
            phoneNumber: loginMethod === 'phone' ? phone : '',
          } as UserData;
          
          localStorage.setItem('userData', JSON.stringify(minimalUserData));
          onLoginSuccess(minimalUserData);
          console.warn('Using minimal user data as full profile could not be fetched');
        }
        
        // Close the modal
        setShowOTP(false);
        onClose();

        // Check for redirect URL
        const redirectUrl = localStorage.getItem('loginRedirectUrl');
        if (redirectUrl) {
          localStorage.removeItem('loginRedirectUrl');
          window.location.href = redirectUrl;
        }
      } else if (data.otpValidate === 'otpNotExist') {
        console.log('OTP verification failed: OTP does not exist');
        setOtpError('Invalid verification code. Please try again.');
        // Don't close the modal, let the user try again
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('An error occurred during verification. Please try again.');
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login to your account</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
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
                    setError("") // Clear error when user types
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
                      setError("") // Clear error when user types
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
                    setError("") // Clear error when user types
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
          <button
            onClick={onSwitchToSignup}
            className="text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            Sign up
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 