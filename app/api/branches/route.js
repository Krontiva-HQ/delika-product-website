import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Use the branches API URL from environment variables
    const branchesApiUrl = process.env.NEXT_PUBLIC_BRANCHES_API;
    
    // Make the actual API call
    const response = await fetch(branchesApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch branches' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Branches API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Use the branches API URL from environment variables
    const branchesApiUrl = process.env.NEXT_PUBLIC_BRANCHES_API;
    
    // Make the actual API call
    const response = await fetch(branchesApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to process branch data' },
        { status: response.status }
      );
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Branches API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 