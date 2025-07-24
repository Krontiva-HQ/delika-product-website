"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";
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

interface InventoryItem {
  id: string;
  productName: string;
  price: string;
  category?: string;
  subCategory?: string;
  description?: string;
  stockQuantity?: number;
  image: string | null;
  groceryShopId?: string | null;
  groceryShopBranchId?: string | null;
  available?: boolean;
  _delika_groceries_shops_table?: {
    groceryshopAddress?: string;
  };
}

export default function GroceryDetailsPage() {
  const params = useParams();
  const shopId = params?.id as string;
  // Use localStorage values if available, fallback to URL param
  const groceryShopIdParam = typeof window !== "undefined"
    ? localStorage.getItem("selectedGroceryShopId") || shopId || null
    : shopId || null;
  const groceryBranchId = typeof window !== "undefined"
    ? localStorage.getItem("selectedGroceryBranchId") || null
    : null;
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;
  const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);
  const paginatedInventory = inventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Group inventory by category
  const categories = Array.from(new Set(inventory.map(item => item.category || "Uncategorized")));
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");
  useEffect(() => {
    if (categories.length && !selectedCategory) setSelectedCategory(categories[0]);
  }, [categories]);
  const filteredInventory = inventory.filter(item => (item.category || "Uncategorized") === selectedCategory);

  // Get shop info from localStorage (set when user clicks a grocery branch)
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [shopCoordinates, setShopCoordinates] = useState<{lat: number, lng: number} | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shopData = localStorage.getItem("selectedGroceryShopData");
      if (shopData) {
        try {
          const parsed = JSON.parse(shopData);
          setShopLogo(parsed.groceryshopLogo?.url || null);
          setShopName(parsed.groceryshopName || null);
        } catch {}
      }
      
      // Get shop coordinates from the selected branch
      const branchData = localStorage.getItem("selectedGroceryBranchData");
      if (branchData) {
        try {
          const parsed = JSON.parse(branchData);
          console.log('[Grocery Coordinates] Branch data loaded:', parsed);
          const lat = parseFloat(parsed.grocerybranchLatitude);
          const lng = parseFloat(parsed.grocerybranchLongitude);
          console.log('[Grocery Coordinates] Parsed coordinates:', { lat, lng });
          if (!isNaN(lat) && !isNaN(lng)) {
            setShopCoordinates({ lat, lng });
            console.log('[Grocery Coordinates] Shop coordinates set:', { lat, lng });
          } else {
            console.log('[Grocery Coordinates] Invalid coordinates - NaN values');
          }
        } catch (error) {
          console.log('[Grocery Coordinates] Error parsing branch data:', error);
        }
      } else {
        console.log('[Grocery Coordinates] No branch data found in localStorage');
      }
    }
  }, []);

  useEffect(() => {
    async function fetchInventory() {
      try {
        setIsLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_GROCERIES_SHOPS_INVENTORY_API;
        if (!baseUrl) throw new Error("NEXT_PUBLIC_GROCERIES_SHOPS_INVENTORY_API is not defined");
        const apiUrl = `${baseUrl}?groceryShopId=${groceryShopIdParam}&groceryBranchId=${groceryBranchId}`;
        // Log the endpoint
        console.log("Fetching inventory from:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        const normalize = (item: any) => ({
          ...item,
          groceryShopId: item.groceryShopId ?? groceryShopIdParam ?? null,
          groceryShopBranchId: item.groceryShopBranchId ?? groceryBranchId ?? null,
          available: typeof item.available === "boolean" ? item.available : true,
        });
        if (Array.isArray(data)) {
          const sorted = data.map(normalize).sort((a, b) => {
            if (!a.productName) return -1;
            if (!b.productName) return 1;
            return a.productName.localeCompare(b.productName);
          });
          setInventory(sorted);
        } else if (data && typeof data === 'object') {
          setInventory([normalize(data)]);
        } else {
          setInventory([]);
        }
      } catch (error) {
        setInventory([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (shopId) fetchInventory();
  }, [shopId]);

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
  // Optionally, get address/location if available
  const shopAddress = inventory[0]?._delika_groceries_shops_table?.groceryshopAddress || "";
  // Modal state for View Details
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header section styled like branch-page */}
        <div className="mb-8">
          <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden shadow-lg bg-white border mx-auto">
            {bannerImage ? (
              <img src={bannerImage} alt={shopName || "Grocery Shop"} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">No Image</div>
            )}
            {/* Optionally, add a like button at top-right */}
          </div>
          <div className="text-center py-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-1">{shopName || "Grocery Shop"}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600 mb-2">
              {shopAddress && <span>{shopAddress}</span>}
            </div>
            <button
              onClick={() => setIsDetailsModalOpen(true)}
              className="px-4 py-1 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium shadow-sm transition"
            >
              View Details
            </button>
          </div>
        </div>
        {/* Placeholder for View Details modal */}
        {isDetailsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
              <h2 className="text-xl font-bold mb-4">Shop Details</h2>
              <p>Name: {shopName}</p>
              <p>Address: {shopAddress}</p>
              <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded" onClick={() => setIsDetailsModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
        <hr className="my-6 border-gray-200" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Categories Sidebar (desktop) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-4 h-fit sticky top-4 z-10 hidden lg:block">
              <h2 className="font-semibold mb-4">Categories</h2>
              <div className="block overflow-x-auto whitespace-nowrap lg:whitespace-normal pb-2 lg:pb-0 gap-2 lg:gap-0 lg:space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex-shrink-0 lg:w-full text-left ${selectedCategory === category ? 'bg-gray-100' : ''}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Categories Horizontal (mobile) */}
          <div className="bg-white rounded-lg p-4 mb-6 block lg:hidden">
            <h2 className="font-semibold mb-4">Categories</h2>
            <div className="flex overflow-x-auto whitespace-nowrap pb-2 gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex-shrink-0 ${selectedCategory === category ? 'bg-gray-100' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          {/* Items Grid */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold mb-4 sm:mb-6">{selectedCategory}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left flex flex-col ${item.available === false ? "opacity-50 grayscale pointer-events-none" : ""}`}
                  >
                    <div className="relative h-36 w-full">
                      {typeof item.image === 'object' && item.image && 'url' in item.image ? (
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
                            onClick={() => handleAddToCart(item)}
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
        total={cart.reduce((total, item) => total + (parseFloat(item.price) || 0), 0)}
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
        cartTotal={cart.reduce((total, item) => total + (parseFloat(item.price) || 0), 0)}
        branchId={shopName || "grocery"}
        branchName={shopName || "Grocery Shop"}
        menuCategories={[]}
        isAuthenticated={false}
        branchLocation={shopCoordinates ? { 
          latitude: shopCoordinates.lat, 
          longitude: shopCoordinates.lng 
        } : undefined}
      />
      </div>
    </div>
  );
} 