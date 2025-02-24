import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ predictions: [] })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=gh&key=${process.env.GOOGLE_MAPS_API_KEY}`
    )
    const data = await response.json()
    
    return NextResponse.json({
      predictions: data.results.map((result: any) => ({
        description: result.formatted_address,
        place_id: result.place_id
      }))
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ predictions: [] })
  }
} 