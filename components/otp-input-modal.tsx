"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

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
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      let endpoint = ''
      let payload = {}
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (signupMethod === 'phone' || (!signupMethod && phone)) {
        endpoint = 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber'
        payload = {
          contact: phone,
          OTP: otp
        }
      } else if (signupMethod === 'email' || (!signupMethod && authToken)) {
        endpoint = 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        payload = { 
          contact: email,
          OTP: otp
        }
        if (authToken) {
          headers = {
            ...headers,
            'Authorization': `Bearer ${authToken}`
          }
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
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.otpValidate === 'otpFound') {
        // User data is already saved, just close the modal and notify success
        onVerify(otp)
        onClose()
      } else if (data.otpValidate === 'otpNotExist') {
        setErrorMessage('Invalid verification code. Please try again.')
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

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
    setOtp(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="otp-modal-description">
        <DialogHeader>
          <DialogTitle>Enter Verification Code</DialogTitle>
          <DialogDescription id="otp-modal-description">
            Enter the 4-digit code we sent to {phone || email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 4-digit code"
              value={otp}
              onChange={handleOTPChange}
              maxLength={4}
              className="text-center text-2xl tracking-[1em] font-mono"
              autoComplete="one-time-code"
            />
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading || otp.length !== 4}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 