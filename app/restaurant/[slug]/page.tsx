"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { StoreHeader } from "@/components/store-header"
import { getBranches } from "@/lib/api"

interface Branch {
  id: string
  branchName: string
  branchLocation: string
  branchPhoneNumber: string
  branchCity: string
  branchLatitude: string
  branchLongitude: string
  _restaurantTable: Array<{
    restaurantName: string
    restaurantPhoneNumber: string
    restaurantLogo: {
      url: string
    }
  }>
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function RestaurantPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [branchId, setBranchId] = useState<string | null>(null)
  
  // Find the branch ID from the slug on mount
  useEffect(() => {
    async function fetchBranchId() {
      try {
        const branches = await getBranches<Branch[]>()
        
        // Find branch where combined (restaurant name + branch name) slugified text matches the URL slug
        const branch = branches.find((b: Branch) => {
          const restaurantName = b._restaurantTable[0]?.restaurantName || '';
          const branchName = b.branchName;
          const combinedSlug = slugify(`${restaurantName}-${branchName}`);
          return combinedSlug === resolvedParams.slug;
        });
        
        if (branch) {
          setBranchId(branch.id)
          localStorage.setItem('selectedBranchId', branch.id)
          localStorage.setItem('currentView', 'branch')
        }
      } catch (error) {
        console.error('Error finding branch ID from slug:', error)
      }
    }
    
    fetchBranchId()
  }, [resolvedParams.slug])
  
  // Helper function to create URL-friendly slugs
  function slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '')       // Trim - from end of text
  }
  
  return (
    <main>
      <StoreHeader />
    </main>
  )
} 