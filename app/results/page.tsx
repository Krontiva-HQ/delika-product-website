"use client";
 
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { ChevronLeft } from "lucide-react";
 
export default function ResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
 
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"restaurant" | "grocery" | "pharmacy">("restaurant");
 
    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            const params = new URLSearchParams();
            const rating = searchParams!.get("rating");
            const category = searchParams!.get("category");
            const deliveryTime = searchParams!.get("deliveryTime");
            const type = searchParams!.get("type");
            if (rating) params.append("rating", rating);
            if (category) params.append("category", category);
            if (deliveryTime) params.append("deliveryTime", deliveryTime);
            if (type) params.append("type", type);
 
            try {
                const response = await fetch(
                    `https://api-server.krontiva.africa/api:uEBBwbSs/filterWindow?${params.toString()}`
                );
                const data = await response.json();
                setResults(data.filltered || []);
            } catch (error) {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }
        fetchResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams!.toString()]);
 
    // Extraction logic
    const restaurantResults: Array<any> = [];
    const groceryResults: Array<any> = [];
    const pharmacyResults: Array<any> = [];
    results.forEach((branch) => {
        // Restaurant
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
                    restaurantResults.push({
                        id: branch.id,
                        logo: restaurant.restaurantLogo?.url,
                        name: restaurant.restaurantName,
                        address: restaurant.restaurantAddress,
                        raw: branch,
                    });
                }
            }
        }
        // Grocery
        if (
            branch.grocery_inventory &&
            Array.isArray(branch.grocery_inventory) &&
            branch.grocery_inventory.length > 0
        ) {
            branch.grocery_inventory.forEach((item: any) => {
                const grocery = item._delika_groceries_shops_table;
                if (grocery) {
                    groceryResults.push({
                        id: item.id,
                        logo: grocery.groceryshopLogo?.url,
                        name: grocery.groceryshopName,
                        address: grocery.groceryshopAddress,
                        raw: item,
                    });
                }
            });
        }
        // Pharmacy
        if (
            branch.pharmacy_inventory &&
            Array.isArray(branch.pharmacy_inventory) &&
            branch.pharmacy_inventory.length > 0
        ) {
            branch.pharmacy_inventory.forEach((item: any) => {
                const pharmacy = item._delika_pharmacy_table;
                if (pharmacy) {
                    pharmacyResults.push({
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
 
    // Tab content
    const renderTab = (type: "restaurant" | "grocery" | "pharmacy") => {
        let data: any[] = [];
        let fallback = "";
        let label = "";
        if (type === "restaurant") {
            data = restaurantResults;
            fallback = "🍽️";
            label = "Restaurant";
        } else if (type === "grocery") {
            data = groceryResults;
            fallback = "🛒";
            label = "Grocery";
        } else {
            data = pharmacyResults;
            fallback = "💊";
            label = "Pharmacy";
        }
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                    <div className="text-orange-500">Loading results...</div>
                </div>
            );
        }
        if (data.length === 0) {
            return (
                <div className="col-span-full text-center text-gray-500 py-8">
                    No {label.toLowerCase()}s found.
                </div>
            );
        }
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left relative cursor-pointer block"
                        onClick={() => {
                            // TODO: Implement navigation logic for each vendor type
                            // Example:
                            // if (type === 'restaurant') router.push(`/restaurants/${item.raw.id}`);
                            // else if (type === 'grocery') router.push(`/groceries/${item.raw.id}`);
                            // else if (type === 'pharmacy') router.push(`/pharmacies/${item.raw.id}`);
                        }}
                    >
                        <div className="relative h-28">
                            {item.logo ? (
                                <Image
                                    src={item.logo}
                                    alt={item.name || label}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">
                                    {fallback}
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-gray-900 truncate">{item.name || label}</h3>
                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{item.address}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
 
    return (
        <div className="container mx-auto px-4 py-8">
            <button
                className="mb-4 flex items-center gap-2 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm"
                onClick={() => router.back()}
                type="button"
            >
                <ChevronLeft className="w-5 h-5" />
                Back
            </button>
            <div className="mb-6 flex gap-2">
                <button
                    className={`px-4 py-2 rounded-t ${activeTab === "restaurant" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setActiveTab("restaurant")}
                >
                    Restaurants
                </button>
                <button
                    className={`px-4 py-2 rounded-t ${activeTab === "grocery" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setActiveTab("grocery")}
                >
                    Groceries
                </button>
                <button
                    className={`px-4 py-2 rounded-t ${activeTab === "pharmacy" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setActiveTab("pharmacy")}
                >
                    Pharmacies
                </button>
            </div>
            {renderTab(activeTab)}
        </div>
    );
}