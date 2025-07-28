"use client"

import { useEffect } from "react"
import { use } from "react"
import { GroceriesStoreHeader } from "@/components/store-header"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function GroceryPage({ params }: PageProps) {
  const resolvedParams = use(params)

  useEffect(() => {
    // Get data from localStorage (set by VendorGrid)
    const groceryShopIdParam = typeof window !== "undefined"
      ? localStorage.getItem("selectedGroceryShopId") || null
      : null;

    // Load shop info from localStorage
    const groceryData = localStorage.getItem('selectedGroceryShopData');
    
    if (groceryData) {
      try {
        const grocery = JSON.parse(groceryData);
        
        // Set shop info from the main shop data
        localStorage.setItem('selectedGroceryShopId', grocery.id);
        localStorage.setItem('currentView', 'grocery');
        
        console.log('Set grocery shop info from localStorage:', {
          id: grocery.id,
          name: grocery.groceryshopName,
          slug: grocery.slug
        });
      } catch (error) {
        console.error('Error parsing grocery data from localStorage:', error);
      }
    }
  }, [resolvedParams.slug])

  return (
    <main>
      <GroceriesStoreHeader />
    </main>
  )
} 