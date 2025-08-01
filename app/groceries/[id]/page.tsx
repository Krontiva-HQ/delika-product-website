"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ProductSkeleton } from "@/components/product-skeleton";
import { CategorySkeleton } from "@/components/category-skeleton";
import { MobileCategories } from "@/components/mobile-categories";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { FloatingCart } from "@/components/floating-cart";
import { CartModal } from "@/components/cart-modal";
import { LoginModal } from "@/components/login-modal";
import { SignupModal } from "@/components/signup-modal";
import { AuthNav } from "@/components/auth-nav";
import { SearchField } from "@/components/search-field";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ChevronLeft, MapPin, Phone, Clock } from "lucide-react";

interface InventoryItem {
  id: string;
  productName: string;
  price: string;
  category?: string;
  subCategory?: string;
  description?: string;
  stockQuantity?: number;
  image: string | null;
  image_url?: string; // New field for direct image URL
  groceryShopId?: string | null;
  groceryShopBranchId?: string | null;
  available?: boolean;
  created_at?: number;
  updatedAt?: number;
}

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  onAddToCart: (item: InventoryItem, quantity: number) => void;
}

function ItemDetailsModal({ isOpen, onClose, item, onAddToCart }: ItemDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);

  console.log('Grocery ItemDetailsModal rendered with:', { isOpen, item: item?.productName });

  const handleAddToCart = () => {
    console.log('Adding to cart:', item.productName, 'quantity:', quantity);
    onAddToCart(item, quantity);
    onClose();
    setQuantity(1); // Reset quantity
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Item Details</DialogTitle>
        {/* Item Image */}
        <div className="relative w-full h-48 sm:h-56 md:h-64">
          {typeof item.image === 'object' && item.image && 'url' in item.image ? (
            <Image
              src={(item.image as { url: string }).url}
              alt={item.productName}
              fill
              className="object-cover w-full h-full"
            />
          ) : typeof item.image === 'string' && item.image ? (
            <Image
              src={item.image}
              alt={item.productName}
              fill
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
              No Image
            </div>
          )}
        </div>
        
        <div className="p-6">
          {/* Item Info */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">{item.productName}</h2>
            <div className="text-2xl font-bold text-gray-900 mb-1">GH₵{parseFloat(item.price).toFixed(2)}</div>
            {item.description && <div className="text-gray-500 text-sm mb-2">{item.description}</div>}
            {item.category && <div className="text-gray-400 text-xs mb-2">Category: {item.category}</div>}
          </div>

          {/* Quantity and Add Button */}
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => setQuantity(q => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-semibold text-base"
              onClick={handleAddToCart}
            >
              Add
              <span className="ml-2">GH₵{(parseFloat(item.price) * quantity).toFixed(2)}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function GroceryDetailsPage() {
  const params = useParams();
  const shopId = params?.id as string; // This is now the slug
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 24;
  const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);
  const paginatedInventory = inventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Group inventory by category
  const categories = Array.from(new Set(inventory.map(item => item.category || "Uncategorized")));
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");
  
  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory && !isLoading) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory, isLoading]);
  
  const filteredInventory = searchQuery
    ? inventory.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (
          item.productName.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.category?.toLowerCase().includes(searchLower)
        );
      })
    : inventory.filter(item => (item.category || "Uncategorized") === selectedCategory);

  // Get shop info from API response
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [shopAddress, setShopAddress] = useState<string | null>(null);
  const [shopCoordinates, setShopCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [activeHours, setActiveHours] = useState<Array<{
    day: string;
    openingTime: string;
    closingTime: string;
    isActive?: boolean;
  }> | null>(null);

  // Delivery calculation state
  const [riderFee, setRiderFee] = useState(0);
  const [pedestrianFee, setPedestrianFee] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [distance, setDistance] = useState(0);

  // Helper function to convert values to numbers
  const toNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    const parsed = parseFloat(value?.toString());
    return isNaN(parsed) ? 0 : parsed;
  };

  // Function to load delivery fees from localStorage
  const loadDeliveryFeesFromStorage = () => {
    try {
      const deliveryDataKey = `deliveryCalculationData_grocery_${params?.id}`;
      const deliveryData = localStorage.getItem(deliveryDataKey);
      if (deliveryData) {
        const parsed = JSON.parse(deliveryData);
        console.log('[GroceryPage] Loading delivery fees from localStorage with key:', deliveryDataKey, parsed);
        console.log('[GroceryPage] Current grocery params:', { id: params?.id });
        
        // Check if cached data is for this grocery (by ID or slug)
        const isForThisGrocery = parsed.branchId === params?.id || 
                                 parsed.branchSlug === params?.id;
        
        // Also check if the vendor type matches
        const isCorrectVendorType = !parsed.vendorType || parsed.vendorType === 'grocery';
        
        if (isForThisGrocery && isCorrectVendorType) {
          setRiderFee(toNumber(parsed.riderFee));
          setPedestrianFee(toNumber(parsed.pedestrianFee));
          setPlatformFee(toNumber(parsed.platformFee));
          setDistance(toNumber(parsed.distance));
          console.log('[GroceryPage] ✅ Loaded delivery fees from localStorage for grocery:', params?.id);
        } else {
          console.log('[GroceryPage] Cached delivery data is for different grocery or vendor type, clearing');
          console.log('[GroceryPage] Cached branchId:', parsed.branchId, 'vs current params.id:', params?.id);
          console.log('[GroceryPage] Cached branchSlug:', parsed.branchSlug, 'vs current params.id:', params?.id);
          console.log('[GroceryPage] Cached vendorType:', parsed.vendorType, 'vs expected: grocery');
          setRiderFee(0);
          setPedestrianFee(0);
          setPlatformFee(0);
          setDistance(0);
        }
      } else {
        console.log('[GroceryPage] No delivery calculation data found in localStorage for key:', deliveryDataKey);
        setRiderFee(0);
        setPedestrianFee(0);
        setPlatformFee(0);
        setDistance(0);
      }
    } catch (error) {
      console.error('[GroceryPage] Error loading delivery fees from localStorage:', error);
      setRiderFee(0);
      setPedestrianFee(0);
      setPlatformFee(0);
      setDistance(0);
    }
  };
  
  useEffect(() => {
    async function fetchInventory() {
      try {
        setIsLoading(true);
        // Use the new slug-based API endpoint
        const apiUrl = `https://api-server.krontiva.africa/api:uEBBwbSs/groceries/${shopId}`;
        console.log("Fetching grocery inventory from:", apiUrl);
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch grocery data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Grocery API response:", data);
        
        // Extract shop information from the new API structure
        if (data.slug) {
          setShopName(data.slug.grocerybranchName || "Grocery Shop");
          setShopCoordinates({
            lat: parseFloat(data.slug.grocerybranchLatitude) || 0,
            lng: parseFloat(data.slug.grocerybranchLongitude) || 0
          });
        }
        
        // Extract active hours if available
        if (data.slug?.activeHours) {
          console.log('Grocery active hours:', data.slug.activeHours);
          setActiveHours(data.slug.activeHours);
        }
        
        // Extract grocery shop details from Groceries_Shops array
        if (data.Groceries_Shops && Array.isArray(data.Groceries_Shops) && data.Groceries_Shops.length > 0) {
          const groceryShop = data.Groceries_Shops[0];
          setShopName(groceryShop.groceryshopName || data.slug?.grocerybranchName || "Grocery Shop");
          setShopAddress(groceryShop.groceryshopAddress || "");
          
          // Store grocery IDs in localStorage for order submission
          if (groceryShop.id) {
            localStorage.setItem('selectedGroceryShopId', groceryShop.id);
            console.log('🛒 Stored selectedGroceryShopId:', groceryShop.id);
          }
          if (data.slug?.id) {
            localStorage.setItem('selectedGroceryBranchId', data.slug.id);
            console.log('🛒 Stored selectedGroceryBranchId:', data.slug.id);
          }
          
          // Extract logo from image_url first, then fallback to groceryshopLogo
          if (groceryShop.image_url) {
            setShopLogo(groceryShop.image_url);
          } else if (groceryShop.groceryshopLogo && groceryShop.groceryshopLogo.url) {
            setShopLogo(groceryShop.groceryshopLogo.url);
          } else {
            setShopLogo("/fallback/grocery.jpg");
          }
        } else {
          // Fallback to slug data
          setShopName(data.slug?.grocerybranchName || "Grocery Shop");
          setShopAddress(data.slug?.grocerybranchLocation || "");
          setShopLogo("/fallback/grocery.jpg");
          
          // Store fallback IDs if available
          if (data.slug?.id) {
            localStorage.setItem('selectedGroceryBranchId', data.slug.id);
            console.log('🛒 Stored selectedGroceryBranchId (fallback):', data.slug.id);
          }
        }
        
        const normalize = (item: any) => ({
          ...item,
          // Map the new API structure to our interface
          id: item.id,
          productName: item.productName,
          price: item.price?.toString() || "0",
          category: item.category,
          subCategory: item.subCategory,
          description: item.description,
          stockQuantity: item.stockQuantity,
          available: typeof item.available === "boolean" ? item.available : true,
          // Handle image: use image_url first, then fallback to image object or string
          image: item.image_url || item.image?.url || item.image || null,
          // Map grocery IDs
          groceryShopId: item.groceryShopId || null,
          groceryShopBranchId: item.groceryShopBranchId || null,
        });
        
        if (Array.isArray(data.ShopsInventory)) {
          const sorted = data.ShopsInventory.map(normalize).sort((a: any, b: any) => {
            if (!a.productName) return -1;
            if (!b.productName) return 1;
            return a.productName.localeCompare(b.productName);
          });
          setInventory(sorted);
        } else if (data.ShopsInventory && typeof data.ShopsInventory === 'object') {
          setInventory([normalize(data.ShopsInventory)]);
        } else {
          setInventory([]);
        }
      } catch (error) {
        console.error("Error fetching grocery inventory:", error);
        setInventory([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (shopId) fetchInventory();
  }, [shopId]);

  // Load delivery fees from localStorage after grocery data is loaded
  useEffect(() => {
    if (!isLoading) {
      console.log('[GroceryPage] Grocery data loaded, loading delivery fees from localStorage');
      loadDeliveryFeesFromStorage();
    }
  }, [isLoading]);

  const [cart, setCart] = useState<any[]>([]);

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

  useEffect(() => {
    console.log('Grocery cart state:', cart, 'Item count:', cart.length);
  }, [cart]);

  // Helper to add item to cart, always saving name, price, and image
  const handleAddToCart = (item: any, quantity: number = 1) => {
    if (!item.productName || !item.price) return;
    const image =
      item.image_url || // Use image_url first
      (typeof item.image === "object" && item.image && "url" in item.image
        ? item.image.url
        : typeof item.image === "string"
        ? item.image
        : (item.foodImage && item.foodImage.url) || null);
    setCart(prev => {
      const updated = [
        ...prev,
        {
          ...item,
          name: item.productName,
          price: item.price,
          image,
          quantity: quantity,
          available: typeof item.available === "boolean" ? item.available : true
        }
      ];
      localStorage.setItem('groceryCart', JSON.stringify(updated));
      return updated;
    });
  };

  // Handler to delete item from cart by id
  const handleDeleteItem = (itemId: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      localStorage.setItem('groceryCart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddItem = (itemId: string) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
      localStorage.setItem('groceryCart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(prev => {
      const updated = prev
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
            : item
        )
        .filter(item => item.quantity > 0);
      localStorage.setItem('groceryCart', JSON.stringify(updated));
      return updated;
    });
  };

  // Optionally, get a banner image (use logo as fallback)
  const bannerImage = shopLogo;
  // Modal state for View Details
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {}
      } else {
        setUser(null);
      }
    };

    // Initial check
    checkAuth();

    // Listen for auth state changes
    window.addEventListener('userDataUpdated', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('userDataUpdated', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Auth navigation handlers
  const userData = user;
  const handleViewChange = (view: 'stores' | 'orders' | 'favorites' | 'profile' | 'settings') => {
    switch (view) {
      case 'orders':
        window.location.href = '/orders';
        break;
      case 'favorites':
        window.location.href = '/favorites';
        break;
      case 'settings':
        window.location.href = '/settings';
        break;
      case 'stores':
        window.location.href = '/vendors';
        break;
      default:
        break;
    }
  };
  const handleLoginClick = () => setIsLoginModalOpen(true);
  const handleSignupClick = () => setIsSignupModalOpen(true);
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };
  const handleHomeClick = () => window.location.href = "/vendors";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AuthNav
        userData={userData}
        onViewChange={handleViewChange}
        currentView={"stores"}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onLogout={handleLogout}
        onHomeClick={handleHomeClick}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Back to Vendors button */}
        <button
          onClick={handleHomeClick}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Vendors
        </button>
        
        {/* Header section styled like branch-page */}
        <div className="mb-8">
          <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden shadow-lg bg-white border mx-auto">
            {isLoading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse" />
            ) : bannerImage ? (
              <img src={bannerImage} alt={shopName || "Grocery Shop"} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg">
                No Image Available
              </div>
            )}
          </div>
          <div className="text-center py-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-1">{shopName || "Grocery Shop"}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600 mb-2">
              {shopAddress && <span>{shopAddress}</span>}
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
        {/* Placeholder for View Details modal */}
        {isDetailsModalOpen && (
          <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 max-h-[80vh] overflow-y-auto">
              <DialogTitle className="text-2xl font-bold mb-6 px-6 pt-6">
                {shopName || 'Shop Details'}
              </DialogTitle>
              
              <div className="space-y-4 px-6 pb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="w-full">
                    <h4 className="font-medium text-gray-900">Location</h4>
                    {shopCoordinates ? (
                      <div className="mt-2 -mx-6">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${shopCoordinates.lat},${shopCoordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden w-full"
                          title="Open in Google Maps"
                        >
                          <iframe
                            src={`https://www.google.com/maps?q=${shopCoordinates.lat},${shopCoordinates.lng}&z=16&output=embed`}
                            className="w-full"
                            height="220"
                            style={{ border: 0, width: '100%', borderRadius: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Shop Location Map"
                          />
                        </a>
                        <p className="text-xs text-gray-500 mt-1 px-6">
                          Click the map to open a larger view
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600">{shopAddress || 'Location not available'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600">Phone not available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Hours</h4>
                    {activeHours && activeHours.length > 0 ? (
                      <div className="space-y-1">
                        {activeHours.map((hours) => (
                          <div key={hours.day} className="flex justify-between text-sm">
                            <span className={`${hours.isActive !== false ? 'text-gray-900' : 'text-gray-400'}`}>
                              {hours.day}:
                            </span>
                            <span className={`${hours.isActive !== false ? 'text-gray-600' : 'text-gray-400'}`}>
                              {hours.isActive !== false ? `${hours.openingTime} - ${hours.closingTime}` : 'Closed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Hours not available</p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <hr className="my-6 border-gray-200" />
        
        {/* Search Field */}
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search grocery items..."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Categories Sidebar (desktop) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-4 h-fit sticky top-4 z-10 hidden lg:block">
              <h2 className="font-semibold mb-4">Categories</h2>
              <div className="block overflow-x-auto whitespace-nowrap lg:whitespace-normal pb-2 lg:pb-0 gap-2 lg:gap-0 lg:space-y-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <CategorySkeleton key={index} />
                  ))
                ) : categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex-shrink-0 lg:w-full text-left ${selectedCategory === category ? 'bg-gray-100' : ''}`}
                    data-category={category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Categories Horizontal (mobile) */}
          <MobileCategories
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isLoading={isLoading}
          />
          {/* Items Grid */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold mb-4 sm:mb-6">{selectedCategory}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {isLoading ? (
                  Array.from({ length: 12 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))
                ) : filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left flex flex-col cursor-pointer ${item.available === false ? "opacity-50 grayscale pointer-events-none" : ""}`}
                    onClick={() => {
                      if (item.available !== false) {
                        console.log('Grocery item card clicked:', item.productName);
                        setSelectedItem(item);
                        console.log('Selected item set to:', item);
                      }
                    }}
                  >
                    <div className="relative h-36 w-full">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : typeof item.image === 'object' && item.image && 'url' in item.image ? (
                        <Image
                          src={(item.image as { url: string }).url}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : typeof item.image === 'string' && item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-base truncate mb-1">{item.productName || "No Name"}</h3>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-base font-semibold text-gray-800 truncate">GH₵ {item.price || "No Price"}</span>
                        {!item.available && (
                          <span className="ml-2 text-xs text-gray-400 font-semibold">Not Available</span>
                        )}
                        {item.available && (
                          <button
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-9 h-9 flex items-center justify-center ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Grocery item clicked:', item.productName);
                              setSelectedItem(item);
                              console.log('Selected item set to:', item);
                            }}
                          >
                            <span className="text-xl font-bold">+</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setCurrentPage(p => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {/* Floating Cart */}
      <FloatingCart
        total={cart.reduce((total, item) => {
          const basePrice = (parseFloat(item.price) || 0) * (item.quantity || 1);
          const extrasTotal = (item.selectedExtras?.reduce((sum: number, extra: any) => 
            sum + (parseFloat(extra.price) || 0) * (extra.quantity || 1), 0) || 0);
          return total + basePrice + extrasTotal;
        }, 0)}
        itemCount={cart.length}
        onClick={() => setIsCartModalOpen(true)}
        branchLocation={{ 
          latitude: shopCoordinates?.lat.toString() || "0", 
          longitude: shopCoordinates?.lng.toString() || "0" 
        }}
        branchId={shopName || "grocery"}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart.map(item => ({
          ...item,
          name: item.productName,
          price: item.price,
          image:
            typeof item.image === "object" && item.image && "url" in item.image
              ? item.image.url
              : typeof item.image === "string"
              ? item.image
              : (item.foodImage && item.foodImage.url) || null
        }))}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onDeleteItem={handleDeleteItem}
        cartTotal={cart.reduce((total, item) => {
          const basePrice = (parseFloat(item.price) || 0) * (item.quantity || 1);
          const extrasTotal = (item.selectedExtras?.reduce((sum: number, extra: any) => 
            sum + (parseFloat(extra.price) || 0) * (extra.quantity || 1), 0) || 0);
          return total + basePrice + extrasTotal;
        }, 0)}
        branchId={shopName || "grocery"}
        branchName={shopName || "Grocery Shop"}
        menuCategories={[]}
        isAuthenticated={!!user}
        branchLocation={shopCoordinates ? { 
          latitude: shopCoordinates.lat, 
          longitude: shopCoordinates.lng 
        } : undefined}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLoginSuccess={(userData) => {
          setUser(userData);
          setIsCartModalOpen(false);
        }}
        storeType="grocery"
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
        onLoginSuccess={(userData) => {
          setUser(userData);
          setIsLoginModalOpen(false);
        }}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onSignupSuccess={(userData) => {
          setUser(userData);
          setIsSignupModalOpen(false);
        }}
      />

      {/* Item Details Modal */}
      {selectedItem && (
        <ItemDetailsModal
          isOpen={!!selectedItem}
          onClose={() => {
            console.log('Grocery modal closing');
            setSelectedItem(null);
          }}
          item={selectedItem}
          onAddToCart={handleAddToCart}
        />
      )}
      
      {/* Debug: Show selected item state */}
      {process.env.NODE_ENV === 'development' && selectedItem && (
        <div className="fixed top-4 left-4 bg-green-500 text-white p-2 rounded z-50 text-xs">
          Selected: {selectedItem.productName}
        </div>
      )}
      </div>
    </div>
  );
} 