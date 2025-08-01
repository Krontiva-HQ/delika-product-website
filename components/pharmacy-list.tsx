import { useEffect, useState } from "react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";
import Link from "next/link";
import { calculateDistance } from "@/utils/distance";
import { ChevronDown, Search, Heart, Clock } from "lucide-react";
import { isVendorOpen } from "@/lib/utils";

interface PharmacyBranch {
  id: string;
  pharmacybranchName: string;
  pharmacybranchLocation?: string;
  pharmacybranchLatitude: string | number;
  pharmacybranchLongitude: string | number;
  active?: boolean;
  activeHours?: Array<{
    day: string;
    openingTime: string;
    closingTime: string;
    isActive?: boolean;
  }>;
  _delika_pharmacy_table?: {
    pharmacyName?: string;
    pharmacyLogo?: { url?: string } | null;
    id?: string; // Added id to the interface
  };
}

interface UserData {
  id: string;
  customerTable?: Array<{
    id: string;
    userId: string;
    created_at: number;
    deliveryAddress?: {
      fromAddress: string;
      fromLatitude: string;
      fromLongitude: string;
    };
    favoriteRestaurants?: Array<{
      branchName: string;
    }>;
  }>;
}

interface FavoriteRestaurant {
  branchName: string;
}

export function PharmacyList() {
  const [branches, setBranches] = useState<PharmacyBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(8); // 8km default radius
  const [showExpandedSearch, setShowExpandedSearch] = useState<boolean>(false);
  const [filteredOutResults, setFilteredOutResults] = useState<PharmacyBranch[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUserSearched, setHasUserSearched] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [likedBranches, setLikedBranches] = useState<Set<string>>(new Set());

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('userData')
      const authToken = localStorage.getItem('authToken')
      console.log('checkAuth called:', { hasUserData: !!userData, hasAuthToken: !!authToken })
      
      if (userData && authToken) {
        const user = JSON.parse(userData)
        console.log('Setting user from localStorage:', user)
        setUser(user)
        // Fetch user favorites when user data is loaded
        if (user.id) {
          fetchUserFavorites(user.id)
        }
      } else {
        console.log('No user data or auth token found')
        setUser(null)
        setLikedBranches(new Set())
      }
    }

    // Initial check
    checkAuth()

    // Listen for auth state changes
    window.addEventListener('userDataUpdated', checkAuth)
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('userDataUpdated', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  // Add function to fetch user favorites
  const fetchUserFavorites = async (userId: string) => {
    if (!userId) {
      return;
    }
    
    try {
      // Use our API utility function instead of direct fetch
      const { getCustomerDetails } = await import('@/lib/api');
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

  // Handle like/unlike toggle for pharmacy branches
  const handleLikeToggle = async (branchId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('handleLikeToggle called with user:', user)
    
    if (!user) {
      console.log('No user found, opening login modal')
      // You can add login modal logic here if needed
      return
    }

    // Check if user has auth token
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      console.error('No auth token found, user needs to login again')
      // You can add login modal logic here if needed
      return
    }

    const currentlyLiked = likedBranches.has(branchId)

    try {
      // Optimistically update UI
      setLikedBranches(prev => {
        const newSet = new Set(prev)
        if (currentlyLiked) {
          newSet.delete(branchId)
        } else {
          newSet.add(branchId)
        }
        return newSet
      })

      // Call the favorites API using the environment variable
      const favoritesApiUrl = process.env.NEXT_PUBLIC_CUSTOMER_FAVORITES_API || 'https://api-server.krontiva.africa/api:uEBBwbSs/customer/favorites/add/remove/restaurant';
      
      console.log('Favorites API Debug Info:', {
        url: favoritesApiUrl,
        envVar: process.env.NEXT_PUBLIC_CUSTOMER_FAVORITES_API,
        userId: user.id,
        branchId,
        currentlyLiked,
        newLikedState: !currentlyLiked,
        hasAuthToken: !!authToken,
        authTokenLength: authToken?.length,
        requestPayload: {
          userId: user.id,
          branchName: branchId,
          liked: !currentlyLiked,
          field_value: user.id
        }
      })
      
      const response = await fetch(favoritesApiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: user.id,
          branchName: branchId,
          liked: !currentlyLiked,
          field_value: user.id
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: favoritesApiUrl,
          requestBody: {
            userId: user.id,
            branchName: branchId,
            liked: !currentlyLiked,
            field_value: user.id
          }
        })
        throw new Error(`Failed to update favorites: ${response.status} - ${errorText}`)
      }

      // Show feedback
      const feedbackElem = document.createElement('div')
      feedbackElem.textContent = !currentlyLiked ? 'Added to favorites!' : 'Removed from favorites'
      feedbackElem.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-md z-50'
      document.body.appendChild(feedbackElem)
      setTimeout(() => {
        if (document.body.contains(feedbackElem)) {
          document.body.removeChild(feedbackElem)
        }
      }, 2000)

      // Update localStorage favorites count for other components
      const currentCount = parseInt(localStorage.getItem('filteredFavoritesCount') || '0', 10)
      const newCount = !currentlyLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
      localStorage.setItem('filteredFavoritesCount', newCount.toString())

    } catch (error) {
      console.error('Error updating favorites:', error)
      // Revert UI if error occurred
      setLikedBranches(prev => {
        const newSet = new Set(prev)
        if (currentlyLiked) {
          newSet.add(branchId)
        } else {
          newSet.delete(branchId)
        }
        return newSet
      })
      
      // Show error feedback
      const feedbackElem = document.createElement('div')
      feedbackElem.textContent = 'Failed to update favorites'
      feedbackElem.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-md z-50'
      document.body.appendChild(feedbackElem)
      setTimeout(() => {
        if (document.body.contains(feedbackElem)) {
          document.body.removeChild(feedbackElem)
        }
      }, 2000)
    }
  }

  // Load user location from localStorage
  useEffect(() => {
    const loadLocationData = () => {
      const savedLocationData = localStorage.getItem('userLocationData');
      if (savedLocationData) {
        const { lat, lng } = JSON.parse(savedLocationData);
        setUserCoordinates({ lat, lng });
        console.log('[Location] User coordinates loaded:', { lat, lng });
      } else {
        console.log('[Location] No user location data found');
      }
    };

    // Initial load
    loadLocationData();

    // Listen for location updates
    const handleLocationUpdate = (event: CustomEvent) => {
      const locationData = event.detail;
      if (locationData && locationData.lat && locationData.lng) {
        console.log('[Location] Pharmacy received location update:', locationData);
        setUserCoordinates({ lat: locationData.lat, lng: locationData.lng });
      }
    };

    window.addEventListener('locationUpdated', handleLocationUpdate as EventListener);
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate as EventListener);
    };
  }, []);

  // Listen for search from store-header main search bar
  useEffect(() => {
    // Load saved search query on mount
    const savedSearch = localStorage.getItem('lastSearchQuery');
    if (savedSearch) {
      setSearchQuery(savedSearch);
      setHasUserSearched(true);
    }

    const handleSearchUpdate = (event: CustomEvent) => {
      const query = event.detail.query || "";
      setSearchQuery(query);
      setHasUserSearched(query.length > 0);
    };

    window.addEventListener('pharmacySearchUpdate', handleSearchUpdate as EventListener);
    return () => {
      window.removeEventListener('pharmacySearchUpdate', handleSearchUpdate as EventListener);
    };
  }, []);

  // Filter branches by search query
  const searchFilteredBranches = searchQuery
    ? branches.filter(branch =>
        branch.pharmacybranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch._delika_pharmacy_table?.pharmacyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.pharmacybranchLocation?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : branches;

  // Filter branches by distance and activity status
  const filterBranchesByDistance = (branches: PharmacyBranch[], userLat?: number, userLng?: number, radius: number = 8) => {
    console.log(`\n[Distance Filter] Starting distance calculations for ${branches.length} pharmacy branches`);
    console.log(`[Distance Filter] User Location: ${userLat}, ${userLng}`);
    console.log(`[Distance Filter] Search Radius: ${radius}km\n`);

    if (!userLat || !userLng) {
      console.log('[Distance Filter] No user coordinates, returning all branches');
      return branches;
    }

    return branches.filter(branch => {
      console.log(`\n[Branch] Processing ${branch.pharmacybranchName}`);
      console.log(`[Branch] Active status:`, branch.active);
      console.log(`[Branch] Raw coordinates - Lat: ${branch.pharmacybranchLatitude}, Lng: ${branch.pharmacybranchLongitude}`);
      
      const branchLat = parseFloat(branch.pharmacybranchLatitude.toString());
      const branchLng = parseFloat(branch.pharmacybranchLongitude.toString());
      
      console.log(`[Branch] Parsed coordinates - Lat: ${branchLat}, Lng: ${branchLng}`);
      
      if (isNaN(branchLat) || isNaN(branchLng)) {
        console.log('[Branch] Skipped - Invalid coordinates');
        return false;
      }
      
      const distance = calculateDistance(
        userLat,
        userLng,
        branchLat,
        branchLng
      );

      console.log(`[Branch] Calculated distance: ${distance.toFixed(2)}km`);
      console.log(`[Branch] Within ${radius}km radius: ${distance <= radius}`);
      
      // For testing, include all branches within radius regardless of active status
      return distance <= radius;
    });
  };

  // Get filtered results within radius
  const filteredBranches = filterBranchesByDistance(
    searchFilteredBranches,
    userCoordinates?.lat,
    userCoordinates?.lng,
    searchRadius
  );

  // Handle expanded search for branches outside 8km but within 15km
  useEffect(() => {
    if (!userCoordinates || !hasUserSearched) {
      setFilteredOutResults([]);
      setShowExpandedSearch(false);
      return;
    }

    const outsideRadius = searchFilteredBranches.filter(branch => {
      // Only consider active branches
      const isActive = branch.active !== false;
      if (!isActive) return false;

      const branchLat = parseFloat(branch.pharmacybranchLatitude.toString());
      const branchLng = parseFloat(branch.pharmacybranchLongitude.toString());
      
      if (isNaN(branchLat) || isNaN(branchLng)) return false;

      const distance = calculateDistance(
        userCoordinates.lat,
        userCoordinates.lng,
        branchLat,
        branchLng
      );

      // Only include active branches that are between 8km and 15km
      return isActive && distance > 8 && distance <= 15;
    });

    // Only show expanded search if user searched, no results within 8km, but results between 8-15km
    setFilteredOutResults(outsideRadius);
    setShowExpandedSearch(outsideRadius.length > 0 && filteredBranches.length === 0 && hasUserSearched);
  }, [searchFilteredBranches, userCoordinates, filteredBranches.length, hasUserSearched]);

  useEffect(() => {
    async function fetchPharmacyBranches() {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_PHARMACY_SHOPS_API;
        if (!apiUrl) throw new Error("NEXT_PUBLIC_PHARMACY_SHOPS_API is not defined");
        console.log("Fetching pharmacy branches from:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log("Pharmacy branches response:", data);
        setBranches(Array.isArray(data) ? data : []);
      } catch (error) {
        setBranches([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPharmacyBranches();
  }, []);

  const handleExpandSearch = () => {
    setSearchRadius(15);
    setShowExpandedSearch(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" color="orange" text="Loading pharmacies..." />
      </div>
    );
  }

  if (!filteredBranches.length) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center py-8">
          {showExpandedSearch && filteredOutResults.length > 0 ? (
            <div className="text-center">
              <div className="mb-4">
                <Search className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">
                We found {filteredOutResults.length} {filteredOutResults.length === 1 ? 'pharmacy' : 'pharmacies'} near you, but they're a bit far from your location.
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
            <div className="text-center">
              <div className="mb-4">
                <Search className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
              <p className="text-gray-500 text-sm">
                {userCoordinates 
                  ? "No pharmacies available within 8km of your location" 
                  : "Please set your delivery location to see nearby pharmacies"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBranches.map((branch) => {
          // Check if vendor is open based on working hours
          const isOpen = isVendorOpen(branch.activeHours);
          
          return (
          <div key={branch.id} className="relative">
            <Link
              href={`/pharmacy/${branch.id}`}
              onClick={(e) => {
                if (!isOpen) {
                  e.preventDefault();
                  // Don't navigate if vendor is closed
                  return;
                }
                localStorage.setItem("selectedPharmacyBranchId", branch.id);
                localStorage.setItem("selectedPharmacyShopId", branch._delika_pharmacy_table?.id || "");
                // Store pharmacy name and logo for details page
                localStorage.setItem("selectedPharmacyShopData", JSON.stringify({
                  pharmacyshopName: branch._delika_pharmacy_table?.pharmacyName || "",
                  pharmacyshopLogo: branch._delika_pharmacy_table?.pharmacyLogo || null
                }));
                // Store branch coordinates for delivery calculation
                localStorage.setItem("selectedPharmacyBranchData", JSON.stringify({
                  pharmacybranchLatitude: branch.pharmacybranchLatitude,
                  pharmacybranchLongitude: branch.pharmacybranchLongitude,
                  pharmacybranchName: branch.pharmacybranchName,
                  pharmacybranchLocation: branch.pharmacybranchLocation
                }));
              }}
              className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative block ${
                !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="relative h-36">
                {branch._delika_pharmacy_table?.pharmacyLogo?.url ? (
                  <Image
                    src={branch._delika_pharmacy_table.pharmacyLogo.url}
                    alt={branch._delika_pharmacy_table.pharmacyName || "Pharmacy Shop"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
                {/* Favorite Button */}
                <button
                  onClick={(e) => handleLikeToggle(branch.id, e)}
                  className={`absolute top-2 right-2 z-10 rounded-full p-1.5 shadow-md transition-all duration-200 ${
                    likedBranches.has(branch.id)
                      ? 'bg-orange-100 text-orange-500 border border-orange-200 hover:bg-orange-200'
                      : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-100'
                  }`}
                  aria-label={likedBranches.has(branch.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 transition-all duration-200 ${likedBranches.has(branch.id) ? 'fill-current' : ''}`} />
                </button>

                {/* Closed indicator */}
                {!isOpen && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Closed
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 truncate">
                  {branch._delika_pharmacy_table?.pharmacyName || "No Name"}
                </h3>
                <span className="text-xs text-gray-600 truncate block">
                  {branch.pharmacybranchName}
                </span>
                <span className="text-xs text-gray-500 truncate block">
                  {branch.pharmacybranchLocation}
                </span>
                
                {/* Status indicator */}
                {!isOpen && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-500">Closed</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
          );
        })}
      </div>
    </div>
  );
}