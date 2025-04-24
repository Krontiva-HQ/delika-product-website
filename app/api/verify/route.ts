import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders } from '@/app/utils/api';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface VerificationResponse {
  success: boolean;
  message: string;
  data?: {
    verified: boolean;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get the data from the request
    const data = await request.json();
    
    // Use the API base URL from environment variables
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    
    // Determine the verification type (email or phone)
    const isPhoneVerification = data.contact && !data.type;
    
    // Construct the appropriate endpoint
    const endpoint = isPhoneVerification 
      ? `${apiBaseUrl}/auth/verify/otp/code/phoneNumber`
      : `${apiBaseUrl}/auth/verify/otp/code`;
    
    // Make the actual API call to your external API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store'
    });

    // Handle the response
    const status = response.status;
    const contentType = response.headers.get('content-type');
    
    let responseData: VerificationResponse;
    
    if (contentType?.includes('application/json')) {
      const jsonData = await response.json();
      responseData = {
        success: response.ok,
        message: jsonData.message || 'Verification completed',
        data: jsonData.data
      };
    } else {
      const text = await response.text();
      responseData = { 
        success: response.ok,
        message: text 
      };
    }
    
    return new NextResponse(JSON.stringify(responseData), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: `Internal server error: ${errorMessage}`
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