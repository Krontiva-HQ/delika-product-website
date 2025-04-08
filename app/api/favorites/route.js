import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Use the favorites API URL from environment variables
    const favoritesApiUrl = process.env.FAVORITES_API || process.env.NEXT_PUBLIC_FAVORITES_API;
    
    if (!favoritesApiUrl) {
      console.error('FAVORITES_API environment variable is not defined');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }
    
    console.log('Updating favorites at:', favoritesApiUrl);
    
    // Make the actual API call
    const response = await fetch(favoritesApiUrl, {
      method: 'PATCH', // Use PATCH since we're updating a resource
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update favorites:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to update favorites: ${response.status}` },
        { status: response.status }
      );
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// Also support PATCH method directly
export async function PATCH(request) {
  return POST(request);
} 