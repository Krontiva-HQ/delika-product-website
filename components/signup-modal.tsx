"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OTPInputModal } from "@/components/otp-input-modal"
import { Eye, EyeOff } from "lucide-react"
import { PolicyAcceptanceModal } from "@/components/policy-acceptance-modal"
import { authRequest, AuthResponse, OTPResponse } from "@/lib/api"
import { UserData } from "@/types/user"

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSignupSuccess?: (userData: UserData) => void;
}

export function SignupModal({ isOpen, onClose, onLoginClick, onSignupSuccess }: SignupModalProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [otpError, setOtpError] = useState<string>("")

  // Function to check if user has accepted policy
  const checkPolicyAcceptance = (userData: UserData) => {
    const customerTable = userData.customerTable;
    const policyAccepted = customerTable && customerTable.length > 0 && 
      customerTable.some(customer => customer.privacyPolicyAccepted === true);
    
    return policyAccepted;
  };

  // Function to handle policy acceptance
  const handlePolicyAccept = async () => {
    if (!userData) return;

    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      // Call API to update policy acceptance
      const response = await fetch('/api/auth/update-policy-acceptance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          authToken,
          userId: userData.id 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update policy acceptance');
      }

      // Update user data in localStorage
      const updatedUserData = {
        ...userData,
        customerTable: userData.customerTable.map(customer => ({
          ...customer,
          privacyPolicyAccepted: true
        }))
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      setShowPolicyModal(false);
      if (onSignupSuccess) {
        onSignupSuccess(updatedUserData);
      }
    } catch (error) {
      console.error('Failed to update policy acceptance:', error);
      // Still update localStorage even if API call fails
      const updatedUserData = {
        ...userData,
        customerTable: userData.customerTable.map(customer => ({
          ...customer,
          privacyPolicyAccepted: true
        }))
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setShowPolicyModal(false);
      if (onSignupSuccess) {
        onSignupSuccess(updatedUserData);
      }
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
    if (password !== confirmPassword) {
      alert("Passwords don't match")
      return
    }

    setIsLoading(true)
    try {
      const isEmailMode = e.currentTarget.getAttribute('data-mode') === 'email'
      setSignupMethod(isEmailMode ? 'email' : 'phone')

      const endpoint = isEmailMode
        ? process.env.NEXT_PUBLIC_SIGNUP_EMAIL_API
        : process.env.NEXT_PUBLIC_SIGNUP_PHONE_API

      const payload = isEmailMode
        ? { 
            email, 
            password, 
            fullName,
            role: 'Customer'
          }
        : { 
            phoneNumber: phone, 
            fullName,
            role: 'Customer'
          }

      const response = await fetch(endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.authToken) {
        setAuthToken(data.authToken)
        
        const userData = await authRequest<UserData>('me', {}, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.authToken}`,
          }
        });
        
        setUserData(userData)
        setShowOTP(true)
      } else {
        if (data.message) {
          if (
            data.message.toLowerCase().includes('invalid') ||
            data.message.toLowerCase().includes('already exists') ||
            data.message.toLowerCase().includes('not found') ||
            data.message.toLowerCase().includes('incorrect')
          ) {
            alert("Signup failed: Please check your details or use a different email/phone number.");
          } else {
            alert(data.message);
          }
        } else {
          alert("Signup failed. Please check your details and try again.");
        }
      }
    } catch (error) {
      alert("Can't sign up. Please check your details or try again later.");
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (otp: string) => {
    try {
      const endpoint = signupMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber';

      const payload = signupMethod === 'email'
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

      if (data.otpValidate === 'otpFound' && userData) {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Check if user has accepted the policy
        if (!checkPolicyAcceptance(userData)) {
          // Show policy acceptance modal
          setShowPolicyModal(true);
          setShowOTP(false);
        } else {
          // User has already accepted policy, proceed with normal signup
          if (onSignupSuccess) {
            onSignupSuccess(userData);
          }
          setShowOTP(false);
          onClose();
        }
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('Failed to verify code. Please try again.');
    }
  };

  if (showPolicyModal) {
    return (
      <PolicyAcceptanceModal
        isOpen={showPolicyModal}
        onAccept={handlePolicyAccept}
        onDecline={handlePolicyDecline}
      />
    )
  }

  if (showOTP) {
    return (
      <OTPInputModal
        isOpen={true}
        onClose={() => setShowOTP(false)}
        onVerify={handleOTPVerification}
        email={email}
        phone={phone}
        signupMethod={signupMethod}
        errorMessage={otpError}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create an account</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <form onSubmit={handleSubmit} data-mode="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
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
                    placeholder="Create a password"
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
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
                    Creating account...
                  </>
                ) : (
                  'Sign up with Email'
                )}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="phone">
            <form onSubmit={handleSubmit} data-mode="phone" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
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
                    Creating account...
                  </>
                ) : (
                  'Sign up with Phone'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <button
            onClick={onLoginClick}
            className="text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            Log in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 