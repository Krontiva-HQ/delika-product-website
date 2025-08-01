"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckoutPage } from "@/components/checkout-page"

export default function PharmacyCheckoutPage() {
  const params = useParams()
  const shopId = params?.id as string

  const [cart, setCart] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [shopData, setShopData] = useState<any>(null)
  const [branchData, setBranchData] = useState<any>(null)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('pharmacyCart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch {}
    }

    // Load user data
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {}
    }

    // Load shop data
    const savedShopData = localStorage.getItem('selectedPharmacyShopData')
    if (savedShopData) {
      try {
        setShopData(JSON.parse(savedShopData))
      } catch {}
    }

    // Load branch data for coordinates
    const savedBranchData = localStorage.getItem('selectedPharmacyBranchData')
    if (savedBranchData) {
      try {
        setBranchData(JSON.parse(savedBranchData))
      } catch {}
    }
  }, [])

  // Remove inventory fetching - CheckoutPage component will handle "Add More Items" section internally

  const handleAddItem = (item: any) => {
    setCart(prev => {
      const updated = [
        ...prev,
        {
          ...item,
          name: item.productName,
          price: item.price,
          quantity: 1,
          available: typeof item.available === "boolean" ? item.available : true
        }
      ]
      localStorage.setItem('pharmacyCart', JSON.stringify(updated))
      return updated
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setCart(prev => {
      const updated = prev
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
            : item
        )
        .filter(item => item.quantity > 0)
      localStorage.setItem('pharmacyCart', JSON.stringify(updated))
      return updated
    })
  }

  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.price) || 0), 0)

  const shopCoordinates = branchData ? {
    latitude: parseFloat(branchData.pharmacybranchLatitude),
    longitude: parseFloat(branchData.pharmacybranchLongitude)
  } : undefined

  return (
    <CheckoutPage
      cart={cart.map(item => ({
        ...item,
        name: item.productName || item.name,
        price: item.price,
        available: typeof item.available === "boolean" ? item.available : true
      }))}
      cartTotal={cartTotal}
      onAddItem={(item) => handleAddItem(item)}
      onRemoveItem={handleRemoveItem}
      menuCategories={[]}
      branchId={shopId}
      branchName={shopData?.pharmacyshopName || "Pharmacy Shop"}
      restaurantName={shopData?.pharmacyshopName || "Pharmacy Shop"}
      branchCity=""
      onBackToCart={() => window.history.back()}
      branchLocation={shopCoordinates}
      branchPhone=""
      initialFullName={user?.fullName || ""}
      initialPhoneNumber={user?.phoneNumber || ""}
      inventory={[]}
      storeType="pharmacy"
    />
  )
} 