"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Timer, ArrowRight, RefreshCw } from "lucide-react"
import { login, authRequest } from "@/lib/api"

interface OTPInputModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (otp: string) => void
  email?: string
  phone?: string
  signupMethod?: 'email' | 'phone'
  errorMessage?: string
}

export function OTPInputModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  email, 
  phone,
  signupMethod,
  errorMessage: initialErrorMessage
}: OTPInputModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""])
  const [activeInput, setActiveInput] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(initialErrorMessage || null)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)

  // Update error message when prop changes
  useEffect(() => {
    if (initialErrorMessage) {
      setErrorMessage(initialErrorMessage);
    }
  }, [initialErrorMessage]);

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      setCanResend(true)
    }
    return () => clearInterval(timer)
  }, [countdown, canResend])

  const handleResendOTP = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      if (signupMethod === 'phone' || (!signupMethod && phone)) {
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/signup/phoneNumber/customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phoneNumber: phone })
        });

        if (!response.ok) {
          throw new Error('Failed to resend OTP');
        }
      } else {
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password: '' })
        });

        if (!response.ok) {
          throw new Error('Failed to resend OTP');
        }
      }

      // Reset countdown and disable resend button
      setCountdown(30)
      setCanResend(false)
      setErrorMessage('New verification code sent!')
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      setErrorMessage('Failed to resend code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = async (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOTP = [...otp]
    newOTP[index] = value
    setOtp(newOTP)

    // Auto-focus next input
    if (value && index < 3) {
      setActiveInput(index + 1)
    }

    // Only verify when all 4 digits are entered
    const otpString = newOTP.join('')
    if (otpString.length === 4 && /^\d{4}$/.test(otpString)) {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        // Pass the OTP back to the parent component for verification
        await onVerify(otpString);
      } catch (error) {
        setErrorMessage('Failed to verify code. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveInput(index - 1)
    }
  }

  useEffect(() => {
    if (activeInput >= 0 && activeInput <= 3) {
      const input = document.getElementById(`otp-input-${activeInput}`)
      if (input) {
        input.focus()
      }
    }
  }, [activeInput])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">Enter Verification Code</DialogTitle>
          <DialogDescription className="text-center">
            We sent a 4-digit code to<br />
            <span className="font-medium text-gray-900">{phone || email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                className={`w-14 h-14 text-center text-2xl font-semibold rounded-xl border-2 focus:border-orange-500 focus:ring-orange-500 ${
                  errorMessage ? 'border-red-500' : ''
                }`}
              />
            ))}
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500 text-center">
              {errorMessage}
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-500">
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Verifying...
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            {!canResend ? (
              <>
                <Timer className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">Resend code in {countdown}s</span>
              </>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="text-orange-500 hover:text-orange-600"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Code
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}