import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Use the customer details API URL from environment variables
    const customerDetailsApiUrl = process.env.NEXT_PUBLIC_CUSTOMER_DETAILS_API;
    
    // Get query parameters if any
    const url = new URL(request.url);
    const queryParams = url.search;
    
    // Make the actual API call
    const response = await fetch(`${customerDetailsApiUrl}${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch customer details' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Customer details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Use the customer details API URL from environment variables
    const customerDetailsApiUrl = process.env.NEXT_PUBLIC_CUSTOMER_DETAILS_API;
    
    // Make the actual API call
    const response = await fetch(customerDetailsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to process customer details' },
        { status: response.status }
      );
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Customer details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 