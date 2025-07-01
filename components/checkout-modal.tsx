"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { ShoppingBag, Check } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
  selectedExtras?: Array<{
    id: string
    name: string
    price: string
    quantity: number
  }>
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  cartTotal: number
  onSubmitOrder: (customerInfo: CustomerInfo) => void
  deliveryFee: number
}

interface CustomerInfo {
  name: string
  phone: string
  address: string
  notes: string
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  cartTotal,
  onSubmitOrder,
  deliveryFee
}: CheckoutModalProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const platformFee = 3.00 // Platform fee of GHC3.00

  useEffect(() => {
    console.log('CheckoutModal received cart:', cart);
    console.log('CheckoutModal received cartTotal:', cartTotal);
  }, [cart, cartTotal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Submit order information
    onSubmitOrder(customerInfo)
    setIsSubmitting(false)
    setIsSuccess(true)
    
    // Reset form after success
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
      setCustomerInfo({
        name: "",
        phone: "",
        address: "",
        notes: ""
      })
    }, 2000)
  }

  useEffect(() => {
  }, [deliveryFee]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-semibold mb-4">Review Order Details</DialogTitle>
        
        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order Details Confirmed</h3>
            <p className="text-gray-500">Proceeding to checkout page...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-4 mb-3">
                {cart.map(item => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.quantity} × {item.name}</span>
                      <span>GH₵ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                      <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                        {item.selectedExtras.map(extra => (
                          <div key={extra.id} className="flex justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="text-orange-500">+</span>
                              <span>{extra.quantity} × {extra.name}</span>
                            </div>
                            <span>GH₵ {(parseFloat(extra.price) * extra.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-medium text-gray-700 pt-1 border-t border-gray-100">
                          <span>Item Total</span>
                          <span>GH₵ {(
                            (parseFloat(item.price) * item.quantity) + 
                            (item.selectedExtras.reduce((sum, extra) => 
                              sum + (parseFloat(extra.price) * extra.quantity), 0))
                          ).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>GH₵ {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Fee</span>
                <span>GH₵ {platformFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>GH₵ {(cartTotal + deliveryFee + platformFee).toFixed(2)}</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    name="name"
                    value={customerInfo.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <Input
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address</label>
                  <Input
                    name="address"
                    value={customerInfo.address}
                    onChange={handleChange}
                    placeholder="Enter your delivery address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={customerInfo.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions for delivery"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Continue to Checkout
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 