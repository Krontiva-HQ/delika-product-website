import { useEffect, useState } from "react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";
import Link from "next/link";

interface GroceryBranch {
  id: string;
  grocerybranchName: string;
  grocerybranchLocation: string;
  groceryshopID: string;
  _delika_groceries_shops_table?: {
    groceryshopName?: string;
    groceryshopLogo?: { url: string } | null;
  };
}

export function GroceriesList() {
  const [branches, setBranches] = useState<GroceryBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" color="orange" text="Loading groceries..." />
      </div>
    );
  }

  if (!branches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-gray-500 text-center">No grocery branches found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {branches.map((branch) => (
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