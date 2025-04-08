import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the data from the request
    const data = await request.json();
    
    // Use the API base URL from environment variables
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    
    // Get authorization header if present
    const authHeader = request.headers.get('Authorization');
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    console.log(`Making OTP verification request to ${apiBaseUrl}/auth/verify/otp/code`);
    console.log('Request data:', JSON.stringify(data));
    console.log('With headers:', JSON.stringify(headers));
    
    // Make the actual API call to your external API
    const response = await fetch(`${apiBaseUrl}/auth/verify/otp/code`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    
    // Try to parse the response as JSON
    let responseData;
    const contentType = response.headers.get('content-type');
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response content-type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData));
    } else {
      const text = await response.text();
      console.log(`Non-JSON response from OTP verification:`, text);
      responseData = { message: text };
    }
    
    // Return the response with the same status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error(`OTP verification error:`, error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 