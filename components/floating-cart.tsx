import { calculateDeliveryPrices } from "@/lib/api"
import { useEffect, useState } from "react"
import { CartAuthModal } from "./cart-auth-modal"
import { UserData } from "@/lib/api"

interface FloatingCartProps {
  total: number
  itemCount: number
  onClick: () => void
  branchLocation: {
    latitude: string
    longitude: string
  }
  branchId: string
  onLoginClick?: () => void // Keep for backward compatibility
}

export function FloatingCart({ total, itemCount, onClick, branchLocation, branchId, onLoginClick }: FloatingCartProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('userData')
      const authToken = localStorage.getItem('authToken')
      
      if (userData && authToken) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    }

    // Initial check
    checkAuth()

    // Listen for auth state changes
    window.addEventListener('userDataUpdated', checkAuth)
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('userDataUpdated', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  useEffect(() => {
    // Clear other restaurant carts when mounting
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cart-') && key !== `cart-${branchId}`) {
        localStorage.removeItem(key);
      }
    }

    // Listen for successful payment event
    const handlePaymentSuccess = () => {
      localStorage.removeItem(`cart-${branchId}`);
    };

    // Listen for login success with cart context
    const handleLoginSuccessWithCart = (event: CustomEvent) => {
      const context = event.detail;
      if (context.branchId === branchId) {
        // If this is the same branch, automatically open the cart modal
        onClick();
      }
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('loginSuccessWithCart', handleLoginSuccessWithCart as EventListener);
    
    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('loginSuccessWithCart', handleLoginSuccessWithCart as EventListener);
    };
  }, [branchId, onClick]);

  const handleLoginSuccess = (userData: UserData) => {
    // Update authentication state
    setIsAuthenticated(true)
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: userData }))
    
    // Close auth modal
    setIsAuthModalOpen(false)
    
    // Open cart modal after successful login
    setTimeout(() => {
      onClick()
    }, 100)
  }

  if (itemCount === 0) return null

  const handleClick = async () => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      // Store current cart context for after login
      localStorage.setItem('cartContext', JSON.stringify({
        branchId,
        total,
        itemCount,
        branchLocation
      }))
      
      // Open the new auth modal instead of using onLoginClick
      setIsAuthModalOpen(true)
      return
    }

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
      
      // Get userId from localStorage userData
      let userId = '';
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          userId = parsedUserData.id || '';
        }
      } catch (error) {
        console.log('[FloatingCart] Could not retrieve userId from userData:', error);
      }
      
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
        pedestrian: true,
        total: total,
        subTotal: total,
        userId: userId
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
    <>
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

      {/* Cart Authentication Modal */}
      <CartAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        cartContext={{
          branchId,
          total,
          itemCount,
          branchLocation
        }}
      />
    </>
  )
} 