import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
): Promise<NextResponse> {
  try {
    const orderId = params.orderId

    const response = await fetch(`${process.env.NEXT_PUBLIC_XANO_API_URL}/api:delika/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_XANO_AUTH_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch order')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
): Promise<NextResponse> {
  try {
    const orderId = params.orderId
    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_XANO_API_URL}/api:delika/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_XANO_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error('Failed to update order')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
} 