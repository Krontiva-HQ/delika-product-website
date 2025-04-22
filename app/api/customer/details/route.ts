import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders, getClientHeaders } from '@/app/utils/api';

interface ErrorResponse {
  error: string;
  details?: unknown;
  url?: string;
  raw?: string;
  parseError?: string;
}

interface CustomerDetailsResponse {
  customerId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters if any
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');
    
    // Log all request information
    console.log('--- Customer Details API Request ---');
    console.log('Request URL:', request.url);
    console.log('Search Params:', Object.fromEntries(url.searchParams.entries()));
    console.log('Parsed customerId:', customerId);
    
    // Get the auth token from the request if it exists
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    // Use the customer details API URL from environment variables
    const customerDetailsApiUrl = process.env.CUSTOMER_DETAILS_API || process.env.NEXT_PUBLIC_CUSTOMER_DETAILS_API;
    
    if (!customerDetailsApiUrl) {
      console.error('CUSTOMER_DETAILS_API environment variable is not defined');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }
    
    // Validate customerId - allow it to be optional if the external API can handle it
    if (customerId === null || customerId === undefined) {
      console.log('No customerId provided - will attempt to call API without it');
    }
    
    // Try a different approach: modify URL construction based on API expectation
    // Some APIs expect /customer/{id} format instead of a query parameter
    let fullUrl;
    
    // Check if the API URL already has a customerId parameter or if it ends with '/'
    if (customerId && !customerDetailsApiUrl.includes('?') && !customerDetailsApiUrl.endsWith('/')) {
      // Try path-based parameter instead of query-based
      fullUrl = `${customerDetailsApiUrl}/${customerId}`;
      console.log('Using path-based parameter URL:', fullUrl);
    } else {
      // Use standard query parameter approach
      const queryParams = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
      fullUrl = `${customerDetailsApiUrl}${queryParams}`;
      console.log('Using query parameter URL:', fullUrl);
    }
    
    // Get headers with authorization
    const headers = await getClientHeaders();
    console.log('Request headers:', headers);
    
    // Make the actual API call
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    // Get more detailed error info
    const statusCode = response.status;
    const statusText = response.statusText;
    
    console.log('Response status:', statusCode, statusText);
    console.log('Response headers:', JSON.stringify(Object.fromEntries([...response.headers])));
    
    if (!response.ok) {
      let errorText: string;
      let errorJson: ErrorResponse | null = null;
      
      try {
        // Try to parse as JSON first
        errorJson = await response.clone().json();
        errorText = JSON.stringify(errorJson);
        console.error('API error response (JSON):', errorText);
      } catch {
        // If JSON parsing fails, get as text
        errorText = await response.text();
        console.error('API error response (Text):', errorText);
      }
      
      // If we got a 404 or 400 error using the path-based approach, try with query params
      if ((statusCode === 404 || statusCode === 400) && fullUrl.includes(`${customerDetailsApiUrl}/${customerId}`)) {
        console.log('Path-based approach failed, trying query parameter approach...');
        
        const queryUrl = `${customerDetailsApiUrl}?customerId=${encodeURIComponent(customerId!)}`;
        console.log('Trying fallback URL:', queryUrl);
        
        const fallbackResponse = await fetch(queryUrl, {
          method: 'GET',
          headers,
          cache: 'no-store'
        });
        
        if (fallbackResponse.ok) {
          console.log('Fallback approach succeeded!');
          try {
            const data = await fallbackResponse.json();
            return NextResponse.json(data);
          } catch (e) {
            console.error('Failed to parse fallback response:', e);
          }
        } else {
          console.log('Fallback approach also failed with status:', fallbackResponse.status);
        }
      }
      
      // If we got a 401 error, it may indicate we need authentication
      if (statusCode === 401) {
        console.error('Authentication may be required for this endpoint');
      }
      
      return NextResponse.json<ErrorResponse>(
        { 
          error: `Failed to fetch customer details: ${statusCode} ${statusText}`, 
          details: errorJson || errorText,
          url: fullUrl
        },
        { status: statusCode }
      );
    }
    
    // Try to get the successful response
    let responseData: CustomerDetailsResponse;
    let responseText: string;
    
    try {
      responseText = await response.clone().text();
      console.log('Raw response:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
      try {
        responseData = await response.json();
        console.log('Successfully parsed customer details as JSON');
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError);
        return NextResponse.json<ErrorResponse>(
          { 
            error: 'Invalid JSON response from customer details API', 
            raw: responseText,
            parseError: jsonError instanceof Error ? jsonError.message : String(jsonError)
          },
          { status: 502 }
        );
      }
    } catch (textError) {
      console.error('Failed to read response as text:', textError);
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Failed to read API response', 
          parseError: textError instanceof Error ? textError.message : String(textError)
        },
        { status: 502 }
      );
    }
    
    console.log('Successfully fetched customer details');
    return NextResponse.json<CustomerDetailsResponse>(responseData);
  } catch (error) {
    console.error('Customer details API error:', error);
    return NextResponse.json<ErrorResponse>(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get data from request body
    const data = await request.json();
    console.log('--- Customer Details POST API Request ---');
    console.log('Request body:', data);
    
    // Extract customerId from request body
    const customerId = data.customerId;
    console.log('Parsed customerId from body:', customerId);
    
    // Get the auth token from the request if it exists
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    // Use the customer details API URL from environment variables
    const customerDetailsApiUrl = process.env.CUSTOMER_DETAILS_API || process.env.NEXT_PUBLIC_CUSTOMER_DETAILS_API;
    
    if (!customerDetailsApiUrl) {
      console.error('CUSTOMER_DETAILS_API environment variable is not defined');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }
    
    // Validate customerId
    if (!customerId) {
      console.log('No customerId provided in request body');
      return NextResponse.json(
        { error: 'Missing required customerId in request body' },
        { status: 400 }
      );
    }
    
    // Get headers with authorization
    const headers = await getClientHeaders();
    console.log('Request headers:', headers);
    console.log('Sending POST to:', customerDetailsApiUrl);
    
    // Make the actual API call
    const response = await fetch(customerDetailsApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ customerId }),
      cache: 'no-store'
    });
    
    // Get more detailed error info
    const statusCode = response.status;
    const statusText = response.statusText;
    
    console.log('Response status:', statusCode, statusText);
    console.log('Response headers:', JSON.stringify(Object.fromEntries([...response.headers])));
    
    if (!response.ok) {
      let errorText: string;
      let errorJson: ErrorResponse | null = null;
      
      try {
        // Try to parse as JSON first
        errorJson = await response.clone().json();
        errorText = JSON.stringify(errorJson);
        console.error('API error response (JSON):', errorText);
      } catch {
        // If JSON parsing fails, get as text
        errorText = await response.text();
        console.error('API error response (Text):', errorText);
      }
      
      return NextResponse.json<ErrorResponse>(
        { 
          error: `Failed to fetch customer details: ${statusCode} ${statusText}`, 
          details: errorJson || errorText,
          url: customerDetailsApiUrl
        },
        { status: statusCode }
      );
    }
    
    // Try to get the successful response
    let responseData: CustomerDetailsResponse;
    let responseText: string;
    
    try {
      responseText = await response.clone().text();
      console.log('Raw response:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
      try {
        responseData = await response.json();
        console.log('Successfully parsed customer details as JSON');
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError);
        return NextResponse.json<ErrorResponse>(
          { 
            error: 'Invalid JSON response from customer details API', 
            raw: responseText,
            parseError: jsonError instanceof Error ? jsonError.message : String(jsonError)
          },
          { status: 502 }
        );
      }
    } catch (textError) {
      console.error('Failed to read response as text:', textError);
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Failed to read API response', 
          parseError: textError instanceof Error ? textError.message : String(textError)
        },
        { status: 502 }
      );
    }
    
    console.log('Successfully fetched customer details');
    return NextResponse.json<CustomerDetailsResponse>(responseData);
  } catch (error) {
    console.error('Customer details API error:', error);
    return NextResponse.json<ErrorResponse>(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 