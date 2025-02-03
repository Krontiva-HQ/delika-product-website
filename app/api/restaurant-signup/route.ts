import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const response = await fetch(process.env.RESTAURANT_APPROVAL_API!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      })
      return NextResponse.json(
        { error: 'Failed to submit form', details: errorData },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 