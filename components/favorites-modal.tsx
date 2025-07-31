"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Heart } from "lucide-react"
import { calculateDistance } from "@/lib/distance"

interface FavoritesModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Branch {
  id: string
  branchName: string
  branchLocation: string
  branchCity: string
  branchLatitude: string
  branchLongitude: string
  _restaurantTable: Array<{
    restaurantName: string
    restaurantLogo: {
      url: string
    }
    image_url?: string
  }>
}

export function FavoritesModal({ isOpen, onClose }: FavoritesModalProps) {
  const [favoriteBranches, setFavoriteBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [removingFavorites, setRemovingFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      // Load saved location
      const savedLocationData = localStorage.getItem('userLocationData')
      if (savedLocationData) {
        const { lat, lng } = JSON.parse(savedLocationData)
        setUserCoordinates({ lat, lng })
      }

      // Fetch favorites
      fetchFavorites()
    }
  }, [isOpen])

  const fetchFavorites = async () => {
    try {
      setIsLoading(true)
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      
      if (!userData.id) {
        setFavoriteBranches([])
        return
      }

      const customerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_CUSTOMER_DETAILS_API}?userId=${userData.id}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (!customerResponse.ok) throw new Error('Failed to fetch favorites')

      const customerData = await customerResponse.json()
      const favoriteIds = customerData.favoriteRestaurants?.map((fav: { branchName: string }) => fav.branchName) || []

      if (favoriteIds.length === 0) {
        setFavoriteBranches([])
        return
      }

      const branchesResponse = await fetch(process.env.NEXT_PUBLIC_BRANCHES_API!)
      if (!branchesResponse.ok) throw new Error('Failed to fetch branches')

      const allBranches = await branchesResponse.json()
      let userFavorites = allBranches.filter((branch: Branch) => 
        favoriteIds.includes(branch.id)
      )

      if (userCoordinates) {
        userFavorites = userFavorites.filter(branch => {
          const distance = calculateDistance(
            userCoordinates.lat,
            userCoordinates.lng,
            parseFloat(branch.branchLatitude),
            parseFloat(branch.branchLongitude)
          )
          return distance <= 8
        })
      }

      setFavoriteBranches(userFavorites)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFavorite = async (branchId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      setRemovingFavorites(prev => new Set(prev).add(branchId))
      
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      if (!userData.id) return

      await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/customer/favorites/add/remove/restaurant', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: userData.id,
          branchName: branchId,
          liked: false,
          field_value: userData.id
        })
      })
      
      setFavoriteBranches(prev => prev.filter(branch => branch.id !== branchId))
      localStorage.setItem('filteredFavoritesCount', (favoriteBranches.length - 1).toString())
    } catch (error) {
      console.error('Error removing favorite:', error)
    } finally {
      setRemovingFavorites(prev => {
        const updated = new Set(prev)
        updated.delete(branchId)
        return updated
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Favorites</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-8">Loading favorites...</div>
          ) : favoriteBranches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {userCoordinates 
                ? "None of your favorite restaurants are within 8km of your location."
                : "You haven't added any restaurants to your favorites yet."}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {favoriteBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => {
                    onClose()
                    window.location.href = `/branch/${branch.id}`
                  }}
                >
                  <button 
                    className={`absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform ${
                      removingFavorites.has(branch.id)
                        ? 'opacity-50 pointer-events-none'
                        : 'text-orange-500 scale-110 hover:scale-105'
                    }`}
                    onClick={(e) => handleRemoveFavorite(branch.id, e)}
                    disabled={removingFavorites.has(branch.id)}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                  <div className="relative h-32">
                    <Image
                      src={branch._restaurantTable[0].image_url || branch._restaurantTable[0].restaurantLogo.url}
                      alt={branch._restaurantTable[0].restaurantName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold truncate text-gray-900">
                      {branch._restaurantTable[0].restaurantName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{branch.branchName}</p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{branch.branchLocation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}