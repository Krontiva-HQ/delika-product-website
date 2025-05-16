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
  const reference = searchParams?.get('reference')

  // Clear delivery fee and type after successful payment
  useEffect(() => {
    localStorage.removeItem('checkoutDeliveryFee');
    localStorage.removeItem('selectedDeliveryType');
  }, []);

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
        <Button onClick={() => router.push('/shop')} className="bg-orange-500 hover:bg-orange-600 w-full">
          Return to Home
        </Button>
      </div>
    </div>
  )
}