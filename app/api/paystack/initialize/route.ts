import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, email, orderId, customerId } = await request.json();

    // Validate required fields
    if (!amount || !email || !orderId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert amount to kobo (smallest currency unit)
    const amountInKobo = Math.round(amount * 100);

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInKobo,
        email,
        currency: 'GHS',
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        metadata: {
          orderId,
          customerId,
          originalAmount: amount,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId
            }
          ]
        },
        language: 'en' // Explicitly set language to English
      }),
    });

    const paystackData = await paystackResponse.json();
    
    if (!paystackResponse.ok) {
      console.error('Paystack API Error:', paystackData);
      // Log the full error response for debugging
      console.error('Full Paystack Error Response:', JSON.stringify(paystackData, null, 2));
      return NextResponse.json(
        { 
          error: paystackData.message || 'Failed to initialize payment',
          details: paystackData
        },
        { status: paystackResponse.status }
      );
    }

    // Save payment record to our database
    const paymentRecord = {
      orderId,
      customerId,
      amount,
      currency: 'GHS',
      status: 'pending',
      reference: paystackData.data.reference,
      createdAt: Date.now()
    };

    const saveResponse = await fetch(process.env.PAYMENTS_API || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRecord),
    });

    if (!saveResponse.ok) {
      console.error('Failed to save payment record');
      // Still return the Paystack data even if saving fails
      return NextResponse.json(paystackData.data);
    }

    return NextResponse.json(paystackData.data);
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment', details: error },
      { status: 500 }
    );
  }
} 