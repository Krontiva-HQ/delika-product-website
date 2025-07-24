import { useEffect, useState } from "react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";
import Link from "next/link";

interface PharmacyBranch {
  id: string;
  pharmacybranchName: string;
  pharmacybranchLocation?: string;
  _delika_pharmacy_table?: {
    pharmacyName?: string;
    pharmacyLogo?: { url?: string } | null;
    id?: string; // Added id to the interface
  };
}

export function PharmacyList() {
  const [branches, setBranches] = useState<PharmacyBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPharmacyBranches() {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_PHARMACY_SHOPS_API;
        if (!apiUrl) throw new Error("NEXT_PUBLIC_PHARMACY_SHOPS_API is not defined");
        console.log("Fetching pharmacy branches from:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log("Pharmacy branches response:", data);
        setBranches(Array.isArray(data) ? data : []);
      } catch (error) {
        setBranches([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPharmacyBranches();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" color="orange" text="Loading pharmacies..." />
      </div>
    );
  }

  if (!branches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-gray-500 text-center">No pharmacy branches found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            href={`/pharmacy/${branch.id}`}
            onClick={() => {
              localStorage.setItem("selectedPharmacyBranchId", branch.id);
              localStorage.setItem("selectedPharmacyShopId", branch._delika_pharmacy_table?.id || "");
              // Store pharmacy name and logo for details page
              localStorage.setItem("selectedPharmacyShopData", JSON.stringify({
                pharmacyshopName: branch._delika_pharmacy_table?.pharmacyName || "",
                pharmacyshopLogo: branch._delika_pharmacy_table?.pharmacyLogo || null
              }));
            }}
            className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block"
          >
            <div className="relative h-36">
              {branch._delika_pharmacy_table?.pharmacyLogo?.url ? (
                <Image
                  src={branch._delika_pharmacy_table.pharmacyLogo.url}
                  alt={branch._delika_pharmacy_table.pharmacyName || "Pharmacy Shop"}
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
                {branch._delika_pharmacy_table?.pharmacyName || "No Name"}
              </h3>
              <span className="text-xs text-gray-500 truncate block">
                {branch.pharmacybranchLocation || ""}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 