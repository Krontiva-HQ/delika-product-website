"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Minus, Plus, Trash2, AlertCircle, Bike, User, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CartItem } from "@/types/cart"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { calculateDistance } from "@/lib/distance"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { calculateDeliveryPrices } from "@/lib/api"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cart: (CartItem & {
    selectedExtras?: Array<{
      id: string
      name: string
      price: string
      quantity: number
    }>
  })[]
  onAddItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
  onDeleteItem: (itemId: string) => void
  cartTotal: number
  branchId: string
  branchName: string
  menuCategories: Array<{
    foodType: string
    foods: Array<CartItem>
  }>
  isAuthenticated: boolean
  branchLocation?: { latitude: number; longitude: number }
  onLoginClick?: () => void
  onCheckout?: () => void
  storeType?: 'restaurant' | 'pharmacy' | 'grocery'
}

export function CartModal({
  isOpen,
  onClose,
  cart,
  onAddItem,
  onRemoveItem,
  onDeleteItem,
  cartTotal,
  branchId,
  branchName,
  menuCategories,
  isAuthenticated,
  branchLocation,
  onLoginClick,
  onCheckout,
  storeType = 'restaurant'
}: CartModalProps) {
  const router = useRouter()
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState(20)
  const [distance, setDistance] = useState(0)
  const [deliveryType, setDeliveryType] = useState<'rider' | 'pedestrian'>('rider')
  const [riderFee, setRiderFee] = useState(0)
  const [pedestrianFee, setPedestrianFee] = useState(0)
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false)
  const platformFee = 3.00 // Platform fee of GHC3.00

  useEffect(() => {
    console.log('Cart Items in CartModal:', cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedExtras: item.selectedExtras,
      total: (parseFloat(item.price) * item.quantity) + 
        (item.selectedExtras?.reduce((sum, extra) => 
          sum + (parseFloat(extra.price) * extra.quantity), 0) || 0)
    })));
  }, [cart]);

  useEffect(() => {
  }, [deliveryType])

  useEffect(() => {
    const calculateFee = async () => {
      try {
        setIsLoadingDelivery(true)
        const locationData = localStorage.getItem('userLocationData')
        
        console.log('[Delivery Calculation] Starting delivery fee calculation');
        console.log('[Delivery Calculation] Branch location prop:', branchLocation);
        console.log('[Delivery Calculation] Raw user location data:', locationData);
        
        if (!locationData || !branchLocation) {
          console.log('[Delivery Calculation] Missing location data - locationData:', !!locationData, 'branchLocation:', !!branchLocation);
          setIsLoadingDelivery(false)
          return
        }

        const { lat, lng } = JSON.parse(locationData)
        const branchLat = parseFloat(branchLocation.latitude.toString())
        const branchLng = parseFloat(branchLocation.longitude.toString())
        
        console.log('[Delivery Calculation] User coordinates:', { lat, lng });
        console.log('[Delivery Calculation] Branch coordinates:', { branchLat, branchLng });
        
        const distance = await calculateDistance(
          { latitude: lat, longitude: lng },
          { latitude: branchLat, longitude: branchLng }
        )
        
        console.log('[Delivery Calculation] Calculated distance:', distance, 'km');
        setDistance(distance)

        // Prepare the payload for delivery price calculation
        const deliveryPayload = {
          pickup: {
            fromLatitude: branchLat.toString(),
            fromLongitude: branchLng.toString(),
          },
          dropOff: {
            toLatitude: lat.toString(),
            toLongitude: lng.toString(),
          },
          rider: true,
          pedestrian: true
        };
        
        console.log('[Delivery Calculation] Payload being sent to delivery API:', JSON.stringify(deliveryPayload, null, 2));

        // Get delivery prices from API
        const { riderFee: newRiderFee, pedestrianFee: newPedestrianFee } = await calculateDeliveryPrices(deliveryPayload);

        console.log('[Delivery Calculation] API response - Rider fee:', newRiderFee, 'Pedestrian fee:', newPedestrianFee);
        
        setRiderFee(newRiderFee)
        setPedestrianFee(newPedestrianFee)
        
        // If distance > 2km and pedestrian is selected, switch to rider
        if (distance > 2 && deliveryType === 'pedestrian') {
          console.log('[Delivery Calculation] Distance > 2km, switching from pedestrian to rider');
          setDeliveryType('rider')
          setDeliveryFee(newRiderFee)
        } else {
          // Set the fee based on the selected delivery type
          const currentFee = deliveryType === 'rider' ? newRiderFee : newPedestrianFee
          console.log('[Delivery Calculation] Setting delivery fee for', deliveryType, ':', currentFee);
          setDeliveryFee(currentFee)
        }
      } catch (error) {
        console.error('[Delivery Calculation] Error calculating delivery fee:', error);
        // Handle error silently
      } finally {
        setIsLoadingDelivery(false)
      }
    }

    if (isOpen) {
      calculateFee()
    }

    // Listen for location updates
    const handleLocationUpdate = () => {
      if (isOpen) {
        calculateFee()
      }
    }

    window.addEventListener('locationUpdated', handleLocationUpdate)
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate)
    }
  }, [isOpen, branchLocation, deliveryType])

  // Check authentication status whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const userData = localStorage.getItem('userData')
      if (userData && isProcessingAuth) {
        setIsProcessingAuth(false)
        router.push(`/checkout/${branchId}`)
      }
    }
  }, [isOpen, branchId, isProcessingAuth, router])

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Store checkout data for after login
      const redirectUrl = getCheckoutUrl()
      localStorage.setItem('loginRedirectUrl', redirectUrl)
      localStorage.setItem('selectedDeliveryType', deliveryType)
      localStorage.setItem('checkoutDeliveryFee', deliveryFee.toString())
      localStorage.setItem('checkoutPlatformFee', platformFee.toString())
      // Store cart items with extras in localStorage
      localStorage.setItem('checkoutCartItems', JSON.stringify(cart))
      
      // Close cart modal and open login modal
      onClose()
      if (onLoginClick) {
        onLoginClick()
      } else {
        // Fallback to router navigation if onLoginClick is not provided
        setIsProcessingAuth(true)
        router.push('/login')
      }
      return
    }
    
    // Store delivery type, delivery fee, and platform fee
    localStorage.setItem('selectedDeliveryType', deliveryType)
    localStorage.setItem('checkoutDeliveryFee', deliveryFee.toString())
    localStorage.setItem('checkoutPlatformFee', platformFee.toString())
    // Store cart items with extras in localStorage
    localStorage.setItem('checkoutCartItems', JSON.stringify(cart))
    
    if (onCheckout) {
      // Use custom checkout handler if provided
      onClose()
      onCheckout()
    } else {
      // Navigate to appropriate checkout page
      const checkoutUrl = getCheckoutUrl()
      router.push(checkoutUrl)
      onClose()
    }
  }

  const getCheckoutUrl = () => {
    switch (storeType) {
      case 'pharmacy':
        return `/checkout/pharmacy/${branchId}`
      case 'grocery':
        return `/checkout/grocery/${branchId}`
      case 'restaurant':
      default:
        return `/checkout/${branchId}`
    }
  }

  const hasUnavailableItems = cart.some(item => {
    // If menuCategories is empty, fall back to item.available
    if (!menuCategories || menuCategories.length === 0) {
      return item.available === false;
    }
    const menuItem = menuCategories
      .flatMap(cat => cat.foods)
      .find(food => food.name === item.name);
    // If menuItem is found, use its available, else fallback to item.available
    return menuItem ? menuItem.available === false : item.available === false;
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 bg-white overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="font-semibold">{branchName}</div>
              <div className="text-sm text-gray-500 font-normal">Your Cart</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {cart.length > 0 ? (
          <>
            <div className="px-6 space-y-4 overflow-y-auto flex-1 py-6">
              {hasUnavailableItems && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      Some items in your cart are no longer available. <strong>Click the red trash icon</strong> to remove them and proceed with checkout.
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                    onClick={() => {
                      // Remove all unavailable items
                      const unavailableItems = cart.filter(item => {
                        if (!menuCategories || menuCategories.length === 0) {
                          return item.available === false;
                        }
                        const menuItem = menuCategories
                          .flatMap(cat => cat.foods)
                          .find(food => food.name === item.name);
                        return menuItem ? menuItem.available === false : item.available === false;
                      });
                      unavailableItems.forEach(item => onDeleteItem(item.id));
                    }}
                  >
                    Remove All
                  </Button>
                </div>
              )}
              
              <AnimatePresence>
                {cart.map((item, index) => {
                  // If menuCategories is empty, use item.available; else use menuItem.available if found, else fallback to item.available
                  let isAvailable = true;
                  if (!menuCategories || menuCategories.length === 0) {
                    isAvailable = item.available !== false;
                  } else {
                    const menuItem = menuCategories
                      .flatMap(cat => cat.foods)
                      .find(food => food.name === item.name);
                    isAvailable = menuItem ? menuItem.available !== false : item.available !== false;
                  }
                  return (
                    <motion.div
                      key={`${item.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex gap-4 p-4 rounded-xl border ${!isAvailable ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100'}`}
                    >
                                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className={`object-cover ${!isAvailable ? 'grayscale' : ''}`}
                          />
                        ) : (
                          <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${!isAvailable ? 'grayscale' : ''}`}>
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                            {!isAvailable && (
                              <span className="text-xs text-red-500 font-medium">No longer available</span>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-8 w-8 ${!isAvailable ? 'text-red-500 hover:text-red-600 hover:bg-red-100 border border-red-200' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                            onClick={() => onDeleteItem(item.id)}
                            title={!isAvailable ? "Remove unavailable item" : "Remove item"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Extras Section */}
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="mt-2 pl-2 space-y-1 border-l-2 border-gray-200">
                            {item.selectedExtras.map(extra => (
                              <div key={extra.id} className="flex justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <span className="text-orange-500">+</span>
                                  <span>{extra.quantity} × {extra.name}</span>
                                </div>
                                <span>GH₵ {(parseFloat(extra.price) * extra.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm font-medium text-gray-700 pt-1 border-t border-gray-100">
                              <span>Item Total</span>
                              <span>GH₵ {((parseFloat(item.price) + (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0)) * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-medium">GH₵ {((parseFloat(item.price) + (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0)) * item.quantity).toFixed(2)}</span>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full"
                              onClick={() => onRemoveItem(item.id)}
                              disabled={!isAvailable}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full"
                              onClick={() => onAddItem(item.id)}
                              disabled={!isAvailable}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="border-t bg-white px-6 py-4 sticky bottom-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">GH₵ {cart.reduce((total, item) => {
                    const base = parseFloat(item.price) * item.quantity;
                    const extrasTotal = (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0) * item.quantity;
                    return total + base + extrasTotal;
                  }, 0).toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Choose Delivery Type</span>
                  </div>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(value) => setDeliveryType(value as 'rider' | 'pedestrian')}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div>
                      <RadioGroupItem
                        value="rider"
                        id="rider"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="rider"
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50 cursor-pointer",
                          "peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50",
                          "transition-all duration-200"
                        )}
                      >
                        <Bike className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Rider</div>
                          <div className="text-xs text-gray-500">GH₵ {riderFee.toFixed(2)}</div>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="pedestrian"
                        id="pedestrian"
                        className="peer sr-only"
                        disabled={distance > 2}
                      />
                      <Label
                        htmlFor="pedestrian"
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-gray-200 p-2 cursor-pointer transition-all duration-200",
                          distance > 2 
                            ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300" 
                            : "hover:bg-gray-50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50"
                        )}
                      >
                        <User className={cn(
                          "h-4 w-4",
                          distance > 2 ? "text-gray-400" : "text-gray-600"
                        )} />
                        <div>
                          <div className={cn(
                            "text-sm font-medium",
                            distance > 2 ? "text-gray-400" : "text-gray-900"
                          )}>
                            Pedestrian
                            {distance > 2 && (
                              <span className="ml-1 text-xs text-red-500">(Not available)</span>
                            )}
                          </div>
                          <div className={cn(
                            "text-xs",
                            distance > 2 ? "text-gray-400" : "text-gray-500"
                          )}>
                            {distance > 2 ? "Distance too far" : `GH₵ ${pedestrianFee.toFixed(2)}`}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Delivery Fee</span>
                    {distance > 0 && (
                      <span className="px-2 py-1 bg-green-100 rounded-full text-xs text-green-700">
                        {distance.toFixed(1)}km
                      </span>
                    )}
                  </div>
                  <span className="font-medium">GH₵ {deliveryFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">GH₵ {platformFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold text-lg">GH₵ {(cartTotal + deliveryFee + platformFee).toFixed(2)}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 h-12 text-lg font-medium"
                onClick={handleCheckout}
                disabled={hasUnavailableItems || isLoadingDelivery}
              >
                {isLoadingDelivery
                  ? 'Calculating delivery...'
                  : hasUnavailableItems
                    ? 'Remove Unavailable Items'
                    : 'Proceed to Checkout'}
              </Button>
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  You&apos;ll need to log in to complete your order
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 text-sm">
              Add items from the menu to start your order
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 