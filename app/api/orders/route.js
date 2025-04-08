import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.restaurantId || !orderData.branchId || !orderData.customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate products array
    if (!orderData.products || !Array.isArray(orderData.products) || orderData.products.length === 0) {
      return NextResponse.json(
        { error: 'Products array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate pickup and dropoff locations
    if (!orderData.pickup || !orderData.dropOff || 
        !orderData.pickup[0]?.fromAddress || !orderData.dropOff[0]?.toAddress) {
      return NextResponse.json(
        { error: 'Pickup and dropoff locations are required' },
        { status: 400 }
      );
    }

    // Calculate order price if not provided
    if (!orderData.orderPrice) {
      orderData.orderPrice = orderData.products.reduce((total, product) => {
        return total + (parseFloat(product.price) * product.quantity);
      }, 0);
    }

    // Calculate total price if not provided
    if (!orderData.totalPrice) {
      orderData.totalPrice = parseFloat(orderData.orderPrice) + parseFloat(orderData.deliveryPrice || 0);
    }

    // Set default values
    orderData.orderStatus = orderData.orderStatus || 'ReadyForPickup';
    orderData.orderDate = orderData.orderDate || new Date().toISOString();
    orderData.paymentStatus = orderData.paymentStatus || 'Pending';

    // Use the orders API URL from environment variables
    const ordersApiUrl = process.env.NEXT_PUBLIC_ORDERS_API || "https://api-server.krontiva.africa/api:uEBBwbSs/orders";

    // Make the API call through our proxy route
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: ordersApiUrl,
        data: orderData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to create order', details: errorData },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 