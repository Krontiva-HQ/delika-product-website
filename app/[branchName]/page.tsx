"use client"

import { use } from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Star, MapPin, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BranchDetailsModal } from "@/components/branch-details-modal"
import { EmptyState } from "@/components/empty-state"

interface MenuItem {
  id: string
  name: string
  price: number
  description: string
  category: string
}

interface Category {
  id: string
  name: string
  items: MenuItem[]
}

interface MenuCategory {
  id: string
  foodType: string
  foods: MenuItem[]
  foodTypeImage: {
    url: string
  }
}

interface BranchDetails {
  id: string
  branchName: string
  branchLocation: string
  branchPhoneNumber: string
  branchCity: string
  _menutable: MenuCategory[]
  _restaurantTable: Array<{
    restaurantName: string
    restaurantLogo: {
      url: string
    }
  }>
}

interface BranchPageProps {
  params: {
    branchName: string
  }
}

export default function BranchPage({ params: paramsPromise }: { params: Promise<{ branchName: string }> }) {
  const params = use(paramsPromise)
  const [branch, setBranch] = useState<BranchDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBranch() {
      try {
        setIsLoading(true)
        setError(null)
        
        // First get all branches
        const branchesResponse = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_branches_table')
        const branchesData = await branchesResponse.json()
        
        const foundBranch = branchesData?.find((b: any) => 
          b.branchName.toLowerCase().replace(/\s+/g, '-') === params.branchName
        )

        if (foundBranch) {
          // Then get branch details with the correct endpoint
          const detailsResponse = await fetch(
            `https://api-server.krontiva.africa/api:uEBBwbSs/get/branch/details?id=${foundBranch.id}&branchName=${encodeURIComponent(foundBranch.branchName)}&restaurantID=${foundBranch.restaurantID}`, 
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          )
          
          const detailsData = await detailsResponse.json()
          
          if (!detailsData || !detailsData._menutable) {
            setError("Invalid branch data received")
            return
          }

          // Transform the data to match our interface
          const transformedData: BranchDetails = {
            id: detailsData.id,
            branchName: detailsData.branchName,
            branchLocation: detailsData.branchLocation,
            branchPhoneNumber: detailsData.branchPhoneNumber,
            branchCity: detailsData.branchCity,
            _menutable: detailsData._menutable.map((menu: any) => ({
              id: menu.id,
              foodType: menu.foodType,
              foods: menu.foods.map((food: any) => ({
                id: food.id,
                name: food.name,
                price: food.price,
                description: food.description,
                category: food.category,
              })),
              foodTypeImage: {
                url: menu.foodTypeImage.url
              }
            })),
            _restaurantTable: [{
              restaurantName: foundBranch._restaurantTable[0].restaurantName,
              restaurantLogo: {
                url: foundBranch._restaurantTable[0].restaurantLogo.url
              }
            }]
          }

          setBranch(transformedData)
          if (transformedData._menutable?.[0]) {
            setSelectedCategory(transformedData._menutable[0].foodType)
          }
        } else {
          setError("Branch not found")
        }
      } catch (error) {
        console.error('Error fetching branch:', error)
        setError("Failed to load branch details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranch()
  }, [params.branchName])

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
      <div className="min-h-screen bg-gray-50">
        <EmptyState
          title={error || "Branch not found"}
          description="We couldn't find the branch you're looking for. Please try again."
          icon="store"
        />
      </div>
    )
  }

  const currentCategory = branch._menutable?.find(cat => cat.foodType === selectedCategory)

  const restaurantInfo = branch?._restaurantTable?.[0]
  const logoUrl = restaurantInfo?.restaurantLogo?.url || '/placeholder-image.jpg'
  const restaurantName = restaurantInfo?.restaurantName || branch?.branchName || 'Restaurant'

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="relative h-[200px] rounded-t-xl overflow-hidden mb-6">
              <Image
                src={logoUrl}
                alt={restaurantName}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-24" />
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
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="font-semibold mb-6">{selectedCategory}</h2>
              <div className="space-y-6">
                {currentCategory?.foods?.map((item) => (
                  <div key={item.name} className="flex gap-4 p-4 border rounded-lg">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.foodImage.url}
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

          {/* Cart - Right Sidebar */}
          <div className="col-span-3 bg-white rounded-lg p-4 h-fit">
            {/* ... existing cart code ... */}
          </div>
        </div>
      </div>

      {/* Branch Details Modal */}
      <BranchDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        branch={branch}
      />
    </div>
  )
} 