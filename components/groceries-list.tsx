import { useEffect, useState } from "react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";
import Link from "next/link";
import { calculateDistance } from "@/utils/distance";
import { ChevronDown, Search } from "lucide-react";

interface GroceryBranch {
  id: string;
  grocerybranchName: string;
  grocerybranchLocation: string;
  groceryshopID: string;
  grocerybranchLatitude: string | number;
  grocerybranchLongitude: string | number;
  active?: boolean;
  _delika_groceries_shops_table?: {
    groceryshopName?: string;
    groceryshopLogo?: { url: string } | null;
  };
}

export function GroceriesList() {
  const [branches, setBranches] = useState<GroceryBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(8); // 8km default radius
  const [showExpandedSearch, setShowExpandedSearch] = useState<boolean>(false);
  const [filteredOutResults, setFilteredOutResults] = useState<GroceryBranch[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUserSearched, setHasUserSearched] = useState<boolean>(false);

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
        console.log('[Location] Groceries received location update:', locationData);
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

    window.addEventListener('grocerySearchUpdate', handleSearchUpdate as EventListener);
    return () => {
      window.removeEventListener('grocerySearchUpdate', handleSearchUpdate as EventListener);
    };
  }, []);

  // Filter branches by search query
  const searchFilteredBranches = searchQuery
    ? branches.filter(branch =>
        branch.grocerybranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch._delika_groceries_shops_table?.groceryshopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.grocerybranchLocation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : branches;

  // Filter branches by distance and activity status
  const filterBranchesByDistance = (branches: GroceryBranch[], userLat?: number, userLng?: number, radius: number = 8) => {
    console.log(`\n[Distance Filter] Starting distance calculations for ${branches.length} grocery branches`);
    console.log(`[Distance Filter] User Location: ${userLat}, ${userLng}`);
    console.log(`[Distance Filter] Search Radius: ${radius}km\n`);

    if (!userLat || !userLng) {
      console.log('[Distance Filter] No user coordinates, returning active branches only');
      return branches.filter(branch => branch.active !== false);
    }

    return branches.filter(branch => {
      console.log(`\n[Branch] Processing ${branch.grocerybranchName}`);
      console.log(`[Branch] Active status:`, branch.active);
      console.log(`[Branch] Raw coordinates - Lat: ${branch.grocerybranchLatitude}, Lng: ${branch.grocerybranchLongitude}`);
      
      // Check active status first
      const isActive = branch.active !== false;
      if (!isActive) {
        console.log('[Branch] Excluded - Branch is inactive');
        return false;
      }
      
      const branchLat = parseFloat(branch.grocerybranchLatitude.toString());
      const branchLng = parseFloat(branch.grocerybranchLongitude.toString());
      
      console.log(`[Branch] Parsed coordinates - Lat: ${branchLat}, Lng: ${branchLng}`);
      
      if (isNaN(branchLat) || isNaN(branchLng)) {
        console.log('[Branch] Excluded - Invalid coordinates');
        return false;
      }
      
      const distance = calculateDistance(
        userLat,
        userLng,
        branchLat,
        branchLng
      );

      console.log(`[Branch] Calculated distance: ${distance.toFixed(2)}km`);
      const isWithinRadius = distance <= radius;
      console.log(`[Branch] Within ${radius}km radius: ${isWithinRadius}`);
      
      if (!isWithinRadius) {
        console.log('[Branch] Excluded - Outside radius');
      } else {
        console.log('[Branch] Included - Active and within radius');
      }
      
      return isWithinRadius;
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

      const branchLat = parseFloat(branch.grocerybranchLatitude.toString());
      const branchLng = parseFloat(branch.grocerybranchLongitude.toString());
      
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
    async function fetchGroceriesBranches() {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_GROCERIES_SHOPS_API;
        if (!apiUrl) throw new Error("NEXT_PUBLIC_GROCERIES_SHOPS_API is not defined");
        console.log("Fetching groceries branches from:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log("Groceries branches response:", data);
        setBranches(Array.isArray(data) ? data : []);
      } catch (error) {
        setBranches([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroceriesBranches();
  }, []);

  const handleExpandSearch = () => {
    setSearchRadius(15);
    setShowExpandedSearch(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" color="orange" text="Loading groceries..." />
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
                We found {filteredOutResults.length} {filteredOutResults.length === 1 ? 'grocery store' : 'grocery stores'} near you, but they're a bit far from your location.
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No grocery stores found</h3>
              <p className="text-gray-500 text-sm">
                {userCoordinates 
                  ? "No grocery stores available within 8km of your location" 
                  : "Please set your delivery location to see nearby grocery stores"}
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
        {filteredBranches.map((branch) => (
          <Link
            key={branch.id}
            href={`/groceries/${branch.groceryshopID}?branchId=${branch.id}`}
            onClick={() => {
              localStorage.setItem("selectedGroceryBranchId", branch.id);
              localStorage.setItem("selectedGroceryShopId", branch.groceryshopID);
              // Store grocery shop name and logo for details page
              localStorage.setItem("selectedGroceryShopData", JSON.stringify({
                groceryshopName: branch._delika_groceries_shops_table?.groceryshopName || "",
                groceryshopLogo: branch._delika_groceries_shops_table?.groceryshopLogo || null
              }));
              // Store branch coordinates for delivery calculation
              localStorage.setItem("selectedGroceryBranchData", JSON.stringify({
                grocerybranchLatitude: branch.grocerybranchLatitude,
                grocerybranchLongitude: branch.grocerybranchLongitude,
                grocerybranchName: branch.grocerybranchName,
                grocerybranchLocation: branch.grocerybranchLocation
              }));
            }}
            className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block"
          >
            <div className="relative h-36">
              {branch._delika_groceries_shops_table?.groceryshopLogo?.url ? (
                <Image
                  src={branch._delika_groceries_shops_table.groceryshopLogo.url}
                  alt={branch._delika_groceries_shops_table.groceryshopName || "Grocery Shop"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 truncate">
                {branch._delika_groceries_shops_table?.groceryshopName || "No Name"}
              </h3>
              <span className="text-xs text-gray-600 truncate block">
                {branch.grocerybranchName}
              </span>
              <span className="text-xs text-gray-500 truncate block">
                {branch.grocerybranchLocation}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 