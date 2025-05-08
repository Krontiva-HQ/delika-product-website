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

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
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
  onLoginClick: () => void
  isAuthenticated: boolean
  branchLocation?: { latitude: number; longitude: number }
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
  onLoginClick,
  isAuthenticated,
  branchLocation
}: CartModalProps) {
  const router = useRouter()
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState(15)
  const [distance, setDistance] = useState(0)
  const [deliveryType, setDeliveryType] = useState<'rider' | 'pedestrian' | 'pickup'>('rider')
  const [riderFee, setRiderFee] = useState(0)
  const [pedestrianFee, setPedestrianFee] = useState(0)

  useEffect(() => {
    const calculateFee = async () => {
      try {
        const locationData = localStorage.getItem('userLocationData')
        console.log('Location data from localStorage:', locationData)
        
        if (!locationData || !branchLocation) {
          console.log('Missing location data:', { 
            hasUserLocation: !!locationData, 
            hasBranchLocation: !!branchLocation,
            branchLocationDetails: branchLocation
          })
          setDeliveryFee(15)
          setRiderFee(15)
          setPedestrianFee(15)
          return
        }

        const { lat, lng } = JSON.parse(locationData)
        const branchLat = parseFloat(branchLocation.latitude.toString())
        const branchLng = parseFloat(branchLocation.longitude.toString())
        
        const distance = await calculateDistance(
          { latitude: lat, longitude: lng },
          { latitude: branchLat, longitude: branchLng }
        )
        
        setDistance(distance)

        console.log('Making API request to:', `${process.env.NEXT_PUBLIC_DELIVERY_PRICE}`)
        console.log('Request payload:', { distance, deliveryType })

        // Call the delivery price API
        const response = await fetch(`${process.env.NEXT_PUBLIC_DELIVERY_PRICE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            distance,
            deliveryType,
          }),
        })

        console.log('API response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to calculate delivery fee: ${response.status}`)
        }

        const responseJson = await response.json()
        console.log('API response data:', responseJson)

        // Add proper type checking and fallbacks
        const riderFee = typeof responseJson.riderFee === 'number' ? responseJson.riderFee : 0
        const pedestrianFee = typeof responseJson.pedestrianFee === 'number' ? responseJson.pedestrianFee : 0

        console.log('Extracted fees:', { riderFee, pedestrianFee })

        setRiderFee(riderFee)
        setPedestrianFee(pedestrianFee)
        
        // Set the fee based on the selected delivery type
        const currentFee = deliveryType === 'rider' ? riderFee : pedestrianFee
        console.log(`Setting delivery fee for ${deliveryType} to:`, currentFee)
        setDeliveryFee(currentFee)
        
        console.log('=== DELIVERY FEE CALCULATION ===')
        console.log('Distance:', distance.toFixed(2), 'km')
        console.log('Delivery Type:', deliveryType)
        console.log('Rider Fee:', riderFee, 'GH₵')
        console.log('Pedestrian Fee:', pedestrianFee, 'GH₵')
        console.log('Selected Fee:', currentFee, 'GH₵')
        console.log('=============================')
      } catch (error) {
        console.error('Error calculating delivery fee:', error)
        // Set default values on error
        setDeliveryFee(15)
        setRiderFee(15)
        setPedestrianFee(15)
      }
    }

    if (isOpen) {
      calculateFee()
    }
  }, [isOpen, branchLocation, deliveryType])

  // Update delivery fee when delivery type changes
  useEffect(() => {
    console.log('Delivery type changed to:', deliveryType)
    console.log('Current fees:', { riderFee, pedestrianFee })
    
    // Set to 0 if pickup is selected
    const fee = deliveryType === 'pickup' ? 0 : (deliveryType === 'rider' ? riderFee : pedestrianFee)
    
    console.log('Setting new delivery fee to:', fee)
    setDeliveryFee(fee)
  }, [deliveryType, riderFee, pedestrianFee])

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
      setIsProcessingAuth(true)
      // Store the intended redirect URL
      localStorage.setItem('loginRedirectUrl', `/checkout/${branchId}`)
      onLoginClick()
      onClose()
      return
    }
    router.push(`/checkout/${branchId}`)
  }

  const hasUnavailableItems = cart.some(item => {
    const menuItem = menuCategories
      .flatMap(cat => cat.foods)
      .find(food => food.name === item.name)
    return !menuItem?.available
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    Some items in your cart are no longer available. Please remove them to proceed with checkout.
                  </div>
                </div>
              )}
              
              <AnimatePresence>
                {cart.map((item, index) => {
                  const menuItem = menuCategories
                    .flatMap(cat => cat.foods)
                    .find(food => food.name === item.name);

                  return (
                    <motion.div
                      key={`${item.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex gap-4 p-4 rounded-xl border ${!menuItem?.available ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'}`}
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className={`object-cover ${!menuItem?.available ? 'grayscale' : ''}`}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                            {menuItem?.available === false && (
                              <span className="text-xs text-red-500 font-medium">No longer available</span>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => onDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-medium">GH₵ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full"
                              onClick={() => onRemoveItem(item.id)}
                              disabled={!menuItem?.available}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full"
                              onClick={() => onAddItem(item.id)}
                              disabled={!menuItem?.available}
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
                  <span className="font-medium">GH₵ {cartTotal.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Choose Delivery Type</span>
                  </div>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(value) => setDeliveryType(value as 'rider' | 'pedestrian' | 'pickup')}
                    className="grid grid-cols-3 gap-2"
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
                      />
                      <Label
                        htmlFor="pedestrian"
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50 cursor-pointer",
                          "peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50",
                          "transition-all duration-200"
                        )}
                      >
                        <User className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Pedestrian</div>
                          <div className="text-xs text-gray-500">GH₵ {pedestrianFee.toFixed(2)}</div>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="pickup"
                        id="pickup"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="pickup"
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50 cursor-pointer",
                          "peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50",
                          "transition-all duration-200"
                        )}
                      >
                        <Store className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Pickup</div>
                          <div className="text-xs text-gray-500">Free</div>
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

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold text-lg">GH₵ {(cartTotal + deliveryFee).toFixed(2)}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 h-12 text-lg font-medium"
                onClick={handleCheckout}
                disabled={hasUnavailableItems}
              >
                {hasUnavailableItems ? 'Remove Unavailable Items' : 'Place Order'}
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