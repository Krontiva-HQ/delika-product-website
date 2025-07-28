"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ShoppingBag, MapPin, Clock, Phone, User, Receipt, Star, Download, Share2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface OrderDetails {
  id: string
  customerName: string
  orderNumber: string
  customerPhoneNumber: string
  totalPrice: string
  orderPrice: string
  deliveryPrice: string
  delikaBalance?: boolean // Added for wallet payment detection
  walletUsed?: boolean // Added for wallet payment detection
  delikaBalanceAmount?: number // Added for wallet payment amount
  paymentStatus?: string // Added for payment status verification
  products: Array<{
    name: string
    price: string
    quantity: string
  }>
  dropOff: Array<{
    toAddress: string
  }>
  pickup: Array<{
    fromAddress: string
  }>
  orderDate: string
  orderReceivedTime: number
}

interface PaymentVerificationResponse {
  paymentVerification: OrderDetails | "unsuccessful"
}

interface ClientCheckoutSuccessProps {
  reference?: string
  orderId?: string
}

export default function ClientCheckoutSuccess({ reference: propReference, orderId: propOrderId }: ClientCheckoutSuccessProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [verificationError, setVerificationError] = useState(false)
  const [isWalletPayment, setIsWalletPayment] = useState(false)
  const [reverifying, setReverifying] = useState(false)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from props or URL params
        const reference = propReference || (searchParams?.get('reference') ?? null)
        const orderId = propOrderId || (searchParams?.get('orderId') ?? null)
        const walletPaid = searchParams?.get('walletPaid') === 'true'
        
        if (!reference && !orderId) {
          console.error('No reference or orderId found')
          throw new Error('No payment reference or order ID found')
        }

        // Check if this was a wallet payment (fully paid by Delika balance)
        if (walletPaid) {
          console.log('💰 Processing wallet payment success');
          console.log('[Success Page] Wallet payment details:', {
            walletPaid,
            orderId,
            reference
          });
          setIsWalletPayment(true);
          
          // For wallet payments, we need to fetch the order details from the backend
          // since there's no walletPaymentResponse in localStorage
          if (orderId) {
            try {
              // First, we need to get the orderNumber from the backend response
              // Check if we have the order submission response in localStorage
              const orderSubmissionData = localStorage.getItem('orderSubmissionResponse');
              let orderNumber = null;
              
              if (orderSubmissionData) {
                try {
                  const { response } = JSON.parse(orderSubmissionData);
                  console.log('[Success Page] Full order submission response:', response);
                  
                  // For restaurant orders: { result1: { id: "...", orderNumber: "..." } }
                  // For pharmacy/grocery orders: { id: "...", orderNumber: "..." }
                  orderNumber = response?.result1?.orderNumber || response?.orderNumber;
                  console.log('[Success Page] Extracted orderNumber from localStorage:', orderNumber);
                  console.log('[Success Page] Response structure:', {
                    hasResult1: !!response?.result1,
                    result1OrderNumber: response?.result1?.orderNumber,
                    directOrderNumber: response?.orderNumber,
                    finalOrderNumber: orderNumber
                  });
                } catch (error) {
                  console.error('Error parsing order submission data:', error);
                }
              }
              
              // If we don't have orderNumber, try using orderId as fallback
              if (!orderNumber) {
                orderNumber = orderId;
                console.log('[Success Page] Using orderId as fallback for orderNumber:', orderNumber);
              }
              
              console.log('[Success Page] Final orderNumber being used for API call:', orderNumber);
              console.log('[Success Page] API endpoint:', `${process.env.NEXT_PUBLIC_ORDER_STATUS_API}?orderNumber=${orderNumber}`);
              
              // Use the same API endpoint as the order status widget, but pass orderNumber as query parameter
              const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_STATUS_API}?orderNumber=${orderNumber}`)
              if (!response.ok) {
                throw new Error('Failed to fetch order details')
              }
              const data = await response.json()
              
              // Verify payment status for wallet payments
              console.log('[Success Page] Wallet payment order details:', data);
              console.log('[Success Page] Payment status:', data.paymentStatus);
              
              // Only show receipt if payment status is confirmed as "paid"
              if (data.paymentStatus?.toLowerCase() === 'paid') {
                setOrderDetails(data)
                
                // Store order number for tracking
                if (data.orderNumber) {
                  localStorage.setItem('activeOrderNumber', data.orderNumber.toString())
                  localStorage.setItem('lastOrderDetails', JSON.stringify(data))
                }
                console.log('[Success Page] ✅ Wallet payment verified - showing receipt');
              } else {
                console.log('[Success Page] ❌ Wallet payment not confirmed - payment status:', data.paymentStatus);
                setVerificationError(true)
                toast({
                  title: "Payment Verification Failed",
                  description: "Your wallet payment could not be verified. Please contact support.",
                  variant: "destructive"
                })
                // Redirect to shop page after a delay
                setTimeout(() => {
                  router.push('/shop')
                }, 3000)
                return;
              }
              return;
            } catch (error) {
              console.error('Error fetching order details for wallet payment:', error)
              throw new Error('Failed to fetch wallet payment order details')
            }
          } else {
            throw new Error('No orderId provided for wallet payment')
          }
        }

        // If we have a reference, verify payment (this is for Paystack payments)
        if (reference) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_VERIFY_ORDER_PAYMENT_API}?reference=${reference}`)
          if (!response.ok) {
            throw new Error('Failed to verify payment')
          }

          const data: PaymentVerificationResponse = await response.json()
          
          if (data.paymentVerification === "unsuccessful") {
            setVerificationError(true)
            toast({
              title: "Payment Verification Failed",
              description: "The payment could not be verified. Please contact support.",
              variant: "destructive"
            })
            // Redirect to shop page after a delay
            setTimeout(() => {
              router.push('/shop')
            }, 3000)
          } else {
            setOrderDetails(data.paymentVerification)
             // Store order number for tracking
            if (data.paymentVerification.orderNumber) {
              localStorage.setItem('activeOrderNumber', data.paymentVerification.orderNumber.toString())
              // Also store the full order details
              localStorage.setItem('lastOrderDetails', JSON.stringify(data.paymentVerification))
            }
          }
        } 
        // If we have an orderId, fetch order details
        else if (orderId) {
          // First, we need to get the orderNumber from the backend response
          // Check if we have the order submission response in localStorage
          const orderSubmissionData = localStorage.getItem('orderSubmissionResponse');
          let orderNumber = null;
          
          if (orderSubmissionData) {
            try {
              const { response } = JSON.parse(orderSubmissionData);
              console.log('[Success Page] Full order submission response (fallback):', response);
              
              // For restaurant orders: { result1: { id: "...", orderNumber: "..." } }
              // For pharmacy/grocery orders: { id: "...", orderNumber: "..." }
              orderNumber = response?.result1?.orderNumber || response?.orderNumber;
              console.log('[Success Page] Extracted orderNumber from localStorage (fallback):', orderNumber);
              console.log('[Success Page] Response structure (fallback):', {
                hasResult1: !!response?.result1,
                result1OrderNumber: response?.result1?.orderNumber,
                directOrderNumber: response?.orderNumber,
                finalOrderNumber: orderNumber
              });
            } catch (error) {
              console.error('Error parsing order submission data:', error);
            }
          }
          
          // If we don't have orderNumber, try using orderId as fallback
          if (!orderNumber) {
            orderNumber = orderId;
            console.log('[Success Page] Using orderId as fallback for orderNumber (fallback):', orderNumber);
          }
          
          console.log('[Success Page] Final orderNumber being used for API call (fallback):', orderNumber);
          console.log('[Success Page] API endpoint (fallback):', `${process.env.NEXT_PUBLIC_ORDER_STATUS_API}?orderNumber=${orderNumber}`);
          
          // Use the same API endpoint as the order status widget, but pass orderNumber as query parameter
          const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_STATUS_API}?orderNumber=${orderNumber}`)
          if (!response.ok) {
            throw new Error('Failed to fetch order details')
          }
          const data = await response.json()
          
          // Check if this was a wallet payment based on order details
          if (data.delikaBalance === true || data.walletUsed === true) {
            setIsWalletPayment(true);
            console.log('[Success Page] Detected wallet payment from order details');
            
            // Verify payment status for wallet payments
            console.log('[Success Page] Wallet payment order details:', data);
            console.log('[Success Page] Payment status:', data.paymentStatus);
            
            // Only show receipt if payment status is confirmed as "paid"
            if (data.paymentStatus?.toLowerCase() === 'paid') {
              setOrderDetails(data)
              console.log('[Success Page] ✅ Wallet payment verified - showing receipt');
            } else {
              console.log('[Success Page] ❌ Wallet payment not confirmed - payment status:', data.paymentStatus);
              setVerificationError(true)
              toast({
                title: "Payment Verification Failed",
                description: "Your wallet payment could not be verified. Please contact support.",
                variant: "destructive"
              })
              // Redirect to shop page after a delay
              setTimeout(() => {
                router.push('/shop')
              }, 3000)
              return;
            }
          } else {
            // For non-wallet payments, show order details regardless of payment status
            setOrderDetails(data)
          }
        }
      } catch (error) {
        console.error('Error:', error)
        setVerificationError(true)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [propReference, propOrderId, searchParams, router])

  const handleReverifyPayment = async () => {
    setReverifying(true)
    setVerificationError(false)
    
    try {
      // Get reference from props or URL params
      const reference = propReference || (searchParams?.get('reference') ?? null)
      const orderId = propOrderId || (searchParams?.get('orderId') ?? null)
      const walletPaid = searchParams?.get('walletPaid') === 'true'
      
      if (!reference && !orderId) {
        throw new Error('No payment reference or order ID found')
      }

      // Check if this was a wallet payment
      if (walletPaid) {
        console.log('💰 Re-verifying wallet payment...');
        
        if (orderId) {
          // Get orderNumber from localStorage or use orderId as fallback
          const orderSubmissionData = localStorage.getItem('orderSubmissionResponse');
          let orderNumber = null;
          
          if (orderSubmissionData) {
            try {
              const { response } = JSON.parse(orderSubmissionData);
              orderNumber = response?.result1?.orderNumber || response?.orderNumber;
            } catch (error) {
              console.error('Error parsing order submission data:', error);
            }
          }
          
          if (!orderNumber) {
            orderNumber = orderId;
          }
          
          // Re-verify using the order status API
          const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_STATUS_API}?orderNumber=${orderNumber}`)
          if (!response.ok) {
            throw new Error('Failed to fetch order details')
          }
          const data = await response.json()
          
          // Check payment status
          if (data.paymentStatus?.toLowerCase() === 'paid') {
            setOrderDetails(data)
            setIsWalletPayment(true)
            
            // Store order number for tracking
            if (data.orderNumber) {
              localStorage.setItem('activeOrderNumber', data.orderNumber.toString())
              localStorage.setItem('lastOrderDetails', JSON.stringify(data))
            }
            
            toast({
              title: "Payment Verified!",
              description: "Your payment has been successfully verified.",
            })
          } else {
            throw new Error('Payment not confirmed')
          }
        } else {
          throw new Error('No orderId provided for wallet payment')
        }
      } else if (reference) {
        // Re-verify Paystack payment
        const response = await fetch(`${process.env.NEXT_PUBLIC_VERIFY_ORDER_PAYMENT_API}?reference=${reference}`)
        if (!response.ok) {
          throw new Error('Failed to verify payment')
        }

        const data: PaymentVerificationResponse = await response.json()
        
        if (data.paymentVerification === "unsuccessful") {
          throw new Error('Payment verification unsuccessful')
        } else {
          setOrderDetails(data.paymentVerification)
          setIsWalletPayment(false)
          
          // Store order number for tracking
          if (data.paymentVerification.orderNumber) {
            localStorage.setItem('activeOrderNumber', data.paymentVerification.orderNumber.toString())
            localStorage.setItem('lastOrderDetails', JSON.stringify(data.paymentVerification))
          }
          
          toast({
            title: "Payment Verified!",
            description: "Your payment has been successfully verified.",
          })
        }
      } else if (orderId) {
        // Re-verify using orderId
        const orderSubmissionData = localStorage.getItem('orderSubmissionResponse');
        let orderNumber = null;
        
        if (orderSubmissionData) {
          try {
            const { response } = JSON.parse(orderSubmissionData);
            orderNumber = response?.result1?.orderNumber || response?.orderNumber;
          } catch (error) {
            console.error('Error parsing order submission data:', error);
          }
        }
        
        if (!orderNumber) {
          orderNumber = orderId;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_STATUS_API}?orderNumber=${orderNumber}`)
        if (!response.ok) {
          throw new Error('Failed to fetch order details')
        }
        const data = await response.json()
        
        // Check if this was a wallet payment
        if (data.delikaBalance === true || data.walletUsed === true) {
          setIsWalletPayment(true);
          
          if (data.paymentStatus?.toLowerCase() === 'paid') {
            setOrderDetails(data)
            toast({
              title: "Payment Verified!",
              description: "Your wallet payment has been successfully verified.",
            })
          } else {
            throw new Error('Wallet payment not confirmed')
          }
        } else {
          setOrderDetails(data)
          setIsWalletPayment(false)
          toast({
            title: "Order Retrieved!",
            description: "Your order details have been retrieved successfully.",
          })
        }
      }
    } catch (error) {
      console.error('Re-verification error:', error)
      setVerificationError(true)
      toast({
        title: "Verification Failed",
        description: "Payment verification failed again. Please contact support.",
        variant: "destructive"
      })
    } finally {
      setReverifying(false)
    }
  }

  const handleShare = () => {
    if (orderDetails) {
      const paymentMethod = isWalletPayment ? 'Delika Balance' : 'Mobile Money';
      const message = `🧾 Order Receipt #${orderDetails.id}\n\n📱 Customer: ${orderDetails.customerName}\n💰 Total: GH₵${orderDetails.totalPrice}\n💳 Payment: ${paymentMethod}\n📍 From: ${orderDetails.pickup[0]?.fromAddress}\n🏠 To: ${orderDetails.dropOff[0]?.toAddress}\n\n✅ Order confirmed successfully!`
      
      if (navigator.share) {
        navigator.share({
          title: 'Order Receipt',
          text: message
        })
      } else {
        navigator.clipboard.writeText(message)
        toast({
          title: "Receipt copied!",
          description: "Order details copied to clipboard",
        })
      }
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-orange-50 to-orange-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-orange-100">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    )
  }

  if (verificationError || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Receipt className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">We couldn't verify your payment. You can try reverifying or contact support.</p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleReverifyPayment}
              disabled={reverifying}
              className="bg-orange-500 hover:bg-orange-600 w-full"
            >
              {reverifying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Re-verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Re-verify Payment
                </span>
              )}
            </Button>
            
            <Button 
              onClick={() => router.push('/shop')} 
              variant="outline"
              className="border-red-200 hover:bg-red-50 w-full"
            >
              Return to Shop
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-50 to-orange-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header with success animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-24 h-24 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Check className="h-12 w-12 text-white animate-bounce" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isWalletPayment ? 'Order Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isWalletPayment 
              ? 'Your order has been paid using your Delika balance' 
              : 'Your order has been confirmed'
            }
          </p>
          {isWalletPayment && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Paid with Delika Balance</span>
            </div>
          )}
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/Delika-Logo.png"
                  alt="Delika Logo"
                  width={120}
                  height={48}
                  className="h-12 w-auto brightness-0 invert"
                />
              </div>
              <div className="text-right">
                <Receipt className="h-8 w-8 ml-auto mb-1" />
                <p className="text-sm opacity-90">Digital Receipt</p>
                {isWalletPayment && (
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Wallet className="h-3 w-3" />
                    <span className="text-xs opacity-90">Wallet Payment</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm opacity-90">Order #</p>
                <p className="font-mono text-lg font-semibold">{orderDetails.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total Amount</p>
                <p className="text-2xl font-bold">GH₵{orderDetails.totalPrice}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Customer Information</h3>
                <p className="text-gray-700 font-medium">{orderDetails.customerName}</p>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {orderDetails.customerPhoneNumber}
                </p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-2xl">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">From</p>
                      <p className="text-gray-700 font-medium">{orderDetails.pickup[0]?.fromAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">To</p>
                      <p className="text-gray-700 font-medium">{orderDetails.dropOff[0]?.toAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                Order Items
              </h3>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {orderDetails.products.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × GH₵{item.price}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      GH₵{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-orange-50 rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">GH₵{orderDetails.orderPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">GH₵{orderDetails.deliveryPrice}</span>
                </div>
                <div className="border-t border-orange-200 pt-2 flex justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-lg text-orange-600">GH₵{orderDetails.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Order Time</h3>
                <p className="text-gray-700">{formatDate(orderDetails.orderDate)}</p>
                <p className="text-gray-600 text-sm">{formatTime(orderDetails.orderReceivedTime)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 space-y-3">
            <div className="flex gap-3">
              <Button 
                onClick={handleShare}
                variant="outline"
                className="flex-1 border-orange-200 hover:bg-orange-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Receipt
              </Button>
              <Button 
                onClick={() => window.print()}
                variant="outline"
                className="flex-1 border-orange-200 hover:bg-orange-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Print/Save
              </Button>
            </div>
            <Button 
                              onClick={() => router.push('/vendors')} 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12 text-lg font-semibold shadow-lg"
            >
              Back to Restaurants
            </Button>
          </div>
        </div>

        {/* Customer Service Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border border-yellow-200">
            <Star className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-gray-600">
              Thank you for choosing Delika! Rate your experience
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}