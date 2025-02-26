"use client"

import { MapPin, Search, SlidersHorizontal, Star, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { BranchDetailsModal } from "@/components/branch-details-modal"
import { useLoadScript } from "@react-google-maps/api"
import { LocationSearchModal } from "@/components/location-search-modal"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { EmptyState } from "@/components/empty-state"
import { AuthNav } from "@/components/auth-nav"
import { BranchPage } from "@/components/branch-page"

interface Restaurant {
  restaurantName: string
  restaurantPhoneNumber: string
  restaurantLogo: {
    url: string
  }
}

interface Branch {
  id: string
  branchName: string
  branchLocation: string
  branchPhoneNumber: string
  branchCity: string
  branchLatitude: string
  branchLongitude: string
  _restaurantTable: Restaurant[]
  created_at: number
}

type Libraries = ("places" | "geocoding")[]

const libraries: Libraries = ["places", "geocoding"]

export function StoreHeader() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [activeTab, setActiveTab] = useState<'restaurants' | 'menus'>('restaurants')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [userLocation, setUserLocation] = useState<string>("Loading location...")
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<'stores' | 'orders' | 'favorites' | 'profile' | 'settings' | 'branch'>('stores')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [user, setUser] = useState<{ name: string, email: string } | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries
  })

  useEffect(() => {
    async function fetchBranches() {
      try {
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_branches_table')
        const data = await response.json()
        setBranches(data)
      } catch (error) {
        console.error('Error fetching branches:', error)
      }
    }

    fetchBranches()
  }, [])

  useEffect(() => {
    // Get user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ lat: latitude, lng: longitude })

          // Convert coordinates to address using Google Geocoding
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            )
            const data = await response.json()
            if (data.results[0]) {
              // Get city and area from address components
              const addressComponents = data.results[0].address_components
              const city = addressComponents.find(
                (component: any) => 
                  component.types.includes("locality") || 
                  component.types.includes("administrative_area_level_2")
              )
              const area = addressComponents.find(
                (component: any) => component.types.includes("sublocality")
              )
              
              setUserLocation(
                area 
                  ? `${area.short_name}, ${city?.short_name || ''}`
                  : city?.short_name || 'Location not found'
              )
            }
          } catch (error) {
            console.error("Error fetching address:", error)
            setUserLocation("Location not found")
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setUserLocation("Location access denied")
        }
      )
    } else {
      setUserLocation("Geolocation not supported")
    }
  }, [])

  useEffect(() => {
    // Check localStorage for selected branch on mount
    const savedBranchId = localStorage.getItem('selectedBranchId')
    const savedView = localStorage.getItem('currentView')
    if (savedBranchId && savedView) {
      setSelectedBranchId(savedBranchId)
      setCurrentView(savedView as any)
    }
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      // Fetch user data or decode token
      // For now, we'll just check if token exists
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      if (userData.name) {
        setUser(userData)
      }
    }
  }, [])

  // Get unique cities for filter
  const cities = Array.from(new Set(branches.map(branch => branch.branchCity)))

  // Filter branches by selected city
  const filteredBranches = selectedCity === 'all' 
    ? branches 
    : branches.filter(branch => branch.branchCity === selectedCity)

  // Further filter by search query
  const searchResults = searchQuery
    ? filteredBranches.filter(branch => 
        branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch._restaurantTable[0].restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.branchLocation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredBranches

  const handleLocationSelect = ({ address, lat, lng }: { address: string; lat: number; lng: number }) => {
    setUserLocation(address)
    setCoordinates({ lat, lng })
  }

  // Save to localStorage when branch is selected
  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranchId(branch.id)
    setCurrentView('branch')
    localStorage.setItem('selectedBranchId', branch.id)
    localStorage.setItem('currentView', 'branch')
  }

  // Clear localStorage when going back to stores
  const handleBackToStores = () => {
    setCurrentView('stores')
    setSelectedBranchId(null)
    localStorage.removeItem('selectedBranchId')
    localStorage.removeItem('currentView')
  }

  const handleLoginSuccess = (userData: { name: string, email: string }) => {
    setUser(userData)
    localStorage.setItem('userData', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setCurrentView('stores')
  }

  const handleHomeClick = () => {
    setCurrentView('stores')
    setSelectedBranchId(null)
    localStorage.removeItem('selectedBranchId')
    localStorage.removeItem('currentView')
  }

  const renderContent = () => {
    switch (currentView) {
      case 'branch':
        return (
          <div className="container mx-auto px-4 py-8">
            <button 
              onClick={handleBackToStores}
              className="mb-4 text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Stores
            </button>
            <BranchPage params={{ id: selectedBranchId! }} />
          </div>
        )
      case 'orders':
        return <div>Orders content here</div>
      case 'favorites':
        return <div>Favorites content here</div>
      case 'profile':
        return <div>Profile content here</div>
      case 'settings':
        return <div>Settings content here</div>
      default:
        return (
          <div>
            {/* Search and Store Content */}
            <div className="border-b">
              <div className="container mx-auto px-4 h-16 flex items-center justify-center">
                <div className="flex items-center gap-4 max-w-3xl w-full">
                  <button 
                    onClick={() => setIsLocationModalOpen(true)} 
                    className="flex items-center gap-2 hover:text-gray-600 max-w-[200px]"
                  >
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium truncate">{userLocation}</span>
                  </button>

                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search restaurants and stores"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-gray-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5" />
                        <span className="text-sm">Filter</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setSelectedCity('all')}>
                        All Locations
                      </DropdownMenuItem>
                      {cities.map((city) => (
                        <DropdownMenuItem key={city} onClick={() => setSelectedCity(city)}>
                          {city}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Store Listings */}
            <div className="container mx-auto px-4 py-6">
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {searchResults.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleBranchSelect(branch)}
                      className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left"
                    >
                      <div className="relative h-36">
                        <Image
                          src={branch._restaurantTable[0].restaurantLogo.url}
                          alt={branch._restaurantTable[0].restaurantName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 truncate">
                          {branch.branchName}
                        </h3>
                        <span className="text-xs text-gray-600 truncate block">
                          {branch._restaurantTable[0].restaurantName}
                        </span>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{branch.branchLocation}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>4.5</span>
                          <span className="text-gray-600">(500+)</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No restaurants found"
                  description={searchQuery ? `We couldn't find any restaurants matching "${searchQuery}"` : "No restaurants available"}
                  icon="search"
                />
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div>
      <AuthNav 
        userName={user?.name}
        onViewChange={setCurrentView}
        currentView={currentView}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSignupClick={() => setIsSignupModalOpen(true)}
        onLogout={handleLogout}
        onHomeClick={handleHomeClick}
      />
      {renderContent()}
      
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
        onLoginSuccess={(userData) => {
          setUser(userData)
          setIsLoginModalOpen(false)
        }}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
        onSignupSuccess={handleLoginSuccess}
      />
    </div>
  )
}

