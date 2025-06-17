import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders } from '@/app/utils/api';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    
    const response = await fetch(`${apiBaseUrl}/delika_chat`, {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store'
    });

    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }
    
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    
    // For now, return empty messages since the external API might not support GET
    // You can modify this based on your external API's actual GET endpoint
    const response = await fetch(`${apiBaseUrl}/delika_chat?session_id=${sessionId}`, {
      method: 'GET',
      headers: getBaseHeaders(),
      cache: 'no-store'
    });

    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { messages: [] }; // Default to empty messages if API doesn't support GET
    }
    
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Chat GET error:', error);
    // Return empty messages array as fallback
    return NextResponse.json({ messages: [] }, { status: 200 });
  }
} 