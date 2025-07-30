import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { authToken, userId } = await request.json();
    
    if (!authToken) {
      return NextResponse.json({ error: 'Auth token is required' }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const response = await fetch(`https://api-server.krontiva.africa/api:uEBBwbSs/AcceptPolicy/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        privacyPolicyAccepted: true,
        user: userId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update policy acceptance');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating policy acceptance:', error);
    return NextResponse.json({ error: 'Failed to update policy acceptance' }, { status: 500 });
  }
} 