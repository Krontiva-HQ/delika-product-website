"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Lock, UserPlus, LogIn, AlertCircle } from "lucide-react"
import { UserData } from "@/lib/api"

interface CartAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (userData: UserData) => void
  cartContext?: {
    branchId: string
    total: number
    itemCount: number
    branchLocation?: {
      latitude: string
      longitude: string
    }
  }
}

export function CartAuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  cartContext 
}: CartAuthModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Login states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [authToken, setAuthToken] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  
  // Signup states
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupFullName, setSignupFullName] = useState("")
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email')
  const [signupAuthToken, setSignupAuthToken] = useState("")
  const [signupUserData, setSignupUserData] = useState<UserData | null>(null)
  const [showSignupOTP, setShowSignupOTP] = useState(false)
  const [signupOtpError, setSignupOtpError] = useState("")

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Determine login method based on active tab
      const isEmailMode = e.currentTarget.getAttribute('data-mode') === 'email'
      setLoginMethod(isEmailMode ? 'email' : 'phone')

      let data: any;
      if (isEmailMode) {
        // Email login
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
      } else {
        // Phone login
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/login/phoneNumber/customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: phone }),
        });
        data = await response.json();
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
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              
              // Check if user role is Customer
              if (userData.role !== 'Customer') {
                setError('Invalid credentials');
                return;
              }
              
              setUserData(userData)
              setOtpError("")
              setShowOTP(true)
            } else {
              // Even if we can't fetch user data, we can still show OTP
              setOtpError("")
              setShowOTP(true);
            }
          } catch (userDataError) {
            setOtpError("")
            setShowOTP(true);
          }
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
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (otp: string) => {
    try {
      setOtpError("")
      setIsLoading(true)

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
        // Store auth token in localStorage
        localStorage.setItem('authToken', authToken);
        
        // Use userData if available, otherwise try to fetch it
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
          } catch (userDataError) {
            console.error('Failed to fetch user data:', userDataError);
          }
        }
        
        if (finalUserData) {
          localStorage.setItem('userData', JSON.stringify(finalUserData));
          
          // Store cart context for after login
          if (cartContext) {
            localStorage.setItem('cartContext', JSON.stringify(cartContext));
          }
          
          onLoginSuccess(finalUserData);
        }
        
        setShowOTP(false);
        onClose();
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const endpoint = signupMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/signup/email/customer'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/signup/phoneNumber/customer';
      
      const payload = signupMethod === 'email'
        ? {
            email: signupEmail,
            password: signupPassword,
            fullName: signupFullName
          }
        : {
            phoneNumber: signupPhone,
            fullName: signupFullName
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.authToken) {
        setSignupAuthToken(data.authToken);
        setSignupUserData(data);
        setSignupOtpError("");
        setShowSignupOTP(true);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupOTPVerification = async (otp: string) => {
    try {
      setSignupOtpError("")
      setIsLoading(true)

      const endpoint = signupMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber';
      
      const payload = signupMethod === 'email'
        ? {
            OTP: parseInt(otp),
            type: true,
            contact: signupEmail
          }
        : {
            OTP: parseInt(otp),
            contact: signupPhone
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupAuthToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.otpValidate === 'otpFound' && signupUserData) {
        localStorage.setItem('authToken', signupAuthToken);
        localStorage.setItem('userData', JSON.stringify(signupUserData));
        
        // Store cart context for after signup
        if (cartContext) {
          localStorage.setItem('cartContext', JSON.stringify(cartContext));
        }
        
        onLoginSuccess(signupUserData);
        setShowSignupOTP(false);
        onClose();
      } else {
        setSignupOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Signup OTP verification error:', error);
      setSignupOtpError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  if (showOTP) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Verify Your Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification code to your {loginMethod === 'email' ? 'email' : 'phone'}. Please enter it below.
            </p>
            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                {otpError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 4-digit code"
                maxLength={4}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length === 4) {
                    handleOTPVerification(value);
                  }
                }}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button 
              onClick={() => setShowOTP(false)} 
              variant="outline" 
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (showSignupOTP) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Verify Your Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification code to your {signupMethod === 'email' ? 'email' : 'phone'}. Please enter it below.
            </p>
            {signupOtpError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                {signupOtpError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="signup-otp">Verification Code</Label>
              <Input
                id="signup-otp"
                type="text"
                placeholder="Enter 4-digit code"
                maxLength={4}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length === 4) {
                    handleSignupOTPVerification(value);
                  }
                }}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button 
              onClick={() => setShowSignupOTP(false)} 
              variant="outline" 
              className="w-full"
            >
              Back to Signup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="w-6 h-6 text-orange-500" />
            {cartContext ? (
              <div>
                <div className="font-semibold">Complete Your Order</div>
                <div className="text-sm text-gray-500 font-normal">
                  {cartContext.itemCount} items • GH₵ {cartContext.total.toFixed(2)}
                </div>
              </div>
            ) : (
              "Access Your Cart"
            )}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Already have an account? Log in to continue with your order.
              </p>
            </div>
            
            <Tabs defaultValue="email" className="w-full" onValueChange={() => setError("")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                <form onSubmit={handleLoginSubmit} data-mode="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError("")
                      }}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="phone">
                <form onSubmit={handleLoginSubmit} data-mode="phone" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">Phone Number</Label>
                    <Input
                      id="login-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        setError("")
                      }}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending code..." : "Send Code"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                New to Delika? Create an account to start ordering.
              </p>
            </div>
            
            <Tabs defaultValue="email" className="w-full" onValueChange={() => setError("")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                <form onSubmit={handleSignupSubmit} data-mode="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupFullName}
                      onChange={(e) => {
                        setSignupFullName(e.target.value)
                        setError("")
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value)
                        setError("")
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value)
                        setError("")
                      }}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="phone">
                <form onSubmit={handleSignupSubmit} data-mode="phone" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname-phone">Full Name</Label>
                    <Input
                      id="signup-fullname-phone"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupFullName}
                      onChange={(e) => {
                        setSignupFullName(e.target.value)
                        setError("")
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupPhone}
                      onChange={(e) => {
                        setSignupPhone(e.target.value)
                        setError("")
                      }}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 