"use client"

import { useEffect } from "react"
import { use } from "react"
import { PharmacyStoreHeader } from "@/components/store-header"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function PharmacyPage({ params }: PageProps) {
  const resolvedParams = use(params)

  useEffect(() => {
  // Get data from localStorage (set by VendorGrid)
  const pharmacyShopIdParam = typeof window !== "undefined"
    ? localStorage.getItem("selectedPharmacyShopId") || null
    : null;

  // Load shop info from localStorage
    const pharmacyData = localStorage.getItem('selectedPharmacyShopData');
    
    if (pharmacyData) {
      try {
        const pharmacy = JSON.parse(pharmacyData);
        
        // Set shop info from the main shop data
        localStorage.setItem('selectedPharmacyShopId', pharmacy.id);
        localStorage.setItem('currentView', 'pharmacy');
        
        console.log('Set pharmacy shop info from localStorage:', {
          id: pharmacy.id,
          name: pharmacy.pharmacyName,
          slug: pharmacy.slug
        });
      } catch (error) {
        console.error('Error parsing pharmacy data from localStorage:', error);
      }
    }
  }, [resolvedParams.slug])

  return (
    <main>
      <PharmacyStoreHeader />
    </main>
  )
} 