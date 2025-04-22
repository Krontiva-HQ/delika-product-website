import { NextResponse } from 'next/server'
import { getBaseHeaders } from '@/app/utils/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        headers: getBaseHeaders()
      }
    )
    const data = await response.json()
    
    if (data.results?.[0]) {
      return NextResponse.json({ result: data.results[0] })
    }
    return NextResponse.json({ error: 'No results found' }, { status: 404 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 