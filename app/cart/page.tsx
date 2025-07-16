"use client"

import Image from "next/image"
import { ShoppingCart, Minus, Plus, Trash2, AlertCircle, Bike, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { calculateDistance } from "@/lib/distance"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { calculateDeliveryPrices } from "@/lib/api"
import { CartItem } from "@/types/cart"
import { motion, AnimatePresence } from "framer-motion"

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [branchId, setBranchId] = useState<string>("")
  const [branchName, setBranchName] = useState<string>("")
  const [menuCategories, setMenuCategories] = useState<any[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [branchLocation, setBranchLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined)
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState(20)
  const [distance, setDistance] = useState(0)
  const [deliveryType, setDeliveryType] = useState<'rider' | 'pedestrian'>('rider')
  const [riderFee, setRiderFee] = useState(0)
  const [pedestrianFee, setPedestrianFee] = useState(0)
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false)
  const platformFee = 3.00 // Platform fee of GHC3.00

  // Load cart and branch info from localStorage on mount
  useEffect(() => {
    const savedBranchId = localStorage.getItem('selectedBranchId')
    if (savedBranchId) {
      setBranchId(savedBranchId)
      const savedCart = localStorage.getItem(`cart-${savedBranchId}`)
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch {}
      }
      const savedBranchName = localStorage.getItem('selectedBranchName')
      if (savedBranchName) setBranchName(savedBranchName)
      const savedMenuCategories = localStorage.getItem('selectedMenuCategories')
      if (savedMenuCategories) setMenuCategories(JSON.parse(savedMenuCategories))
      const savedBranchLocation = localStorage.getItem('selectedBranchLocation')
      if (savedBranchLocation) setBranchLocation(JSON.parse(savedBranchLocation))
    }
    const userData = localStorage.getItem('userData')
    setIsAuthenticated(!!userData)
  }, [])

  useEffect(() => {
    if (branchId) {
      localStorage.setItem(`cart-${branchId}` , JSON.stringify(cart))
    }
  }, [cart, branchId])

  useEffect(() => {}, [deliveryType])

  useEffect(() => {
    const calculateFee = async () => {
      try {
        setIsLoadingDelivery(true)
        const locationData = localStorage.getItem('userLocationData')
        if (!locationData || !branchLocation) {
          setIsLoadingDelivery(false)
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
        const { riderFee: newRiderFee, pedestrianFee: newPedestrianFee } = await calculateDeliveryPrices({
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
        });
        setRiderFee(newRiderFee)
        setPedestrianFee(newPedestrianFee)
        if (distance > 2 && deliveryType === 'pedestrian') {
          setDeliveryType('rider')
          setDeliveryFee(newRiderFee)
        } else {
          const currentFee = deliveryType === 'rider' ? newRiderFee : newPedestrianFee
          setDeliveryFee(currentFee)
        }
      } catch (error) {
      } finally {
        setIsLoadingDelivery(false)
      }
    }
    calculateFee()
    const handleLocationUpdate = () => {
      calculateFee()
    }
    window.addEventListener('locationUpdated', handleLocationUpdate)
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate)
    }
  }, [branchLocation, deliveryType])

  useEffect(() => {
    // Check authentication status whenever the page is loaded
    if (isProcessingAuth) {
      const userData = localStorage.getItem('userData')
      if (userData) {
        setIsProcessingAuth(false)
        router.push(`/checkout/${branchId}`)
      }
    }
  }, [isProcessingAuth, branchId, router])

  const onAddItem = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return prevCart
    })
  }
  const onRemoveItem = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
      }
      return prevCart.filter(item => item.id !== itemId)
    })
  }
  const onDeleteItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const cartTotal = cart.reduce((total: number, item: CartItem) => {
    const itemTotal = parseFloat(item.price) * item.quantity;
    const extrasTotal = item.selectedExtras?.reduce((extrasSum: number, extra: { price: string; quantity: number }) => {
      return extrasSum + (parseFloat(extra.price) * extra.quantity);
    }, 0) || 0;
    return total + itemTotal + extrasTotal;
  }, 0)

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setIsProcessingAuth(true)
      localStorage.setItem('loginRedirectUrl', `/checkout/${branchId}`)
      localStorage.setItem('selectedDeliveryType', deliveryType)
      localStorage.setItem('checkoutDeliveryFee', deliveryFee.toString())
      localStorage.setItem('checkoutPlatformFee', platformFee.toString())
      localStorage.setItem('checkoutCartItems', JSON.stringify(cart))
      router.push('/login')
      return
    }
    localStorage.setItem('selectedDeliveryType', deliveryType)
    localStorage.setItem('checkoutDeliveryFee', deliveryFee.toString())
    localStorage.setItem('checkoutPlatformFee', platformFee.toString())
    localStorage.setItem('checkoutCartItems', JSON.stringify(cart))
    router.push(`/checkout/${branchId}`)
  }

  const hasUnavailableItems = cart.some(item => {
    const menuItem = menuCategories
      .flatMap((cat: any) => cat.foods)
      .find((food: any) => food.name === item.name)
    return !menuItem?.available
  })

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="font-semibold">{branchName || 'Your Cart'}</div>
            <div className="text-sm text-gray-500 font-normal">Your Cart</div>
          </div>
        </div>
        {cart.length > 0 ? (
          <>
            <div className="space-y-4 overflow-y-auto flex-1 py-2">
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
                    .flatMap((cat: any) => cat.foods)
                    .find((food: any) => food.name === item.name)
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
                  )
                })}
              </AnimatePresence>
            </div>
            <div className="border-t bg-white py-4 sticky bottom-0">
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
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 text-sm">
              Add items from the menu to start your order
            </p>
          </div>
        )}
      </div>
    </main>
  )
} 