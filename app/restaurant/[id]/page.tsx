"use client"

import { useEffect } from "react"
import { use } from "react"
import { StoreHeader } from "@/components/store-header"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function RestaurantPage({ params }: PageProps) {
  const resolvedParams = use(params)
  
  // Store the selected branch ID in localStorage for compatibility with existing code
  useEffect(() => {
    if (resolvedParams.id) {
      localStorage.setItem('selectedBranchId', resolvedParams.id)
      localStorage.setItem('currentView', 'branch')
    }
  }, [resolvedParams.id])
  
  return (
    <main>
      <StoreHeader />
    </main>
  )
} 