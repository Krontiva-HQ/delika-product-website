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
import { LocationSearchModal } from "@/components/location-search-modal"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { EmptyState } from "@/components/empty-state"
import { AuthNav } from "@/components/auth-nav"
import { BranchPage } from "@/components/branch-page"
import { SearchSection } from "@/components/search-section"
import { calculateDistance } from "@/utils/distance"
import { FavoritesSection } from "@/components/favorites-section"
import { getBranches, getCustomerDetails, updateFavorites, calculateDeliveryPrices } from "@/lib/api"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { LoadingSpinner } from "@/components/loading-spinner"
import { GroceriesList } from "@/components/groceries-list";
import { PharmacyList } from "@/components/pharmacy-list";
import { FilterModal } from "@/components/FilterModal";
import { ActiveFilters } from "@/components/ActiveFilters";
import { VendorSkeleton } from "@/components/vendor-skeleton";
import { Star, Clock, Plus, Minus, Share2, Store, X, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FloatingCart } from "@/components/floating-cart"
import { CartModal } from "@/components/cart-modal"
import { isVendorOpen } from "@/lib/utils"
import { PolicyAcceptanceModal } from "@/components/policy-acceptance-modal"
import { usePolicyAcceptance } from "@/hooks/use-policy-acceptance"


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
  Restaurant?: Restaurant[]
  RestaurantItem?: any[]
  restaurantItem?: any[]
  created_at: number
  active: boolean
  slug: string
  _menutable?: {
    name: string;
    foodType?: string;
    foods: {
      name: string;
      price: number;
      quantity: number;
    }[];
  }[];
  _itemsmenu?: {
    name: string;
    foods: {
      name: string;
      price: number;
      quantity: number;
    }[];
  }[];
  menutable?: {
    name: string;
    foodType?: string;
    foods: {
      name: string;
      price: number;
      quantity: number;
    }[];
  }[];
  itemsmenu?: {
    name: string;
    foods: {
      name: string;
      price: number;
      quantity: number;
    }[];
  }[];
  foods?: {
    name: string;
    price: number;
    quantity: number;
  }[];
  menu?: {
    name: string;
    foodType?: string;
    foods: {
      name: string;
      price: number;
      quantity: number;
    }[];
  }[];
}

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

interface VendorData {
  Restaurants: any[];
  Groceries: any[];
  Pharmacies: any[];
  Ratings: any[];
}

interface StoreHeaderProps {
  vendorData?: VendorData | null;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

export function StoreHeader({ vendorData, onTabChange, activeTab: externalActiveTab }: StoreHeaderProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [branches, setBranches] = useState<Branch[]>([])

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

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState(1)
  const ORDERS_PER_PAGE = 10
  const [isBranchPageLoaded, setIsBranchPageLoaded] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterDeliveryType, setFilterDeliveryType] = useState('all');
  const [filterSortBy, setFilterSortBy] = useState('best');
  const [internalActiveTab, setInternalActiveTab] = useState("restaurants")
  
  // Use external activeTab if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  // FilterModal state variables
  const [filterTypes, setFilterTypes] = useState<string[]>(['restaurant']);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);

  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterDeliveryTime, setFilterDeliveryTime] = useState<number | null>(null);
  const [filterPickup, setFilterPickup] = useState<boolean>(false);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [showAllFoods, setShowAllFoods] = useState<boolean>(false);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isShowingFilteredResults, setIsShowingFilteredResults] = useState<boolean>(false);

  // Category constants for FilterModal
  const RESTAURANT_CATEGORIES = [
    'Alcohol', 'Angwamo Dishes', 'Appetizer', 'Assorted Fried Rice', 'Bake', 'Bakery', 'Beef Pizza', 'Beer', 'Beverages', 
    'Boba - Fruit Tea (Reg / Large)', 'Boba - Milk Tea (Reg/ Large)', 'Boba Tea', 'Boiled Yam', 'Bread', 'Breakfast', 
    'Burger', 'Burger Size', 'Burgers', 'Burgers & Sandwiches', 'Cakes & Pastries', 'Chicken', 'Chicken Meals', 
    'Chicken Noodles', 'Chicken Pizza', 'Classic Cocktails', 'Classic Cocktails / Mocktails', 'Cocktail Mixes', 
    'Coffee', 'Coffee & Tea', 'Crispy Fries', 'Croissant', 'Day Time "Tucker" Menu', 'Dessert', 'Desserts & Sweets', 
    'Doughnuts', 'Drink', 'Drinks', 'Drinks / Beer', 'Energy Drinks', 'Evening Menu', 'Fast Food', 'Flour', 
    'Food, Beverages & Tobacco', 'Fresh Juice', 'Fried Dishes', 'Fries', 'Fries / Chips', 'Fruit Juice', 'Fruit Tea', 
    'Ghana Jollof', 'Grills / Fried', 'Hot Beverages', 'Juice', 'Juices', 'Juices & Smoothies', 'Khebab', 
    'Krontiva Menu', 'Light Soup', 'Loaded Fries', 'Local Dish', 'Local Dishes', 'Local Food', 'Local Foods', 
    'Lunch', 'Lunch Special', 'Main Menu', 'Margherita Pizza', 'Menu For Classic Plate- Rice Dishes', 'Milk Series', 
    'Milk Shakes', 'Milkshake', 'Milkshakes', 'Morning Menu', 'Nigerian Local Food', 'Noodles', 'Okro Soup', 
    'Other Dishes', 'Pastries', 'Pizza', 'Pork', 'Protein', 'Proteins', 'Ribs', 'Rice', 'Rice & Grains', 
    'Rice Dishes', 'Rice Meals', 'Rice Menu', 'Rich Dishes', 'Salad', 'Salad Dressing', 'Salads', 'Sandwich', 
    'Sandwiches', 'Sauce / Soups', 'Sauces', 'Sausage Pizza', 'Seafood Lovers', 'Self- Treat Dishes', 'Shawarma', 
    'Side Dish', 'Side Meals', 'Signature Cocktails / Mocktails', 'Smoothies', 'Smoothies (Reg / Large)', 
    'Snack', 'Snack Bar', 'Snack Bites', 'Sobolo', 'Soft Drinks', 'Soup', 'Soups', 'Soups Only', 'Spaghetti', 
    'Special Stir Fries', 'Springrolls And Samosa', 'Starter', 'Starters', 'Starters / Appetizers / Small Bites', 
    'Stew', 'Stir Fry Noodles', 'Stir Fry Spaghetti', 'Swallow Dish', 'Test Foods', 'Traditional Foods', 
    'Unique Series', 'Vegetarian Pizza', 'Waakye', 'Wine', 'Wrap', 'Wrap & Sandwich', 'Wraps', 'Yam/Plantain',
    '면류 (Noodles)', '식사류 (Meal)', '한식요리 (Korean Dish_Meats & Others)'
  ];
  const GROCERY_CATEGORIES = ['Fresh Produce', 'Dairy & Eggs', 'Meat & Poultry', 'Seafood', 'Bakery', 'Pantry', 'Frozen Foods', 'Beverages', 'Snacks', 'Health & Beauty', 'Household', 'Baby Care'];
  const PHARMACY_CATEGORIES = ['Prescription', 'Over-the-Counter', 'Vitamins', 'First Aid', 'Personal Care', 'Baby & Child', 'Health Monitoring', 'Pain Relief', 'Allergy', 'Cold & Flu'];
  const PAGE_SIZE = 5;

  // Show More state for search results
  const [showMoreRestaurants, setShowMoreRestaurants] = useState(false);
  const [showMoreGroceries, setShowMoreGroceries] = useState(false);
  const [showMorePharmacies, setShowMorePharmacies] = useState(false);

  // VendorGrid hover-based delivery calculation states
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);
  const [calculatingVendors, setCalculatingVendors] = useState<Set<string>>(new Set());

  // Helper function to safely convert values to numbers
  const toNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    const parsed = parseFloat(value?.toString());
    return isNaN(parsed) ? 0 : parsed;
  };

  // Function to calculate delivery fees for vendor on hover (from VendorGrid)
  const calculateDeliveryFeesForVendor = async (vendor: any) => {
    try {
      console.log('[StoreHeader] 🚀 Starting delivery fee calculation for vendor:', {
        id: vendor.id,
        type: vendor.type,
        name: vendor.displayName,
        slug: vendor.displaySlug
      });
      
      // Get user location from localStorage
      const locationData = localStorage.getItem('userLocationData');
      if (!locationData) {
        console.log('[StoreHeader] ❌ No user location data found, skipping delivery calculation');
        return;
      }

      const { lat, lng } = JSON.parse(locationData);
      console.log('[StoreHeader] 📍 User coordinates:', { lat, lng });
      
      // Get branch coordinates based on vendor type
      let branchLat, branchLng;
      
      if (vendor.type === 'restaurant') {
        branchLat = parseFloat(vendor.branchLatitude);
        branchLng = parseFloat(vendor.branchLongitude);
      } else if (vendor.type === 'grocery') {
        branchLat = parseFloat(vendor.grocerybranchLatitude);
        branchLng = parseFloat(vendor.grocerybranchLongitude);
      } else if (vendor.type === 'pharmacy') {
        branchLat = parseFloat(vendor.pharmacybranchLatitude);
        branchLng = parseFloat(vendor.pharmacybranchLongitude);
      } else {
        // Fallback to any available coordinates
        branchLat = parseFloat(vendor.branchLatitude || vendor.grocerybranchLatitude || vendor.pharmacybranchLatitude);
        branchLng = parseFloat(vendor.branchLongitude || vendor.grocerybranchLongitude || vendor.pharmacybranchLongitude);
      }
      
      console.log('[StoreHeader] 🏪 Branch coordinates:', { branchLat, branchLng });
      
      if (isNaN(branchLat) || isNaN(branchLng)) {
        console.log('[StoreHeader] ❌ Invalid branch coordinates, skipping delivery calculation');
        return;
      }
      
      // Calculate distance
      console.log('[StoreHeader] 📏 Calculating distance...');
      const calculatedDistance = calculateDistance(
        lat,
        lng,
        branchLat,
        branchLng
      );
      console.log('[StoreHeader] 📏 Calculated distance:', calculatedDistance, 'km');

      // Get userId from localStorage userData
      let userId = '';
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          userId = parsedUserData.id || '';
          console.log('[StoreHeader] 👤 User ID:', userId);
        }
      } catch (error) {
        console.log('[StoreHeader] ⚠️ Could not retrieve userId from userData:', error);
      }

      // Prepare the payload for delivery price calculation
      const deliveryPayload = {
        pickup: {
          fromLatitude: branchLat.toString(),
          fromLongitude: branchLng.toString(),
        },
        dropOff: {
          toLatitude: lat.toString(),
          toLongitude: lng.toString(),
        },
        rider: true,
        pedestrian: true,
        total: 0, // No cart items yet
        subTotal: 0,
        userId: userId
      };

      console.log('[StoreHeader] 📤 Sending delivery payload to API:', deliveryPayload);

      // Get delivery prices from API
      console.log('[StoreHeader] 🌐 Calling delivery API...');
      const deliveryResponse = await calculateDeliveryPrices(deliveryPayload);
      const { 
        riderFee: newRiderFee, 
        pedestrianFee: newPedestrianFee,
        platformFee: newPlatformFee
      } = deliveryResponse;
      
      console.log('[StoreHeader] 📥 Delivery API response:', {
        riderFee: newRiderFee,
        pedestrianFee: newPedestrianFee,
        platformFee: newPlatformFee,
        distance: calculatedDistance
      });
      
      // Store delivery calculation results in localStorage with vendor-specific key
      const deliveryCalculationData = {
        riderFee: toNumber(newRiderFee),
        pedestrianFee: toNumber(newPedestrianFee),
        platformFee: toNumber(newPlatformFee),
        distance: toNumber(calculatedDistance),
        cartTotal: 0,
        branchId: vendor.id,
        branchSlug: vendor.slug || vendor.displaySlug,
        vendorType: vendor.type,
        timestamp: Date.now(),
        deliveryType: 'rider' // Default to rider
      };
      
      // Store with vendor-specific key for quick access
      const vendorKey = `deliveryCalculationData_${vendor.type}_${vendor.id}`;
      localStorage.setItem(vendorKey, JSON.stringify(deliveryCalculationData));
      
      // Also store in the generic key for backward compatibility
      localStorage.setItem('deliveryCalculationData', JSON.stringify(deliveryCalculationData));
      
      console.log('[StoreHeader] 💾 Stored delivery calculation data:', {
        vendorId: vendor.id,
        vendorType: vendor.type,
        storageKey: vendorKey,
        data: deliveryCalculationData,
        timestamp: new Date(deliveryCalculationData.timestamp).toLocaleString()
      });
      
    } catch (error) {
      console.error('[StoreHeader] ❌ Error calculating delivery fees:', error);
    }
  };

  // Handle vendor hover with pre-calculation (from VendorGrid)
  const handleVendorHover = useCallback(async (vendor: any) => {
    if (!vendor || calculatingVendors.has(vendor.id)) {
      console.log('[StoreHeader] 🚫 Hover blocked - vendor invalid or already calculating:', vendor?.id);
      return; // Already calculating or invalid vendor
    }

    console.log('[StoreHeader] 🎯 Hover started for vendor:', {
      id: vendor.id,
      type: vendor.type,
      name: vendor.displayName,
      location: vendor.displayLocation,
      slug: vendor.displaySlug,
      coordinates: {
        lat: vendor.displayLatitude,
        lng: vendor.displayLongitude
      },
      userCoordinates: userCoordinates
    });

    setHoveredVendor(vendor.id);
    setCalculatingVendors(prev => new Set([...prev, vendor.id]));

    try {
      // Check if we already have cached delivery data for this vendor
      const vendorKey = `deliveryCalculationData_${vendor.type}_${vendor.id}`;
      const cachedData = localStorage.getItem(vendorKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const isStale = Date.now() - parsed.timestamp > 5 * 60 * 1000; // 5 minutes
        
        console.log('[StoreHeader] 📦 Found cached delivery data:', {
          vendorId: vendor.id,
          vendorType: vendor.type,
          cachedData: parsed,
          isStale: isStale,
          ageMinutes: Math.round((Date.now() - parsed.timestamp) / 60000)
        });
        
        if (!isStale) {
          console.log('[StoreHeader] ✅ Using cached delivery data for vendor:', vendor.id);
          return;
        } else {
          console.log('[StoreHeader] ⏰ Cached data is stale, recalculating...');
        }
      } else {
        console.log('[StoreHeader] ❌ No cached data found, calculating fresh...');
      }

      console.log('[StoreHeader] 🔄 Starting delivery calculation for vendor:', vendor.id);
      // Calculate delivery fees on hover
      await calculateDeliveryFeesForVendor(vendor);
      
      // Log the newly calculated data
      const newCachedData = localStorage.getItem(vendorKey);
      if (newCachedData) {
        const newParsed = JSON.parse(newCachedData);
        console.log('[StoreHeader] ✅ New delivery calculation completed:', {
          vendorId: vendor.id,
          vendorType: vendor.type,
          calculatedData: newParsed,
          timestamp: new Date(newParsed.timestamp).toLocaleString()
        });
      }
      
    } catch (error) {
      console.error('[StoreHeader] ❌ Error calculating delivery fees on hover:', error);
    } finally {
      setCalculatingVendors(prev => {
        const newSet = new Set(prev);
        newSet.delete(vendor.id);
        return newSet;
      });
      console.log('[StoreHeader] 🏁 Hover calculation completed for vendor:', vendor.id);
    }
  }, [calculatingVendors, userCoordinates]);

  // Handle vendor hover end (from VendorGrid)
  const handleVendorHoverEnd = useCallback(() => {
    console.log('[StoreHeader] 👋 Hover ended for vendor:', hoveredVendor);
    setHoveredVendor(null);
  }, [hoveredVendor]);

  // Reset "Show More" states when search query changes or tab changes
  useEffect(() => {
    setShowMoreRestaurants(false);
    setShowMoreGroceries(false);
    setShowMorePharmacies(false);
  }, [searchQuery, activeTab]);

  // Policy acceptance check
  const { showPolicyModal, handlePolicyAccept, handlePolicyDecline } = usePolicyAcceptance(user)

  // Store and load activeTab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('selectedStoreType');
    if (savedTab && ['restaurants', 'groceries', 'pharmacy'].includes(savedTab)) {
      if (!externalActiveTab) {
        setInternalActiveTab(savedTab);
      }
    }
  }, [externalActiveTab]);

  useEffect(() => {
    localStorage.setItem('selectedStoreType', activeTab);
    
    // Console log data when groceries or pharmacy tabs are active
    if (activeTab === 'groceries' && vendorData?.Groceries) {
      console.log('=== GROCERIES TAB DATA ===');
      console.log('Active Tab:', activeTab);
      console.log('Total Groceries:', vendorData.Groceries.length);
      console.log('Groceries Data Structure:', vendorData.Groceries);
      
      // Log first grocery item structure for reference
      if (vendorData.Groceries.length > 0) {
        const firstGrocery = vendorData.Groceries[0];
        console.log('First Grocery Structure:', {
          id: firstGrocery.id,
          slug: firstGrocery.slug,
          grocerybranchName: firstGrocery.grocerybranchName,
          Grocery: firstGrocery.Grocery,
          GroceryItem: firstGrocery.GroceryItem,
          groceryshopLogo: firstGrocery.Grocery?.groceryshopLogo,
          groceryshopName: firstGrocery.Grocery?.groceryshopName,
          groceryItemCount: firstGrocery.GroceryItem?.length || 0
        });
        
        // Log sample grocery items if they exist
        if (firstGrocery.GroceryItem && firstGrocery.GroceryItem.length > 0) {
          console.log('Sample Grocery Items:', firstGrocery.GroceryItem.slice(0, 3));
        }
      }
    }
    
    if (activeTab === 'pharmacy' && vendorData?.Pharmacies) {
      console.log('=== PHARMACY TAB DATA ===');
      console.log('Active Tab:', activeTab);
      console.log('Total Pharmacies:', vendorData.Pharmacies.length);
      console.log('Pharmacies Data Structure:', vendorData.Pharmacies);
      
      // Log first pharmacy item structure for reference
      if (vendorData.Pharmacies.length > 0) {
        const firstPharmacy = vendorData.Pharmacies[0];
        console.log('First Pharmacy Structure:', {
          id: firstPharmacy.id,
          slug: firstPharmacy.slug,
          pharmacybranchName: firstPharmacy.pharmacybranchName,
          Pharmacy: firstPharmacy.Pharmacy,
          PharmacyItem: firstPharmacy.PharmacyItem,
          pharmacyLogo: firstPharmacy.Pharmacy?.pharmacyLogo,
          pharmacyName: firstPharmacy.Pharmacy?.pharmacyName,
          pharmacyItemCount: firstPharmacy.PharmacyItem?.length || 0
        });
        
        // Log sample pharmacy items if they exist
        if (firstPharmacy.PharmacyItem && firstPharmacy.PharmacyItem.length > 0) {
          console.log('Sample Pharmacy Items:', firstPharmacy.PharmacyItem.slice(0, 3));
        }
      }
    }
  }, [activeTab, vendorData]);

  useEffect(() => {
    async function fetchBranchesDirect() {
      try {
        setIsLoadingRestaurants(true);
        
        // If vendorData is provided, use it instead of fetching
        if (vendorData && vendorData.Restaurants) {
          setBranches(vendorData.Restaurants);
          setIsLoadingRestaurants(false);
          return;
        }
        
        // Fallback to original API call
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
  }, [vendorData]);

  useEffect(() => {
    // Load saved location on mount
    const loadLocationData = () => {
      const savedLocationData = localStorage.getItem('userLocationData')
      if (savedLocationData) {
        const { address, lat, lng } = JSON.parse(savedLocationData)
        setUserLocation(address)
        setUserCoordinates({ lat, lng })
      } else {
        // First visit - prompt user to select location
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

  // Simple filtered branches - just show all active branches
  const filteredBranches = useMemo(() => {
    if (!branches.length) return [];
    return branches.filter(branch => branch.active);
  }, [branches]);

  const searchResults = useMemo(() => {
    // If no search query, return all data for current tab
    if (!searchQuery.trim()) {
      if (activeTab === "restaurants") {
        return filteredBranches;
      } else if (activeTab === "groceries" && vendorData?.Groceries) {
        return vendorData.Groceries;
      } else if (activeTab === "pharmacy" && vendorData?.Pharmacies) {
        return vendorData.Pharmacies;
      }
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const results: any[] = [];

    if (activeTab === "restaurants") {
      filteredBranches.forEach((branch) => {
        // Search by restaurant name
        const restaurantName = branch.Restaurant?.[0]?.restaurantName || 
                              branch._restaurantTable?.[0]?.restaurantName || 
                              branch.branchName;
        
        if (restaurantName?.toLowerCase().includes(query)) {
          results.push(branch);
      return;
    }

        // Search by branch name and location
        if (branch.branchName?.toLowerCase().includes(query) ||
            branch.branchLocation?.toLowerCase().includes(query)) {
          results.push(branch);
          return;
        }

        // Search by restaurant items
        const restaurantItems = branch.RestaurantItem || branch.restaurantItem || [];
        const hasMatchingItem = restaurantItems.some((item: any) => {
                        // Search by food type (category)
              if (item.foodType?.toLowerCase().includes(query)) {
                return true;
              }
          
          // Search by food names in the foods array
          if (item.foods && Array.isArray(item.foods)) {
                            const hasMatchingFood = item.foods.some((food: any) =>
                  food.name?.toLowerCase().includes(query)
                );
                if (hasMatchingFood) {
                  return true;
                }
          }
          
          return false;
        });

        if (hasMatchingItem) {
          results.push(branch);
          return;
        }

        // Search by menu items (fallback for older data structure)
        branch._menutable?.forEach((menu: any) => {
          if (menu.foodType?.toLowerCase().includes(query) ||
              menu.name?.toLowerCase().includes(query)) {
            results.push(branch);
            return;
          }

          menu.foods?.forEach((food: any) => {
            if (food.name?.toLowerCase().includes(query)) {
              results.push(branch);
              return;
            }
          });
        });

        branch._itemsmenu?.forEach((menu: any) => {
          if (menu.name?.toLowerCase().includes(query)) {
            results.push(branch);
            return;
          }

          menu.foods?.forEach((food: any) => {
            if (food.name?.toLowerCase().includes(query)) {
              results.push(branch);
              return;
            }
          });
        });
      });
    } else if (activeTab === "groceries" && vendorData?.Groceries) {
      vendorData.Groceries.forEach((grocery) => {
        // Search by grocery store name
        const groceryName = grocery.Grocery?.groceryshopName || grocery.grocerybranchName;
        if (groceryName?.toLowerCase().includes(query)) {
          results.push(grocery);
          return;
        }

        // Search by branch name and location
        if (grocery.grocerybranchName?.toLowerCase().includes(query) ||
            grocery.grocerybranchLocation?.toLowerCase().includes(query)) {
          results.push(grocery);
          return;
        }

        // Search by grocery items
        const groceryItems = grocery.GroceryItem || grocery.groceryItem || [];
        const hasMatchingItem = groceryItems.some((item: any) => {
          // Search by product name
          if (item.productName?.toLowerCase().includes(query)) {
            return true;
          }
          
          // Search by category
          if (item.category?.toLowerCase().includes(query)) {
            return true;
          }
          
          // Search by subcategory
          if (item.subCategory?.toLowerCase().includes(query)) {
            return true;
          }
          
          // Search by brand
          if (item.brand?.toLowerCase().includes(query)) {
            return true;
          }
          
          return false;
        });

        if (hasMatchingItem) {
          results.push(grocery);
          return;
        }
      });
    } else if (activeTab === "pharmacy" && vendorData?.Pharmacies) {
      vendorData.Pharmacies.forEach((pharmacy) => {
        // Search by pharmacy name
        const pharmacyName = pharmacy.Pharmacy?.pharmacyName;
        if (pharmacyName?.toLowerCase().includes(query)) {
          results.push(pharmacy);
          return;
        }

        // Search by pharmacy address
        if (pharmacy.Pharmacy?.pharmacyAddress?.toLowerCase().includes(query)) {
          results.push(pharmacy);
          return;
        }

        // Search by pharmacy items
        const pharmacyItems = pharmacy.PharmacyItem || pharmacy.pharmacyItem || [];
        const hasMatchingItem = pharmacyItems.some((item: any) => {
          // Search by product name
          if (item.productName?.toLowerCase().includes(query)) {
            return true;
          }
          
          // Search by category
          if (item.category?.toLowerCase().includes(query)) {
            return true;
          }
          
          // Search by subcategory
          if (item.subCategory?.toLowerCase().includes(query)) {
            return true;
          }
          
          // Search by brand
          if (item.brand?.toLowerCase().includes(query)) {
            return true;
          }
          
          return false;
        });

        if (hasMatchingItem) {
          results.push(pharmacy);
          return;
        }
      });
    }

    // Remove duplicates based on id
    const finalResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    return finalResults;
  }, [searchQuery, filteredBranches, activeTab, vendorData]);

  // Check if we should sort by open/closed status (when 35% or more are closed)
  const shouldSortByStatus = useMemo(() => {
    if (!searchResults.length) return false;
    
    const closedCount = searchResults.filter(vendor => {
      const isOpen = isVendorOpen(vendor.activeHours);
      return !isOpen;
    }).length;
    
    const closedPercentage = (closedCount / searchResults.length) * 100;
    return closedPercentage >= 35;
  }, [searchResults]);

  // Sort vendors by open/closed status when threshold is met
  const sortedSearchResults = useMemo(() => {
    if (!shouldSortByStatus) return searchResults;
    
    return [...searchResults].sort((a, b) => {
      const aIsOpen = isVendorOpen(a.activeHours);
      const bIsOpen = isVendorOpen(b.activeHours);
      
      // Open vendors first, then closed ones
      if (aIsOpen && !bIsOpen) return -1;
      if (!aIsOpen && bIsOpen) return 1;
      return 0;
    });
  }, [searchResults, shouldSortByStatus]);

  // Organize search results into sections
  const organizedSearchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        foodNames: [],
        foodCategories: [],
        restaurants: sortedSearchResults,
        groceryItems: [],
        groceryCategories: [],
        groceries: sortedSearchResults,
        pharmacyItems: [],
        pharmacyCategories: [],
        pharmacies: sortedSearchResults
      };
    }

    const query = searchQuery.toLowerCase().trim();
    
    // Restaurant search results
    if (activeTab === "restaurants") {
      const foodNames: any[] = [];
      const foodCategories: any[] = [];
      const restaurants: any[] = [];

      // Collect all food names and categories from search results
      sortedSearchResults.forEach((branch) => {
        const restaurantItems = branch.RestaurantItem || branch.restaurantItem || [];
        
        restaurantItems.forEach((item: any) => {
          // Check food names
          if (item.foods && Array.isArray(item.foods)) {
            item.foods.forEach((food: any) => {
              if (food.name?.toLowerCase().includes(query)) {
                foodNames.push({
                  foodName: food.name,
                  foodPrice: parseFloat(food.price) || 0,
                  foodImage: food.foodImage,
                  foodCategory: item.foodType?.trim(), // Add the category from the parent item and trim spaces
                  restaurantName: branch.Restaurant?.[0]?.restaurantName || branch._restaurantTable?.[0]?.restaurantName || branch.branchName,
                  branchName: branch.branchName,
                  branch: branch
                });
              }
            });
          }
          
          // Check food categories
          if (item.foodType?.toLowerCase().includes(query)) {
            foodCategories.push({
              categoryName: item.foodType?.trim(), // Trim spaces from category name
              categoryImage: item.foodTypeImage,
              restaurantName: branch.Restaurant?.[0]?.restaurantName || branch._restaurantTable?.[0]?.restaurantName || branch.branchName,
              branchName: branch.branchName,
              branch: branch
            });
          }
        });
      });

      // Add restaurants that match by name/location OR have matching food items
      sortedSearchResults.forEach((branch) => {
        const restaurantName = branch.Restaurant?.[0]?.restaurantName || 
                              branch._restaurantTable?.[0]?.restaurantName || 
                              branch.branchName;
        
        // Check if restaurant matches by name/location
        const matchesByName = restaurantName?.toLowerCase().includes(query) ||
                             branch.branchName?.toLowerCase().includes(query) ||
                             branch.branchLocation?.toLowerCase().includes(query);
        
        // Check if restaurant has food items matching the query
        const restaurantItems = branch.RestaurantItem || branch.restaurantItem || [];
        const hasMatchingFood = restaurantItems.some((item: any) => {
          // Check food names
          if (item.foods && Array.isArray(item.foods)) {
            return item.foods.some((food: any) => 
              food.name?.toLowerCase().includes(query)
            );
          }
          // Check food categories
          return item.foodType?.toLowerCase().includes(query);
        });
        
        if (matchesByName || hasMatchingFood) {
          restaurants.push(branch);
        }
      });

      // Remove duplicates
      const uniqueFoodNames = foodNames.filter((item, index, self) => 
        index === self.findIndex(t => t.foodName === item.foodName)
      );
      const uniqueFoodCategories = foodCategories.filter((item, index, self) => 
        index === self.findIndex(t => t.categoryName === item.categoryName)
      );
      const uniqueRestaurants = restaurants.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      return {
        foodNames: uniqueFoodNames,
        foodCategories: uniqueFoodCategories,
        restaurants: uniqueRestaurants,
        groceryItems: [],
        groceryCategories: [],
        groceries: [],
        pharmacyItems: [],
        pharmacyCategories: [],
        pharmacies: []
      };
    }

    // Grocery search results
    if (activeTab === "groceries") {
      const groceryItems: any[] = [];
      const groceryCategories: any[] = [];
      const groceries: any[] = [];

      // Collect all grocery items and categories from search results
      sortedSearchResults.forEach((grocery) => {
        const groceryItemsList = grocery.GroceryItem || grocery.groceryItem || [];
        
        groceryItemsList.forEach((item: any) => {
          // Check grocery item names
          if (item.productName?.toLowerCase().includes(query)) {
                                      groceryItems.push({
              itemName: item.productName,
              itemPrice: parseFloat(item.price) || 0,
              itemImage: item.image,
              itemCategory: item.category?.trim(), // Add category and trim spaces
              groceryName: grocery.Grocery?.groceryshopName || grocery.branchName,
              branchName: grocery.branchName,
              grocery: grocery
            });
          }
          
          // Check grocery categories
          if (item.category?.toLowerCase().includes(query)) {
            groceryCategories.push({
              categoryName: item.category?.trim(), // Trim spaces from category name
              categoryImage: null, // Groceries might not have category images
              groceryName: grocery.Grocery?.groceryshopName || grocery.branchName,
              branchName: grocery.branchName,
              grocery: grocery
            });
          }
        });
      });

      // Add groceries that match by name/location OR have matching items
      sortedSearchResults.forEach((grocery) => {
        const groceryName = grocery.Grocery?.groceryshopName || grocery.branchName;
        
        // Check if grocery matches by name/location
        const matchesByName = groceryName?.toLowerCase().includes(query) ||
                             grocery.branchName?.toLowerCase().includes(query) ||
                             grocery.branchLocation?.toLowerCase().includes(query);
        
        // Check if grocery has items matching the query
        const groceryItemsList = grocery.GroceryItem || grocery.groceryItem || [];
        const hasMatchingItem = groceryItemsList.some((item: any) => {
          return item.productName?.toLowerCase().includes(query) ||
                 item.category?.toLowerCase().includes(query) ||
                 item.subCategory?.toLowerCase().includes(query) ||
                 item.brand?.toLowerCase().includes(query);
        });
        
        if (matchesByName || hasMatchingItem) {
          groceries.push(grocery);
        }
      });

      // Remove duplicates
      const uniqueGroceryItems = groceryItems.filter((item, index, self) => 
        index === self.findIndex(t => t.itemName === item.itemName)
      );
      const uniqueGroceryCategories = groceryCategories.filter((item, index, self) => 
        index === self.findIndex(t => t.categoryName === item.categoryName)
      );
      const uniqueGroceries = groceries.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      return {
        foodNames: [],
        foodCategories: [],
        restaurants: [],
        groceryItems: uniqueGroceryItems,
        groceryCategories: uniqueGroceryCategories,
        groceries: uniqueGroceries,
        pharmacyItems: [],
        pharmacyCategories: [],
        pharmacies: []
      };
    }

    // Pharmacy search results
    if (activeTab === "pharmacy") {
      const pharmacyItems: any[] = [];
      const pharmacyCategories: any[] = [];
      const pharmacies: any[] = [];

      // Collect all pharmacy items and categories from search results
      sortedSearchResults.forEach((pharmacy) => {
        const pharmacyItemsList = pharmacy.PharmacyItem || pharmacy.pharmacyItem || [];
        
        pharmacyItemsList.forEach((item: any) => {
          // Check pharmacy item names
          if (item.productName?.toLowerCase().includes(query)) {
            pharmacyItems.push({
              itemName: item.productName,
              itemPrice: parseFloat(item.price) || 0,
              itemImage: item.image,
              itemCategory: item.category?.trim(), // Add category and trim spaces
              pharmacyName: pharmacy.Pharmacy?.pharmacyName,
              branchName: pharmacy.branchName,
              pharmacy: pharmacy
            });
          }
          
          // Check pharmacy categories
          if (item.category?.toLowerCase().includes(query)) {
            pharmacyCategories.push({
              categoryName: item.category?.trim(), // Trim spaces from category name
              categoryImage: null, // Pharmacies might not have category images
              pharmacyName: pharmacy.Pharmacy?.pharmacyName,
              branchName: pharmacy.branchName,
              pharmacy: pharmacy
            });
          }
        });
      });

      // Add pharmacies that match by name/location OR have matching items
      sortedSearchResults.forEach((pharmacy) => {
        const pharmacyName = pharmacy.Pharmacy?.pharmacyName;
        
        // Check if pharmacy matches by name/location
        const matchesByName = pharmacyName?.toLowerCase().includes(query) ||
                             pharmacy.Pharmacy?.pharmacyAddress?.toLowerCase().includes(query);
        
        // Check if pharmacy has items matching the query
        const pharmacyItemsList = pharmacy.PharmacyItem || pharmacy.pharmacyItem || [];
        const hasMatchingItem = pharmacyItemsList.some((item: any) => {
          return item.productName?.toLowerCase().includes(query) ||
                 item.category?.toLowerCase().includes(query) ||
                 item.subCategory?.toLowerCase().includes(query) ||
                 item.brand?.toLowerCase().includes(query);
        });
        
        if (matchesByName || hasMatchingItem) {
          pharmacies.push(pharmacy);
        }
      });

      // Remove duplicates
      const uniquePharmacyItems = pharmacyItems.filter((item, index, self) => 
        index === self.findIndex(t => t.itemName === item.itemName)
      );
      const uniquePharmacyCategories = pharmacyCategories.filter((item, index, self) => 
        index === self.findIndex(t => t.categoryName === item.categoryName)
      );
      const uniquePharmacies = pharmacies.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      return {
        foodNames: [],
        foodCategories: [],
        restaurants: [],
        groceryItems: [],
        groceryCategories: [],
        groceries: [],
        pharmacyItems: uniquePharmacyItems,
        pharmacyCategories: uniquePharmacyCategories,
        pharmacies: uniquePharmacies
      };
    }

    // Default return for other tabs
    return {
      foodNames: [],
      foodCategories: [],
      restaurants: searchResults,
      groceryItems: [],
      groceryCategories: [],
      groceries: searchResults,
      pharmacyItems: [],
      pharmacyCategories: [],
      pharmacies: searchResults
    };
  }, [searchQuery, sortedSearchResults, activeTab]);

  const handleLocationSelect = ({ address, lat, lng }: { address: string; lat: number; lng: number }) => {
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
  const handleBranchSelect = async (branch: any) => {
    try {
      setIsLoading(true)
      setIsBranchPageLoaded(false)
      
      // Validate branch data with more specific checks
      if (!branch) {
        throw new Error('Branch is undefined')
      }
      
      // Handle different data structures
      let branchId = branch.id
      let branchSlug = branch.slug
      let restaurantName = ''
      
      // For restaurant branches
      if (branch._restaurantTable && Array.isArray(branch._restaurantTable) && branch._restaurantTable.length > 0) {
        const restaurant = branch._restaurantTable[0]
        restaurantName = restaurant?.restaurantName || branch.branchName || 'Restaurant'
      }
      // For grocery branches
      else if (branch.Grocery) {
        restaurantName = branch.Grocery?.groceryshopName || branch.grocerybranchName || 'Grocery'
      }
      // For pharmacy branches
      else if (branch.Pharmacy) {
        restaurantName = branch.Pharmacy?.pharmacyName || branch.pharmacybranchName || 'Pharmacy'
      }
      // For other branches (fallback)
      else {
        restaurantName = branch.branchName || branch.name || branch.displayName || 'Store'
      }
      
      // If we have a branch ID and slug, proceed with navigation
      if (branchId && branchSlug) {
        // Set state with branch ID
        setSelectedBranchId(branchId)
        setCurrentView('branch')
        
        // Store both the ID and slug in localStorage
        localStorage.setItem('selectedBranchId', branchId)
        localStorage.setItem('branchSlug', branchSlug)
        localStorage.setItem('currentView', 'branch')
        
        // Navigate to the correct URL based on branch type
        let targetUrl = ''
        if (branch.Grocery) {
          targetUrl = `/groceries/${branchSlug}`
        } else if (branch.Pharmacy) {
          targetUrl = `/pharmacy/${branchSlug}`
        } else {
          targetUrl = `/restaurants/${branchSlug}`
        }
        
        await router.replace(targetUrl)
        
        setIsLoading(false)
        setIsBranchPageLoaded(true)
      } else {
        throw new Error('Branch ID or slug is missing')
      }
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

  // Reset showAllFoods when search query changes
  useEffect(() => {
    setShowAllFoods(false);
  }, [searchQuery]);

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
    router.push('/vendors')
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
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
  }

  const handleSignupClick = () => {
    setIsSignupModalOpen(true)
  }

  const handleHomeClick = () => {
    setCurrentView('stores')
    setSelectedBranchId(null)
    localStorage.removeItem('selectedBranchId')
    localStorage.removeItem('currentView')
  }

  // Update handleLikeToggle to handle the response properly
  const handleLikeToggle = async (branchName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchName,
          userId: user.id,
        }),
      });

      if (response.ok) {
        // Toggle the liked state
        setLikedBranches(prev => {
          const newSet = new Set(prev);
          if (newSet.has(branchName)) {
            newSet.delete(branchName);
          } else {
            newSet.add(branchName);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Handle clearing individual filters
  const handleClearFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'type':
        setFilterTypes([]);
        break;
      case 'rating':
        setFilterRating('all');
        break;
      case 'deliveryTime':
        setFilterDeliveryTime(null);
        break;
      case 'pickup':
        setFilterPickup(false);
        break;
      case 'category':
        if (value) {
          setFilterCategories(prev => prev.filter(cat => cat !== value));
        }
        break;
    }
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setFilterTypes([]);
    setFilterCategories([]);
    setFilterRating('all');
    setFilterDeliveryTime(null);
    setFilterPickup(false);
    setIsShowingFilteredResults(false);
    setFilteredResults([]);
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



  // Helper to filter out empty strings
  const nonEmpty = (arr: string[]) => arr.filter(Boolean);

  const renderRestaurantList = () => (
    <div className="container mx-auto px-4 py-6">
      {isLoadingRestaurants ? (
        <div className="space-y-6">
          {/* Search section skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          
          {/* Vendor cards skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <VendorSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : isShowingFilteredResults && filteredResults.length > 0 ? (
        // Display filtered results
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Filtered Results</h2>
          </div>
          
          {/* Active Filters Display */}
          <ActiveFilters
            filterTypes={filterTypes}
            filterCategories={filterCategories}
            filterRating={filterRating}
            filterDeliveryTime={filterDeliveryTime}
            filterPickup={filterPickup}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearAllFilters}
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredResults.map((vendor) => {
              // Check if vendor is open based on working hours
              const isOpen = isVendorOpen(vendor.activeHours);
              const isHovered = hoveredVendor === vendor.id;
              const isCalculating = calculatingVendors.has(vendor.id);
              
              return (
              <div
                key={vendor.id}
                className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block ${
                  !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                } ${isHovered ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isOpen) {
                    // Don't navigate if vendor is closed
                    return;
                  }
                  handleBranchSelect(vendor);
                }}
                onMouseEnter={() => handleVendorHover(vendor)}
                onMouseLeave={handleVendorHoverEnd}
              >
                <button 
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLikeToggle(vendor.branchName || vendor.displayName, e);
                  }}
                >
                  <Heart
                    size={16}
                    className={`${
                      likedBranches.has(vendor.branchName || vendor.displayName)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    } transition-colors`}
                  />
                </button>

                {/* Closed indicator */}
                {!isOpen && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Closed
                  </div>
                )}

                {/* Calculating indicator */}
                {isCalculating && (
                  <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Calculating...
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                    {vendor.type === 'restaurant' ? 'Restaurant' : vendor.type === 'grocery' ? 'Grocery' : 'Pharmacy'}
                  </span>
                </div>
                  
                <div className="relative h-36">
                  {vendor.displayLogo ? (
                    <Image
                      src={vendor.displayLogo}
                      alt={vendor.displayName || vendor.type}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/fallbackResto.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 text-3xl">
                        {vendor.type === 'restaurant' ? '🍽️' : vendor.type === 'grocery' ? '🛒' : '💊'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                    {vendor.restaurantName || vendor.groceryName || vendor.pharmacyName || vendor.displayName || vendor.type}
                  </h3>
                  
                  <p className="text-gray-600 text-xs mb-2 line-clamp-1 flex items-center gap-1">
                    <MapPin size={12} />
                    {vendor.displayLocation || vendor.branchLocation || vendor.location}
                  </p>

                  {/* Rating, Delivery, and Distance Info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span className="text-gray-700">{vendor.rating || '0'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {vendor.deliveryTime && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock size={12} />
                          <span>{vendor.deliveryTime}min</span>
                        </div>
                      )}
                      
                      {vendor.distance !== null && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin size={12} />
                          <span>{vendor.distance.toFixed(1)}km</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pickup/Delivery Badge */}
                  {vendor.pickup && (
                    <div className="mt-2 flex items-center gap-1">
                      <Truck size={12} className="text-green-600" />
                      <span className="text-xs text-green-600">Pickup Available</span>
                    </div>
                  )}

                  {/* Status indicator */}
                  {!isOpen && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">Closed</span>
                    </div>
                  )}

                  {/* Hover indicator */}
                  {isHovered && !isCalculating && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">Ready to order</span>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      ) : isShowingFilteredResults && filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <EmptyState
            title="No results found"
            description="No vendors match your current filters. Try adjusting your criteria."
            icon="search"
          />
          <button
            onClick={() => {
              setIsShowingFilteredResults(false);
              setFilteredResults([]);
            }}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Clear Filters
          </button>
        </div>
      ) : searchQuery.trim() ? (
        // Display organized search results for all tabs
        <div className="space-y-8">
          {/* Food Names Section */}
          {organizedSearchResults.foodNames.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Meals Available</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.foodNames.slice(0, showAllFoods ? undefined : 6).map((item, index) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(item.branch.activeHours);
                  
                  return (
                  <Link
                    key={`food-${index}`}
                    href={`/restaurants/${item.branch.slug}?name=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent((item.foodCategory || 'food').trim())}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleBranchSelect(item.branch)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block ${
                      !isOpen ? 'opacity-50 grayscale' : ''
                    }`}
                  >
                    <div className="relative h-36">
                      {item.foodImage?.url ? (
                        <Image
                          src={item.foodImage.url}
                          alt={item.foodName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-orange-600 text-3xl">🍽️</span>
                        </div>
                      )}

                      {/* Closed indicator */}
                      {!isOpen && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Closed
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{item.foodName}</h3>
                      <span className="text-xs text-gray-600 truncate block">{item.restaurantName}</span>
                      <span className="text-xs font-bold text-orange-600">₵{typeof item.foodPrice === 'number' ? item.foodPrice.toFixed(2) : '0.00'}</span>
                    </div>
                  </Link>
                );
              })}
              </div>
              {organizedSearchResults.foodNames.length > 6 && !showAllFoods && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllFoods(true)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    View All {organizedSearchResults.foodNames.length} Food Items
                  </button>
                </div>
              )}
              {organizedSearchResults.foodNames.length > 6 && showAllFoods && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllFoods(false)}
                    className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Food Categories Section */}
          {organizedSearchResults.foodCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.foodCategories.map((item, index) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(item.branch.activeHours);
                  
                  return (
                  <Link
                    key={`category-${index}`}
                    href={`/restaurants/${item.branch.slug}?category=${encodeURIComponent((item.categoryName || '').trim())}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleBranchSelect(item.branch)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block ${
                      !isOpen ? 'opacity-50 grayscale' : ''
                    }`}
                  >
                    <div className="relative h-36">
                      {item.categoryImage?.url ? (
                        <Image
                          src={item.categoryImage.url}
                          alt={item.categoryName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <span className="text-blue-600 text-3xl">📂</span>
                        </div>
                      )}

                      {/* Closed indicator */}
                      {!isOpen && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Closed
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{item.categoryName}</h3>
                      <span className="text-xs text-gray-600 truncate block">{item.restaurantName}</span>
                      
                      {/* Status indicator */}
                      {!isOpen && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-500">Closed</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
              </div>
            </div>
          )}

          {/* Restaurants Section */}
          {organizedSearchResults.restaurants.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurants</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.restaurants.slice(0, showMoreRestaurants ? undefined : 12).map((branch) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(branch.activeHours);
                  
                  return (
                  <Link
                    key={branch.id}
                    href={`/restaurants/${branch.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isOpen) {
                        // Don't navigate if vendor is closed
                        return
                      }
                      handleBranchSelect(branch)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative block ${
                      !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <button 
                      className={`absolute top-2 right-2 z-1 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform ${
                        likedBranches.has(branch.id) 
                          ? 'text-orange-500 scale-110 hover:scale-105' 
                          : 'text-gray-400 hover:text-orange-500 hover:bg-white hover:scale-105'
                      }`}
                      onClick={(e) => handleLikeToggle(branch.id, e)}
                      aria-label={likedBranches.has(branch.id) ? "Unlike restaurant" : "Like restaurant"}
                    >
                      <Heart className={`w-5 h-5 transition-all duration-200 ${likedBranches.has(branch.id) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Closed indicator */}
                    {!isOpen && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Closed
                      </div>
                    )}

                    <div className="relative h-36">
                      {branch.Restaurant?.[0]?.image_url || 
                       branch._restaurantTable?.[0]?.image_url ||
                       branch.Restaurant?.[0]?.restaurantLogo?.url || 
                       branch._restaurantTable?.[0]?.restaurantLogo?.url || 
                       branch.restaurantLogo?.url ||
                       branch.logo?.url ||
                       branch.image?.url ? (
                        <Image
                          src={branch.Restaurant?.[0]?.image_url ||
                               branch._restaurantTable?.[0]?.image_url ||
                               branch.Restaurant?.[0]?.restaurantLogo?.url ||
                               branch._restaurantTable?.[0]?.restaurantLogo?.url ||
                               branch.restaurantLogo?.url ||
                               branch.logo?.url ||
                               branch.image?.url}
                          alt={branch.Restaurant?.[0]?.restaurantName ||
                               branch._restaurantTable?.[0]?.restaurantName ||
                               branch.restaurantName ||
                               branch.name ||
                               branch.branchName ||
                               'Restaurant'}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">
                        {branch.Restaurant?.[0]?.restaurantName ||
                         branch._restaurantTable?.[0]?.restaurantName ||
                         branch.restaurantName ||
                         branch.name ||
                         branch.branchName ||
                         'Restaurant'}
                      </h3>
                      <span className="text-xs text-gray-600 truncate block">
                        {branch.branchName || branch.location || 'Location'}
                      </span>
                    </div>
                  </Link>
                );
              })}
              </div>
              
              {/* Show More Button for Restaurants */}
              {organizedSearchResults.restaurants.length > 12 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowMoreRestaurants(!showMoreRestaurants)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    {showMoreRestaurants ? 'Show Less' : `Show All ${organizedSearchResults.restaurants.length} Restaurants`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Grocery Items Section */}
          {activeTab === "groceries" && organizedSearchResults.groceryItems.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Products Available</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.groceryItems.slice(0, showAllFoods ? undefined : 6).map((item, index) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(item.grocery.activeHours);
                  
                  return (
                  <Link
                    key={`grocery-item-${index}`}
                    href={`/groceries/${item.grocery.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isOpen) {
                        // Don't navigate if vendor is closed
                        return
                      }
                      handleBranchSelect(item.grocery)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative block ${
                      !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="relative h-36">
                      {item.itemImage?.url ? (
                        <Image
                          src={item.itemImage.url}
                          alt={item.itemName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-orange-600 text-3xl">🛒</span>
                        </div>
                      )}

                      {/* Closed indicator */}
                      {!isOpen && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Closed
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{item.itemName}</h3>
                      <span className="text-xs text-gray-600 truncate block">{item.groceryName}</span>
                      <span className="text-xs font-bold text-orange-600">₵{typeof item.itemPrice === 'number' ? item.itemPrice.toFixed(2) : '0.00'}</span>
                    </div>
                  </Link>
                );
              })}
              </div>
              {organizedSearchResults.groceryItems.length > 6 && !showAllFoods && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllFoods(true)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    View All {organizedSearchResults.groceryItems.length} Products
                  </button>
                </div>
              )}
              {organizedSearchResults.groceryItems.length > 6 && showAllFoods && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllFoods(false)}
                    className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Grocery Categories Section */}
          {activeTab === "groceries" && organizedSearchResults.groceryCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.groceryCategories.map((item, index) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(item.grocery.activeHours);
                  
                  return (
                  <Link
                    key={`grocery-category-${index}`}
                    href={`/groceries/${item.grocery.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isOpen) {
                        // Don't navigate if vendor is closed
                        return
                      }
                      handleBranchSelect(item.grocery)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative block ${
                      !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="relative h-36">
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <span className="text-orange-600 text-3xl">📂</span>
                      </div>

                      {/* Closed indicator */}
                      {!isOpen && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Closed
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{item.categoryName}</h3>
                      <span className="text-xs text-gray-600 truncate block">{item.groceryName}</span>
                    </div>
                  </Link>
                );
              })}
              </div>
            </div>
          )}

          {/* Groceries Section */}
          {activeTab === "groceries" && organizedSearchResults.groceries.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Grocery Stores</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.groceries.slice(0, showMoreGroceries ? undefined : 12).map((grocery) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(grocery.activeHours);
                  
                  return (
                  <Link
                    key={grocery.id}
                    href={`/groceries/${grocery.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isOpen) {
                        // Don't navigate if vendor is closed
                        return
                      }
                      handleBranchSelect(grocery)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative block ${
                      !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <button 
                      className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform text-gray-400 hover:text-orange-500 hover:bg-white hover:scale-105"
                      aria-label="Like grocery"
                    >
                      <Heart className="w-5 h-5 transition-all duration-200" />
                    </button>

                    {/* Closed indicator */}
                    {!isOpen && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Closed
                      </div>
                    )}

                    <div className="relative h-36">
                      {grocery.Grocery?.groceryshopLogo?.url ? (
                        <Image
                          src={grocery.Grocery.groceryshopLogo.url}
                          alt={grocery.Grocery?.groceryshopName || 'Grocery Store'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-orange-600 text-3xl">🛒</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">
                        {grocery.Grocery?.groceryshopName || grocery.branchName}
                      </h3>
                      <span className="text-xs text-gray-600 truncate block">
                        {grocery.Grocery?.groceryshopAddress || grocery.branchName || grocery.location || 'Location'}
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
                );
              })}
              </div>
              
              {/* Show More Button for Groceries */}
              {organizedSearchResults.groceries.length > 12 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowMoreGroceries(!showMoreGroceries)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    {showMoreGroceries ? 'Show Less' : `Show All ${organizedSearchResults.groceries.length} Grocery Stores`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pharmacy Items Section */}
          {activeTab === "pharmacy" && organizedSearchResults.pharmacyItems.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Products Available</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.pharmacyItems.slice(0, showAllFoods ? undefined : 6).map((item, index) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(item.pharmacy.activeHours);
                  
                  return (
                  <Link
                    key={`pharmacy-item-${index}`}
                    href={`/pharmacy/${item.pharmacy.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isOpen) {
                        // Don't navigate if vendor is closed
                        return
                      }
                      handleBranchSelect(item.pharmacy)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative block ${
                      !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="relative h-36">
                      {item.itemImage?.url ? (
                        <Image
                          src={item.itemImage.url}
                          alt={item.itemName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <span className="text-blue-600 text-3xl">💊</span>
                        </div>
                      )}

                      {/* Closed indicator */}
                      {!isOpen && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Closed
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{item.itemName}</h3>
                      <span className="text-xs text-gray-600 truncate block">{item.pharmacyName}</span>
                      <span className="text-xs font-bold text-blue-600">₵{typeof item.itemPrice === 'number' ? item.itemPrice.toFixed(2) : '0.00'}</span>
                    </div>
                  </Link>
                );
              })}
              </div>
              {organizedSearchResults.pharmacyItems.length > 6 && !showAllFoods && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllFoods(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View All {organizedSearchResults.pharmacyItems.length} Products
                  </button>
                </div>
              )}
              {organizedSearchResults.pharmacyItems.length > 6 && showAllFoods && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllFoods(false)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pharmacy Categories Section */}
          {activeTab === "pharmacy" && organizedSearchResults.pharmacyCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.pharmacyCategories.map((item, index) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(item.pharmacy.activeHours);
                  
                  return (
                  <Link
                    key={`pharmacy-category-${index}`}
                    href={`/pharmacy/${item.pharmacy.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isOpen) {
                        // Don't navigate if vendor is closed
                        return
                      }
                      handleBranchSelect(item.pharmacy)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative block ${
                      !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="relative h-36">
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-blue-600 text-3xl">📂</span>
                      </div>

                      {/* Closed indicator */}
                      {!isOpen && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Closed
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{item.categoryName}</h3>
                      <span className="text-xs text-gray-600 truncate block">{item.pharmacyName}</span>
                    </div>
                  </Link>
                );
              })}
              </div>
            </div>
          )}

          {/* Pharmacies Section */}
          {activeTab === "pharmacy" && organizedSearchResults.pharmacies.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pharmacies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {organizedSearchResults.pharmacies.slice(0, showMorePharmacies ? undefined : 12).map((pharmacy) => {
                  // Check if vendor is open based on working hours
                  const isOpen = isVendorOpen(pharmacy.activeHours);
                  
                  return (
                  <Link
                    key={pharmacy.id}
                    href={`/pharmacy/${pharmacy.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isOpen) {
                        // Don't navigate if vendor is closed
                        return
                      }
                      handleBranchSelect(pharmacy)
                    }}
                    className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative block ${
                      !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <button 
                      className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform text-gray-400 hover:text-blue-500 hover:bg-white hover:scale-105"
                      aria-label="Like pharmacy"
                    >
                      <Heart className="w-5 h-5 transition-all duration-200" />
                    </button>

                    {/* Closed indicator */}
                    {!isOpen && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Closed
                      </div>
                    )}

                    <div className="relative h-36">
                      {pharmacy.Pharmacy?.pharmacyLogo?.url ? (
                        <Image
                          src={pharmacy.Pharmacy.pharmacyLogo.url}
                          alt={pharmacy.Pharmacy?.pharmacyName || 'Pharmacy'}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ${pharmacy.Pharmacy?.pharmacyLogo?.url ? 'hidden' : ''}`}>
                        <span className="text-blue-600 text-3xl">💊</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">
                        {pharmacy.Pharmacy?.pharmacyName}
                      </h3>
                      <span className="text-xs text-gray-600 truncate block">
                        {pharmacy.Pharmacy?.pharmacyAddress || pharmacy.branchName || pharmacy.location || 'Location'}
                      </span>
                    </div>
                  </Link>
                );
              })}
              </div>
              
              {/* Show More Button for Pharmacies */}
              {organizedSearchResults.pharmacies.length > 12 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowMorePharmacies(!showMorePharmacies)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    {showMorePharmacies ? 'Show Less' : `Show All ${organizedSearchResults.pharmacies.length} Pharmacies`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {((activeTab === "restaurants" && organizedSearchResults.foodNames.length === 0 && 
             organizedSearchResults.foodCategories.length === 0 && 
             organizedSearchResults.restaurants.length === 0) ||
            (activeTab === "groceries" && organizedSearchResults.groceryItems.length === 0 && 
             organizedSearchResults.groceryCategories.length === 0 && 
             organizedSearchResults.groceries.length === 0) ||
            (activeTab === "pharmacy" && organizedSearchResults.pharmacyItems.length === 0 && 
             organizedSearchResults.pharmacyCategories.length === 0 && 
             organizedSearchResults.pharmacies.length === 0)) && (
        <div className="flex flex-col items-center justify-center py-8">
              <EmptyState
                title="No results found"
                description={`We couldn't find any ${activeTab} matching "${searchQuery}"`}
                icon="search"
              />
              </div>
          )}
        </div>
      ) : sortedSearchResults.length > 0 ? (
        // Display regular results for non-restaurant tabs or when no search query
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sortedSearchResults.map((item) => {
            // Handle different item types based on activeTab
            if (activeTab === "restaurants") {
              const branch = item;
              const isOpen = isVendorOpen(branch.activeHours);
              
              return (
            <Link
              key={branch.id}
              href={`/restaurants/${branch.slug}`}
              onClick={(e) => {
                e.preventDefault()
                handleBranchSelect(branch)
              }}
                  className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block ${
                    !isOpen ? 'opacity-50 grayscale' : ''
                  }`}
            >
              <button
                className={`absolute top-2 right-2 z-1 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform ${
                  likedBranches.has(branch.id) 
                    ? 'text-orange-500 scale-110 hover:scale-105' 
                    : 'text-gray-400 hover:text-orange-500 hover:bg-white hover:scale-105'
                }`}
                onClick={(e) => handleLikeToggle(branch.id, e)}
                aria-label={likedBranches.has(branch.id) ? "Unlike restaurant" : "Like restaurant"}
              >
                <Heart className={`w-5 h-5 transition-all duration-200 ${likedBranches.has(branch.id) ? 'fill-current' : ''}`} />
              </button>
                  
                  {/* Closed indicator */}
                  {!isOpen && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Closed
                    </div>
                  )}
                  
              <div className="relative h-36">
                    {branch.Restaurant?.[0]?.image_url || 
                     branch._restaurantTable?.[0]?.image_url ||
                     branch.Restaurant?.[0]?.restaurantLogo?.url || 
                     branch._restaurantTable?.[0]?.restaurantLogo?.url || 
                     branch.restaurantLogo?.url || 
                     branch.logo?.url || 
                     branch.image?.url ? (
                <Image
                        src={branch.Restaurant?.[0]?.image_url || 
                             branch._restaurantTable?.[0]?.image_url ||
                             branch.Restaurant?.[0]?.restaurantLogo?.url || 
                             branch._restaurantTable?.[0]?.restaurantLogo?.url || 
                             branch.restaurantLogo?.url || 
                             branch.logo?.url || 
                             branch.image?.url}
                        alt={branch.Restaurant?.[0]?.restaurantName || 
                             branch._restaurantTable?.[0]?.restaurantName || 
                             branch.restaurantName || 
                             branch.name || 
                             branch.branchName || 
                             'Restaurant'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                      {branch.Restaurant?.[0]?.restaurantName || 
                       branch._restaurantTable?.[0]?.restaurantName || 
                       branch.restaurantName || 
                       branch.name || 
                       branch.branchName || 
                       'Restaurant'}
                </h3>
                <span className="text-xs text-gray-600 truncate block">
                      {branch.branchName || branch.location || 'Location'}
                </span>
              </div>
            </Link>
              );
            } else if (activeTab === "groceries") {
              const grocery = item;
              const groceryName = grocery.Grocery?.groceryshopName || grocery.grocerybranchName;
              const isOpen = isVendorOpen(grocery.activeHours);
              
              return (
                <Link
                  key={grocery.id}
                  href={`/groceries/${grocery.slug}`}
                  className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block ${
                    !isOpen ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  <button 
                    className="absolute top-2 right-2 z-1 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform text-gray-400 hover:text-orange-500 hover:bg-white hover:scale-105"
                    aria-label="Like grocery"
                  >
                    <Heart className="w-5 h-5 transition-all duration-200" />
                  </button>
                  
                  {/* Closed indicator */}
                  {!isOpen && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Closed
                    </div>
                  )}
                  
                  <div className="relative h-36">
                    {grocery.Grocery?.image_url || grocery.Grocery?.groceryshopLogo?.url ? (
                      <Image
                        src={grocery.Grocery.image_url || grocery.Grocery.groceryshopLogo.url}
                        alt={groceryName || 'Grocery'}
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
                      {groceryName || 'Grocery'}
                    </h3>
                    <span className="text-xs text-gray-600 truncate block">
                      {grocery.grocerybranchLocation || 'Grocery Store'}
                    </span>
                  </div>
                </Link>
              );
            } else if (activeTab === "pharmacy") {
              const pharmacy = item;
              const pharmacyName = pharmacy.Pharmacy?.pharmacyName || pharmacy.pharmacybranchName;
              const isOpen = isVendorOpen(pharmacy.activeHours);
              
              return (
                <Link
                  key={pharmacy.id}
                  href={`/pharmacy/${pharmacy.slug}`}
                  className={`bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block ${
                    !isOpen ? 'opacity-50 grayscale' : ''
                  }`}
                >
              <button
                    className="absolute top-2 right-2 z-1 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform text-gray-400 hover:text-orange-500 hover:bg-white hover:scale-105"
                    aria-label="Like pharmacy"
              >
                    <Heart className="w-5 h-5 transition-all duration-200" />
              </button>
                  
                  {/* Closed indicator */}
                  {!isOpen && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Closed
                    </div>
                  )}
                  
                  <div className="relative h-36">
                    {pharmacy.Pharmacy?.pharmacyLogo?.url ? (
                      <Image
                        src={pharmacy.Pharmacy.pharmacyLogo.url}
                        alt={pharmacyName || 'Pharmacy'}
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
                      {pharmacyName || 'Pharmacy'}
                    </h3>
                    <span className="text-xs text-gray-600 truncate block">
                      {pharmacy.pharmacybranchLocation || 'Pharmacy'}
                    </span>
                  </div>
                </Link>
              );
            }
            return null;
          })}
            </div>
          ) : (
        <div className="flex flex-col items-center justify-center py-8">
            <EmptyState
            title={`No ${activeTab} found`}
            description={searchQuery ? `We couldn't find any ${activeTab} matching "${searchQuery}"` : `No ${activeTab} available`}
              icon="search"
            />
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
              Back to Vendors
            </Link>
            {currentBranch && <BranchPage params={{ id: currentBranch.id }} urlParams={{}} />}
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
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-lg">Settings have moved to a dedicated page.</p>
            <Link href="/settings">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Go to Settings</Button>
            </Link>
          </div>
        );
      default:
        return (
          <div>
            {/* Search Section with Tabs */}
            <SearchSection
              onSearch={setSearchQuery}
              userLocation={userLocation}
              onLocationClick={() => setIsLocationModalOpen(true)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onFilterClick={() => setIsFilterModalOpen(true)}
              branches={branches}
            />

            {/* Advanced Filter Modal */}
            <FilterModal
              open={isFilterModalOpen}
              onOpenChange={setIsFilterModalOpen}
              filterTypes={filterTypes}
              setFilterTypes={setFilterTypes}
              filterCategories={filterCategories}
              setFilterCategories={setFilterCategories}

              filterRating={filterRating}
              setFilterRating={setFilterRating}
              filterDeliveryTime={filterDeliveryTime}
              setFilterDeliveryTime={setFilterDeliveryTime}
              filterPickup={filterPickup}
              setFilterPickup={setFilterPickup}
              foodPage={0}
              setFoodPage={() => {}}
              groceryPage={0}
              setGroceryPage={() => {}}
              pharmacyPage={0}
              setPharmacyPage={() => {}}
              RESTAURANT_CATEGORIES={RESTAURANT_CATEGORIES}
              GROCERY_CATEGORIES={GROCERY_CATEGORIES}
              PHARMACY_CATEGORIES={PHARMACY_CATEGORIES}
              PAGE_SIZE={PAGE_SIZE}
              vendorData={vendorData}
              ratings={vendorData?.Ratings}
              isLoading={isFilterLoading}
              onApply={async (filteredResults) => {
                console.log('StoreHeader: onApply called with filteredResults:', filteredResults);
                setIsFilterLoading(true);
                try {
                  // Small delay to show loading state
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  // Store filtered results in state
                  setFilteredResults(filteredResults || []);
                  setIsShowingFilteredResults(true);
                  console.log('StoreHeader: setFilteredResults and setIsShowingFilteredResults called');
                  
                  // Update the current view to show filtered results
                  setCurrentView('stores');
                  
                  // Only close the modal after data is set
                  setIsFilterModalOpen(false);
                } catch (error) {
                  console.error('Error applying filters:', error);
                } finally {
                  setIsFilterLoading(false);
                }
              }}
            />

                        {/* Tab Content */}
            <div className="container mx-auto px-4 py-4">
              {renderRestaurantList()}
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
      
      {/* Policy Acceptance Modal */}
      {showPolicyModal && (
        <PolicyAcceptanceModal
          isOpen={showPolicyModal}
          onAccept={handlePolicyAccept}
          onDecline={handlePolicyDecline}
        />
      )}
    </div>
  )
}

export function GroceriesStoreHeader() {
  const [groceryData, setGroceryData] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [cart, setCart] = useState<any[]>([]);

  // Load grocery data from localStorage
  useEffect(() => {
    const groceryData = localStorage.getItem('selectedGroceryShopData');
    
    console.log('Retrieved grocery data from localStorage:', { groceryData });
    
    if (groceryData) {
      try {
        const grocery = JSON.parse(groceryData);
        
        console.log('Parsed grocery data:', grocery);
        console.log('Grocery structure:', {
          id: grocery.id,
          slug: grocery.slug,
          groceryshopName: grocery.groceryshopName,
          groceryshopLogo: grocery.groceryshopLogo,
          groceryshopAddress: grocery.groceryshopAddress,
          groceryItemCount: grocery.GroceryItem?.length || 0
        });
        
        // Set shop info from the main shop data
        setShopLogo(grocery.groceryshopLogo?.url || null);
        setShopName(grocery.groceryshopName || 'Grocery Store');
        
        console.log('Set shop info:', {
          logo: grocery.groceryshopLogo?.url || null,
          name: grocery.groceryshopName || 'Grocery Store'
        });
        
        // Load inventory from main shop data
        if (grocery.GroceryItem && Array.isArray(grocery.GroceryItem)) {
          console.log('Loading', grocery.GroceryItem.length, 'items from main shop data');
          
          const normalizedItems = grocery.GroceryItem.map((item: any) => ({
            ...item,
            groceryShopId: grocery.id,
            available: typeof item.available === "boolean" ? item.available : true,
          }));
          
          const sorted = normalizedItems.sort((a: any, b: any) => {
            if (!a.productName) return -1;
            if (!b.productName) return 1;
            return a.productName.localeCompare(b.productName);
          });
          
          setInventory(sorted);
          setIsLoading(false);
          console.log('Successfully loaded', sorted.length, 'grocery items from main shop data');
          return;
        }
      } catch (error) {
        console.error('Error parsing grocery data:', error);
      }
    }
    
    // Fallback to allData if main shop data not found
    const allData = localStorage.getItem('allData');
    if (allData) {
      try {
        const parsedAllData = JSON.parse(allData);
        console.log('Found allData, looking for matching grocery');
        
        if (parsedAllData.Groceries && Array.isArray(parsedAllData.Groceries)) {
          const matchingGrocery = parsedAllData.Groceries.find((grocery: any) => 
            grocery.id === localStorage.getItem('selectedGroceryShopId') || 
            grocery.groceryshopID === localStorage.getItem('selectedGroceryShopId') ||
            grocery.Grocery?.id === localStorage.getItem('selectedGroceryShopId')
          );
          
          if (matchingGrocery && matchingGrocery.GroceryItem && Array.isArray(matchingGrocery.GroceryItem)) {
            console.log('Found matching grocery in allData with', matchingGrocery.GroceryItem.length, 'items');
            
            // Set shop info from allData main shop
            setShopLogo(matchingGrocery.Grocery?.groceryshopLogo?.url || null);
            setShopName(matchingGrocery.Grocery?.groceryshopName || 'Grocery Store');
            
            const normalizedItems = matchingGrocery.GroceryItem.map((item: any) => ({
              ...item,
              groceryShopId: matchingGrocery.Grocery?.id || localStorage.getItem('selectedGroceryShopId'),
              available: typeof item.available === "boolean" ? item.available : true,
            }));
            
            const sorted = normalizedItems.sort((a: any, b: any) => {
              if (!a.productName) return -1;
              if (!b.productName) return 1;
              return a.productName.localeCompare(b.productName);
            });
            
            setInventory(sorted);
            setIsLoading(false);
            console.log('Successfully loaded', sorted.length, 'grocery items from allData');
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing allData:', error);
      }
    }
    
    console.log('No grocery data found, setting loading to false');
    setIsLoading(false);
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('groceryCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {}
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('groceryCart', JSON.stringify(cart));
  }, [cart]);

  // Helper to add item to cart
  const handleAddToCart = (item: any) => {
    if (!item.productName || !item.price) return;
    const image =
      typeof item.image === "object" && item.image && "url" in item.image
        ? item.image.url
        : typeof item.image === "string"
        ? item.image
        : (item.foodImage && item.foodImage.url) || null;
    setCart(prev => {
      const updated = [
        ...prev,
        {
          ...item,
          name: item.productName,
          price: item.price,
          image,
          quantity: 1,
          available: typeof item.available === "boolean" ? item.available : true
        }
      ];
      localStorage.setItem('groceryCart', JSON.stringify(updated));
      return updated;
    });
  };

  // Group inventory by category
  const categories = ["All Items", ...Array.from(new Set(inventory.map(item => item.category || "Uncategorized")))];
  useEffect(() => {
    if (categories.length && !categories.includes(selectedCategory)) {
      setSelectedCategory("All Items");
    }
  }, [categories, selectedCategory]);
  
  const filteredInventory = selectedCategory === "All Items" 
    ? inventory 
    : inventory.filter(item => (item.category || "Uncategorized") === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header skeleton */}
          <div className="bg-white shadow-sm border-b mb-6">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Category tabs skeleton */}
          <div className="mb-6">
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {shopLogo && (
                  <img
                    src={shopLogo}
                    alt={shopName || "Grocery Store"}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {shopName || "Grocery Store"}
                  </h1>
                </div>
              </div>
            </div>
            
            {/* Cart Button */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cart ({cart.length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 text-xs rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={item.image || '/fallbackVendor.jpg'}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/fallbackVendor.jpg';
                  }}
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-600 text-white rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {item.productName}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {item.category || "Uncategorized"}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-orange-600">
                      ₵{parseFloat(item.price).toFixed(2)}
                    </span>
                    {item.stockQuantity !== undefined && (
                      <span className="text-xs text-gray-500">
                        {item.stockQuantity} in stock
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No items found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PharmacyStoreHeader() {
  const [pharmacyData, setPharmacyData] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [cart, setCart] = useState<any[]>([]);

  // Load pharmacy data from localStorage
  useEffect(() => {
    const pharmacyData = localStorage.getItem('selectedPharmacyShopData');
    
    console.log('Retrieved pharmacy data from localStorage:', { pharmacyData });
    
    if (pharmacyData) {
      try {
        const pharmacy = JSON.parse(pharmacyData);
        
        console.log('Parsed pharmacy data:', pharmacy);
        console.log('Pharmacy structure:', {
          id: pharmacy.id,
          slug: pharmacy.slug,
          pharmacyName: pharmacy.pharmacyName,
          pharmacyLogo: pharmacy.pharmacyLogo,
          pharmacyAddress: pharmacy.pharmacyAddress,
          pharmacyItemCount: pharmacy.PharmacyItem?.length || 0
        });
        
        // Set shop info from the main shop data
        setShopLogo(pharmacy.pharmacyLogo?.url || null);
        setShopName(pharmacy.pharmacyName || 'Pharmacy');
        
        console.log('Set shop info:', {
          logo: pharmacy.pharmacyLogo?.url || null,
          name: pharmacy.pharmacyName || 'Pharmacy'
        });
        
        // Load inventory from main shop data
        if (pharmacy.PharmacyItem && Array.isArray(pharmacy.PharmacyItem)) {
          console.log('Loading', pharmacy.PharmacyItem.length, 'items from main shop data');
          
          const normalizedItems = pharmacy.PharmacyItem.map((item: any) => ({
            ...item,
            pharmacyShopId: pharmacy.id,
            available: typeof item.available === "boolean" ? item.available : true,
          }));
          
          const sorted = normalizedItems.sort((a: any, b: any) => {
            if (!a.productName) return -1;
            if (!b.productName) return 1;
            return a.productName.localeCompare(b.productName);
          });
          
          setInventory(sorted);
          setIsLoading(false);
          console.log('Successfully loaded', sorted.length, 'pharmacy items from main shop data');
          return;
        }
      } catch (error) {
        console.error('Error parsing pharmacy data:', error);
      }
    }
    
    // Fallback to allData if main shop data not found
    const allData = localStorage.getItem('allData');
    if (allData) {
      try {
        const parsedAllData = JSON.parse(allData);
        console.log('Found allData, looking for matching pharmacy');
        
        if (parsedAllData.Pharmacies && Array.isArray(parsedAllData.Pharmacies)) {
          const matchingPharmacy = parsedAllData.Pharmacies.find((pharmacy: any) => 
            pharmacy.id === localStorage.getItem('selectedPharmacyShopId') || 
            pharmacy.pharmacyshopID === localStorage.getItem('selectedPharmacyShopId') ||
            pharmacy.Pharmacy?.id === localStorage.getItem('selectedPharmacyShopId')
          );
          
          if (matchingPharmacy && matchingPharmacy.PharmacyItem && Array.isArray(matchingPharmacy.PharmacyItem)) {
            console.log('Found matching pharmacy in allData with', matchingPharmacy.PharmacyItem.length, 'items');
            
            // Set shop info from allData main shop
            setShopLogo(matchingPharmacy.Pharmacy?.pharmacyLogo?.url || null);
            setShopName(matchingPharmacy.Pharmacy?.pharmacyName || 'Pharmacy');
            
            const normalizedItems = matchingPharmacy.PharmacyItem.map((item: any) => ({
              ...item,
              pharmacyShopId: matchingPharmacy.Pharmacy?.id || localStorage.getItem('selectedPharmacyShopId'),
              available: typeof item.available === "boolean" ? item.available : true,
            }));
            
            const sorted = normalizedItems.sort((a: any, b: any) => {
              if (!a.productName) return -1;
              if (!b.productName) return 1;
              return a.productName.localeCompare(b.productName);
            });
            
            setInventory(sorted);
            setIsLoading(false);
            console.log('Successfully loaded', sorted.length, 'pharmacy items from allData');
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing allData:', error);
      }
    }
    
    console.log('No pharmacy data found, setting loading to false');
    setIsLoading(false);
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pharmacyCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {}
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pharmacyCart', JSON.stringify(cart));
  }, [cart]);

  // Helper to add item to cart
  const handleAddToCart = (item: any) => {
    if (!item.productName || !item.price) return;
    const image =
      typeof item.image === "object" && item.image && "url" in item.image
        ? item.image.url
        : typeof item.image === "string"
        ? item.image
        : (item.foodImage && item.foodImage.url) || null;
    setCart(prev => {
      const updated = [
        ...prev,
        {
          ...item,
          name: item.productName,
          price: item.price,
          image,
          quantity: 1,
          available: typeof item.available === "boolean" ? item.available : true
        }
      ];
      localStorage.setItem('pharmacyCart', JSON.stringify(updated));
      return updated;
    });
  };

  // Group inventory by category
  const categories = ["All Items", ...Array.from(new Set(inventory.map(item => item.category || "Uncategorized")))];
  useEffect(() => {
    if (categories.length && !categories.includes(selectedCategory)) {
      setSelectedCategory("All Items");
    }
  }, [categories, selectedCategory]);
  
  const filteredInventory = selectedCategory === "All Items" 
    ? inventory 
    : inventory.filter(item => (item.category || "Uncategorized") === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header skeleton */}
          <div className="bg-white shadow-sm border-b mb-6">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Category tabs skeleton */}
          <div className="mb-6">
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {shopLogo && (
                  <img
                    src={shopLogo}
                    alt={shopName || "Pharmacy"}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {shopName || "Pharmacy"}
                  </h1>
                </div>
              </div>
            </div>
            
            {/* Cart Button */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cart ({cart.length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 text-xs rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={item.image || '/fallbackVendor.jpg'}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/fallbackVendor.jpg';
                  }}
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-600 text-white rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {item.productName}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {item.category || "Uncategorized"}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      ₵{parseFloat(item.price).toFixed(2)}
                    </span>
                    {item.stockQuantity !== undefined && (
                      <span className="text-xs text-gray-500">
                        {item.stockQuantity} in stock
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No items found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

