"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Minus, Plus, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CartItem } from "@/types/cart"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { calculateDistance, calculateDeliveryFee } from "@/lib/distance"

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
  const [deliveryFee, setDeliveryFee] = useState(10) // Default fee
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const calculateFee = async () => {
      try {
        // Get user's location from localStorage
        const locationData = localStorage.getItem('userLocation')
        if (!locationData || !branchLocation) {
          setDeliveryFee(10) // Default fee if no location data
          return
        }

        const userLocation = JSON.parse(locationData)
        const distance = await calculateDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: branchLocation.latitude, longitude: branchLocation.longitude }
        )
        
        setDistance(distance)
        setDeliveryFee(calculateDeliveryFee(distance))
      } catch (error) {
        console.error('Error calculating delivery fee:', error)
        setDeliveryFee(10) // Default fee on error
      }
    }

    if (isOpen) {
      calculateFee()
    }
  }, [isOpen, branchLocation])

  // Check authentication status whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const userData = localStorage.getItem('userData')
      if (userData && isProcessingAuth) {
        setIsProcessingAuth(false)
        router.push(`/checkout/${branchId}`)
      }
    }
  }, [isOpen, branchId, isProcessingAuth])

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
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 bg-white overflow-hidden">
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
            <div className="px-6 space-y-4 max-h-[60vh] overflow-y-auto py-6">
              {hasUnavailableItems && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    Some items in your cart are no longer available. Please remove them to proceed with checkout.
                  </div>
                </div>
              )}
              
              <AnimatePresence>
                {cart.map((item) => {
                  const menuItem = menuCategories
                    .flatMap(cat => cat.foods)
                    .find(food => food.name === item.name);

                  return (
                    <motion.div
                      key={item.id}
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
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">GH₵ {deliveryFee.toFixed(2)}</span>
                  {distance > 0 && (
                    <span className="text-xs text-gray-500 ml-1">({distance.toFixed(1)}km)</span>
                  )}
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
                  You'll need to log in to complete your order
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