import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Use the API base URL from environment variables
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    
    // Get authorization header if present
    const authHeader = request.headers.get('Authorization');
    
    // Authorization header is required for this endpoint
    if (!authHeader) {
      console.error('Authorization header missing for /me endpoint');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    };
    
    console.log(`Making request to ${apiBaseUrl}/auth/me`);
    console.log('With headers:', JSON.stringify({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [REDACTED]'
    }));
    
    // Make the actual API call to your external API
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    // Try to parse the response as JSON
    let responseData;
    const contentType = response.headers.get('content-type');
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response content-type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('Response data received');
    } else {
      const text = await response.text();
      console.log(`Non-JSON response from /me endpoint:`, text);
      responseData = { message: text };
    }
    
    // Return the response with the same status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error(`User data fetch error:`, error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 