'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface OrderProduct {
  name: string;
  price: string;
  quantity: string;
  extras: any[];
}

interface OrderStatus {
  orderNumber: number;
  orderStatus: string;
  kitchenStatus: string;
  orderAccepted: 'pending' | 'accepted' | 'rejected';
  orderReceivedTime: number;
  orderPickedUpTime: number | null;
  orderOnmywayTime: number | null;
  orderCompletedTime: number | null;
  courierName: string | null;
  products: OrderProduct[];
  customerName: string;
  totalPrice: string;
  paymentStatus: string;
}

interface FetchError {
  message: string;
}

export function OrderStatusWidget() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const { toast } = useToast();

  const checkLoginStatus = () => {
    // Check if there's an auth token in localStorage
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-400';
      case 'completed':
        return 'bg-green-400';
      case 'assigned':
        return 'bg-blue-400';
      case 'cancelled':
        return 'bg-red-400';
      case 'preparing':
        return 'bg-orange-400';
      case 'ready':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  const fetchOrderStatus = async (orderNumber: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_STATUS_API}/${orderNumber}`);
      if (!response.ok) throw new Error('Failed to fetch order status');
      const data = await response.json();
      setOrderStatus(data);
    } catch (error) {
      console.error('Error fetching order status:', error);
      const fetchError = error as FetchError;
      if (fetchError.message !== 'Failed to fetch order status') {
        toast({
          title: "Error",
          description: "Failed to fetch order status",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    checkLoginStatus();
    
    if (isLoggedIn) {
      const activeOrderNumber = localStorage.getItem('activeOrderNumber');
      if (activeOrderNumber) {
        fetchOrderStatus(activeOrderNumber);
        const interval = setInterval(() => fetchOrderStatus(activeOrderNumber), 30000);
        return () => clearInterval(interval);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    window.addEventListener('storage', (e) => {
      if (e.key === 'authToken') {
        checkLoginStatus();
      }
    });
    return () => {
      window.removeEventListener('storage', () => {});
    };
  }, []);

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="default" 
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <span className="flex items-center gap-2">
              {orderStatus ? (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(orderStatus.orderStatus)} animate-pulse`} />
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(orderStatus.kitchenStatus)} animate-pulse`} />
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              )}
              Order Status
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[50vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Order Status</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-4">
            {orderStatus ? (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">Order #{orderStatus.orderNumber}</h3>
                  <div className="text-right">
                    <p className="text-sm font-medium">Total: ₵{orderStatus.totalPrice}</p>
                    <p className={`text-sm ${orderStatus.paymentStatus.toLowerCase() === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {orderStatus.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Status Section */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                    {/* Order Status */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Order Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(orderStatus.orderStatus)}`} />
                        <p className="font-medium">{orderStatus.orderStatus || 'Pending'}</p>
                      </div>
                    </div>

                    {/* Kitchen Status */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Kitchen Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(orderStatus.kitchenStatus)}`} />
                        <p className="font-medium">{orderStatus.kitchenStatus || 'Pending'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Courier Info */}
                  {orderStatus.courierName && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Courier</p>
                      <p className="font-medium">{orderStatus.courierName}</p>
                    </div>
                  )}

                  {/* Order Timeline */}
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-500">Timeline</p>
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg">
                      {orderStatus.orderReceivedTime && (
                        <p className="flex justify-between">
                          <span>Received:</span>
                          <span>{formatTime(orderStatus.orderReceivedTime)}</span>
                        </p>
                      )}
                      {orderStatus.orderPickedUpTime && (
                        <p className="flex justify-between">
                          <span>Picked up:</span>
                          <span>{formatTime(orderStatus.orderPickedUpTime)}</span>
                        </p>
                      )}
                      {orderStatus.orderOnmywayTime && (
                        <p className="flex justify-between">
                          <span>On the way:</span>
                          <span>{formatTime(orderStatus.orderOnmywayTime)}</span>
                        </p>
                      )}
                      {orderStatus.orderCompletedTime && (
                        <p className="flex justify-between">
                          <span>Completed:</span>
                          <span>{formatTime(orderStatus.orderCompletedTime)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">Order Items</p>
                    <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                      {orderStatus.products.map((product, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{product.quantity}x {product.name}</span>
                          <span>₵{product.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No active orders</p>
                <p className="text-sm text-muted-foreground mt-1">Your order status will appear here when you place an order</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 