import { NextResponse } from 'next/server'
import { getBaseHeaders } from '@/app/utils/api'

interface GooglePlacesPrediction {
  description: string
  place_id: string
  types: string[]
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ predictions: [] })
  }

  try {
    // Use Autocomplete API instead of Text Search for better predictions with types
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:gh&location=5.6037,-0.1870&radius=50000&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        headers: getBaseHeaders()
      }
    )
    const data = await response.json()
    
    if (data.status === 'OK' && data.predictions) {
      return NextResponse.json({
        predictions: data.predictions.map((prediction: GooglePlacesPrediction) => ({
          description: prediction.description,
          place_id: prediction.place_id,
          types: prediction.types || [],
          structured_formatting: prediction.structured_formatting
        }))
      })
    } else {
      return NextResponse.json({ predictions: [] })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ predictions: [] })
  }
} 