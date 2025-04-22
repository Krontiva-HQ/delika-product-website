import { NextResponse } from 'next/server';
import { getBaseHeaders } from '@/app/utils/api';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Use the rider approval API URL from environment variables
    const riderApprovalApiUrl = process.env.RIDER_APPROVAL_API;
    
    // Make the actual API call
    const response = await fetch(riderApprovalApiUrl, {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to process rider approval' },
        { status: response.status }
      );
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Rider approval API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Use the rider approval API URL from environment variables
    const riderApprovalApiUrl = process.env.RIDER_APPROVAL_API;
    
    // Get query parameters if any
    const url = new URL(request.url);
    const queryParams = url.search;
    
    // Make the actual API call
    const response = await fetch(`${riderApprovalApiUrl}${queryParams}`, {
      method: 'GET',
      headers: getBaseHeaders(),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch rider approval data' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Rider approval API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 