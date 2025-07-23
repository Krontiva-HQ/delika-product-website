import { useEffect, useState } from "react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";

interface GroceryShop {
  id: string;
  groceryshopName: string;
  groceryshopAddress: string;
  groceryshopLogo?: { url: string } | null;
  groceryshopPhoneNumber: string;
}

export function GroceriesList() {
  const [shops, setShops] = useState<GroceryShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGroceries() {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_GROCERIES_SHOPS_API;
        if (!apiUrl) throw new Error("NEXT_PUBLIC_GROCERIES_SHOPS_API is not defined");
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        setShops(data);
      } catch (error) {
        setShops([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroceries();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" color="orange" text="Loading groceries..." />
      </div>
    );
  }

  if (!shops.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-gray-500 text-center">No grocery stores found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block"
          >
            <div className="relative h-36">
              {shop.groceryshopLogo?.url ? (
                <Image
                  src={shop.groceryshopLogo.url}
                  alt={shop.groceryshopName}
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
              <h3 className="font-bold text-gray-900 truncate">{shop.groceryshopName}</h3>
              <span className="text-xs text-gray-600 truncate block">{shop.groceryshopAddress}</span>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <span className="truncate">{shop.groceryshopPhoneNumber}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 