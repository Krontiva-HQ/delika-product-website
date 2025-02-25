"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star, MapPin, Phone, Clock, Info, ShoppingCart, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BranchDetailsModal } from "@/components/branch-details-modal"
import { EmptyState } from "@/components/empty-state"
import { FloatingCart } from "@/components/floating-cart"
import { CartModal } from "@/components/cart-modal"

interface BranchDetails {
  _menutable?: Array<{
    foodType: string
    foods: Array<{
      name: string
      price: string
      available: boolean
      description?: string
      foodImage?: { url: string }
    }>
    foodTypeImage?: { url: string }
  }>
  _restaurantTable?: Array<{
    restaurantLogo?: { url: string }
    restaurantName?: string
  }>
  branchLocation: string
  branchPhoneNumber: string
  branchName?: string
  branchCity?: string
}

interface BranchPageProps {
  params: {
    id: string
  }
}

interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
}

export function BranchPage({ params }: BranchPageProps) {
  const [branch, setBranch] = useState<BranchDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({})
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)

  useEffect(() => {
    async function fetchBranch() {
      try {
        setIsLoading(true)
        setError(null)
        
        const detailsResponse = await fetch(
          `https://api-server.krontiva.africa/api:uEBBwbSs/get/branch/details?branchId=${params.id}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }
        )
        
        const detailsData = await detailsResponse.json()
        
        if (!detailsData || !detailsData._menutable) {
          setError("Invalid branch data received")
          return
        }

        setBranch(detailsData)
        if (detailsData._menutable?.[0]) {
          setSelectedCategory(detailsData._menutable[0].foodType)
        }
      } catch (error) {
        console.error('Error fetching branch:', error)
        setError("Failed to load branch details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranch()
  }, [params.id])

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prevCart.filter(item => item.id !== itemId)
    })
  }

  const getItemQuantity = (itemId: string) => {
    return cart.find(item => item.id === itemId)?.quantity || 0
  }

  const cartTotal = cart.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity)
  }, 0)

  const deleteFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !branch) {
    return <EmptyState title={error || "Branch not found"} description="We couldn't find the branch you're looking for." icon="store" />
  }

  const currentCategory = branch._menutable?.find((cat: { foodType: string }) => cat.foodType === selectedCategory)
  const restaurantInfo = branch._restaurantTable?.[0]
  const logoUrl = restaurantInfo?.restaurantLogo?.url || '/placeholder-image.jpg'
  const restaurantName = restaurantInfo?.restaurantName || branch.branchName || 'Restaurant'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Menu Categories - Left Sidebar */}
          <div className="col-span-3 bg-white rounded-lg p-4 h-fit">
            <h2 className="font-semibold mb-4">Menu Categories</h2>
            <div className="space-y-2">
              {branch._menutable?.map((category) => (
                <button 
                  key={category.foodType}
                  onClick={() => setSelectedCategory(category.foodType)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm ${
                    selectedCategory === category.foodType ? 'bg-gray-100' : ''
                  }`}
                >
                  {category.foodType}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Column */}
          <div className="col-span-6">
            {/* Restaurant Header */}
            <div className="bg-white rounded-xl overflow-hidden mb-6">
              <div className="relative h-[200px]">
                <Image
                  src={logoUrl}
                  alt={restaurantName}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h1 className="text-xl font-bold text-white mb-2">{branch.branchName}</h1>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      <span className="ml-1">4.4</span>
                      <span className="ml-1">(500+)</span>
                    </div>
                    <span>•</span>
                    <span>Delivery</span>
                    <span>•</span>
                    <span>{branch.branchCity}</span>
                  </div>
                </div>
                <Button 
                  className="absolute bottom-4 right-4 bg-white text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsDetailsModalOpen(true)}
                >
                  More Info
                </Button>
              </div>
              
              {/* Restaurant Quick Info */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{branch.branchLocation}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Open 8:00 AM - 10:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="font-semibold mb-6">{selectedCategory}</h2>
              <div className="space-y-6">
                {currentCategory?.foods?.map((item) => {
                  const quantity = getItemQuantity(item.name)
                  return (
                    <div key={item.name} className="flex gap-4 p-4 border rounded-lg">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={item.foodImage?.url || '/placeholder-image.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-medium text-gray-900">GH₵ {item.price}</span>
                          <div className="flex items-center gap-2">
                            {quantity > 0 ? (
                              <div className="flex items-center gap-3">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => removeFromCart(item.name)}
                                  className="h-8 w-8"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-medium w-4 text-center">{quantity}</span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => addToCart({
                                    id: item.name,
                                    name: item.name,
                                    price: item.price,
                                    quantity: 1,
                                    image: item.foodImage?.url
                                  })}
                                  className="h-8 w-8"
                                  disabled={!item.available}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="icon"
                                className="bg-orange-500 hover:bg-orange-600 h-8 w-8 rounded-full"
                                onClick={() => addToCart({
                                  id: item.name,
                                  name: item.name,
                                  price: item.price,
                                  quantity: 1,
                                  image: item.foodImage?.url
                                })}
                                disabled={!item.available}
                              >
                                {item.available ? <Plus className="h-4 w-4" /> : 'Out of Stock'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Add the new cart components */}
          <FloatingCart
            total={cartTotal}
            itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            onClick={() => setIsCartModalOpen(true)}
          />

          <CartModal
            isOpen={isCartModalOpen}
            onClose={() => setIsCartModalOpen(false)}
            cart={cart}
            onAddItem={(itemId) => {
              const item = cart.find(i => i.id === itemId)
              if (item) {
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: 1,
                  image: item.image
                })
              }
            }}
            onRemoveItem={removeFromCart}
            onDeleteItem={deleteFromCart}
            cartTotal={cartTotal}
          />
        </div>
      </div>

      {/* Branch Details Modal */}
      {branch && (
        <BranchDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          branch={{
            branchName: branch.branchName,
            branchLocation: branch.branchLocation,
            branchPhoneNumber: branch.branchPhoneNumber,
            branchCity: branch.branchCity,
            _restaurantTable: branch._restaurantTable
          }}
        />
      )}
    </div>
  )
} 