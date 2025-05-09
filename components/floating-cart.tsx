import { calculateDeliveryPrices } from "@/lib/api"

interface FloatingCartProps {
  total: number
  itemCount: number
  onClick: () => void
  branchLocation: {
    latitude: string
    longitude: string
  }
}

export function FloatingCart({ total, itemCount, onClick, branchLocation }: FloatingCartProps) {
  if (itemCount === 0) return null

  const handleClick = async () => {
    try {
      const locationData = localStorage.getItem('userLocationData')
      
      if (!locationData) {
        onClick()
        return
      }

      if (!branchLocation?.latitude || !branchLocation?.longitude) {
        onClick()
        return
      }

      const { lat, lng } = JSON.parse(locationData)
      
      const prices = await calculateDeliveryPrices({
        pickup: {
          fromLatitude: branchLocation.latitude,
          fromLongitude: branchLocation.longitude,
        },
        dropOff: {
          toLatitude: lat.toString(),
          toLongitude: lng.toString(),
        },
        rider: true,
        pedestrian: true
      })
      
      // Store the prices in localStorage for cart modal to use
      localStorage.setItem('deliveryPrices', JSON.stringify(prices))
    } catch (error) {
      // Silently handle error and continue
    }
    
    // Call the original onClick handler
    onClick()
  }

  return (
    <div className="fixed bottom-4 inset-x-0 mx-auto px-4 z-50 flex justify-center">
      <button
        onClick={handleClick}
        className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-full flex items-center gap-4 shadow-lg max-w-md w-full sm:w-auto"
      >
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">
            {itemCount}
          </div>
          <span className="font-medium">View Basket</span>
        </div>
        <span className="font-medium sm:border-l border-orange-400 sm:pl-4 pl-2">
          GH₵ {total.toFixed(2)}
        </span>
      </button>
    </div>
  )
} 