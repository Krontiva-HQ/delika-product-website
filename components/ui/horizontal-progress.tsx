import { Check } from 'lucide-react';

interface HorizontalProgressProps {
  orderStatus: string;
  kitchenStatus: string;
}

export function HorizontalProgress({ orderStatus, kitchenStatus }: HorizontalProgressProps) {
  const getStatusColor = (status: string, isKitchen = false) => {
    if (isKitchen) {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'bg-blue-500'; // Blue for received
        case 'preparing':
          return 'bg-orange-500'; // Orange for preparing
        case 'ready':
          return 'bg-green-500'; // Green for prepared/ready
        case 'cancelled':
          return 'bg-red-500'; // Red for cancelled
        default:
          return 'bg-violet-500'; // Violet for other states
      }
    } else {
      // Order status colors remain unchanged
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
          return 'bg-gray-400';
      }
    }
  };

  const getOrderStep = () => {
    const orderStatuses = ['ReadyForPickup', 'Assigned', 'OnTheWay', 'Delivered'];
    const currentIndex = orderStatuses.indexOf(orderStatus);
    const color = getStatusColor(orderStatus, false);
    
    const totalSteps = orderStatuses.length + 1;
    const progress = orderStatus === 'Pending' ? 
      (1 / totalSteps) * 100 : 
      ((currentIndex + 2) / totalSteps) * 100;

    return {
      text: orderStatus === 'Pending' ? 'Order Received' :
            orderStatus === 'ReadyForPickup' ? 'Ready for Pickup' :
            orderStatus === 'Assigned' ? 'Courier Assigned' :
            orderStatus === 'OnTheWay' ? 'On the Way' : 'Delivered',
      progress,
      color
    };
  };

  const getKitchenStep = () => {
    const kitchenStatuses = ['Pending', 'Preparing', 'Ready'];
    const currentIndex = kitchenStatuses.indexOf(kitchenStatus);
    const color = getStatusColor(kitchenStatus, true);
    
    return {
      text: kitchenStatus === 'Pending' ? 'Order Pending' :
            kitchenStatus === 'Preparing' ? 'Preparing Order' : 'Order Ready',
      progress: ((currentIndex + 1) / kitchenStatuses.length) * 100,
      color
    };
  };

  const orderStep = getOrderStep();
  const kitchenStep = getKitchenStep();

  return (
    <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg p-4 space-y-4 w-[300px]">
      {/* Order Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Order Status</span>
          <span className="text-sm text-gray-500">{orderStep.text}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${orderStep.color} transition-all duration-500 ease-in-out`}
            style={{ 
              width: `${orderStep.progress}%`,
              boxShadow: `0 0 8px ${orderStep.color.replace('bg-', '')}` 
            }}
          />
        </div>
      </div>

      {/* Kitchen Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Kitchen Status</span>
          <span className="text-sm text-gray-500">{kitchenStep.text}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${kitchenStep.color} transition-all duration-500 ease-in-out`}
            style={{ 
              width: `${kitchenStep.progress}%`,
              boxShadow: `0 0 8px ${kitchenStep.color.replace('bg-', '')}` 
            }}
          />
        </div>
      </div>
    </div>
  );
} 