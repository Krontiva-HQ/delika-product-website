import { NextResponse } from 'next/server';


export async function POST(request, { params }) {
  try {
    // Get the path from the URL
    const path = params.path.join('/');
    
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
    
    console.log(`Making POST request to ${apiBaseUrl}/auth/${path}`);
    console.log('Request data:', JSON.stringify(data));
    console.log('With headers:', JSON.stringify(headers));
    
    // Make the actual API call to your external API
    const response = await fetch(`${apiBaseUrl}/auth/${path}`, {
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
      console.log(`Non-JSON response from ${path}:`, text);
      responseData = { message: text };
    }
    
    // Return the response with the same status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error(`Auth API error (${params.path.join('/')}):`, error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    // Get the path from the URL
    const path = params.path.join('/');
    
    // Get query parameters if any
    const url = new URL(request.url);
    const queryParams = url.search;
    
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
    
    console.log(`Making GET request to ${apiBaseUrl}/auth/${path}${queryParams}`);
    console.log('With headers:', JSON.stringify(headers));
    
    // Make the actual API call to your external API
    const response = await fetch(`${apiBaseUrl}/auth/${path}${queryParams}`, {
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
      console.log('Response data:', JSON.stringify(responseData));
    } else {
      const text = await response.text();
      console.log(`Non-JSON response from ${path}:`, text);
      responseData = { message: text };
    }
    
    // Return the response with the same status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error(`Auth API error (${params.path.join('/')}):`, error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 