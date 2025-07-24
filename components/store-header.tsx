"use client"

import { MapPin, Search, ChevronDown, ChevronLeft, Filter, Heart, Settings2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState, useCallback, useMemo } from "react"
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
import { SettingsSection } from "@/components/settings-section"
import { getBranches, getCustomerDetails, updateFavorites } from "@/lib/api"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { GroceriesList } from "@/components/groceries-list";
import PharmacyPage from "@/app/pharmacy/page";

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
  branchUrl: string
  _restaurantTable: Restaurant[]
  created_at: number
  active: boolean
  slug: string
  _menutable?: {
    name: string;
    foods: {
      name: string;
      price: number;
      quantity: number;
    }[];
  }[];
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

interface Product {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: number;
  orderStatus: string;
  orderDate: string;
  totalPrice: number;
  paymentStatus: string;
  pickupName: string;
  dropoffName: string;
  orderComment?: string;
  products: Product[];
  // ...add other fields as needed
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
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState(1)
  const ORDERS_PER_PAGE = 10
  const [isBranchPageLoaded, setIsBranchPageLoaded] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterDeliveryType, setFilterDeliveryType] = useState('all');
  const [filterSortBy, setFilterSortBy] = useState('best');
  const [activeTab, setActiveTab] = useState("restaurants")

  useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries
  })

  useEffect(() => {
    async function fetchBranchesDirect() {
      try {
        setIsLoadingRestaurants(true);
        const apiUrl = process.env.NEXT_PUBLIC_BRANCHES_API;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_BRANCHES_API is not defined');
        }
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches directly:', error);
      } finally {
        setIsLoadingRestaurants(false);
      }
    }
    fetchBranchesDirect();
  }, []);

  useEffect(() => {
    // Load saved location on mount
    const loadLocationData = () => {
      const savedLocationData = localStorage.getItem('userLocationData')
      if (savedLocationData) {
        const { address, lat, lng } = JSON.parse(savedLocationData)
        setUserLocation(address)
        setUserCoordinates({ lat, lng })
        console.log('Loaded saved location:', { address, lat, lng })
      } else {
        // First visit - prompt user to select location
        console.log('First visit detected - prompting for location selection...')
        setUserLocation("Select delivery location")
        // Small delay to ensure component is mounted before showing modal
        setTimeout(() => {
          setIsLocationModalOpen(true)
        }, 1500)
      }
    }

    // Initial load
    loadLocationData()

    // Listen for location updates
    const handleLocationUpdate = (event: CustomEvent) => {
      const locationData = event.detail
      if (locationData && locationData.address) {
        console.log('StoreHeader received location update:', locationData)
        setUserLocation(locationData.address)
        setUserCoordinates({ lat: locationData.lat, lng: locationData.lng })
      }
    }

    window.addEventListener('locationUpdated', handleLocationUpdate as EventListener)
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    // Check if we're on a restaurant page by examining the URL
    const path = pathname || ''
    
    if (path.startsWith('/restaurants/')) {
      const branchSlug = path.split('/').pop() || ''
      
      if (branchSlug) {
        // Find the branch by slug
        const branch = branches.find(b => b.slug === branchSlug);
        
        if (branch) {
          setSelectedBranchId(branch.id)
          setCurrentView('branch')
          localStorage.setItem('selectedBranchId', branch.id)
          localStorage.setItem('currentView', 'branch')
        }
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

  // Filter branches by selected city and selected menu categories
  const filteredBranches = useMemo(() => {
    let result = selectedCity === 'all'
      ? branches.filter(branch => branch.active ?? true)
      : branches.filter(branch => (branch.active ?? true) && branch.branchCity === selectedCity);
    if (filterCategories.length > 0) {
      result = result.filter(branch =>
        branch._menutable?.some(menu => filterCategories.includes(menu.name))
      );
    }
    return result;
  }, [branches, selectedCity, filterCategories]);

  // Filter branches by distance
  const filterBranchesByDistance = (branches: Branch[], userLat?: number, userLng?: number) => {
    if (!userLat || !userLng) return branches;

    return branches.filter(branch => {
      const isActive = branch.active ?? true;
      if (!isActive) return false;
      
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
      setSearchRadius(8);
      return;
    }

    const outsideRadius = branches.filter(branch => {
      const isActive = branch.active ?? true;
      if (!isActive) return false;

      const distance = calculateDistance(
        userCoordinates.lat,
        userCoordinates.lng,
        parseFloat(branch.branchLatitude),
        parseFloat(branch.branchLongitude)
      );
      const matchesSearch = (
        branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch._restaurantTable[0]?.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.branchLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const isOutsideRange = distance > searchRadius && distance <= 15;
      
      return isOutsideRange && matchesSearch;
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
          branch._restaurantTable[0]?.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    console.log('StoreHeader location selected:', { address, lat, lng })
    setUserLocation(address)
    setUserCoordinates({ lat, lng })
    
    // Save location data in the format expected by other components
    localStorage.setItem('userLocationData', JSON.stringify({ address, lat, lng }))
    
    // Also save in the format used by the user location display (fallback)
    localStorage.setItem('userLocation', JSON.stringify({ address }))
    
    // Trigger event to notify other components
    window.dispatchEvent(new CustomEvent('locationUpdated', { detail: { address, lat, lng } }))
    
    setIsLocationModalOpen(false)
  }

  // Modify handleBranchSelect to handle loading state
  const handleBranchSelect = async (branch: Branch) => {
    try {
      setIsLoading(true)
      setIsBranchPageLoaded(false)
      
      // Validate branch data with more specific checks
      if (!branch) {
        throw new Error('Branch is undefined')
      }
      
      if (!branch._restaurantTable) {
        throw new Error('Restaurant table is undefined')
      }
      
      if (!Array.isArray(branch._restaurantTable) || branch._restaurantTable.length === 0) {
        throw new Error('Restaurant table is empty')
      }
      
      const restaurant = branch._restaurantTable[0]
      if (!restaurant || !restaurant.restaurantName) {
        throw new Error('Restaurant name is missing')
      }

      // First get the actual branch ID
      const branchResponse = await fetch(
        `https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_branches_table`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (!branchResponse.ok) {
        throw new Error('Failed to fetch branch data');
      }

      const branchesData = await branchResponse.json();
      const matchingBranch = branchesData.find((b: any) => b.slug === branch.slug);

      if (!matchingBranch || !matchingBranch.id) {
        throw new Error('Branch ID not found');
      }

      const actualBranchId = matchingBranch.id;

      // Set state with actual branch ID
      setSelectedBranchId(actualBranchId)
      setCurrentView('branch')
      
      // Store both the ID and slug in localStorage
      localStorage.setItem('selectedBranchId', actualBranchId)
      localStorage.setItem('branchSlug', branch.slug)
      localStorage.setItem('currentView', 'branch')
      
      // Navigate using only the slug (no ID in URL)
      await router.replace(`/restaurants/${branch.slug}`)
      
      setIsLoading(false)
      setIsBranchPageLoaded(true)
    } catch (error) {
      console.error('Navigation error:', error)
      setCurrentView('stores')
      setSelectedBranchId(null)
      setIsLoading(false)
    }
  }

  // Modify the useEffect that handles branch page loading
  useEffect(() => {
    if (currentView === 'branch' && selectedBranchId) {
      // Wait for branch page to be fully loaded
      const timer = setTimeout(() => {
        setIsBranchPageLoaded(true)
        setIsLoading(false)
      }, 1000) // Adjust this time if needed

      return () => clearTimeout(timer)
    }
  }, [currentView, selectedBranchId])

  // Add effect to restore search query from localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem('lastSearchQuery');
    if (savedSearch) {
      setSearchQuery(savedSearch);
    }
  }, []);

  // Modify search input handler to save to localStorage and emit events for all tabs
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      localStorage.setItem('lastSearchQuery', value);
    } else {
      localStorage.removeItem('lastSearchQuery');
    }
    
    // Emit search events for grocery and pharmacy components regardless of active tab
    window.dispatchEvent(new CustomEvent('grocerySearchUpdate', { 
      detail: { query: value } 
    }));
    window.dispatchEvent(new CustomEvent('pharmacySearchUpdate', { 
      detail: { query: value } 
    }));
  };

  // Modify handleBackToStores to use router navigation
  const handleBackToStores = () => {
    setCurrentView('stores')
    setSelectedBranchId(null)
    localStorage.removeItem('selectedBranchId')
    localStorage.removeItem('currentView')
    router.push('/')
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
      console.error('Error fetching user favorites:', error);

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
      console.error('Error during logout:', error);
    }
  }

  const handleLoginClick = () => {
    router.push('/login')
  }

  const handleSignupClick = () => {
    router.push('/signup')
  }

  const handleHomeClick = () => {
    setCurrentView('stores')
    setSelectedBranchId(null)
    localStorage.removeItem('selectedBranchId')
    localStorage.removeItem('currentView')
  }

  // Update handleLikeToggle to handle the response properly
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: user.id,
          branchName: branchName,
          liked: !isCurrentlyLiked,
          field_value: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorites');
      }

      // Don't try to set orders from the favorites response
      // Just refresh the favorites data
      await fetchUserFavorites(user.id);
      
    } catch (error) {
      console.error('Error toggling like:', error);
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

  const fetchOrderHistory = useCallback(async () => {
    localStorage.removeItem('orders');
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const url = new URL(process.env.NEXT_PUBLIC_GET_ORDER_PER_CUSTOMER_API || '');
      url.searchParams.append('userId', user.id);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch order history');
      const data = await response.json();
      setOrders(data);
      localStorage.setItem('orders', JSON.stringify(data));
      setCurrentView('orders');
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setCurrentView]);

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );


  useEffect(() => {
    if (currentView === 'orders' && user?.id) {
      fetchOrderHistory();
    }
  }, [currentView, user?.id, fetchOrderHistory]);

  // Get all unique menu categories from all branches
  const allCategories = Array.from(new Set(
    branches.flatMap(branch =>
      branch._menutable?.flatMap(menu => menu.foods?.map(food => food.name) || []) || []
    )
  )).sort();

  // Efficiently compute all unique menu categories (food types) from all branches
  const allMenuCategories = useMemo(() => {
    return Array.from(new Set(
      branches.flatMap(branch =>
        branch._menutable?.map(menu => menu.name) || []
      )
    )).filter(Boolean);
  }, [branches]);

  // Debug: Log branches and menu categories
  useEffect(() => {
    console.log('Branches:', branches);
  }, [branches]);
  useEffect(() => {
    console.log('All Menu Categories:', allMenuCategories);
  }, [allMenuCategories]);

  // Helper to filter out empty strings
  const nonEmpty = (arr: string[]) => arr.filter(Boolean);

  const renderRestaurantList = () => (
    <div className="container mx-auto px-4 py-6">
      {/* Menu Categories Bar */}
      {allMenuCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {allMenuCategories.map(category => (
            <button
              key={category}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm whitespace-nowrap hover:bg-orange-100 hover:text-orange-600 transition-colors"
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      )}
      {isLoadingRestaurants ? (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner 
            size="lg"
            color="orange"
            text="Loading restaurants..."
          />
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {searchResults.map((branch) => (
            <Link
              key={branch.id}
              href={`/restaurants/${branch.slug}`}
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
  )

  const renderContent = () => {
    if (isLoading && currentView === 'branch') {
      return null // Don't render content while loading branch page
    }

    switch (currentView) {
      case 'branch':
        const currentBranch = branches.find(b => b.id === selectedBranchId);
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
            {currentBranch && <BranchPage params={{ id: currentBranch.id }} />}
          </div>
        )
      case 'orders':
        return (
          <div className="py-8 w-full">
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                <div className="text-sm text-gray-500">
                  Showing {orders.length} orders
                </div>
              </div>

              {orders.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <div className="p-4">
                          {/* Header Section - Made more compact */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">#{order.orderNumber}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  order.orderStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                  order.orderStatus === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                                  order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">₵{Number(order.totalPrice).toFixed(2)}</div>
                              <p className="text-xs text-gray-500">{order.paymentStatus}</p>
                            </div>
                          </div>

                          {/* Order Details - More compact layout */}
                          <div className="space-y-4">
                            {/* Products Section */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                              <div className="space-y-2">
                                {order.products.map((product: Product, index: number) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full text-xs">
                                        {product.quantity}
                                      </span>
                                      <span className="text-gray-700 text-sm">{product.name}</span>
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">
                                      ₵{(Number(product.price) * Number(product.quantity)).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery Details - More compact */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                  </svg>
                                  <h4 className="text-xs font-medium text-gray-900">Pickup</h4>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{order.pickupName}</p>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                  </svg>
                                  <h4 className="text-xs font-medium text-gray-900">Delivery</h4>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{order.dropoffName}</p>
                              </div>
                            </div>

                            {/* Order Notes - More compact */}
                            {order.orderComment && (
                              <div className="bg-yellow-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  </svg>
                                  <h4 className="text-xs font-medium text-gray-900">Notes</h4>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{order.orderComment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
      case 'favorites':
        return <FavoritesSection />
      case 'profile':
        return <div>Profile content here</div>
      case 'settings':
        return <SettingsSection userData={user} onUserDataUpdate={(userData) => setUser(userData)} />
      default:
        return (
          <div>
            {/* Search and Store Content */}
            <div className="border-b">
              <div className="container mx-auto px-4 h-16 flex items-center justify-center">
                <div className="flex items-center gap-2 md:gap-4 max-w-3xl w-full">
                  {/* Location icon and formatted name on the left */}
                  <button 
                    onClick={() => setIsLocationModalOpen(true)} 
                    className="flex items-center gap-1.5 hover:text-gray-600 p-2 rounded-full border border-gray-200 bg-white min-w-0"
                    aria-label="Select delivery location"
                  >
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium truncate max-w-[100px] md:max-w-[200px] hidden md:inline">{userLocation}</span>
                  </button>
                  <div className="flex-1 relative flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search restaurants and stores"
                      className="w-full pl-10 pr-16 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    {/* Filter button opens modal */}
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full flex items-center gap-2 flex-shrink-0"
                      onClick={() => setIsFilterModalOpen(true)}
                      aria-label="Open filter options"
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Modal */}
            <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
              <DialogContent className="max-w-2xl p-0">
                <div className="p-6">
                  <DialogTitle className="mb-4">Filter Restaurants</DialogTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col gap-2">
                      <label className="block text-sm font-medium mb-1">City</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {nonEmpty(cities).map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Menu Categories */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col gap-2 md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Menu Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {allCategories.map(category => (
                          <button
                            key={category}
                            type="button"
                            className={`px-3 py-1 rounded-full border text-sm ${filterCategories.includes(category) ? 'bg-orange-100 border-orange-400 text-orange-700' : 'bg-white border-gray-300 text-gray-700'}`}
                            onClick={() => {
                              if (filterCategories.includes(category)) {
                                setFilterCategories(filterCategories.filter(c => c !== category));
                              } else {
                                setFilterCategories([...filterCategories, category]);
                              }
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium"
                      onClick={() => setIsFilterModalOpen(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 text-sm font-medium"
                      onClick={() => setIsFilterModalOpen(false)}
                      type="button"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Tabs for categories */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto px-4 py-4">
              <div className="w-full flex justify-center">
                <TabsList>
                  <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                  <TabsTrigger value="groceries">Groceries</TabsTrigger>
                  <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="restaurants">
                {renderRestaurantList()}
              </TabsContent>
              <TabsContent value="groceries">
                <GroceriesList />
              </TabsContent>
              <TabsContent value="pharmacy">
                <PharmacyPage />
              </TabsContent>
            </Tabs>
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
      {isLoading && currentView === 'branch' && (
        <LoadingSpinner 
          size="md"
          color="orange"
          text="Loading restaurant..."
          fullScreen
        />
      )}
      {!isLoading && renderContent()}
      
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
      />

      <LoginModal
        isOpen={false}
        onClose={() => {}}
        onSwitchToSignup={() => {}}
        onLoginSuccess={() => {}}
      />

      <SignupModal
        isOpen={false}
        onClose={() => {}}
        onLoginClick={() => {}}
        onSignupSuccess={() => {}}
      />
    </div>
  )
}

