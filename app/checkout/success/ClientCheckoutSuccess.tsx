"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ShoppingBag, MapPin, Clock, Phone, User, Receipt, Star, Download, Share2 } from 'lucide-react'
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

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from props or URL params
        const reference = propReference || (searchParams?.get('reference') ?? null)
        const orderId = propOrderId || (searchParams?.get('orderId') ?? null)
        
        if (!reference && !orderId) {
          console.error('No reference or orderId found')
          throw new Error('No payment reference or order ID found')
        }

        // If we have a reference, verify payment
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
          const response = await fetch(`/api/orders/${orderId}`)
          if (!response.ok) {
            throw new Error('Failed to fetch order details')
          }
          const data = await response.json()
          setOrderDetails(data)
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

  const handleShare = () => {
    if (orderDetails) {
      const message = `🧾 Order Receipt #${orderDetails.id}\n\n📱 Customer: ${orderDetails.customerName}\n💰 Total: GH₵${orderDetails.totalPrice}\n📍 From: ${orderDetails.pickup[0]?.fromAddress}\n🏠 To: ${orderDetails.dropOff[0]?.toAddress}\n\n✅ Order confirmed successfully!`
      
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
          <p className="text-gray-600 mb-6">We couldn't verify your payment. Please contact support.</p>
          <Button 
            onClick={() => router.push('/shop')} 
            className="bg-red-500 hover:bg-red-600 w-full"
          >
            Return to Shop
          </Button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 text-lg">Your order has been confirmed</p>
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
              onClick={() => router.push('/restaurants')} 
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