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
import { ProgressSteps } from '@/components/ui/progress-steps';
import type { Step } from '@/components/ui/progress-steps';

interface OrderProduct {
  name: string;
  price: string;
  quantity: string;
  extras: any[];
}

interface PickupLocation {
  fromLatitude: string;
  fromLongitude: string;
  fromAddress: string;
}

interface DropOffLocation {
  toLatitude: string;
  toLongitude: string;
  toAddress: string;
}

interface OrderStatus {
  id: string;
  created_at: number;
  orderDate: string;
  orderOTP: number;
  orderNumber: number;
  orderChannel: string;
  restaurantId: string;
  branchId: string;
  customerName: string;
  customerPhoneNumber: string;
  courierId: string;
  courierName: string | null;
  courierPhoneNumber: string | null;
  batchID: string;
  orderPrice: string;
  deliveryPrice: string;
  totalPrice: string;
  orderStatus: string;
  paymentStatus: string;
  paystackReferenceCode: string;
  kitchenStatus: string;
  deliveryDistance: string;
  trackingUrl: string;
  pickupName: string;
  dropoffName: string;
  foodAndDeliveryFee: boolean;
  onlyDeliveryFee: boolean;
  payNow: boolean;
  payLater: boolean;
  dropOffCity: string;
  orderComment: string;
  orderReceivedTime: number;
  orderPickedUpTime: number | null;
  orderOnmywayTime: number | null;
  orderCompletedTime: number | null;
  orderCancelledTime: number | null;
  scheduledTime: number | null;
  completed: boolean;
  Walkin: boolean;
  payVisaCard: boolean;
  rider: boolean;
  pedestrian: boolean;
  orderAccepted: string;
  riderAssignmentStatus: string;
  products: OrderProduct[];
  pickup: PickupLocation[];
  dropOff: DropOffLocation[];
}

interface FetchError {
  message: string;
}

export function OrderStatusWidget() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const { toast } = useToast();

  const checkLoginStatus = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  const fetchOrderStatus = async (orderNumber: string) => {
    try {
      console.log('Fetching order status for number:', orderNumber);
      const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_STATUS_API}/${orderNumber}`);
      
      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        throw new Error('Failed to fetch order status');
      }
      
      const data = await response.json();
      console.log('Order status data:', data);
      
      // Only update if the order is still active
      if (!data.completed && data.orderStatus !== 'Cancelled') {
        setOrderStatus(data);
        localStorage.setItem('activeOrderNumber', orderNumber);
        localStorage.setItem('lastOrderDetails', JSON.stringify(data));
      } else {
        // If order is completed or cancelled, clean up
        localStorage.removeItem('activeOrderNumber');
        localStorage.removeItem('lastOrderDetails');
        setOrderStatus(null);
        toast({
          title: "Order Complete",
          description: "Your order has been completed or cancelled.",
        });
      }
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

  // Initialize order status from localStorage
  useEffect(() => {
    const lastOrderDetails = localStorage.getItem('lastOrderDetails');
    if (lastOrderDetails) {
      try {
        const parsedDetails = JSON.parse(lastOrderDetails);
        setOrderStatus(parsedDetails);
      } catch (error) {
        console.error('Error parsing last order details:', error);
      }
    }
  }, []);

  // Check login status and fetch order status if logged in
  useEffect(() => {
    checkLoginStatus();
    
    if (isLoggedIn) {
      // Check for active order number in localStorage
      const activeOrderNumber = localStorage.getItem('activeOrderNumber');
      console.log('Active order number from localStorage:', activeOrderNumber);
      
      if (activeOrderNumber) {
        fetchOrderStatus(activeOrderNumber);
        // Poll for updates every 30 seconds if there's an active order
        const interval = setInterval(() => fetchOrderStatus(activeOrderNumber), 30000);
        return () => clearInterval(interval);
      }

      // Also check for order submission response
      const orderSubmissionData = localStorage.getItem('orderSubmissionResponse');
      if (orderSubmissionData) {
        try {
          const { response } = JSON.parse(orderSubmissionData);
          if (response?.result1?.orderNumber) {
            const orderNumber = response.result1.orderNumber.toString();
            localStorage.setItem('activeOrderNumber', orderNumber);
            fetchOrderStatus(orderNumber);
          }
        } catch (error) {
          console.error('Error parsing order submission data:', error);
        }
      }
    }
  }, [isLoggedIn]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkLoginStatus();
      }
      if (e.key === 'activeOrderNumber') {
        const newOrderNumber = e.newValue;
        console.log('Order number changed in storage:', newOrderNumber);
        if (newOrderNumber) {
          fetchOrderStatus(newOrderNumber);
        } else {
          setOrderStatus(null);
        }
      }
      if (e.key === 'orderSubmissionResponse') {
        const newData = e.newValue;
        if (newData) {
          try {
            const { response } = JSON.parse(newData);
            if (response?.result1?.orderNumber) {
              const orderNumber = response.result1.orderNumber.toString();
              localStorage.setItem('activeOrderNumber', orderNumber);
              fetchOrderStatus(orderNumber);
            }
          } catch (error) {
            console.error('Error parsing new order submission data:', error);
          }
        }
      }
      if (e.key === 'lastOrderDetails') {
        const newData = e.newValue;
        if (newData) {
          try {
            const parsedDetails = JSON.parse(newData);
            setOrderStatus(parsedDetails);
          } catch (error) {
            console.error('Error parsing last order details:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-400';
      case 'completed':
        return 'bg-green-400';
      case 'assigned':
        return 'bg-blue-400';
      case 'cancelled':
      case 'failed':
        return 'bg-red-400';
      case 'preparing':
        return 'bg-orange-400';
      case 'ready':
        return 'bg-green-400';
      case 'readyforpickup':
        return 'bg-blue-400';
      case 'ontheway':
        return 'bg-blue-400';
      case 'delivered':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getOrderSteps = (orderStatus: OrderStatus) => {
    const steps: Step[] = [];
    
    // Order Status Steps
    const orderStatuses = ['ReadyForPickup', 'Assigned', 'OnTheWay', 'Delivered'];
    const currentOrderIndex = orderStatuses.indexOf(orderStatus.orderStatus);
    
    steps.push({
      label: 'Order Received',
      status: 'completed',
      description: 'Your order has been received',
      time: orderStatus.orderReceivedTime
    });

    orderStatuses.forEach((status, index) => {
      steps.push({
        label: status === 'ReadyForPickup' ? 'Ready for Pickup' :
               status === 'Assigned' ? 'Courier Assigned' :
               status === 'OnTheWay' ? 'On the Way' : 'Delivered',
        status: index < currentOrderIndex ? 'completed' :
                index === currentOrderIndex ? 'current' : 'upcoming',
        time: status === 'Delivered' && orderStatus.orderCompletedTime ? orderStatus.orderCompletedTime :
              status === 'OnTheWay' && orderStatus.orderOnmywayTime ? orderStatus.orderOnmywayTime :
              status === 'Assigned' && orderStatus.orderPickedUpTime ? orderStatus.orderPickedUpTime : undefined
      });
    });

    return steps;
  };

  const getKitchenSteps = (orderStatus: OrderStatus) => {
    const steps: Step[] = [];
    
    // Kitchen Status Steps
    const kitchenStatuses = ['Pending', 'Preparing', 'Ready'];
    const currentKitchenIndex = kitchenStatuses.indexOf(orderStatus.kitchenStatus);
    
    kitchenStatuses.forEach((status, index) => {
      steps.push({
        label: status === 'Pending' ? 'Order Pending' :
               status === 'Preparing' ? 'Preparing Order' : 'Order Ready',
        status: index < currentKitchenIndex ? 'completed' :
                index === currentKitchenIndex ? 'current' : 'upcoming',
        description: status === 'Pending' ? 'Kitchen will start preparing soon' :
                    status === 'Preparing' ? 'Your food is being prepared' :
                    'Your order is ready for pickup'
      });
    });

    return steps;
  };

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
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
        <SheetContent side="bottom" className="h-[96vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Order Status</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-4 overflow-y-auto max-h-[calc(96vh-80px)]">
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

                {/* Status Section */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Order Status */}
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="text-sm text-gray-500">Order Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(orderStatus.orderStatus)}`} />
                      <p className="font-medium">{orderStatus.orderStatus || 'Pending'}</p>
                    </div>
                    {orderStatus.orderReceivedTime && (
                      <p className="text-xs text-gray-500">
                        Received: {new Date(orderStatus.orderReceivedTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {/* Kitchen Status */}
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="text-sm text-gray-500">Kitchen Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(orderStatus.kitchenStatus)}`} />
                      <p className="font-medium">{orderStatus.kitchenStatus || 'Pending'}</p>
                    </div>
                    {orderStatus.orderPickedUpTime && (
                      <p className="text-xs text-gray-500">
                        Picked up: {new Date(orderStatus.orderPickedUpTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pickup</p>
                    <p className="font-medium">{orderStatus.pickupName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Delivery To</p>
                    <p className="font-medium">{orderStatus.dropoffName}</p>
                    {orderStatus.dropOffCity && (
                      <p className="text-sm text-gray-600">{orderStatus.dropOffCity}</p>
                    )}
                  </div>
                </div>

                {/* Courier Info */}
                {orderStatus.courierName && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Courier</p>
                    <p className="font-medium">{orderStatus.courierName}</p>
                    {orderStatus.courierPhoneNumber && (
                      <p className="text-sm text-gray-600">{orderStatus.courierPhoneNumber}</p>
                    )}
                  </div>
                )}

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
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span>Order Price:</span>
                        <span>₵{orderStatus.orderPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee:</span>
                        <span>₵{orderStatus.deliveryPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                {orderStatus.orderComment && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">Notes</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">{orderStatus.orderComment}</p>
                    </div>
                  </div>
                )}
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