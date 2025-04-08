import { NextApiRequest, NextApiResponse } from 'next';

// Debug API to help diagnose API endpoint issues
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { endpoint, data, headers: customHeaders = {} } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }
    
    // Log the request details
    console.log('Debug API - Request details:');
    console.log('Endpoint:', endpoint);
    console.log('Data:', JSON.stringify(data));
    console.log('Headers:', JSON.stringify(customHeaders));
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    
    // Make the request to the external API with a timeout
    console.log(`Making request to ${endpoint}`);
    
    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        cache: 'no-store',
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Get response details
      const statusCode = response.status;
      const statusText = response.statusText;
      const contentType = response.headers.get('content-type');
      
      console.log('Response status:', statusCode, statusText);
      console.log('Response content-type:', contentType);
      
      // Try to parse the response
      let responseData;
      let responseText;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
          console.log('Response data:', JSON.stringify(responseData));
        } catch (parseError) {
          const text = await response.text();
          console.log('Failed to parse JSON response:', text);
          responseData = { text, parseError: true };
        }
      } else {
        responseText = await response.text();
        console.log('Response text:', responseText);
        responseData = { text: responseText };
      }
      
      // Return detailed response
      return res.status(200).json({
        success: response.ok,
        statusCode,
        statusText,
        contentType,
        data: responseData,
        originalEndpoint: endpoint
      });
    } catch (fetchError: unknown) {
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timed out for endpoint:', endpoint);
        return res.status(200).json({
          success: false,
          statusCode: 408,
          statusText: 'Request Timeout',
          contentType: null,
          data: { error: 'Request timed out' },
          originalEndpoint: endpoint
        });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Debug API error:', error);
    return res.status(200).json({ 
      success: false,
      statusCode: 500,
      statusText: 'Internal Server Error',
      data: { error: `Server error: ${error instanceof Error ? error.message : String(error)}` },
      originalEndpoint: req.body?.endpoint || 'unknown'
    });
  }
} 