"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OTPInputModal } from "@/components/otp-input-modal"
import { Eye, EyeOff } from "lucide-react"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"
import { PolicyAcceptanceModal } from "@/components/policy-acceptance-modal"
import { login, authRequest, AuthResponse } from "@/lib/api" // Remove OTPResponse from imports
import { UserData } from "@/types/user"
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
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [otpError, setOtpError] = useState<string>("")

  // Function to check if user has accepted policy
  const checkPolicyAcceptance = (userData: UserData) => {
    const customerTable = userData.customerTable;
    
    // Check if user has any customer records
    if (!customerTable || customerTable.length === 0) {
      return false; // No customer records, show policy modal
    }
    
    // Find the customer record that belongs to this user
    const userCustomer = customerTable.find(customer => customer.userId === userData.id);
    
    if (!userCustomer) {
      return false; // No matching customer record, show policy modal
    }
    
    // Check if this specific user has accepted the policy
    return userCustomer.privacyPolicyAccepted === true;
  };

  // Function to handle policy acceptance
  const handlePolicyAccept = async () => {
    if (!userData) return;

    // Immediately close modal and show loading
    setShowPolicyModal(false);
    
    // Update user data in localStorage immediately
    const updatedUserData = {
      ...userData,
      customerTable: userData.customerTable.map(customer => ({
        ...customer,
        privacyPolicyAccepted: true
      }))
    };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    
    // Show loading screen
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'policy-loading-overlay';
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    loadingOverlay.innerHTML = `
      <div style="text-align: center;">
        <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h3 style="margin: 0 0 10px; font-size: 18px;">Processing...</h3>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">Redirecting to vendors page</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // Redirect after brief delay for visual feedback
    setTimeout(() => {
      window.location.href = '/vendors';
    }, 1500); // 1.5 second delay
    
    // Make API call in background (don't await)
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      // Call API to update policy acceptance in background
      fetch('/api/auth/update-policy-acceptance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          authToken,
          userId: userData.id 
        }),
      }).then(response => {
        if (!response.ok) {
          console.error('Failed to update policy acceptance in background');
        }
      }).catch(error => {
        console.error('Background API call failed:', error);
      });
      
    } catch (error) {
      console.error('Failed to initiate background API call:', error);
    }
  };

  // Function to handle policy decline
  const handlePolicyDecline = () => {
    // Log out the user if they decline
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setShowPolicyModal(false);
    onClose();
    window.location.reload();
  };

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
      
      // Handle different response structures for email vs phone login
      let authToken: string;
      let phoneUserData: UserData | null = null;
      
      if (isEmailMode) {
        // Email login returns: { authToken: "...", ... }
        if (data.authToken) {
          authToken = data.authToken;
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
          authToken = userData.OTP || '';
          phoneUserData = userData;
          
          if (!authToken) {
            setError('Authentication failed. Please try again.');
            return;
          }
        } else {
          setError('Sorry, you do not have an account with this phone number as a customer.');
          return;
        }
      }
      
      if (authToken) {
        setAuthToken(authToken)
        
        if (phoneUserData) {
          // For phone login, we already have user data
          setUserData(phoneUserData)
          setOtpError("")
          setShowOTP(true)
        } else {
          // For email login, try to fetch user data
          try {
            // Use our authRequest utility function to get user data
            const userData = await authRequest<UserData>('me', {}, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authToken}`,
              }
            });
            
            // Check if user role is Customer
            if (userData.role !== 'Customer') {
              setError('Invalid credentials');
              return;
            }
            
            setUserData(userData)
            setOtpError("")
            setShowOTP(true)
          } catch (userDataError) {
            // Even if we can't fetch user data, we can still show OTP
            // since we have the auth token
            setOtpError("")
            setShowOTP(true);
          }
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
    } catch (error: any) {
      // Try to parse error response for more specific messages
      if (error && error.message) {
        const msg = error.message.toLowerCase();
        if (msg === 'auth request failed' || (msg.includes('phone') && (msg.includes('not found') || msg.includes('no user') || msg.includes('does not exist')))) {
          setError('Sorry, you do not have an account with this phone number as a customer.');
        } else if (msg.includes('not found') || msg.includes('no user') || msg.includes('account does not exist')) {
          setError('Sorry, you do not have an account with this email as a customer.');
        } else if (msg.includes('unauthorized') || msg.includes('invalid') || msg.includes('incorrect') || msg.includes('wrong password')) {
          setError('Incorrect email or password. Please try again.');
        } else if (msg.includes('403') || msg.includes('forbidden')) {
          // Handle 403 errors specifically for phone login
          if (loginMethod === 'phone') {
            setError('Sorry, you do not have an account with this phone number as a customer.');
          } else {
            setError('Sorry, you do not have an account with this email as a customer.');
          }
        } else {
          setError(error.message);
        }
      } else if (error && error.status === 403) {
        // Handle HTTP 403 status directly
        if (loginMethod === 'phone') {
          setError('Sorry, you do not have an account with this phone number as a customer.');
        } else {
          setError('Sorry, you do not have an account with this email as a customer.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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

      // Make direct API call
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
          
          // Check if user has accepted the policy
          if (!checkPolicyAcceptance(finalUserData)) {
            // Show policy acceptance modal
            setUserData(finalUserData);
            setShowPolicyModal(true);
            setShowOTP(false);
          } else {
            // User has already accepted policy, proceed with normal login
            onLoginSuccess(finalUserData);
            setShowOTP(false);
            onClose();

            // Check for cart context and trigger cart modal if needed
            const cartContext = localStorage.getItem('cartContext');
            if (cartContext) {
              try {
                const context = JSON.parse(cartContext);
                localStorage.removeItem('cartContext');
                
                // Dispatch a custom event to notify that login was successful and cart should be shown
                window.dispatchEvent(new CustomEvent('loginSuccessWithCart', { 
                  detail: context 
                }));
              } catch (error) {
                console.error('Error parsing cart context:', error);
              }
            }

            // Check for redirect URL
            const redirectUrl = localStorage.getItem('loginRedirectUrl');
            if (redirectUrl) {
              localStorage.removeItem('loginRedirectUrl');
              window.location.href = redirectUrl;
            }
          }
        }
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
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

  if (showPolicyModal) {
    return (
      <PolicyAcceptanceModal
        isOpen={showPolicyModal}
        onAccept={handlePolicyAccept}
        onDecline={handlePolicyDecline}
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