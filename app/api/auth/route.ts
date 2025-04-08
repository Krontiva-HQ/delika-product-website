import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Login request received with data:', JSON.stringify(data));
    
    // Use the API base URL from environment variables
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    console.log('Using API base URL:', apiBaseUrl);
    
    // Get authorization header if present
    const authHeader = request.headers.get('Authorization');
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    console.log('Making login request to external API');
    console.log('Request URL:', `${apiBaseUrl}/auth/login`);
    console.log('Request headers:', JSON.stringify(headers));
    console.log('Request body:', JSON.stringify(data));
    
    // Make the actual API call to your external API with the correct login endpoint
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    // Try to parse the response as JSON
    let responseData: any;
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData));
    } else {
      // If the response is not JSON, return the status text
      const text = await response.text();
      console.log('Non-JSON response from login:', text);
      return NextResponse.json(
        { error: response.statusText || 'Authentication failed' },
        { status: response.status }
      );
    }
    
    // Return the response with the same status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 