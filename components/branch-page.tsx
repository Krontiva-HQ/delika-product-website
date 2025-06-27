"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star, MapPin, Clock, Plus, Minus, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BranchDetailsModal } from "@/components/branch-details-modal"
import { EmptyState } from "@/components/empty-state"
import { FloatingCart } from "@/components/floating-cart"
import { CartModal } from "@/components/cart-modal"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BranchDetails {
  _menutable?: Array<{
    foodType: string
    foods: Array<{
      name: string
      price: string
      available: boolean
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

interface BranchPageProps {
  params: {
    id: string
  }
}

interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
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

const isRestaurantOpen = (activeHours?: Array<{day: string, openingTime: string, closingTime: string, isActive?: boolean}>): boolean => {
  if (!activeHours || activeHours.length === 0) {
    console.log('No activeHours data available');
    return false;
  }

  console.log('ActiveHours data:', activeHours);

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[currentDay];

  console.log('Current day:', currentDayName, 'Day index:', currentDay);

  // Find today's hours - try multiple matching strategies
  let todayHours = activeHours.find(hour => 
    hour.day.toLowerCase() === currentDayName.toLowerCase()
  );

  // If not found, try matching just the first 3 characters (Mon, Tue, etc.)
  if (!todayHours) {
    todayHours = activeHours.find(hour => 
      hour.day.toLowerCase().substring(0, 3) === currentDayName.toLowerCase().substring(0, 3)
    );
  }

  console.log('Found today hours:', todayHours);

  if (!todayHours) {
    console.log('No hours found for today');
    return false;
  }

  // Check if isActive field exists and is false
  if (todayHours.hasOwnProperty('isActive') && !todayHours.isActive) {
    console.log('Restaurant is not active today (isActive: false)');
    return false;
  }

  // Get current time in minutes
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  console.log('Current time:', `${currentHour}:${currentMinute}`, 'Minutes:', currentTimeInMinutes);

  const openTimeInMinutes = parseTimeToMinutes(todayHours.openingTime);
  const closeTimeInMinutes = parseTimeToMinutes(todayHours.closingTime);
  
  console.log('Opening time:', todayHours.openingTime, 'Minutes:', openTimeInMinutes);
  console.log('Closing time:', todayHours.closingTime, 'Minutes:', closeTimeInMinutes);
  
  if (openTimeInMinutes === null || closeTimeInMinutes === null) {
    console.log('Failed to parse opening/closing times');
    return false;
  }

  // Handle cases where closing time is next day (e.g., open until 2 AM)
  if (closeTimeInMinutes < openTimeInMinutes) {
    const isOpen = currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes <= closeTimeInMinutes;
    console.log('Cross-midnight hours - Is open:', isOpen);
    return isOpen;
  }

  const isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
  console.log('Regular hours - Is open:', isOpen);
  return isOpen;
};

function ItemDetailsModal({ isOpen, onClose, item, onAddToCart }: ItemDetailsModalProps) {
  const [extrasQuantities, setExtrasQuantities] = useState<Record<string, number>>({})
  const [quantity, setQuantity] = useState(1)

  // Group extras by extrasTitle
  const groupedExtras: Record<string, Array<any>> = {};
  if (item.extras) {
    item.extras.forEach(extra => {
      if (!groupedExtras[extra.extrasTitle]) {
        groupedExtras[extra.extrasTitle] = [];
      }
      groupedExtras[extra.extrasTitle].push(...extra.inventoryDetails);
    });
  }

  const handleAddToCart = () => {
    // Build selectedExtras array with quantity > 0
    const selectedExtras = Object.entries(extrasQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        // Find the extra detail by id
        let found: any = undefined;
        (Object.values(groupedExtras) as any[][]).forEach((details: any[]) => {
          const match = details.find((d: any) => d.id === id);
          if (match) found = match;
        });
        return found ? {
          id: found.id,
          name: found.foodName,
          price: found.foodPrice,
          quantity: qty
        } : undefined;
      })
      .filter((e): e is { id: string; name: string; price: string; quantity: number } => !!e);

    console.log('Adding item to cart with extras:', {
      item: {
        id: item.name,
        name: item.name,
        price: item.price,
        quantity: quantity,
        image: item.foodImage?.url,
        selectedExtras: selectedExtras
      },
      selectedExtras
    });

    onAddToCart({
      id: item.name,
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.foodImage?.url,
      available: true,
      selectedExtras: selectedExtras
    })
    onClose()
  }

  // Calculate total price
  const extrasTotal = Object.entries(extrasQuantities).reduce((sum, [id, qty]) => {
    let price = 0;
    Object.values(groupedExtras).forEach(details => {
      const match = details.find((d: any) => d.id === id);
      if (match) price = parseFloat(match.foodPrice) * qty;
    });
    return sum + price;
  }, 0);
  const totalPrice = (parseFloat(item.price) + extrasTotal) * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Item Image */}
        {item.foodImage && (
          <div className="relative w-full h-48 sm:h-56 md:h-64">
            <Image
              src={item.foodImage.url}
              alt={item.name}
              fill
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

          <div className="max-h-72 pr-2 mb-4 overflow-y-auto">
            {/* Grouped Extras Section */}
            {Object.keys(groupedExtras).length > 0 && (
              <div className="mb-4">
                {Object.entries(groupedExtras).map(([title, details], groupIdx) => (
                  <div key={title} className="mb-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
                    <div className="divide-y divide-gray-100">
                      {details.map((detail: any) => (
                        <div key={detail.id} className="flex items-center py-2 gap-3">
                          {detail.foodImage && (
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <Image
                                src={detail.foodImage.url}
                                alt={detail.foodName}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-900">{detail.foodName}</span>
                              <span className="ml-2 text-gray-500 text-sm">+GH₵{parseFloat(detail.foodPrice).toFixed(2)}</span>
                            </div>
                            {detail.foodDescription && (
                              <p className="text-xs text-gray-500 mt-1">{detail.foodDescription}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={() => setExtrasQuantities(q => ({ ...q, [detail.id]: Math.max(0, (q[detail.id] || 0) - 1) }))}>-</Button>
                            <span className="w-6 text-center">{extrasQuantities[detail.id] || 0}</span>
                            <Button size="icon" variant="outline" onClick={() => setExtrasQuantities(q => ({ ...q, [detail.id]: (q[detail.id] || 0) + 1 }))}>+</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            >
              Add
              <span className="ml-2">GH₵{totalPrice.toFixed(2)}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function BranchPage({ params }: BranchPageProps) {
  const [branch, setBranch] = useState<BranchDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<(CartItem & { available: boolean })[]>([])
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [isOpen, setIsOpen] = useState(false)
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

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('userData')
      if (userData) {
        setUser(JSON.parse(userData))
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
        setError("Failed to load branch details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranch()
  }, [params.id])

  // Add this effect to check restaurant status
  useEffect(() => {
    if (branch) {
      setIsOpen(isRestaurantOpen(branch.activeHours));
    }
  }, [branch]);

  const addToCart = (item: CartItem & { available: boolean }) => {
    console.log('addToCart called with item:', item);
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        console.log('Updating existing item in cart:', {
          before: existingItem,
          after: { ...existingItem, quantity: existingItem.quantity + 1, selectedExtras: item.selectedExtras }
        });
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1, selectedExtras: item.selectedExtras }
            : cartItem
        )
      }
      console.log('Adding new item to cart:', item);
      return [...prevCart, { ...item, quantity: 1, available: item.available }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prevCart.filter(item => item.id !== itemId)
    })
  }

  const cartTotal = cart.reduce((total, item) => {
    const itemTotal = parseFloat(item.price) * item.quantity;
    const extrasTotal = item.selectedExtras?.reduce((extrasSum, extra) => {
      return extrasSum + (parseFloat(extra.price) * extra.quantity);
    }, 0) || 0;
    return total + itemTotal + extrasTotal;
  }, 0)

  const deleteFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !branch) {
    return <EmptyState title={error || "Branch not found"} description="We couldn't find the branch you're looking for." icon="store" />
  }

  const currentCategory = branch._menutable?.find((cat: { foodType: string }) => cat.foodType === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Menu Categories - Left Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-lg p-4 h-fit sticky top-4 z-10">
            <h2 className="font-semibold mb-4">Menu Categories</h2>
            <div className="flex lg:block overflow-x-auto whitespace-nowrap lg:whitespace-normal pb-2 lg:pb-0 gap-2 lg:gap-0 lg:space-y-2">
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

          {/* Main Content Column */}
          <div className="lg:col-span-9">
            {/* Restaurant Header */}
            <div className="bg-white rounded-xl overflow-hidden mb-6">
              <div className="relative h-[150px] sm:h-[200px]">
                <Image
                  src={branch.restaurant?.[0]?.restaurantLogo?.url || '/placeholder-image.jpg'}
                  alt={branch.restaurant?.[0]?.restaurantName || 'Restaurant'}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-lg sm:text-xl font-bold text-white mb-2">{branch.branchName}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-white">
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
            </div>

            {/* Restaurant Quick Info */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{branch.branchLocation}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {(() => {
                        if (!branch.activeHours || branch.activeHours.length === 0) {
                          return 'Hours not available';
                        }
                        
                        const now = new Date();
                        const currentDay = now.getDay();
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const currentDayName = dayNames[currentDay];
                        
                        const todayHours = branch.activeHours.find(hour => 
                          hour.day.toLowerCase() === currentDayName.toLowerCase()
                        );
                        
                        if (todayHours) {
                          return `Today: ${todayHours.openingTime} - ${todayHours.closingTime}`;
                        } else {
                          return 'Closed today';
                        }
                      })()}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    <span>{isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <button 
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => {
                      // Create a slugified name combining restaurant and branch names
                      const restaurantName = branch.restaurant?.[0]?.restaurantName || '';
                      const branchName = branch.branchName || '';
                      
                      const combinedName = `${restaurantName}-${branchName}`;
                      const slug = combinedName
                        .toString()
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-]+/g, '')
                        .replace(/\-\-+/g, '-')
                        .replace(/^-+/, '')
                        .replace(/-+$/, '');
                        
                      const url = `${window.location.origin}/restaurant/${slug}`;
                      navigator.clipboard.writeText(url);
                      // Show temporary feedback
                      const feedbackElem = document.createElement('div');
                      feedbackElem.textContent = 'Link copied!';
                      feedbackElem.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-md z-50';
                      document.body.appendChild(feedbackElem);
                      setTimeout(() => document.body.removeChild(feedbackElem), 2000);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h2 className="font-semibold mb-4 sm:mb-6">{selectedCategory}</h2>
              {!isOpen && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  This restaurant is currently closed. Orders can only be placed during operating hours.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {currentCategory?.foods?.map((item, index) => {
                  const itemInCart = cart.find(cartItem => cartItem.id === item.name);
                  const quantity = itemInCart?.quantity || 0;
                  
                  return (
                    <div key={`${item.name}-${index}`} className={`flex flex-col gap-4 p-4 border rounded-lg ${!item.available || !isOpen ? 'opacity-50' : ''}`}>
                      <div className="relative w-full h-40 flex-shrink-0">
                        {item.foodImage && (
                          <Image
                            src={item.foodImage.url}
                            alt={item.name}
                            fill
                            className={`object-cover rounded-lg ${!item.available ? 'grayscale' : ''}`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-medium text-gray-900">GH₵ {item.price}</span>
                          <div className="flex items-center gap-2">
                            {item.available && isOpen ? (
                              quantity > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="icon"
                                    className="bg-orange-500 hover:bg-orange-600 h-8 w-8 rounded-full text-white"
                                    onClick={() => removeFromCart(item.name)}
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
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        onAddItem={(itemId) => {
          console.log('CartModal onAddItem called with itemId:', itemId);
          const item = cart.find(i => i.id === itemId)
          if (item) {
            console.log('Found item to add:', item);
            addToCart({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: 1,
              image: item.image,
              available: item.available,
              selectedExtras: item.selectedExtras
            })
          }
        }}
        onRemoveItem={removeFromCart}
        onDeleteItem={deleteFromCart}
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
            image: food.foodImage?.url
          }))
        })) || []}
        isAuthenticated={!!user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        branchLocation={{
          latitude: parseFloat(branch.branchLatitude),
          longitude: parseFloat(branch.branchLongitude)
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