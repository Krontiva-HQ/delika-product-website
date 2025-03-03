"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
}

export function OTPInputModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  email, 
  phone,
  authToken 
}: OTPInputModalProps) {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Verify OTP with phone number
      if (phone) {
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/verify/phoneNumber/customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone,
            otp
          })
        })

        const data = await response.json()

        if (data.success) {
          onVerify(otp)
          onClose()
        } else {
          setErrorMessage(data.message || 'Invalid OTP')
        }
      }
      
      // Verify OTP with auth token
      if (authToken) {
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/verify/email', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            otp
          })
        })

        const data = await response.json()

        if (data.success) {
          onVerify(otp)
          onClose()
        } else {
          setErrorMessage(data.message || 'Invalid OTP')
        }
      }
    } catch {
      setErrorMessage('Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Verification Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              We&apos;ve sent a verification code to {phone || email}
            </p>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 