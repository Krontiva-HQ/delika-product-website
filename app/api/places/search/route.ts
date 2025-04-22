import { NextResponse } from 'next/server'
import { getBaseHeaders } from '@/app/utils/api'

interface GooglePlacesResult {
  formatted_address: string
  place_id: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ predictions: [] })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=gh&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        headers: getBaseHeaders()
      }
    )
    const data = await response.json()
    
    return NextResponse.json({
      predictions: data.results.map((result: GooglePlacesResult) => ({
        description: result.formatted_address,
        place_id: result.place_id
      }))
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ predictions: [] })
  }
} 