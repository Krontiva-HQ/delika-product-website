"use client"

import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface PaystackModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  amount: number
}

export function PaystackModal({ open, onClose, onComplete, amount }: PaystackModalProps) {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState("")
  const [provider, setProvider] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const router = useRouter()

  const providers = [
    { value: "MTN", label: "MTN" },
    { value: "AirtelTigo", label: "AirtelTigo" },
    { value: "Telecel", label: "Telecel" },
  ]

  const handleConfirm = () => {
    if (!phone.match(/^0\d{9}$/)) return
    if (!provider) return
    setStep(2)
  }

  const handleVerifyOtp = () => {
    if (!otp.match(/^\d{6}$/)) {
      setOtpError("OTP must be 6 digits")
      return
    }
    setOtpError("")
    setStep(3)
  }

  const handleDone = () => {
    setStep(1)
    setPhone("")
    setProvider("")
    setOtp("")
    setOtpError("")
    onComplete()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
          {step === 1 && (
            <div>
              <div className="flex flex-col items-center mb-6">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">DELIKA</span>
                <div className="text-4xl mb-2">📱</div>
                <div className="text-center font-medium text-gray-700 mb-2">
                  Enter your mobile money number and provider to start the payment
                </div>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="tel"
                    className="w-full border rounded-lg px-4 py-3 pr-14 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="050 000 0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="fi fi-gh rounded-full w-6 h-6 bg-gray-100 border border-gray-200 flex items-center justify-center">🇬🇭</span>
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <select
                  className="w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                >
                  <option value="">Choose Provider</option>
                  {providers.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <button
                className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg ${(!phone.match(/^0\d{9}$/) || !provider) ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={!phone.match(/^0\d{9}$/) || !provider}
                onClick={handleConfirm}
                type="button"
              >
                Confirm • GH₵ {amount.toFixed(2)}
              </button>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="text-4xl mb-2">🔒</div>
                <div className="text-center font-medium text-gray-700 mb-2">
                  Enter the 6-digit OTP sent to your phone
                </div>
              </div>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-3 text-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400 mb-2"
                placeholder="------"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                maxLength={6}
              />
              {otpError && <div className="text-red-500 text-sm mb-2">{otpError}</div>}
              <button
                className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg ${otp.length !== 6 ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={otp.length !== 6}
                onClick={handleVerifyOtp}
                type="button"
              >
                Verify OTP
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-center font-medium text-gray-700 mb-4">
                Check your phone to enter your momo pin.<br />
                When done, click below to complete payment.
              </div>
              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg mb-3"
                onClick={handleDone}
                type="button"
              >
                Done
              </button>
            </div>
          )}
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
            onClick={() => router.back()}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    </Dialog>
  )
} 