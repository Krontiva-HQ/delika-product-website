"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { Dialog as ConfirmationDialog, DialogContent as ConfirmationDialogContent, DialogHeader as ConfirmationDialogHeader, DialogTitle as ConfirmationDialogTitle, DialogFooter as ConfirmationDialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PaystackModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  amount: number
  orderId: string
  customerId: string
}

export function PaystackModal({ open, onClose, onComplete, amount, orderId, customerId }: PaystackModalProps) {
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
  const [countdown, setCountdown] = useState(0)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const router = useRouter()

  // Reset all states when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setPhone("");
      setProvider("");
      setOtp("");
      setOtpError("");
      setOtpMessage("");
      setReference("");
      setVerifyError("");
      setCanVerify(true);
      setCountdown(0);
      setIsLoading(false);
      setIsVerifying(false);
    }
  }, [open]);

  const providers = [
    { value: "MTN", label: "MTN", apiValue: "mtn" },
    { value: "AirtelTigo", label: "AirtelTigo", apiValue: "atl" },
    { value: "Telecel", label: "Telecel", apiValue: "vod" },
  ]

  const handleClose = () => {
    // Show confirmation if in the middle of a payment
    if (step > 1 && !isVerifying) {
      setShowCancelConfirm(true);
    } else {
      router.back(); // Go to previous page
    }
  };

  const handleConfirm = async () => {
    if (!phone.match(/^0\d{9}$/)) return;
    if (!provider) return;

    setIsLoading(true);
    try {
      const selectedProvider = providers.find(p => p.value === provider);
      const response = await fetch(process.env.NEXT_PUBLIC_CHARGE_API || "", {
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
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const paystackResponse = await response.json();
      
      if (!paystackResponse?.result1?.response?.result?.data) {
        throw new Error('Invalid response from payment server');
      }

      const { status, display_text, reference } = paystackResponse.result1.response.result.data;
      setReference(reference || "");

      if (status === 'send_otp') {
        setStep(2);
        setOtpMessage(display_text || 'Please enter the one-time password sent to your phone');
      } else if (status === 'pay_offline') {
        setStep(3);
        setOtpMessage(display_text || 'Please complete the authorization on your mobile device');
        setCanVerify(false);
        setCountdown(15);
      } else {
        throw new Error('Unexpected payment status: ' + status);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      // Reset to initial state after error
      setStep(1);
      setIsLoading(false);
      // Optional: close modal after error
      // onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.match(/^[0-9]{6}$/)) {
      setOtpError("OTP must be 6 digits");
      return;
    }
    setOtpError("");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CHARGE_API_OTP || "https://api-server.krontiva.africa/api:uEBBwbSs/charge/api/paystack/otp"}?otp=${otp}&reference=${reference}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const verificationResponse = await response.json();

      // Use the status and code from the API response, not the HTTP response
      const apiStatus = verificationResponse?.response?.status;
      const result = verificationResponse?.response?.result;

      if (apiStatus === 200 && result?.data?.status === 'pay_offline') {
        setStep(3);
        setOtpMessage(result?.data?.display_text || 'Please complete the authorization on your mobile device');
      } else if (apiStatus === 400 && result?.code === 'invalid_otp') {
        setOtpError(result?.message || 'The OTP provided is incorrect. Please check again');
      } else {
        setOtpError("Incorrect OTP, kindly enter the right OTP");
      }
    } catch (error) {
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
        setCountdown(15);
      }
    } catch (error) {
      setVerifyError("Failed to verify payment. Please try again.");
      setCanVerify(false);
      setCountdown(15);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent 
        className="sm:max-w-md"
        style={{ 
          fontFamily: '"Rubik", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        }}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="flex flex-col items-center gap-2">
            <Image
              src="/Delika-Logo.png"
              alt="Delika Logo"
              width={80}
              height={32}
              className="h-8 w-auto"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-700 font-normal text-sm">
                  Enter your mobile money number and provider to start the payment
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="tel"
                    className="w-full border rounded-lg px-4 py-3 pr-14 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="050 000 0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="rounded-full w-6 h-6 bg-gray-100 border border-gray-200 flex items-center justify-center">
                      🇬🇭
                    </span>
                  </span>
                </div>

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

                <button
                  className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg ${
                    (!phone.match(/^0\d{9}$/) || !provider || isLoading) ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  disabled={!phone.match(/^0\d{9}$/) || !provider || isLoading}
                  onClick={handleConfirm}
                  type="button"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </div>
                  ) : (
                    `Confirm • GH₵ ${amount.toFixed(2)}`
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🔒</div>
                <p className="text-gray-700 font-medium">
                  {otpMessage}
                </p>
              </div>
              
              <div className="space-y-4">
                <input
                  className="w-full border rounded-lg px-4 py-3 text-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="------"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  maxLength={6}
                />
                
                {otpError && (
                  <div className="text-red-500 text-sm text-center">
                    {otpError}
                  </div>
                )}

                <button
                  className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg ${
                    otp.length !== 6 || isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  disabled={otp.length !== 6 || isLoading}
                  onClick={handleVerifyOtp}
                  type="button"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
              <button
                className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 text-sm"
                onClick={() => setStep(1)}
                type="button"
                disabled={isLoading}
              >
                Change Phone Number
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-gray-700 font-medium">
                  {otpMessage}
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all text-lg ${
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
                    'Verify Payment'
                  )}
                </button>

                {verifyError && (
                  <div className="text-center space-y-2">
                    <div className="text-red-500 text-sm">
                      {countdown > 0 
                        ? verifyError.replace("15 seconds", `${countdown} second${countdown !== 1 ? 's' : ''}`)
                        : verifyError
                      }
                    </div>
                    <button
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                      onClick={() => setStep(1)}
                      type="button"
                      disabled={isVerifying}
                    >
                      Try Different Number
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      {/* Confirmation Dialog for Cancel Payment */}
      <ConfirmationDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <ConfirmationDialogContent>
          <ConfirmationDialogHeader>
            <ConfirmationDialogTitle>Cancel Payment?</ConfirmationDialogTitle>
          </ConfirmationDialogHeader>
          <div className="py-4 text-center text-gray-700">
            Are you sure you want to cancel this payment? Your progress will be lost.
          </div>
          <ConfirmationDialogFooter>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
              No, go back
            </Button>
            <Button variant="destructive" onClick={() => { setShowCancelConfirm(false); router.back(); }}>
              Yes, cancel payment
            </Button>
          </ConfirmationDialogFooter>
        </ConfirmationDialogContent>
      </ConfirmationDialog>
    </Dialog>
  )
} 