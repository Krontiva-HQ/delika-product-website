"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, ChevronLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function ResultsPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const type = searchParams?.get("type") || "restaurant";
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        // Only use results from localStorage (set by filter modal)
        const localResults = typeof window !== 'undefined' ? localStorage.getItem('delikaResults') : null;
        if (localResults) {
            setResults(JSON.parse(localResults));
            localStorage.removeItem('delikaResults');
        } else {
            setResults([]); // No results available
        }
        setLoading(false);
    }, []); // Only run once on mount

    // Extraction logic for each type
    let displayResults: Array<any> = [];
    if (type === "restaurant") {
        results.forEach((branch) => {
            if (
                branch.Restaurant_Inventory_Branch &&
                Array.isArray(branch.Restaurant_Inventory_Branch) &&
                branch.Restaurant_Inventory_Branch.length > 0
            ) {
                const restaurantBranch = branch.Restaurant_Inventory_Branch[0];
                if (
                    restaurantBranch &&
                    Array.isArray(restaurantBranch.restaurantDetails) &&
                    restaurantBranch.restaurantDetails.length > 0
                ) {
                    const restaurant = restaurantBranch.restaurantDetails[0];
                    if (restaurant) {
                        displayResults.push({
                            id: branch.id,
                            logo: restaurant.restaurantLogo?.url,
                            name: restaurant.restaurantName,
                            address: restaurant.restaurantAddress,
                            raw: branch,
                        });
                    }
                }
            }
        });
    } else if (type === "grocery") {
        results.forEach((branch) => {
            if (
                branch.grocery_inventory &&
                Array.isArray(branch.grocery_inventory) &&
                branch.grocery_inventory.length > 0
            ) {
                branch.grocery_inventory.forEach((item: any) => {
                    const grocery = item._delika_groceries_shops_table;
                    if (grocery) {
                        displayResults.push({
                            id: item.id,
                            logo: grocery.groceryshopLogo?.url,
                            name: grocery.groceryshopName,
                            address: grocery.groceryshopAddress,
                            raw: item,
                        });
                    }
                });
            }
        });
    } else if (type === "pharmacy") {
        results.forEach((branch) => {
            if (
                branch.pharmacy_inventory &&
                Array.isArray(branch.pharmacy_inventory) &&
                branch.pharmacy_inventory.length > 0
            ) {
                branch.pharmacy_inventory.forEach((item: any) => {
                    const pharmacy = item._delika_pharmacy_table;
                    if (pharmacy) {
                        displayResults.push({
                            id: item.id,
                            logo: pharmacy.pharmacyLogo?.url,
                            name: pharmacy.pharmacyName,
                            address: pharmacy.pharmacyAddress,
                            raw: item,
                        });
                    }
                });
            }
        });
    }

    // Filter chips (removed due to undefined variables)
    // const filterChips = [
    //     rating && { label: `Rating: ${rating}+` },
    //     deliveryTime && { label: `≤ ${deliveryTime} min` },
    //     ...categories.map((cat) => ({ label: cat })),
    // ].filter(Boolean);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <button
                    className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm"
                    onClick={() => router.back()}
                    type="button"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    Results for {capitalize(type)}
                    <span className="text-base font-medium text-gray-500">({displayResults.length})</span>
                </h1>
                {/* Removed filter chips rendering due to undefined variables */}
            </div>
            {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                    <div className="text-orange-500">Loading results...</div>
                </div>
            ) : displayResults.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-8">
                    No {type}s found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayResults.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block border border-gray-200"
                            onClick={() => {
                                if (type === 'restaurant') router.push(`/restaurant/${item.raw.id}`);
                                else if (type === 'grocery') router.push(`/groceries/${item.raw.id}`);
                                else if (type === 'pharmacy') router.push(`/pharmacy/${item.raw.id}`);
                            }}
                        >
                            <div className="relative h-40 w-full">
                                {item.logo ? (
                                    <Image
                                        src={item.logo}
                                        alt={item.name || type}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">
                                        {type === 'restaurant' ? '🍽️' : type === 'grocery' ? '🛒' : '💊'}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 truncate text-lg mb-1">{item.name || type}</h3>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate">{item.address}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}