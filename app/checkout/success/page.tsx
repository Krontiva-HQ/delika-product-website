import { Suspense } from 'react'
import ClientCheckoutSuccess from './ClientCheckoutSuccess'

// These exports prevent static generation
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payment Details</h2>
          <p className="text-gray-600">Please wait while we load your order information...</p>
        </div>
      </div>
    }>
      <ClientCheckoutSuccess />
    </Suspense>
  )
}