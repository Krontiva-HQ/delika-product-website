"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Timer, ArrowRight, RefreshCw } from "lucide-react"

interface OTPInputModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (otp: string) => void
  email?: string
  phone?: string
  authToken?: string
  signupMethod?: 'email' | 'phone'
}

export function OTPInputModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  email, 
  phone,
  authToken,
  signupMethod 
}: OTPInputModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""])
  const [activeInput, setActiveInput] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)

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
      let endpoint = ''
      let payload = {}

      if (signupMethod === 'phone' || (!signupMethod && phone)) {
        endpoint = 'https://api-server.krontiva.africa/api:uEBBwbSs/auth/login/phoneNumber/customer'
        payload = { phoneNumber: phone }
      } else {
        endpoint = 'https://api-server.krontiva.africa/api:uEBBwbSs/auth/login'
        payload = { email }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to resend OTP')

      setCountdown(30)
      setCanResend(false)
    } catch {
      setErrorMessage('Failed to resend code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOTP = [...otp]
    newOTP[index] = value
    setOtp(newOTP)

    // Auto-focus next input
    if (value && index < 3) {
      setActiveInput(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveInput(index - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 4) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      let endpoint = ''
      let payload = {}
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (signupMethod === 'phone' || (!signupMethod && phone)) {
        endpoint = 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber'
        payload = {
          contact: phone,
          OTP: parseInt(otpString)
        }
      } else if (signupMethod === 'email' || (!signupMethod && authToken)) {
        endpoint = 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        payload = { 
          contact: email,
          OTP: parseInt(otpString)
        }
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`
        }
      } else {
        throw new Error('Invalid verification method')
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.otpValidate === 'otpFound') {
        onVerify(otpString)
        onClose()
      } else if (data.otpValidate === 'otpNotExist') {
        setErrorMessage('Invalid verification code. Please try again.')
        setOtp(["", "", "", ""])
        setActiveInput(0)
      } else {
        setErrorMessage('Verification failed. Please try again.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setErrorMessage('Failed to verify code. Please try again.')
    } finally {
      setIsLoading(false)
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

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                className="w-14 h-14 text-center text-2xl font-semibold rounded-xl border-2 focus:border-orange-500 focus:ring-orange-500"
              />
            ))}
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500 text-center">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg font-medium"
              disabled={isLoading || otp.join('').length !== 4}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Verify Code
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

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
        </form>
      </DialogContent>
    </Dialog>
  )
} 