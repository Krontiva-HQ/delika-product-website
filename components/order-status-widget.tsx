'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface OrderStatus {
  orderNumber: string;
  isAccepted: boolean;
  preparationStatus: string;
  estimatedTime?: string;
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

  const fetchOrderStatus = async (orderNumber: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_STATUS_API}/${orderNumber}`);
      if (!response.ok) throw new Error('Failed to fetch order status');
      const data = await response.json();
      setOrderStatus(data);
    } catch (error) {
      console.error('Error fetching order status:', error);
      // Don't show error toast for 404 (no active order)
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

  // Check login status and fetch order status if logged in
  useEffect(() => {
    checkLoginStatus();
    
    if (isLoggedIn) {
      const activeOrderNumber = localStorage.getItem('activeOrderNumber');
      if (activeOrderNumber) {
        fetchOrderStatus(activeOrderNumber);
        // Poll for updates every 30 seconds if there's an active order
        const interval = setInterval(() => fetchOrderStatus(activeOrderNumber), 30000);
        return () => clearInterval(interval);
      }
    }
  }, [isLoggedIn]);

  // Listen for login/logout events
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
                <div className={`w-2 h-2 rounded-full ${orderStatus.isAccepted ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              )}
              Order Status
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[30vh] rounded-t-xl">
          <div className="space-y-4 p-4">
            {orderStatus ? (
              <>
                <h3 className="text-lg font-semibold">Order #{orderStatus.orderNumber}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${orderStatus.isAccepted ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <p>{orderStatus.isAccepted ? 'Order Accepted' : 'Pending Acceptance'}</p>
                  </div>
                  {orderStatus.isAccepted && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${orderStatus.preparationStatus === 'completed' ? 'bg-green-400' : 'bg-blue-400'}`} />
                        <p>Preparation Status: {orderStatus.preparationStatus}</p>
                      </div>
                      {orderStatus.estimatedTime && (
                        <p className="text-sm text-muted-foreground">
                          Estimated completion: {orderStatus.estimatedTime}
                        </p>
                      )}
                    </>
                  )}
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