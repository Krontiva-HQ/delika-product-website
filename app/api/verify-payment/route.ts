import { NextResponse } from 'next/server'
import { getBaseHeaders } from '@/app/utils/api'

export async function POST(request: Request) {
  try {
    const { reference } = await request.json()

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          ...getBaseHeaders(),
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (data.status && data.data.status === 'success') {
      return NextResponse.json({ status: true, data: data.data })
    } else {
      return NextResponse.json({ status: false, message: 'Payment verification failed' })
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 