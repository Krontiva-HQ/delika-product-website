import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders } from '@/app/utils/api';

interface OTPVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    userId?: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  console.log('App Router OTP verification handler called');
  try {
    // Get the data from the request
    const data = await request.json();
    console.log('Received data:', JSON.stringify(data));
    
    // Use the API base URL from environment variables
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    console.log('Using API base URL:', apiBaseUrl);
    
    // Determine the verification type (email or phone)
    const isPhoneVerification = data.contact && !data.type;
    
    // Construct the appropriate endpoint
    const endpoint = isPhoneVerification 
      ? `${apiBaseUrl}/auth/verify/otp/code/phoneNumber`
      : `${apiBaseUrl}/auth/verify/otp/code`;
    
    console.log(`Making OTP verification request to ${endpoint}`);
    console.log('Request data:', JSON.stringify(data));
    
    // Make the actual API call to your external API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    
    // Try to parse the response as JSON
    let responseData: OTPVerificationResponse;
    const contentType = response.headers.get('content-type');
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response content-type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData));
    } else {
      const text = await response.text();
      console.log(`Non-JSON response from OTP verification:`, text);
      responseData = { 
        success: response.ok,
        message: text 
      };
    }
    
    // Return the response with the same status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error(`OTP verification error:`, error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 