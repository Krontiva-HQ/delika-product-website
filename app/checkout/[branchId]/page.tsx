"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { CheckoutPage } from "@/components/checkout-page"

interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
}

interface CustomerInfo {
  name: string
  phone: string
  address: string
  notes: string
}

interface BranchDetails {
  branchName: string
  branchLocation: string
  _restaurantTable: Array<{
    restaurantName: string
    restaurantLogo: {
      url: string
    }
  }>
}

export default function CheckoutRoute({ params }: { params: Promise<{ branchId: string }> }) {
  const resolvedParams = use(params)
  const [cart, setCart] = useState<CartItem[]>([])
  const [branch, setBranch] = useState<BranchDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem(`cart-${resolvedParams.branchId}`)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Error parsing saved cart:", e)
      }
    }
    
    // Fetch branch details
    async function fetchBranch() {
      try {
        setIsLoading(true)
        
        const detailsResponse = await fetch(
          `https://api-server.krontiva.africa/api:uEBBwbSs/get/branch/details?branchId=${resolvedParams.branchId}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }
        )
        
        const detailsData = await detailsResponse.json()
        setBranch(detailsData)
      } catch (error) {
        console.error('Error fetching branch:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranch()
  }, [resolvedParams.branchId])
  
  const addToCart = (item: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        const updatedCart = prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
        localStorage.setItem(`cart-${resolvedParams.branchId}`, JSON.stringify(updatedCart))
        return updatedCart
      }
      const newCart = [...prevCart, { ...item, quantity: 1 }]
      localStorage.setItem(`cart-${resolvedParams.branchId}`, JSON.stringify(newCart))
      return newCart
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        const updatedCart = prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        localStorage.setItem(`cart-${resolvedParams.branchId}`, JSON.stringify(updatedCart))
        return updatedCart
      }
      const updatedCart = prevCart.filter(item => item.id !== itemId)
      localStorage.setItem(`cart-${resolvedParams.branchId}`, JSON.stringify(updatedCart))
      return updatedCart
    })
  }

  const cartTotal = cart.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity)
  }, 0)

  const handleSubmitOrder = (customerInfo: CustomerInfo) => {
    console.log('Order placed:', { cart, customerInfo, total: cartTotal + 10 })
    // Here you would typically send this data to your backend
    
    // Clear cart after successful order
    localStorage.removeItem(`cart-${resolvedParams.branchId}`)
    setCart([])
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!branch || !branch._menutable) {
    return <div className="container mx-auto px-4 py-8">Branch not found</div>
  }

  return (
    <CheckoutPage
      cart={cart}
      cartTotal={cartTotal}
      onSubmitOrder={handleSubmitOrder}
      onAddItem={addToCart}
      onRemoveItem={removeFromCart}
      menuCategories={branch._menutable}
      branchId={resolvedParams.branchId}
      branchName={branch.branchName || ''}
      restaurantName={branch.restaurant?.[0]?.restaurantName || ''}
      branchCity={branch.branchCity || ''}
      onBackToCart={() => router.push('/shop')}
    />
  )
} 