"use client"

import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface PaystackModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  amount: number
  orderId: string
  customerId: string
}

export function PaystackModal({ open, onClose, onComplete, amount, orderId, customerId }: PaystackModalProps) {
  console.log('PaystackModal received orderId:', orderId);
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState("")
  const [provider, setProvider] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpMessage, setOtpMessage] = useState("")
  const [reference, setReference] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState("")
  const [canVerify, setCanVerify] = useState(true)
  const router = useRouter()

  const providers = [
    { value: "MTN", label: "MTN", apiValue: "mtn" },
    { value: "AirtelTigo", label: "AirtelTigo", apiValue: "atl" },
    { value: "Telecel", label: "Telecel", apiValue: "vod" },
  ]

  const handleConfirm = async () => {
    console.log('Paystack amount received:', amount);
    if (!phone.match(/^0\d{9}$/)) return
    if (!provider) return

    setIsLoading(true)
    try {
      const selectedProvider = providers.find(p => p.value === provider)
      const response = await fetch(process.env.NEXT_PUBLIC_CHARGE_API || "https://api-server.krontiva.africa/api:uEBBwbSs/charge/api/paystack", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          mobile_money: {
            phone: phone,
            provider: selectedProvider?.apiValue || ""
          },
          customerId: customerId,
          orderId: orderId,
        }),
      })

      const paystackResponse = await response.clone().json().catch(() => null);
      console.log('Paystack response (handleConfirm):', paystackResponse);

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      // Handle different response statuses
      const paymentStatus = paystackResponse?.result1?.response?.result?.data?.status;
      const displayText = paystackResponse?.result1?.response?.result?.data?.display_text;
      const paymentReference = paystackResponse?.result1?.response?.result?.data?.reference;
      setReference(paymentReference || "");

      if (paymentStatus === 'send_otp') {
        setStep(2);
        setOtpMessage(displayText || 'Please enter the one-time password sent to your phone');
      } else if (paymentStatus === 'pay_offline') {
        setStep(3);
        setOtpMessage(displayText || 'Please complete the authorization on your mobile device');
        // Enable verification after 15 seconds
        setCanVerify(false);
        setTimeout(() => setCanVerify(true), 15000);
      } else {
        throw new Error('Unexpected payment status');
      }

    } catch (error) {
      console.error('Payment initialization error:', error)
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.match(/^\d{6}$/)) {
      setOtpError("OTP must be 6 digits");
      return;
    }
    setOtpError("");
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_CHARGE_API_OTP || 
          "https://api-server.krontiva.africa/api:uEBBwbSs/charge/api/paystack/otp"
        }?otp=${otp}&reference=${reference}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const verificationResponse = await response.json();
      console.log('OTP verification response:', verificationResponse);

      if (!response.ok) {
        setOtpError("Incorrect OTP, please try again");
        return;
      }

      // Handle verification response
      const verificationStatus = verificationResponse?.result1?.response?.result?.data?.status;
      const verificationMessage = verificationResponse?.result1?.response?.result?.data?.display_text;

      if (verificationStatus === 'pay_offline') {
        setStep(3);
        setOtpMessage(verificationMessage || 'Please complete the authorization on your mobile device');
      } else if (verificationStatus === 'success') {
        setStep(3);
        setOtpMessage('Payment successful!');
      } else {
        setOtpError("Incorrect OTP, kindly enter the right OTP");
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError("Failed to verify OTP, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = async () => {
    setIsVerifying(true);
    setVerifyError("");

    try {
      // Call your backend API that proxies Paystack's verify endpoint
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_CHARGE_API_VERIFY || 
          "https://api-server.krontiva.africa/api:uEBBwbSs/charge/api/verify/payment"
        }?reference=${reference}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const verifyData = await response.json();
      // Adjust this path to match your actual response structure
      const paymentStatus = verifyData.response?.result?.data?.status;

      if (paymentStatus === 'success') {
        // Navigate to the success page
        router.push(`/checkout/success?reference=${reference}`);
        onComplete();
        onClose();
      } else {
        setVerifyError("Payment not confirmed yet. Please try again in 15 seconds.");
        setCanVerify(false);
        setTimeout(() => {
          setCanVerify(true);
          setVerifyError("");
        }, 15000);
      }
    } catch (error) {
      setVerifyError("Failed to verify payment. Please try again.");
      setCanVerify(false);
      setTimeout(() => setCanVerify(true), 15000);
    } finally {
      setIsVerifying(false);
    }
  };

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
                className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg ${(!phone.match(/^0\d{9}$/) || !provider || isLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={!phone.match(/^0\d{9}$/) || !provider || isLoading}
                onClick={handleConfirm}
                type="button"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Confirm • GH₵ ${amount.toFixed(2)}`
                )}
              </button>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="text-4xl mb-2">🔒</div>
                <div className="text-center font-medium text-gray-700 mb-2">
                  {otpMessage}
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
                className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg ${otp.length !== 6 || isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={otp.length !== 6 || isLoading}
                onClick={handleVerifyOtp}
                type="button"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">📱</div>
              <div className="text-center font-medium text-gray-700 mb-4">
                {otpMessage}
              </div>
              <button
                className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg mb-3 ${
                  !canVerify ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleDone}
                disabled={!canVerify || isVerifying}
                type="button"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </div>
                ) : (
                  'Payment Completed'
                )}
              </button>
              {verifyError && (
                <div className="text-red-500 text-sm text-center">
                  {verifyError}
                </div>
              )}
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