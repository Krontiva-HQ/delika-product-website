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
  groceryshopLogo?: { url: string } | null;
  groceryshopName?: string | null;
  _delika_groceries_shops_table?: {
    groceryshopLogo?: { url: string } | null;
    groceryshopName?: string | null;
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

  // Get shop info from localStorage (set when user clicks a grocery branch)
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  useEffect(() => {
    if (inventory.length > 0) {
      // Try to get logo and name from the related shop/restaurant object
      const shopObj = inventory[0]._delika_groceries_shops_table;
      const logo = shopObj?.groceryshopLogo?.url || null;
      const name = shopObj?.groceryshopName || null;
      setShopLogo(logo);
      setShopName(name);
      return;
    }
    // Fallback to localStorage if inventory is empty
    if (typeof window !== "undefined") {
      const shopData = localStorage.getItem("selectedGroceryShopData");
      if (shopData) {
        try {
          const parsed = JSON.parse(shopData);
          setShopLogo(parsed.groceryshopLogo?.url || null);
          setShopName(parsed.groceryshopName || null);
        } catch {}
      }
    }
  }, [inventory]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Shop cover image and name */}
      <div className="relative w-full mb-8 rounded-2xl overflow-hidden" style={{ minHeight: 180 }}>
        {shopLogo ? (
          <img
            src={shopLogo}
            alt={shopName || "Grocery Shop"}
            className="w-full h-48 object-cover rounded-2xl"
            style={{ minHeight: 180, maxHeight: 240 }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-lg rounded-2xl" style={{ minHeight: 180 }}>
            No Image
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
          <h2 className="text-3xl font-bold text-white drop-shadow mb-2">{shopName || "Grocery Shop"}</h2>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-6">Grocery Shop Inventory</h1>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" color="orange" text="Loading inventory..." />
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-gray-500 text-center">No inventory found for this shop.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedInventory.map((item) => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left">
                <div className="relative h-36">
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
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 truncate">{item.productName || "No Name"}</h3>
                  <span className="text-xs text-gray-600 truncate block">{item.price || "No Price"}</span>
                  <span className="text-xs text-gray-500 block mt-1">{item.category || ""}</span>
                </div>
              </div>
            ))}
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
        </>
      )}
    </div>
  );
} 