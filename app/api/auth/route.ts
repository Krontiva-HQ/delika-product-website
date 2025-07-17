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
      // If the response is not OK, forward the most specific error message
      if (!response.ok) {
        let errorMsg = responseData?.error || responseData?.message || response.statusText || 'Login failed';
        // User-friendly error for phone login
        if (errorMsg.toLowerCase().includes('phone') && (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no user') || errorMsg.toLowerCase().includes('does not exist'))) {
          errorMsg = 'Account with this phone number does not exist.';
        }
        if (errorMsg.toLowerCase().includes('email') && (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no user') || errorMsg.toLowerCase().includes('does not exist'))) {
          errorMsg = 'Account with this email does not exist.';
        }
        return NextResponse.json({ error: errorMsg }, { status: response.status });
      }
    } else {
      // If the response is not JSON, return the status text or response text
      const text = await response.text();
      console.log('Non-JSON response from login:', text);
      let errorMsg = text || response.statusText || 'Authentication failed';
      if (errorMsg.toLowerCase().includes('phone') && (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no user') || errorMsg.toLowerCase().includes('does not exist'))) {
        errorMsg = 'Account with this phone number does not exist.';
      }
      if (errorMsg.toLowerCase().includes('email') && (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no user') || errorMsg.toLowerCase().includes('does not exist'))) {
        errorMsg = 'Account with this email does not exist.';
      }
      return NextResponse.json(
        { error: errorMsg },
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