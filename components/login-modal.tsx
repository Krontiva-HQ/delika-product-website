"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OTPInputModal } from "@/components/otp-input-modal"
import { Eye, EyeOff } from "lucide-react"

interface UserLocation {
  lat: string;
  long: string;
}

interface DeliveryAddress {
  fromAddress: string;
  fromLatitude: string;
  fromLongitude: string;
}

interface FavoriteRestaurant {
  branchName: string;
}

interface CustomerTable {
  id: string;
  userId: string;
  created_at: number;
  deliveryAddress: DeliveryAddress;
  favoriteRestaurants: FavoriteRestaurant[];
}

interface UserData {
  id: string;
  OTP: string;
  city: string;
  role: string;
  email: string;
  image: string | null;
  Status: boolean;
  onTrip: boolean;
  address: string;
  country: string;
  Location: UserLocation;
  branchId: string | null;
  deviceId: string;
  fullName: string;
  userName: string;
  tripCount: number;
  created_at: number;
  postalCode: string;
  addressFrom: string[];
  dateOfBirth: string | null;
  phoneNumber: string;
  restaurantId: string | null;
  customerTable: CustomerTable[];
}

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
  const [authToken, setAuthToken] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("") // Clear any previous errors
    
    try {
      const isEmailMode = e.currentTarget.getAttribute('data-mode') === 'email'
      setLoginMethod(isEmailMode ? 'email' : 'phone')

      const endpoint = isEmailMode
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/auth/login'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/auth/login/phoneNumber/customer'

      const payload = isEmailMode
        ? { email, password }
        : { phoneNumber: phone }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (data.authToken) {
        setAuthToken(data.authToken)
        const userResponse = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.authToken}`,
            'Content-Type': 'application/json',
          }
        })
        const userData = await userResponse.json()
        setUserData(userData)
        setShowOTP(true)
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
      const endpoint = loginMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber'

      const payload = loginMethod === 'email'
        ? {
            OTP: parseInt(otp),
            type: true,
            contact: email
          }
        : {
            OTP: parseInt(otp),
            contact: phone
          }

      const otpResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const otpData = await otpResponse.json();

      if (otpData.otpValidate === 'otpFound' && userData) {
        // Store auth token in localStorage
        localStorage.setItem('authToken', authToken);
        
        // Store user data in localStorage and trigger a custom event
        localStorage.setItem('userData', JSON.stringify(userData));
        window.dispatchEvent(new Event('userDataUpdated'));
        
        // Call the success handler with full user data
        onLoginSuccess(userData);
        
        // Close the modal
        setShowOTP(false);
        onClose();

        // Check for redirect URL
        const redirectUrl = localStorage.getItem('loginRedirectUrl');
        if (redirectUrl) {
          localStorage.removeItem('loginRedirectUrl');
          window.location.href = redirectUrl;
        } else {
          // If no redirect URL, just reload the page
          window.location.reload();
        }
      } else {
        console.error('OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
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
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
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