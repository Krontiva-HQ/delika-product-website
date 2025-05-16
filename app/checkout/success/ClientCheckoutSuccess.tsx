"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, ShoppingBag, MapPin, Clock, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

export default function ClientCheckoutSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    if (!searchParams) return;

    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) {
      toast({
        title: "Error",
        description: "Payment reference not found",
        variant: "destructive",
      })
      router.push('/')
      return
    }

    async function verifyPayment() {
      try {
        // First, verify the payment with Paystack
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        })

        const verifyData = await verifyResponse.json()

        // Correct path to payment status
        const paymentStatus = verifyData.response?.result?.data?.status;
        if (paymentStatus === 'success') {
          try {
            // Fetch all orders to find the one with matching reference
            const ordersResponse = await fetch(process.env.NEXT_PUBLIC_ORDERS_API || '', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            })

            if (!ordersResponse.ok) {
              throw new Error('Failed to fetch orders')
            }

            const ordersData = await ordersResponse.json()
            const order = ordersData.find((order: any) => 
              order.paystackReferenceCode === reference && 
              order.paymentStatus === "Paid"
            )

            if (!order) {
              throw new Error('Order not found or payment not confirmed')
            }

            setOrderDetails(order)
            setVerificationSuccess(true)
            
            // Clear cart from localStorage since order is complete
            localStorage.removeItem('cart')
            
            toast({
              title: "Payment Successful",
              description: "Your order has been confirmed and is being processed.",
              variant: "default",
            })
          } catch (error) {
            console.error('Error processing order:', error)
            throw new Error('Failed to process order')
          }
        } else {
          throw new Error(`Payment not confirmed. Status: ${paymentStatus}`)
        }
      } catch (error) {
        console.error('Error verifying payment:', error)
        toast({
          title: "Verification Error",
          description: "There was an error verifying your payment. Please contact support.",
          variant: "destructive",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, router])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  if (!verificationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">We couldn't verify your payment. Please contact our support team for assistance.</p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600">Your payment was successful and your order is being processed.</p>
        </div>
        
        {orderDetails && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-gray-900">Order Summary</h3>
              </div>
              
              <div className="space-y-3">
                {orderDetails.products?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{item.quantity}x</span>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-gray-900">GH₵ {(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">GH₵ {parseFloat(orderDetails.orderPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">GH₵ {parseFloat(orderDetails.deliveryPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-2 border-t">
                    <span>Total</span>
                    <span>GH₵ {parseFloat(orderDetails.totalPrice).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-medium text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5">
                    <MapPin className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="text-sm font-medium text-gray-900">{orderDetails.dropoffName}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(orderDetails.orderDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5">
                    <Phone className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Number</p>
                    <p className="text-sm font-medium text-gray-900">{orderDetails.customerPhoneNumber}</p>
                  </div>
                </div>

                {orderDetails.orderComment && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5">
                      <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Additional Notes</p>
                      <p className="text-sm font-medium text-gray-900">{orderDetails.orderComment}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order ID */}
            <div className="text-center text-sm text-gray-500">
              Order #: {orderDetails.orderNumber}
            </div>

            <Button 
              onClick={() => router.push('/shop')}
              className="bg-orange-500 hover:bg-orange-600 w-full"
            >
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}