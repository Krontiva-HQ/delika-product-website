"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface OTPInputModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (otp: string) => void
  email: string
  phone: string
  signupMethod: 'email' | 'phone'
}

export function OTPInputModal({ isOpen, onClose, onVerify, email, phone, signupMethod }: OTPInputModalProps) {
  const [otp, setOtp] = useState(['', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [timer, setTimer] = useState(60)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isOpen, timer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    if (value.length > 1) value = value[0]

    setOtp(prev => {
      const newOtp = [...prev]
      newOtp[index] = value
      return newOtp
    })

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (!/^\d+$/.test(pastedData)) return

    const pastedArray = pastedData.slice(0, 4).split('')
    setOtp(prev => {
      const newOtp = [...prev]
      pastedArray.forEach((value, index) => {
        if (index < 4) newOtp[index] = value
      })
      return newOtp
    })
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 4) {
      setError('Please enter all 4 digits')
      return
    }

    try {
      const endpoint = signupMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber'

      const payload = signupMethod === 'email'
        ? {
            OTP: parseInt(otpString),
            type: true,
            contact: email
          }
        : {
            OTP: parseInt(otpString),
            contact: phone
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.otpValidate === 'otpFound') {
        setError('')
        onVerify(otpString)
      } else if (data.otpValidate === 'otpNotExist') {
        setError('Invalid OTP code')
      } else {
        setError('Verification failed')
      }
    } catch (error) {
      setError('Verification failed')
    }
  }

  const handleResendOTP = async () => {
    try {
      setIsResending(true)
      // Add your resend OTP API call here
      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend OTP')
      }

      setTimer(60)
      setError('')
    } catch (error) {
      setError('Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Enter Verification Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            We've sent a verification code to{' '}
            {signupMethod === 'email' ? email : phone}
          </p>
          
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl border rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                maxLength={1}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleVerify}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Verify
            </Button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend code in {timer}s
                </p>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-orange-500 hover:text-orange-600"
                >
                  {isResending ? 'Resending...' : 'Resend Code'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 