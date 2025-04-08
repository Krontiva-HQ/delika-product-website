import type { NextApiRequest, NextApiResponse } from 'next';

// API route for OTP verification using Pages Router
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Pages Router OTP verification handler called');
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = req.body;
    console.log('Received data:', JSON.stringify(data));
    
    // Use the API base URL from environment variables
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-server.krontiva.africa/api:uEBBwbSs";
    console.log('Using API base URL:', apiBaseUrl);
    
    // Get authorization header if present
    const authHeader = req.headers.authorization;
    
    // Determine the verification type (email or phone)
    const isPhoneVerification = data.contact && !data.type;
    
    // Construct the appropriate endpoint
    const endpoint = isPhoneVerification 
      ? `${apiBaseUrl}/auth/verify/otp/code/phoneNumber`
      : `${apiBaseUrl}/auth/verify/otp/code`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    console.log(`Making OTP verification request to ${endpoint}`);
    console.log('Request data:', JSON.stringify(data));
    console.log('With headers:', JSON.stringify(headers));
    
    // Make the actual API call to your external API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    
    // Try to parse the response as JSON
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response content-type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData));
    } else {
      const text = await response.text();
      console.log(`Non-JSON response from OTP verification:`, text);
      responseData = { message: text };
    }
    
    // Return the response with the same status code
    return res.status(response.status).json(responseData);
  } catch (error) {
    console.error(`OTP verification error:`, error);
    return res.status(500).json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` 
    });
  }
} 