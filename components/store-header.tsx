"use client"

import { MapPin, Search, ChevronDown, ChevronLeft, Filter, Heart } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLoadScript } from "@react-google-maps/api"
import { LocationSearchModal } from "@/components/location-search-modal"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { EmptyState } from "@/components/empty-state"
import { AuthNav } from "@/components/auth-nav"
import { BranchPage } from "@/components/branch-page"
import { calculateDistance } from "@/utils/distance"
import { FavoritesSection } from "@/components/favorites-section"
import { getBranches, getCustomerDetails, updateFavorites } from "@/lib/api"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"

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

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface UserLocation {
  lat: string;
  long: string;
}

interface DeliveryAddress {
  fromAddress: string;
  fromLatitude: string;
  fromLongitude: string;
}

interface FavoriteRestaurant {
  branchName: string;
}

interface CustomerTable {
  id: string;
  userId: string;
  created_at: number;
  deliveryAddress: DeliveryAddress;
  favoriteRestaurants: FavoriteRestaurant[];
}

interface UserData {
  id: string;
  OTP: string;
  city: string;
  role: string;
  email: string;
  image: string | null;
  Status: boolean;
  onTrip: boolean;
  address: string;
  country: string;
  Location: UserLocation;
  branchId: string | null;
  deviceId: string;
  fullName: string;
  userName: string;
  tripCount: number;
  created_at: number;
  postalCode: string;
  addressFrom: string[];
  dateOfBirth: string | null;
  phoneNumber: string;
  restaurantId: string | null;
  customerTable: CustomerTable[];
}

export function StoreHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [userLocation, setUserLocation] = useState<string>("Loading location...")
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<'stores' | 'orders' | 'favorites' | 'profile' | 'settings' | 'branch'>('stores')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [likedBranches, setLikedBranches] = useState<Set<string>>(new Set())
  const [searchRadius, setSearchRadius] = useState<number>(8) // Default 8km radius
  const [showExpandedSearch, setShowExpandedSearch] = useState<boolean>(false)
  const [filteredOutResults, setFilteredOutResults] = useState<Branch[]>([])

  useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries
  })

  useEffect(() => {
    async function fetchBranchesData() {
      try {
        const data = await getBranches<Branch[]>()
        setBranches(data)
      } catch (error) {

      }
    }

    fetchBranchesData()
  }, [])

  useEffect(() => {
    // Load saved location on mount
    const savedLocationData = localStorage.getItem('userLocationData')
    if (savedLocationData) {
      const { address, lat, lng } = JSON.parse(savedLocationData)
      setUserLocation(address)
      setUserCoordinates({ lat, lng })
    } else {
      // Fall back to geolocation if no saved location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            setUserCoordinates({ lat: latitude, lng: longitude })

            // Convert coordinates to address using Google Geocoding
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
              )
              const data = await response.json()
              if (data.results[0]) {
                // Get city and area from address components
                const addressComponents = data.results[0].address_components as AddressComponent[]
                const city = addressComponents.find(
                  (component) => 
                    component.types.includes("locality") || 
                    component.types.includes("administrative_area_level_2")
                )
                const area = addressComponents.find(
                  (component) => component.types.includes("sublocality")
                )
                
                setUserLocation(
                  area 
                    ? `${area.short_name}, ${city?.short_name || ''}`
                    : city?.short_name || 'Location not found'
                )
              }
            } catch (error) {

              setUserLocation("Location not found")
            }
          },
          (error) => {

            setUserLocation("Location access denied")
          }
        )
      } else {
        setUserLocation("Geolocation not supported")
      }
    }
  }, [])

  useEffect(() => {
    // Check if we're on a restaurant page by examining the URL
    const path = pathname || ''

    
    if (path.startsWith('/restaurant/')) {
      const slug = path.split('/').pop() || ''

      
      if (slug) {
        // Find the branch ID from the slug
        const branch = branches.find(b => slugify(b.branchName) === slug)
        if (branch) {
          setSelectedBranchId(branch.id)
          setCurrentView('branch')
          localStorage.setItem('selectedBranchId', branch.id)
          localStorage.setItem('currentView', 'branch')
        }
      }
    } else if (path.startsWith('/branch/')) {
      const branchId = path.split('/').pop() || ''

      
      if (branchId) {
        setSelectedBranchId(branchId)
        setCurrentView('branch')
        localStorage.setItem('selectedBranchId', branchId)
        localStorage.setItem('currentView', 'branch')
      }
    }
  }, [pathname, branches])

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}') as UserData
      if (userData.id) {
        setUser(userData)
        // Fetch latest favorites data
        fetchUserFavorites(userData.id);
      }
    }
  }, [])

  // Get unique cities for filter
  const cities = Array.from(new Set(branches.map(branch => branch.branchCity)))

  // Filter branches by selected city
  const filteredBranches = selectedCity === 'all' 
    ? branches 
    : branches.filter(branch => branch.branchCity === selectedCity)

  // Filter branches by distance
  const filterBranchesByDistance = (branches: Branch[], userLat?: number, userLng?: number) => {
    if (!userLat || !userLng) return branches;

    return branches.filter(branch => {
      const distance = calculateDistance(
        userLat,
        userLng,
        parseFloat(branch.branchLatitude),
        parseFloat(branch.branchLongitude)
      );
      return distance <= searchRadius;
    });
  };

  // Add useEffect to handle filtered results
  useEffect(() => {
    if (!userCoordinates || !searchQuery) {
      setFilteredOutResults([]);
      setShowExpandedSearch(false);
      // Reset search radius when search is cleared
      setSearchRadius(8);
      return;
    }

    const outsideRadius = branches.filter(branch => {
      const distance = calculateDistance(
        userCoordinates.lat,
        userCoordinates.lng,
        parseFloat(branch.branchLatitude),
        parseFloat(branch.branchLongitude)
      );
      return distance > searchRadius && distance <= 15 && (
        branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch._restaurantTable[0].restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.branchLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredOutResults(outsideRadius);
    setShowExpandedSearch(outsideRadius.length > 0);
  }, [branches, searchQuery, userCoordinates, searchRadius]);

  // Add useEffect to reset search radius when returning to stores view
  useEffect(() => {
    if (currentView === 'stores') {
      setSearchRadius(8);
      setShowExpandedSearch(false);
      setFilteredOutResults([]);
    }
  }, [currentView]);

  // Further filter by search query
  const searchResults = searchQuery
    ? filterBranchesByDistance(
        filteredBranches.filter(branch => 
          branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          branch._restaurantTable[0].restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          branch.branchLocation.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        userCoordinates?.lat,
        userCoordinates?.lng
      )
    : filterBranchesByDistance(
        filteredBranches,
        userCoordinates?.lat,
        userCoordinates?.lng
      )

  const handleLocationSelect = ({ address, lat, lng }: { address: string; lat: number; lng: number }) => {
    setUserLocation(address)
    setUserCoordinates({ lat, lng })
    // Save to localStorage
    localStorage.setItem('userLocationData', JSON.stringify({ address, lat, lng }))
  }

  // Modify handleBranchSelect to use router navigation with slug
  const handleBranchSelect = (branch: Branch) => {
    // Store the branch ID in state and localStorage (keep for backward compatibility)
    setSelectedBranchId(branch.id)
    setCurrentView('branch')
    localStorage.setItem('selectedBranchId', branch.id)
    localStorage.setItem('currentView', 'branch')
    
    // Generate a URL-friendly slug from the restaurant name and branch name
    const slug = slugify(branch._restaurantTable[0].restaurantName, branch.branchName)
    
    // Navigate to the branch page with a shareable URL
    router.push(`/restaurant/${slug}`)
  }

  // Add effect to restore search query from localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem('lastSearchQuery');
    if (savedSearch) {
      setSearchQuery(savedSearch);
    }
  }, []);

  // Modify search input handler to save to localStorage
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      localStorage.setItem('lastSearchQuery', value);
    } else {
      localStorage.removeItem('lastSearchQuery');
    }
  };

  // Modify handleBackToStores to use router navigation
  const handleBackToStores = () => {
    setCurrentView('stores')
    setSelectedBranchId(null)
    localStorage.removeItem('selectedBranchId')
    localStorage.removeItem('currentView')
    
    // Stay on the current page but reset the view to show restaurants
    // This is more intuitive than navigating to the home page
    // We're not using router.push('/') as that would take users away from the restaurant listings
    
    // Don't reset search radius if we have an active search
    if (!searchQuery) {
      setSearchRadius(8)
      setShowExpandedSearch(false)
      setFilteredOutResults([])
    }
  }

  // Add function to fetch user favorites
  const fetchUserFavorites = async (userId: string) => {
    if (!userId) {
      return;
    }
    
   
    try {
      // Use our API utility function instead of direct fetch
      const customerData = await getCustomerDetails(userId);
      
      
      if (customerData?.favoriteRestaurants) {
        const favorites = new Set<string>(
          customerData.favoriteRestaurants.map((fav: FavoriteRestaurant) => fav.branchName)
        );

        setLikedBranches(favorites);
        localStorage.setItem('filteredFavoritesCount', favorites.size.toString());
      } else {

        setLikedBranches(new Set<string>());
        localStorage.setItem('filteredFavoritesCount', '0');
      }
    } catch (error) {

      // Clear favorites on error to prevent stale data
      setLikedBranches(new Set<string>());
      localStorage.setItem('filteredFavoritesCount', '0');
    }
  };

  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData)
    localStorage.setItem('userData', JSON.stringify(userData))
    
    // Fetch latest favorites after login
    fetchUserFavorites(userData.id);
  }

  const handleLogout = async () => {
    try {
      // First reset all modals
      setIsLoginModalOpen(false)
      setIsSignupModalOpen(false)

      // Clear user data
      setUser(null)
      
      // Clear favorites data
      setLikedBranches(new Set())
      localStorage.removeItem('filteredFavoritesCount')
      
      // Clear auth data
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      
      // Reset view and navigation
      setCurrentView('stores')
      setSelectedBranchId(null)
      localStorage.removeItem('selectedBranchId')
      localStorage.removeItem('currentView')

      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
    }
  }

  const handleLoginClick = () => {
    // Ensure modals are in correct state before opening
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const handleSignupClick = () => {
    // Ensure modals are in correct state before opening
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(true)
  }

  const handleHomeClick = () => {
    setCurrentView('stores')
    setSelectedBranchId(null)
    localStorage.removeItem('selectedBranchId')
    localStorage.removeItem('currentView')
  }

  // Update handleLikeToggle to refresh favorites after toggling
  const handleLikeToggle = async (branchName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent branch selection when clicking like
    e.preventDefault(); // Prevent any default behavior

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    const targetButton = e.currentTarget as HTMLButtonElement;
    const isCurrentlyLiked = likedBranches.has(branchName);
    
    // Provide immediate visual feedback
    targetButton.classList.add(isCurrentlyLiked ? 'animate-unliked' : 'animate-liked');
    
    try {
      // Optimistically update UI
      const newLikedBranches = new Set(likedBranches);
      if (isCurrentlyLiked) {
        newLikedBranches.delete(branchName);
      } else {
        newLikedBranches.add(branchName);
      }
      setLikedBranches(newLikedBranches);
      localStorage.setItem('filteredFavoritesCount', newLikedBranches.size.toString());
      


      // Call the CUSTOMER_FAVORITES_API endpoint
      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/customer/favorites/add/remove/restaurant', {
        method: 'PATCH',
        
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add authorization token
        },
        body: JSON.stringify({
          userId: user.id,
          branchName: branchName,
          liked: !isCurrentlyLiked,
          field_value: user.id // Add required field_value parameter
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorites');
      }

      const responseData = await response.json();
      
      // Fetch latest favorites to ensure sync with server
      await fetchUserFavorites(user.id);
    } catch (error) {
      // Revert UI if error occurred
      const revertedLikedBranches = new Set(likedBranches);
      setLikedBranches(revertedLikedBranches);
      localStorage.setItem('filteredFavoritesCount', revertedLikedBranches.size.toString());
    } finally {
      // Remove animation class after animation completes
      setTimeout(() => {
        targetButton.classList.remove('animate-liked', 'animate-unliked');
      }, 300);
    }
  };

  const handleExpandSearch = () => {
    setSearchRadius(15);
    setShowExpandedSearch(false);
  };

  // Helper function to create URL-friendly slugs
  // Now using both restaurant name and branch name to ensure uniqueness
  function slugify(text: string, branchName?: string): string {
    // If branch name is provided, combine restaurant name and branch name
    const slugText = branchName 
      ? `${text}-${branchName}`
      : text;
      
    return slugText
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '')       // Trim - from end of text
  }

  const renderContent = () => {
    switch (currentView) {
      case 'branch':
        return (
          <div className="container mx-auto px-4 py-8">
            <Link 
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handleBackToStores()
              }}
              className="mb-4 text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Restaurants
            </Link>
            <BranchPage params={{ id: selectedBranchId! }} />
          </div>
        )
      case 'orders':
        return (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
            <EmptyState
              title="No orders yet"
              description="When you place orders, they will appear here. Start ordering from your favorite restaurants!"
              icon="shopping-bag"
            />
          </div>
        )
      case 'favorites':
        return <FavoritesSection />
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
                <div className="flex items-center gap-2 md:gap-4 max-w-3xl w-full">
                  <div className="flex-[3] md:flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search restaurants and stores"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <button 
                    onClick={() => setIsLocationModalOpen(true)} 
                    className="flex items-center gap-1.5 hover:text-gray-600 flex-1 md:flex-initial"
                  >
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium truncate max-w-[100px] md:max-w-[200px]">{userLocation}</span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2 flex-shrink-0">
                        <Filter className="w-5 h-5" />
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
                    <Link
                      key={branch.id}
                      href={`/restaurant/${slugify(branch._restaurantTable[0].restaurantName, branch.branchName)}`}
                      onClick={(e) => {
                        e.preventDefault()
                        handleBranchSelect(branch)
                      }}
                      className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block"
                    >
                      <button 
                        className={`absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform ${
                          likedBranches.has(branch.id) 
                            ? 'text-orange-500 scale-110 hover:scale-105' 
                            : 'text-gray-400 hover:text-orange-500 hover:bg-white hover:scale-105'
                        }`}
                        onClick={(e) => handleLikeToggle(branch.id, e)}
                        aria-label={likedBranches.has(branch.id) ? "Unlike restaurant" : "Like restaurant"}
                      >
                        <Heart className={`w-5 h-5 transition-all duration-200 ${likedBranches.has(branch.id) ? 'fill-current' : ''}`} />
                      </button>
                      <div className="relative h-36">
                        <Image
                          src={branch._restaurantTable[0].restaurantLogo.url}
                          alt={branch._restaurantTable[0].restaurantName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 truncate">
                          {branch._restaurantTable[0].restaurantName}
                        </h3>
                        <span className="text-xs text-gray-600 truncate block">
                          {branch.branchName}
                        </span>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{branch.branchLocation}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  {showExpandedSearch ? (
                    <div className="text-center">
                      <div className="mb-4">
                        <Search className="w-12 h-12 text-gray-400 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        We found {filteredOutResults.length} {filteredOutResults.length === 1 ? 'restaurant' : 'restaurants'} matching your search, but they're a bit far from your location.
                      </p>
                      <button
                        onClick={handleExpandSearch}
                        className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2 border border-orange-600 rounded-md px-4 py-2 hover:bg-orange-50 transition-colors"
                      >
                        Click here to expand your search
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <EmptyState
                      title="No restaurants found"
                      description={searchQuery ? `We couldn't find any restaurants matching "${searchQuery}"` : "No restaurants available"}
                      icon="search"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div>
      <AuthNav 
        userData={user}
        onViewChange={setCurrentView}
        currentView={currentView}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
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
        onLoginSuccess={handleLoginSuccess}
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

