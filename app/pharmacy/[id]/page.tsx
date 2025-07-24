"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";

interface PharmacyInventoryItem {
  id: string;
  productName: string;
  price: string;
  category?: string;
  subCategory?: string;
  description?: string;
  stockQuantity?: number;
  image: string | null;
  pharmacyShopId?: string | null;
  pharmacyShopBranchId?: string | null;
  _delika_pharmacy_table?: {
    pharmacyLogo?: { url: string };
    pharmacyName?: string;
  };
}

export default function PharmacyDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const shopId = params?.id as string;
  const branchId = searchParams ? searchParams.get("branchId") : null;
  // Use localStorage values if available, fallback to URL param
  const pharmacyShopIdParam = typeof window !== "undefined"
    ? localStorage.getItem("selectedPharmacyShopId") || shopId || null
    : shopId || null;
  const pharmacyBranchId = typeof window !== "undefined"
    ? localStorage.getItem("selectedPharmacyBranchId") || branchId || null
    : branchId || null;
  const [inventory, setInventory] = useState<PharmacyInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get shop info from localStorage (set when user clicks a pharmacy branch)
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shopData = localStorage.getItem("selectedPharmacyShopData");
      if (shopData) {
        try {
          const parsed = JSON.parse(shopData);
          setShopLogo(parsed.pharmacyshopLogo?.url || null);
          setShopName(parsed.pharmacyshopName || null);
        } catch {}
      }
    }
  }, []);

  // Update shop logo/name from inventory if available
  useEffect(() => {
    if (inventory.length > 0 && inventory[0]._delika_pharmacy_table) {
      const table = inventory[0]._delika_pharmacy_table;
      setShopLogo(table.pharmacyLogo?.url || null);
      setShopName(table.pharmacyName || null);
    }
  }, [inventory]);

  useEffect(() => {
    async function fetchInventory() {
      try {
        setIsLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_PHARMACY_SHOPS_INVENTORY_API;
        if (!baseUrl) throw new Error("NEXT_PUBLIC_PHARMACY_SHOPS_INVENTORY_API is not defined");
        const apiUrl = `${baseUrl}?pharmacyShopId=${pharmacyShopIdParam}&pharmacyBranchId=${pharmacyBranchId}`;
        // Log the endpoint
        console.log("Fetching pharmacy inventory from:", apiUrl);
        console.log("Filtering for pharmacyShopId:", pharmacyShopIdParam, "pharmacyBranchId:", pharmacyBranchId);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        const normalize = (item: any) => ({
          ...item,
          pharmacyShopId: item.pharmacyShopId ?? pharmacyShopIdParam ?? null,
          pharmacyShopBranchId: item.pharmacyShopBranchId ?? pharmacyBranchId ?? null,
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
  }, [shopId, pharmacyBranchId]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Shop logo and name */}
      <div className="flex flex-col items-center mb-8">
        {shopLogo ? (
          <div className="relative w-24 h-24 mb-2">
            <img src={shopLogo} alt={shopName || "Pharmacy Shop"} className="object-cover rounded-full w-full h-full border" />
          </div>
        ) : (
          <div className="w-24 h-24 mb-2 bg-gray-100 flex items-center justify-center text-gray-400 rounded-full border">No Logo</div>
        )}
        <h2 className="text-xl font-bold text-gray-900 text-center">{shopName || "Pharmacy Shop"}</h2>
      </div>
      <h1 className="text-2xl font-bold mb-6">Pharmacy Inventory</h1>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" color="orange" text="Loading inventory..." />
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-gray-500 text-center">No inventory found for this pharmacy.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {inventory.map((item) => (
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
      )}
    </div>
  );
} 