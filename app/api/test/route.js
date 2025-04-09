import { NextResponse } from 'next/server';

export async function GET(_request) {
  try {
    // Check if environment variables are defined
    const envVars = {
      BRANCHES_API: process.env.BRANCHES_API,
      CUSTOMER_DETAILS_API: process.env.CUSTOMER_DETAILS_API,
      FAVORITES_API: process.env.FAVORITES_API,
      NEXT_PUBLIC_BRANCHES_API: process.env.NEXT_PUBLIC_BRANCHES_API,
      NEXT_PUBLIC_CUSTOMER_DETAILS_API: process.env.NEXT_PUBLIC_CUSTOMER_DETAILS_API,
      NEXT_PUBLIC_FAVORITES_API: process.env.NEXT_PUBLIC_FAVORITES_API,
    };
    
    // Create a safe version that doesn't expose full URLs
    const safeEnvVars = Object.entries(envVars).reduce((acc, [key, value]) => {
      acc[key] = value ? 'Defined' : 'Not defined';
      return acc;
    }, {});
    
    return NextResponse.json({
      message: 'Environment variables check',
      envVars: safeEnvVars,
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 