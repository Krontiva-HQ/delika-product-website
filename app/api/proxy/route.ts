import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders } from '@/app/utils/api';

export async function POST(request: NextRequest) {
  try {
    const { endpoint, data, method = 'POST', headers = {} } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        ...getBaseHeaders(),
        ...headers,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getBaseHeaders(),
    });

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 