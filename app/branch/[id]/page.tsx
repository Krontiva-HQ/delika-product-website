"use client"

import { use } from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Star, MapPin, Phone, Clock, Info, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BranchDetailsModal } from "@/components/branch-details-modal"
import { EmptyState } from "@/components/empty-state"

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
  branchLatitude?: string
  branchLongitude?: string
  restaurantID?: string
}

interface BranchPageProps {
  params: {
    id: string
  }
}

export default function BranchPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const [branch, setBranch] = useState<BranchDetails | null>(null)
  const [activeTab, setActiveTab] = useState<'menu' | 'info'>('menu')
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branch details...</p>
        </div>
      </div>
    )
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          title={error || "Branch not found"}
          description="We couldn't find the branch you're looking for. Please try again."
          icon="store"
        />
      </div>
    )
  }

  const currentCategory = branch._menutable?.find((cat: { foodType: string }) => cat.foodType === selectedCategory)
  const restaurantInfo = branch._restaurantTable?.[0]
  const logoUrl = restaurantInfo?.restaurantLogo?.url || '/placeholder-image.jpg'
  const restaurantName = restaurantInfo?.restaurantName || branch.branchName || 'Restaurant'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-[300px]">
        <Image
          src={logoUrl}
          alt={restaurantName}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-bold mb-2">{restaurantName}</h1>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span className="ml-1">4.4</span>
              <span className="text-gray-300 ml-1">(500+)</span>
            </div>
            <span>•</span>
            <span>Delivery</span>
          </div>
        </div>
        <Button 
          className="absolute bottom-4 right-4 bg-white text-gray-900 hover:bg-gray-100"
          onClick={() => setActiveTab('info')}
        >
          More Info
        </Button>
      </div>

      {/* Three Column Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Menu Categories */}
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

          {/* Main Content */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="font-semibold mb-6">{selectedCategory}</h2>
              <div className="space-y-6">
                {currentCategory?.foods?.map((item) => (
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
                        <Button 
                          size="sm" 
                          className="bg-orange-500 hover:bg-orange-600"
                          disabled={!item.available}
                        >
                          {item.available ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )) || (
                  <EmptyState
                    title="No items found"
                    description="This category doesn't have any items yet."
                    icon="search"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="col-span-3 bg-white rounded-lg p-4 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="font-semibold">Your Cart</h2>
            </div>
            <div className="text-center text-gray-500 py-8">
              Your cart is empty
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" disabled>
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 