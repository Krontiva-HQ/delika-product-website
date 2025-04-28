import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    // Verify the signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    const event = payload.event;
    const data = payload.data;

    switch (event) {
      case 'charge.success':
        // Update order status in your database
        await updateOrderStatus(data.reference, 'Paid');
        break;
      case 'charge.failed':
        // Update order status in your database
        await updateOrderStatus(data.reference, 'Failed');
        break;
      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function updateOrderStatus(reference: string, status: string) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_ORDERS_API || '', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paystackReferenceCode: reference,
        paymentStatus: status,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
} 