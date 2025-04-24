import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders } from '@/app/utils/api';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    
    const isPhoneVerification = data.contact && !data.type;
    const endpoint = isPhoneVerification 
      ? `${apiBaseUrl}/auth/verify/otp/code/phoneNumber`
      : `${apiBaseUrl}/auth/verify/otp/code`;
    
    const response = await fetch(endpoint, {
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
    
    return new NextResponse(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 