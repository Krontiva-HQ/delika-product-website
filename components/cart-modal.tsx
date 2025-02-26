"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Minus, X, Trash2 } from "lucide-react"
import Image from "next/image"

// Move CartItem interface here since we can't import it
interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onAddItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
  onDeleteItem?: (itemId: string) => void  // New prop for deleting items
  cartTotal: number
}

export function CartModal({
  isOpen,
  onClose,
  cart,
  onAddItem,
  onRemoveItem,
  onDeleteItem,
  cartTotal
}: CartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="p-6 border-b">
          <div>
            <DialogTitle className="text-2xl font-semibold">Your Cart</DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-auto px-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 mt-2">Add items to get started</p>
            </div>
          ) : (
            <div>
              {/* Table Headers */}
              <div className="grid grid-cols-[2fr,1fr,1fr,auto] gap-4 py-3 text-sm font-medium text-gray-500 border-b">
                <div>PRODUCT</div>
                <div className="text-center">QUANTITY</div>
                <div className="text-right">PRICE</div>
                <div></div> {/* Space for delete icon */}
              </div>

              {/* Cart Items */}
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.id} className="py-6 grid grid-cols-[2fr,1fr,1fr,auto] gap-4 items-center">
                    <div className="flex gap-3">
                      {item.image && (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">GH₵ {item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-8 w-8 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium w-6 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onAddItem(item.id)}
                        className="h-8 w-8 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right font-medium">
                      GH₵ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => onDeleteItem?.(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">GH₵ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-medium">GH₵ 10.00</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-3 border-t">
              <span>Total</span>
              <span>GH₵ {(cartTotal + 10).toFixed(2)}</span>
            </div>
          </div>
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-medium"
            disabled={cart.length === 0}
          >
            Place Order
          </Button>
          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Add More Items
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 