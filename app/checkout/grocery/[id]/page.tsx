"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckoutPage } from "@/components/checkout-page"

export default function GroceryCheckoutPage() {
  const params = useParams()
  const shopId = params?.id as string

  const [cart, setCart] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [shopData, setShopData] = useState<any>(null)
  const [branchData, setBranchData] = useState<any>(null)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('groceryCart')
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
    const savedShopData = localStorage.getItem('selectedGroceryShopData')
    if (savedShopData) {
      try {
        setShopData(JSON.parse(savedShopData))
      } catch {}
    }

    // Load branch data for coordinates
    const savedBranchData = localStorage.getItem('selectedGroceryBranchData')
    if (savedBranchData) {
      try {
        setBranchData(JSON.parse(savedBranchData))
      } catch {}
    }
  }, [])

  // Fetch inventory for "Add More Items" section using API
  useEffect(() => {
    async function fetchInventory() {
      try {
        // Use the new slug-based API endpoint
        const apiUrl = `https://api-server.krontiva.africa/api:uEBBwbSs/groceries/${shopId}`;
        console.log("Fetching grocery inventory for checkout from:", apiUrl);
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch grocery data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Grocery checkout API response:", data);
        
        const normalize = (item: any) => ({
          ...item,
          id: item.id,
          productName: item.productName,
          price: item.price?.toString() || "0",
          category: item.category,
          description: item.description,
          available: typeof item.available === "boolean" ? item.available : true,
          image: item.image_url || item.image?.url || item.image || null,
        });
        
        if (Array.isArray(data.ShopsInventory)) {
          // Take 6 random items from the inventory
          const randomItems = data.ShopsInventory
            .map(normalize)
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);
          setInventory(randomItems);
        } else if (data.ShopsInventory && typeof data.ShopsInventory === 'object') {
          setInventory([normalize(data.ShopsInventory)]);
        } else {
          setInventory([]);
        }
      } catch (error) {
        console.error('Error fetching inventory for checkout:', error);
        setInventory([]);
      }
    }

    if (shopId) {
      fetchInventory();
    }
  }, [shopId])

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
      localStorage.setItem('groceryCart', JSON.stringify(updated))
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
      localStorage.setItem('groceryCart', JSON.stringify(updated))
      return updated
    })
  }

  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.price) || 0), 0)

  const shopCoordinates = branchData ? {
    latitude: parseFloat(branchData.grocerybranchLatitude),
    longitude: parseFloat(branchData.grocerybranchLongitude)
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
      branchName={shopData?.groceryshopName || "Grocery Shop"}
      restaurantName={shopData?.groceryshopName || "Grocery Shop"}
      branchCity=""
      onBackToCart={() => window.history.back()}
      branchLocation={shopCoordinates}
      branchPhone=""
      initialFullName={user?.fullName || ""}
      initialPhoneNumber={user?.phoneNumber || ""}
      inventory={inventory}
      storeType="grocery"
    />
  )
}