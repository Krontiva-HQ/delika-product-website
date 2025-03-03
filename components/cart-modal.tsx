"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CartItem } from "@/types/cart"

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
  menuCategories
}: CartModalProps) {
  const router = useRouter()

  const handleCheckout = () => {
    router.push(`/checkout/${branchId}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {branchName} - Your Cart
          </DialogTitle>
        </DialogHeader>

        {cart.length > 0 ? (
          <>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {cart.map((item) => {
                const menuItem = menuCategories
                  .flatMap(cat => cat.foods)
                  .find(food => food.name === item.name);

                return (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.name}</h3>
                        {menuItem?.available === false && (
                          <span className="text-xs text-red-500">(Unavailable)</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">GH₵ {item.price}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => onRemoveItem(item.id)}
                            disabled={!menuItem?.available}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => onAddItem(item.id)}
                            disabled={!menuItem?.available}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => onDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between mb-4">
                <span>Subtotal</span>
                <span>GH₵ {cartTotal.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Your cart is empty
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 