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

  // Helper function to clear all order tracking data
  const clearOrderTracking = () => {
    localStorage.removeItem('activeOrderNumber');
    localStorage.removeItem('lastOrderDetails');
    localStorage.removeItem('orderSubmissionResponse');
    localStorage.removeItem('orderTrackingStartedAt');
    setOrderStatus(null);
    console.log('Order tracking data cleared');
  };

  // Helper function to format status text for better readability
  const formatStatusText = (status: string) => {
    if (!status) return 'Pending';
    
    // Handle specific status mappings
    const statusMappings: { [key: string]: string } = {
      'ReadyForPickup': 'Ready for Pickup',
      'OnTheWay': 'On the Way',
      'InProgress': 'In Progress',
      'OrderReceived': 'Order Received',
      'CourierAssigned': 'Courier Assigned',
      'OutForDelivery': 'Out for Delivery',
      'PaymentPending': 'Payment Pending',
      'PaymentFailed': 'Payment Failed',
      'OrderCancelled': 'Order Cancelled',
      'OrderCompleted': 'Order Completed'
    };

    // Check if we have a specific mapping
    if (statusMappings[status]) {
      return statusMappings[status];
    }

    // For other camelCase strings, split and capitalize
    return status
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim(); // Remove any leading/trailing spaces
  };

  const checkLoginStatus = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  const fetchOrderStatus = async (orderNumber: string) => {
    try {
      console.log('Fetching order status for number:', orderNumber);
      const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_STATUS_API}?orderNumber=${orderNumber}`);
      
      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        throw new Error('Failed to fetch order status');
      }
      
      const data = await response.json();
      console.log('Order status data:', data);
      
      // Only track and display if paymentStatus is 'paid'
      if (data.paymentStatus?.toLowerCase() === 'paid') {
        setOrderStatus(data);
        localStorage.setItem('activeOrderNumber', orderNumber);
        localStorage.setItem('lastOrderDetails', JSON.stringify(data));
        // Set or update the tracking start timestamp
        if (!localStorage.getItem('orderTrackingStartedAt')) {
          localStorage.setItem('orderTrackingStartedAt', Date.now().toString());
        }
      } else {
        // If not paid, clear all tracking and do not show
        clearOrderTracking();
        setOrderStatus(null);
        return;
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

  // Clean up any stale order data and initialize from localStorage
  useEffect(() => {
    const cleanupStaleOrderData = () => {
      const lastOrderDetails = localStorage.getItem('lastOrderDetails');
      if (lastOrderDetails) {
        try {
          const parsedDetails = JSON.parse(lastOrderDetails);
          
          // Check if the stored order is still active
          const isOrderInactive = parsedDetails.completed || 
                                  parsedDetails.orderStatus === 'Cancelled' || 
                                  parsedDetails.orderStatus === 'Delivered' ||
                                  parsedDetails.paymentStatus?.toLowerCase() === 'paid';
          
          if (isOrderInactive) {
            // Clean up stale data
            clearOrderTracking();
            console.log('Cleaned up stale order data on initialization');
          } else {
            // Order is still active, keep it
            setOrderStatus(parsedDetails);
          }
        } catch (error) {
          console.error('Error parsing last order details:', error);
          // Clean up corrupted data
          clearOrderTracking();
        }
      }
    };

    cleanupStaleOrderData();
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
            // Only fetch if paymentStatus is 'paid' (will be checked in fetchOrderStatus)
            fetchOrderStatus(orderNumber);
          }
        } catch (error) {
          console.error('Error parsing order submission data:', error);
        }
      }
    }
  }, [isLoggedIn]);

  // Periodic cleanup to ensure no stale order data persists
  useEffect(() => {
    // 20-minute auto-clear logic
    const autoClear = setInterval(() => {
      const startedAt = localStorage.getItem('orderTrackingStartedAt');
      if (startedAt) {
        const now = Date.now();
        const elapsed = now - parseInt(startedAt, 10);
        if (elapsed > 20 * 60 * 1000) { // 20 minutes
          console.log('20 minutes passed, clearing order tracking');
          clearOrderTracking();
        }
      }
    }, 60000); // Check every minute

    // Existing periodic cleanup for corrupted/stale data
    const cleanup = setInterval(() => {
      const lastOrderDetails = localStorage.getItem('lastOrderDetails');
      if (lastOrderDetails) {
        try {
          const parsedDetails = JSON.parse(lastOrderDetails);
          const isOrderInactive = parsedDetails.completed || 
                                  parsedDetails.orderStatus === 'Cancelled' || 
                                  parsedDetails.orderStatus === 'Delivered' ||
                                  parsedDetails.paymentStatus?.toLowerCase() !== 'paid';
          if (isOrderInactive) {
            console.log('Periodic cleanup: removing stale order data');
            clearOrderTracking();
          }
        } catch (error) {
          console.error('Periodic cleanup: corrupted order data found, cleaning up');
          clearOrderTracking();
        }
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(autoClear);
      clearInterval(cleanup);
    };
  }, []);

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
          // New order detected, clear old tracking timestamp
          localStorage.removeItem('orderTrackingStartedAt');
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
              // New order detected, clear old tracking timestamp
              localStorage.removeItem('orderTrackingStartedAt');
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
            // Only set if paymentStatus is 'paid'
            if (parsedDetails.paymentStatus?.toLowerCase() === 'paid') {
              setOrderStatus(parsedDetails);
            } else {
              setOrderStatus(null);
            }
          } catch (error) {
            console.error('Error parsing last order details:', error);
          }
        } else {
          // If data was removed, clear the order status
          setOrderStatus(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getStatusColor = (status: string, isKitchen = false) => {
    if (isKitchen) {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-500'; // Blue for received
        case 'preparing':
          return 'bg-orange-500'; // Orange for preparing
        case 'ready':
          return 'bg-green-500'; // Green for prepared/ready
        case 'cancelled':
          return 'bg-red-500'; // Red for cancelled
        default:
          return 'bg-violet-500'; // Violet for other states
      }
    }
    
    // Order status colors
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-400';
      case 'completed':
      case 'delivered':
      case 'ready':
        return 'bg-green-400';
      case 'assigned':
      case 'readyforpickup':
      case 'ontheway':
        return 'bg-blue-400';
      case 'cancelled':
      case 'failed':
        return 'bg-red-400';
      case 'preparing':
        return 'bg-orange-400';
      default:
        return 'bg-violet-400';
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
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(orderStatus.kitchenStatus, true)} animate-pulse`} />
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              )}
              Order Status
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[60vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Order Status</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 p-4 pb-6 overflow-y-auto max-h-[calc(60vh-80px)]">
            {orderStatus ? (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">Order #{orderStatus.orderNumber}</h3>
                  <div className="text-right">
                    <p className="text-sm font-medium">Total: ₵{orderStatus.totalPrice}</p>
                    <p className={`text-sm ${orderStatus.paymentStatus.toLowerCase() === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {formatStatusText(orderStatus.paymentStatus)}
                    </p>
                  </div>
                </div>

                {/* Status Section */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Order Status */}
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Order Status</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(orderStatus.orderStatus)}`} />
                      <p className="text-sm font-medium">{formatStatusText(orderStatus.orderStatus)}</p>
                    </div>
                  </div>

                  {/* Kitchen Status */}
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Kitchen Status</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(orderStatus.kitchenStatus, true)}`} />
                      <p className="text-sm font-medium">{formatStatusText(orderStatus.kitchenStatus)}</p>
                    </div>
                  </div>
                </div>

                {/* 4 Column Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* Pickup Info */}
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Pickup</p>
                    <p className="text-sm font-medium truncate" title={orderStatus.pickupName}>{orderStatus.pickupName}</p>
                  </div>

                  {/* Courier Info */}
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Courier</p>
                    {orderStatus.courierName ? (
                      <div>
                        <p className="text-sm font-medium truncate" title={orderStatus.courierName}>{orderStatus.courierName}</p>
                        {orderStatus.courierPhoneNumber && (
                          <p className="text-xs text-gray-600 truncate">{orderStatus.courierPhoneNumber}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Not assigned</p>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Items ({orderStatus.products.length})</p>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {orderStatus.products.slice(0, 3).map((product, index) => (
                        <div key={index} className="text-xs">
                          <span>{product.quantity}x {product.name.substring(0, 15)}{product.name.length > 15 ? '...' : ''}</span>
                        </div>
                      ))}
                      {orderStatus.products.length > 3 && (
                        <p className="text-xs text-gray-500">+{orderStatus.products.length - 3} more</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    {orderStatus.orderComment ? (
                      <p className="text-xs text-gray-700 line-clamp-3" title={orderStatus.orderComment}>
                        {orderStatus.orderComment.substring(0, 50)}{orderStatus.orderComment.length > 50 ? '...' : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">No notes</p>
                    )}
                  </div>
                </div>

                {/* Delivery & Price Summary */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Delivery To</p>
                    <p className="text-sm font-medium truncate" title={orderStatus.dropoffName}>{orderStatus.dropoffName}</p>
                    {orderStatus.dropOffCity && (
                      <p className="text-xs text-gray-600">{orderStatus.dropOffCity}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Pricing</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Order:</span>
                        <span>₵{orderStatus.orderPrice}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Delivery:</span>
                        <span>₵{orderStatus.deliveryPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-1">
                        <span>Total:</span>
                        <span>₵{orderStatus.totalPrice}</span>
                      </div>
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