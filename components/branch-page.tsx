"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star, MapPin, Clock, Plus, Minus, Share2, Heart, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BranchDetailsModal } from "@/components/branch-details-modal"
import { EmptyState } from "@/components/empty-state"
import { FloatingCart } from "@/components/floating-cart"
import { CartModal } from "@/components/cart-modal"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCustomerDetails, calculateDeliveryPrices } from "@/lib/api"
import { calculateDistance } from "@/lib/distance"
import { Checkbox } from "@/components/ui/checkbox";

interface BranchDetails {
  _menutable?: Array<{
    foodType: string
    foods: Array<{
      name: string
      price: string
      available: boolean
      description?: string
      foodImage?: { url: string }
      image_url?: string // New field for direct image URL
      extras?: Array<{
        extrasTitle: string
        inventoryDetails: Array<{
          id: string
          categoryId: string
          foodType: string
          foodName: string
          foodPrice: string
          foodDescription: string
          foodImage?: {
            url: string
          }
        }>
      }>
    }>
    foodTypeImage?: { url: string }
  }>
  restaurant?: Array<{
    id: string
    restaurantLogo?: { url: string }
    restaurantName?: string
    image_url?: string // New field for direct image URL
  }>
  branchLocation: string
  branchPhoneNumber: string
  branchName?: string
  branchCity?: string
  branchLatitude: string
  branchLongitude: string
  openTime?: string
  closeTime?: string
  activeHours?: Array<{
    day: string
    openingTime: string
    closingTime: string
    isActive?: boolean
  }>
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

interface BranchPageProps {
  params: {
    id: string
  }
  urlParams?: {
    category?: string | null
    name?: string | null
  }
}

interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
  image_url?: string // New field for direct image URL
  selectedExtras?: Array<{
    id: string
    name: string
    price: string
    quantity: number
  }>
}

interface ItemDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    name: string
    price: string
    description?: string
    foodImage?: { url: string }
    image_url?: string // New field for direct image URL
    extras?: Array<{
      extrasTitle: string
      inventoryDetails: Array<{
        id: string
        categoryId: string
        foodType: string
        foodName: string
        foodPrice: string
        foodDescription: string
        foodImage?: { url: string }
      }>
    }>
  }
  onAddToCart: (item: CartItem & { available: boolean }) => void
}

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  // Handles both "8:00 AM" and "16:30" formats
  let hour = 0, minute = 0;
  let isPM = false;
  let isAM = false;
  let time = timeStr.trim();
  if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
    // 12-hour format
    isPM = time.toLowerCase().includes('pm');
    isAM = time.toLowerCase().includes('am');
    time = time.replace(/am|pm|AM|PM/, '').trim();
  }
  const [h, m] = time.split(':');
  hour = parseInt(h, 10);
  minute = m ? parseInt(m, 10) : 0;
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return hour * 60 + minute;
}

// Replace isRestaurantOpen with a client-only hook
function useRestaurantOpen(activeHours?: Array<{day: string, openingTime: string, closingTime: string, isActive?: boolean}>) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!activeHours || activeHours.length === 0) {
      setIsOpen(false);
      return;
    }
    const now = new Date();
    const currentDay = now.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[currentDay];
    let todayHours = activeHours.find(hour => hour.day.toLowerCase() === currentDayName.toLowerCase());
    if (!todayHours) {
      todayHours = activeHours.find(hour => hour.day.toLowerCase().substring(0, 3) === currentDayName.toLowerCase().substring(0, 3));
    }
    if (!todayHours) {
      setIsOpen(false);
      return;
    }
    if (todayHours.hasOwnProperty('isActive') && !todayHours.isActive) {
      setIsOpen(false);
      return;
    }
    const parseTimeToMinutes = (timeStr?: string): number | null => {
      if (!timeStr) return null;
      let hour = 0, minute = 0;
      let isPM = false;
      let isAM = false;
      let time = timeStr.trim();
      if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
        isPM = time.toLowerCase().includes('pm');
        isAM = time.toLowerCase().includes('am');
        time = time.replace(/am|pm|AM|PM/, '').trim();
      }
      const [h, m] = time.split(':');
      hour = parseInt(h, 10);
      minute = m ? parseInt(m, 10) : 0;
      if (isPM && hour < 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
      return hour * 60 + minute;
    };
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const openTimeInMinutes = parseTimeToMinutes(todayHours.openingTime);
    const closeTimeInMinutes = parseTimeToMinutes(todayHours.closingTime);
    if (openTimeInMinutes === null || closeTimeInMinutes === null) {
      setIsOpen(false);
      return;
    }
    if (closeTimeInMinutes < openTimeInMinutes) {
      setIsOpen(currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes <= closeTimeInMinutes);
      return;
    }
    setIsOpen(currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes);
  }, [activeHours]);
  return isOpen;
}

function ItemDetailsModal({ isOpen, onClose, item, onAddToCart }: ItemDetailsModalProps) {
  // --- NEW STATE FOR EXTRAS SELECTION ---
  // extrasSelection: { [groupId]: Set of selected inventoryTable keys (foodName or unique id) }
  const [extrasSelection, setExtrasSelection] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- FLATTENED EXTRAS GROUPS ---
  // Each group: { groupId, title, type, min, max, options: [{ id, name, price, description }] }
  const extrasGroups = (item.extras || []).map((extra, idx) => {
    // Support both new and old structure
    const table = (extra as any).extrasTable || extra;
    const groupId = table.id || table.extrasTitle || `group-${idx}`;
    const title = table.extrasTitle;
    const type = table.extrasType;
    // Flatten all inventoryTable items in all extrasDetails
    let options: Array<{ id: string, name: string, price: string, description: string }> = [];
    (table.extrasDetails || []).forEach((detail: any, dIdx: number) => {
      (detail.inventoryTable || []).forEach((inv: any, iIdx: number) => {
        options.push({
          id: `${groupId}-${dIdx}-${iIdx}-${inv.foodName}`,
          name: inv.foodName,
          price: inv.foodPrice,
          description: inv.foodDescription || '',
        });
      });
    });
    // min/max: take from first detail (assume same for all)
    const min = parseInt(table.extrasDetails?.[0]?.minSelection || '0', 10);
    const max = parseInt(table.extrasDetails?.[0]?.maxSelection || `${options.length}`, 10);
    return { groupId, title, type, min, max, options };
  });

  // --- HANDLE SELECTION ---
  const handleSelect = (groupId: string, optionId: string, checked: boolean) => {
    setExtrasSelection(prev => {
      const current = prev[groupId] || [];
      let next: string[];
      const group = extrasGroups.find(g => g.groupId === groupId);
      if (!group) return prev;
      if (group.type === 'single') {
        next = checked ? [optionId] : [];
      } else {
        // multiple
        if (checked) {
          if (current.length < group.max) {
            next = [...current, optionId];
          } else {
            next = current; // don't add more than max
          }
        } else {
          next = current.filter(id => id !== optionId);
        }
      }
      return { ...prev, [groupId]: next };
    });
  };

  // --- VALIDATE SELECTIONS ---
  useEffect(() => {
    for (const group of extrasGroups) {
      const selected = extrasSelection[group.groupId] || [];
      if (selected.length < group.min) {
        setValidationError(`Select at least ${group.min} option(s) for ${group.title}`);
        return;
      }
      if (selected.length > group.max) {
        setValidationError(`You can select up to ${group.max} option(s) for ${group.title}`);
        return;
      }
    }
    setValidationError(null);
  }, [extrasSelection, extrasGroups]);

  // --- CALCULATE TOTAL PRICE ---
  let extrasTotal = 0;
  extrasGroups.forEach(group => {
    const selected = extrasSelection[group.groupId] || [];
    selected.forEach(optionId => {
      const opt = group.options.find(o => o.id === optionId);
      if (opt) extrasTotal += parseFloat(opt.price);
    });
  });
  const totalPrice = (parseFloat(item.price) + extrasTotal) * quantity;

  // --- BUILD SELECTED EXTRAS FOR CART ---
  const selectedExtras = extrasGroups.flatMap(group => {
    const selected = extrasSelection[group.groupId] || [];
    return selected.map(optionId => {
      const opt = group.options.find(o => o.id === optionId);
      return opt ? {
        id: optionId,
        name: opt.name,
        price: opt.price,
        quantity: 1,
      } : null;
    }).filter((e): e is { id: string; name: string; price: string; quantity: number } => !!e);
  });

  // --- HANDLE ADD TO CART ---
  const handleAddToCart = () => {
    // Validate all groups
    for (const group of extrasGroups) {
      const selected = extrasSelection[group.groupId] || [];
      if (selected.length < group.min) {
        setValidationError(`Select at least ${group.min} option(s) for ${group.title}`);
        return;
      }
    }
    setValidationError(null);
    onAddToCart({
      id: item.name,
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.image_url || item.foodImage?.url,
      available: true,
      selectedExtras: selectedExtras
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Item Details</DialogTitle>
        {/* Item Image */}
        {(item.image_url || item.foodImage) && (
          <div className="relative w-full h-48 sm:h-56 md:h-64">
            <Image
              src={item.image_url || item.foodImage?.url || (item.foodImage as any).path || "/placeholder-image.jpg"}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className="p-6">
          {/* Item Info */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">{item.name}</h2>
            <div className="text-2xl font-bold text-gray-900 mb-1">GH₵{parseFloat(item.price).toFixed(2)}</div>
            {item.description && <div className="text-gray-500 text-sm mb-2">{item.description}</div>}
          </div>

          {/* --- EXTRAS GROUPS --- */}
          <div className="max-h-72 pr-2 mb-4 overflow-y-auto">
            {extrasGroups.map(group => (
              <div key={group.groupId} className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>{group.title}</span>
                  <span className="text-xs text-gray-400">{group.type === 'multiple' ? 'Choose ' : 'Select '}min {group.min}, max {group.max}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {group.options.map(opt => (
                    <label key={opt.id} className="flex items-center py-2 gap-3 cursor-pointer">
                      {group.type === 'multiple' ? (
                        <Checkbox
                          name={group.groupId}
                          checked={(extrasSelection[group.groupId] || []).includes(opt.id)}
                          onCheckedChange={checked => handleSelect(group.groupId, opt.id, !!checked)}
                          disabled={
                            !((extrasSelection[group.groupId] || []).includes(opt.id)) &&
                            (extrasSelection[group.groupId]?.length || 0) >= group.max
                          }
                        />
                      ) : (
                        <input
                          type="radio"
                          name={group.groupId}
                          value={opt.id}
                          checked={(extrasSelection[group.groupId] || []).includes(opt.id)}
                          onChange={e => handleSelect(group.groupId, opt.id, e.target.checked)}
                          className="form-radio h-4 w-4 text-orange-500 border-gray-300"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">{opt.name}</span>
                          <span className="ml-2 text-gray-500 text-sm">+GH₵{parseFloat(opt.price).toFixed(2)}</span>
                        </div>
                        {opt.description && (
                          <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Validation error */}
          {validationError && <div className="text-red-500 text-xs mb-2">{validationError}</div>}

          {/* Quantity and Add Button */}
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button size="icon" variant="outline" onClick={() => setQuantity(q => q + 1)}>+</Button>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-semibold text-base"
              onClick={handleAddToCart}
              disabled={!!validationError}
            >
              Add
              <span className="ml-2">GH₵{totalPrice.toFixed(2)}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BranchPage({ params, urlParams }: BranchPageProps) {
  const [branch, setBranch] = useState<BranchDetails | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<(CartItem & { available: boolean })[]>([])
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    name: string
    price: string
    description?: string
    foodImage?: { url: string }
    extras?: Array<{
      extrasTitle: string
      inventoryDetails: Array<{
        id: string
        categoryId: string
        foodType: string
        foodName: string
        foodPrice: string
        foodDescription: string
        foodImage?: { url: string }
      }>
    }>
  } | null>(null)

  // Delivery calculation state
  const [riderFee, setRiderFee] = useState<number>(0)
  const [pedestrianFee, setPedestrianFee] = useState<number>(0)
  const [platformFee, setPlatformFee] = useState<number>(0)
  const [distance, setDistance] = useState<number>(0)
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false)

  // Helper function to safely convert values to numbers
  const toNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    const parsed = parseFloat(value?.toString());
    return isNaN(parsed) ? 0 : parsed;
  }

  // Function to load delivery fees from localStorage (now uses generic key)
  const loadDeliveryFeesFromStorage = () => {
    try {
      const deliveryData = localStorage.getItem('deliveryCalculationData');
      if (deliveryData) {
        const parsed = JSON.parse(deliveryData);
        console.log('[BranchPage] Loading delivery fees from localStorage with key: deliveryCalculationData', parsed);
        // Only check if data is not too old (5 min)
        const now = Date.now();
        const dataAge = now - parsed.timestamp;
        const maxAge = 30 * 60 * 1000; // 30 minutes
        if (dataAge < maxAge) {
          setRiderFee(toNumber(parsed.riderFee));
          setPedestrianFee(toNumber(parsed.pedestrianFee));
          setPlatformFee(toNumber(parsed.platformFee));
          setDistance(toNumber(parsed.distance));
          console.log('[BranchPage] ✅ Loaded delivery fees from localStorage');
        } else {
          console.log('[BranchPage] Cached delivery data is too old, clearing');
          setRiderFee(0);
          setPedestrianFee(0);
          setPlatformFee(0);
          setDistance(0);
          localStorage.removeItem('deliveryCalculationData');
        }
      } else {
        console.log('[BranchPage] No delivery calculation data found in localStorage for key: deliveryCalculationData');
        setRiderFee(0);
        setPedestrianFee(0);
        setPlatformFee(0);
        setDistance(0);
      }
    } catch (error) {
      console.error('[BranchPage] Error loading delivery fees from localStorage:', error);
      setRiderFee(0);
      setPedestrianFee(0);
      setPlatformFee(0);
      setDistance(0);
      localStorage.removeItem('deliveryCalculationData');
    }
  }

  // Handle URL parameters for category selection
  useEffect(() => {
    if (urlParams?.category && branch?._menutable) {
      const decodedCategory = decodeURIComponent(urlParams.category);
      const matchingCategory = branch._menutable.find(cat => 
        cat.foodType?.toLowerCase().trim() === decodedCategory.toLowerCase().trim()
      );
      if (matchingCategory) {
        setSelectedCategory(matchingCategory.foodType);
      }
    }
  }, [urlParams?.category, branch]);

  // Load delivery fees from localStorage after branch data is loaded
  useEffect(() => {
    if (branch && !isLoading) {
      console.log('[BranchPage] Branch data loaded, loading delivery fees from localStorage');
      loadDeliveryFeesFromStorage();
    }
  }, [branch, isLoading]);

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
        // Check if this branch is liked when user data is loaded
        if (user.id && branch) {
          checkIfBranchIsLiked(user.id)
        }
      } else {
        console.log('No user data or auth token found')
        setUser(null)
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
  }, []) // Removed branch dependency

  // Check if current branch is in user's favorites
  const checkIfBranchIsLiked = async (userId: string) => {
    if (!userId || !branch) return

    try {
      const customerData = await getCustomerDetails(userId)
      if (customerData?.favoriteRestaurants) {
        const isCurrentBranchLiked = customerData.favoriteRestaurants.some(
          (fav: FavoriteRestaurant) => fav.branchName === params.id
        )
        setIsLiked(isCurrentBranchLiked)
      }
    } catch (error) {
      console.error('Error checking if branch is liked:', error)
    }
  }

  // Check favorites when branch data is loaded
  useEffect(() => {
    if (user?.id && branch) {
      checkIfBranchIsLiked(user.id)
    }
  }, [user, branch])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${params.id}`)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
      }
    }
  }, [params.id])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem(`cart-${params.id}`, JSON.stringify(cart))
    } else {
      localStorage.removeItem(`cart-${params.id}`)
    }
  }, [cart, params.id])

  useEffect(() => {
    async function fetchBranch() {
      try {
        setError(null)
        setIsLoading(true)
        
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
        setError("Failed to load branch details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranch()
  }, [params.id])

  // Add this effect to check restaurant status
  const isRestaurantOpen = useRestaurantOpen(branch?.activeHours);

  // Reload delivery fees when cart changes (but don't recalculate)
  useEffect(() => {
    if (branch && cart.length > 0) {
      console.log('[BranchPage] Cart changed, reloading delivery fees from localStorage');
      loadDeliveryFeesFromStorage();
    }
  }, [cart, branch]);

  // Helper to generate a unique key for a cart item based on id and selectedExtras
  function getCartItemKey(item: CartItem) {
    const extrasKey = item.selectedExtras && item.selectedExtras.length > 0
      ? JSON.stringify([...item.selectedExtras].sort((a, b) => a.id.localeCompare(b.id)))
      : '';
    return `${item.id}__${extrasKey}`;
  }

  const addToCart = (item: CartItem & { available: boolean }) => {
    setCart(prevCart => {
      const itemKey = getCartItemKey(item);
      const existingIndex = prevCart.findIndex(cartItem => getCartItemKey(cartItem) === itemKey);
      if (existingIndex !== -1) {
        // Increase quantity for the exact same item+extras combo
        return prevCart.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      // Add new unique item+extras combo
      return [...prevCart, { ...item, quantity: 1, available: item.available }];
    });
  }

  const removeFromCart = (itemKey: string) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => getCartItemKey(cartItem) === itemKey);
      if (existingIndex !== -1 && prevCart[existingIndex].quantity > 1) {
        return prevCart.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter((cartItem, idx) => getCartItemKey(cartItem) !== itemKey);
    });
  }

  const deleteFromCart = (itemKey: string) => {
    setCart(prevCart => prevCart.filter(cartItem => getCartItemKey(cartItem) !== itemKey));
  }

  const cartTotal = cart.reduce((total, item) => {
    const base = parseFloat(item.price);
    const extras = (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0);
    return total + (base + extras) * item.quantity;
  }, 0);

  // Handle like/unlike toggle
  const handleLikeToggle = async () => {
    console.log('handleLikeToggle called with user:', user)
    
    if (!user) {
      console.log('No user found, opening login modal')
      setIsLoginModalOpen(true)
      return
    }

    if (!branch) {
      console.log('No branch data available')
      return
    }

    // Check if user has auth token
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      console.error('No auth token found, user needs to login again')
      setIsLoginModalOpen(true)
      return
    }

    const branchId = params.id
    const currentlyLiked = isLiked

    try {
      // Optimistically update UI
      setIsLiked(!currentlyLiked)

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
      setIsLiked(currentlyLiked)
      
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Restaurant Header Skeleton */}
          <div className="mb-6">
            <div className="relative h-[220px] sm:h-[320px] bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="text-center py-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="mt-3 flex justify-center">
                <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Categories Skeleton */}
          <div className="bg-white rounded-lg p-4 mb-6 block lg:hidden">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="flex overflow-x-auto whitespace-nowrap pb-2 gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded w-20 animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          </div>

          {/* Desktop Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Categories Sidebar Skeleton */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg p-4 h-fit sticky top-4 z-10 hidden lg:block">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Items Grid Skeleton */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col animate-pulse">
                      <div className="relative h-36 w-full bg-gray-200"></div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                          <div className="w-9 h-9 bg-gray-200 rounded-full ml-2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Restaurant</h2>
            <p className="text-gray-600">Please wait while we fetch the latest information...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentCategory = branch._menutable?.find((cat: { foodType: string }) => cat.foodType === selectedCategory)

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Restaurant Header and Details */}
        <div className="mb-6">
          <div className="relative h-[220px] sm:h-[320px]">
            <Image
              src={branch.restaurant?.[0]?.image_url || branch.restaurant?.[0]?.restaurantLogo?.url || '/placeholder-image.jpg'}
              alt={branch.restaurant?.[0]?.restaurantName || 'Restaurant'}
              fill
              sizes="100vw"
              priority
              className="object-cover rounded-2xl"
            />
            <button
              onClick={handleLikeToggle}
              className={`absolute top-3 right-3 z-10 rounded-full p-2 shadow-md transition-all duration-200 ${
                isLiked
                  ? 'bg-orange-100 text-orange-500 border border-orange-200 hover:bg-orange-200'
                  : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-100'
              }`}
              aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-6 h-6 transition-all duration-200 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="text-center py-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-1">
              {branch.restaurant?.[0]?.restaurantName || branch.branchName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="ml-1">4.4</span>
                <span className="ml-1">(500+)</span>
              </div>
              <span>•</span>
              <span>Delivery</span>
              <span>•</span>
              <span>{branch.branchCity}</span>
              <span>•</span>
              <span className={isRestaurantOpen ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {isRestaurantOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <button
                onClick={() => setIsDetailsModalOpen(true)}
                className="px-4 py-1 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium shadow-sm transition"
              >
                View Details
              </button>
              {!user ? (
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-1 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium shadow-sm transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsSignupModalOpen(true)}
                    className="px-4 py-1 rounded-full border border-orange-500 bg-orange-500 text-white hover:bg-orange-600 text-sm font-medium shadow-sm transition"
                  >
                    Sign Up
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
        {/* Mobile Menu Categories - below details, outside grid */}
        <div className="bg-white rounded-lg p-4 mb-6 block lg:hidden">
          <h2 className="font-semibold mb-4">Menu Categories</h2>
          <div className="flex overflow-x-auto whitespace-nowrap pb-2 gap-2">
            {branch._menutable?.map((category) => (
              <button 
                key={category.foodType}
                onClick={() => setSelectedCategory(category.foodType)}
                className={`px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex-shrink-0 ${
                  selectedCategory === category.foodType ? 'bg-gray-100' : ''
                }`}
              >
                {category.foodType}
              </button>
            ))}
          </div>
        </div>
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Menu Categories - Sidebar on lg */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-4 h-fit sticky top-4 z-10 hidden lg:block">
              <h2 className="font-semibold mb-4">Menu Categories</h2>
              <div className="block overflow-x-auto whitespace-nowrap lg:whitespace-normal pb-2 lg:pb-0 gap-2 lg:gap-0 lg:space-y-2">
                {branch._menutable?.map((category) => (
                  <button 
                    key={category.foodType}
                    onClick={() => setSelectedCategory(category.foodType)}
                    className={`px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex-shrink-0 lg:w-full text-left ${
                      selectedCategory === category.foodType ? 'bg-gray-100' : ''
                    }`}
                  >
                    {category.foodType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-9">
            {/* Menu Items */}
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h2 className="font-semibold mb-4 sm:mb-6">{selectedCategory}</h2>
              {!isRestaurantOpen && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  This restaurant is currently closed. Orders can only be placed during operating hours.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {currentCategory?.foods?.map((item, index) => {
                  const itemInCart = cart.find(cartItem => getCartItemKey(cartItem) === getCartItemKey({ id: item.name, name: item.name, price: item.price, quantity: 0 }));
                  const quantity = itemInCart?.quantity || 0;
                  
                  return (
                    <div key={`${item.name}-${index}`} className={`flex flex-col gap-4 p-4 border rounded-lg ${!item.available || !isRestaurantOpen ? 'opacity-50' : ''}`}>
                      <div className="relative w-full h-40 flex-shrink-0">
                        {item.image_url || item.foodImage ? (
                          <Image
                            src={item.image_url || item.foodImage?.url || '/placeholder-image.jpg'}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className={`object-cover rounded-lg ${!item.available ? 'grayscale' : ''}`}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-medium text-gray-900">GH₵ {item.price}</span>
                          <div className="flex items-center gap-2">
                            {item.available && isRestaurantOpen ? (
                              quantity > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="icon"
                                    className="bg-orange-500 hover:bg-orange-600 h-8 w-8 rounded-full text-white"
                                    onClick={() => removeFromCart(getCartItemKey({ id: item.name, name: item.name, price: item.price, quantity: 0 }))}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-5 text-center font-medium">{quantity}</span>
                                  <Button 
                                    size="icon"
                                    className="bg-orange-500 hover:bg-orange-600 h-8 w-8 rounded-full text-white"
                                    onClick={() => setSelectedItem({
                                      name: item.name,
                                      price: item.price,
                                      description: item.description,
                                      foodImage: item.foodImage,
                                      extras: item.extras
                                    })}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  size="icon"
                                  className="bg-orange-500 hover:bg-orange-600 h-8 w-8 rounded-full text-white"
                                  onClick={() => setSelectedItem({
                                    name: item.name,
                                    price: item.price,
                                    description: item.description,
                                    foodImage: item.foodImage,
                                    extras: item.extras
                                  })}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )
                            ) : (
                              <span className="text-sm text-gray-500">Not Available</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FloatingCart
        total={cartTotal}
        itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onClick={() => setIsCartModalOpen(true)}
        branchLocation={{
          latitude: branch.branchLatitude,
          longitude: branch.branchLongitude
        }}
        branchId={params.id}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        onAddItem={(itemId) => {
          // Find the cart item by key and increment its quantity
          const item = cart.find(i => getCartItemKey(i) === itemId)
          if (item) {
            addToCart({
              ...item,
              quantity: 1 // addToCart always increments by 1
            })
          }
        }}
        onRemoveItem={(itemId) => {
          // Remove or decrement item by key
          removeFromCart(itemId)
        }}
        onDeleteItem={(itemId) => {
          // Delete item by key
          deleteFromCart(itemId)
        }}
        cartTotal={cartTotal}
        branchId={params.id}
        branchName={branch.branchName || ''}
        menuCategories={branch._menutable?.map(category => ({
          foodType: category.foodType,
          foods: category.foods.map(food => ({
            id: food.name,
            name: food.name,
            price: food.price,
            quantity: 0,
            available: food.available,
            image: food.image_url || food.foodImage?.url
          }))
        })) || []}
        isAuthenticated={!!user}
        branchLocation={{
          latitude: parseFloat(branch.branchLatitude),
          longitude: parseFloat(branch.branchLongitude)
        }}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLoginSuccess={(userData) => {
          setUser(userData)
          setIsCartModalOpen(false)
        }}
        storeType="restaurant"
        // Pre-calculated delivery fees from branch page
        preCalculatedFees={{
          riderFee,
          pedestrianFee,
          platformFee,
          distance,
          isLoadingDelivery
        }}
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
        onSignupSuccess={(userData) => {
          setUser(userData)
          setIsSignupModalOpen(false)
        }}
      />

      {branch && (
        <BranchDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          branch={{
            branchName: branch.branchName,
            branchLocation: branch.branchLocation,
            branchPhoneNumber: branch.branchPhoneNumber,
            branchCity: branch.branchCity,
            openTime: branch.openTime,
            closeTime: branch.closeTime,
            activeHours: branch.activeHours,
            branchLatitude: branch.branchLatitude,
            branchLongitude: branch.branchLongitude,
            _restaurantTable: branch.restaurant
          }}
        />
      )}

      {selectedItem && (
        <ItemDetailsModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
          onAddToCart={addToCart}
        />
      )}
    </div>
  )
} 