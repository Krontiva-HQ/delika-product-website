'use client';

import { useState, useEffect, useMemo } from 'react';
import { StoreHeader } from "@/components/store-header";
import { VendorGrid } from "@/components/vendor-grid";
import { VendorSkeleton } from "@/components/vendor-skeleton";
import { safeSetLocalStorage, safeGetLocalStorage, getLocalStorageUsage } from '@/lib/utils';

interface VendorData {
    Restaurants: any[];
    Groceries: any[];
    Pharmacies: any[];
    Ratings: any[];
}

interface CachedData {
    Restaurants?: any[];
    Groceries?: any[];
    Pharmacies?: any[];
    Ratings?: any[];
    lastFetched: { [key: string]: number };
    [key: string]: any;
}

export default function VendorsPage() {
    const [vendorData, setVendorData] = useState<VendorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [activeTab, setActiveTab] = useState<string>('restaurants');

    // Cache duration in milliseconds (30 minutes)
    const CACHE_DURATION = 30 * 60 * 1000;

    const getCachedData = (): CachedData => {
        try {
            return safeGetLocalStorage('vendorDataCache', { lastFetched: {} });
        } catch {
            return { lastFetched: {} };
        }
    };

    const setCachedData = (data: CachedData) => {
        // Log localStorage usage before storing
        const usage = getLocalStorageUsage();
        console.log(`localStorage usage: ${usage.percentage.toFixed(1)}% (${usage.used} bytes used, ${usage.available} bytes available)`);
        
        const success = safeSetLocalStorage('vendorDataCache', data);
        if (!success) {
            console.warn('Failed to cache vendor data due to size constraints');
        }
    };

    const isDataStale = (category: string): boolean => {
        const cached = getCachedData();
        const lastFetched = cached.lastFetched[category] || 0;
        return Date.now() - lastFetched > CACHE_DURATION;
    };

    const fetchCategoryData = async (category: string): Promise<any[]> => {
        const cached = getCachedData();
        
        // Check if we have fresh cached data
        if (cached[category] && !isDataStale(category)) {
            console.log(`📦 Using cached ${category} data (${cached[category].length} items)`);
            return cached[category];
        }

        // Fetch fresh data
        const endpoints = {
            restaurants: 'https://api-server.krontiva.africa/api:uEBBwbSs/allData_restaurants',
            groceries: 'https://api-server.krontiva.africa/api:uEBBwbSs/allData_groceries',
            pharmacies: 'https://api-server.krontiva.africa/api:uEBBwbSs/allData_phamarcies',
            ratings: 'https://api-server.krontiva.africa/api:uEBBwbSs/allData'
        };

        const endpoint = endpoints[category as keyof typeof endpoints];
        if (!endpoint) {
            throw new Error(`Unknown category: ${category}`);
        }

        console.log(`🌐 Fetching ${category} data from:`, endpoint);
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`Failed to fetch ${category} data`);
        }

        const data = await response.json();
        console.log(`✅ Successfully fetched ${category} data:`, data[category.charAt(0).toUpperCase() + category.slice(1)]?.length || 0, 'items');
        
        // Cache the data
        const updatedCache = getCachedData();
        updatedCache[category] = category === 'ratings' ? data.Ratings : data[category.charAt(0).toUpperCase() + category.slice(1)];
        updatedCache.lastFetched[category] = Date.now();
        setCachedData(updatedCache);

        return updatedCache[category];
    };

    useEffect(() => {
        console.log('🚀 VendorsPage: Starting data fetch...');
        const fetchVendorData = async () => {
            try {
                setLoading(true);
                
                console.log('🔄 Fetching all categories on page load...');
                
                // Fetch all categories in parallel for better performance
                const [ratings, restaurants, groceries, pharmacies] = await Promise.all([
                    fetchCategoryData('ratings'),
                    fetchCategoryData('restaurants'),
                    fetchCategoryData('groceries'),
                    fetchCategoryData('pharmacies')
                ]);
                
                // Initialize vendor data with all categories
                const initialData: VendorData = {
                    Restaurants: restaurants,
                    Groceries: groceries,
                    Pharmacies: pharmacies,
                    Ratings: ratings
                };
                
                setVendorData(initialData);
                console.log('🎉 VendorsPage: Data fetch completed successfully');

                // Store essential data in localStorage for detail pages to access
                try {
                    // Store only essential data to avoid quota exceeded
                    const essentialData = {
                        Restaurants: initialData.Restaurants?.map((restaurant: any) => ({
                            id: restaurant.id,
                            slug: restaurant.slug,
                            branchName: restaurant.branchName,
                            branchLocation: restaurant.branchLocation,
                            branchCity: restaurant.branchCity,
                            active: restaurant.active,
                            Restaurant: restaurant.Restaurant ? {
                                restaurantLogo: restaurant.Restaurant.restaurantLogo,
                                restaurantName: restaurant.Restaurant.restaurantName,
                                restaurantDescription: restaurant.Restaurant.restaurantDescription
                            } : null
                        })) || [],
                        Groceries: initialData.Groceries?.map((grocery: any) => ({
                            id: grocery.id,
                            slug: grocery.slug,
                            grocerybranchName: grocery.grocerybranchName,
                            active: grocery.active,
                            Grocery: grocery.Grocery ? {
                                groceryshopLogo: grocery.Grocery.groceryshopLogo,
                                groceryshopName: grocery.Grocery.groceryshopName,
                                groceryshopDescription: grocery.Grocery.groceryshopDescription
                            } : null
                        })) || [],
                        Pharmacies: initialData.Pharmacies?.map((pharmacy: any) => ({
                            id: pharmacy.id,
                            slug: pharmacy.slug,
                            pharmacybranchName: pharmacy.pharmacybranchName,
                            active: pharmacy.active,
                            Pharmacy: pharmacy.Pharmacy ? {
                                pharmacyLogo: pharmacy.Pharmacy.pharmacyLogo,
                                pharmacyName: pharmacy.Pharmacy.pharmacyName,
                                pharmacyDescription: pharmacy.Pharmacy.pharmacyDescription
                            } : null
                        })) || [],
                        Ratings: initialData.Ratings || []
                    };
                    
                    localStorage.setItem('allData', JSON.stringify(essentialData));
                    console.log('Stored essential allData in localStorage for detail pages');
                } catch (storageError) {
                    console.warn('Failed to store allData in localStorage:', storageError);
                    // Continue without storing if localStorage fails
                }

                // Console log the complete data structure
                console.log('=== COMPLETE ALLDATA STRUCTURE ===');
                console.log('Total Restaurants:', initialData.Restaurants?.length || 0);
                console.log('Total Groceries:', initialData.Groceries?.length || 0);
                console.log('Total Pharmacies:', initialData.Pharmacies?.length || 0);
                console.log('Total Ratings:', initialData.Ratings?.length || 0);
                console.log('=== ENDPOINTS CALLED ===');
                console.log('✅ Ratings endpoint called');
                console.log('✅ Restaurants endpoint called');
                console.log('✅ Groceries endpoint called');
                console.log('✅ Pharmacies endpoint called');
                console.log('🚀 All categories loaded in parallel for optimal performance');

                // Log sample data from each category
                if (initialData.Restaurants && initialData.Restaurants.length > 0) {
                    console.log('=== SAMPLE RESTAURANT DATA ===');
                    const sampleRestaurant = initialData.Restaurants[0];
                    console.log('Sample Restaurant:', {
                        id: sampleRestaurant.id,
                        slug: sampleRestaurant.slug,
                        branchName: sampleRestaurant.branchName,
                        Restaurant: sampleRestaurant.Restaurant,
                        restaurantLogo: sampleRestaurant.Restaurant?.restaurantLogo,
                        restaurantName: sampleRestaurant.Restaurant?.restaurantName
                    });
                }

                if (initialData.Groceries && initialData.Groceries.length > 0) {
                    console.log('=== SAMPLE GROCERY DATA ===');
                    const sampleGrocery = initialData.Groceries[0];
                    console.log('Sample Grocery:', {
                        id: sampleGrocery.id,
                        slug: sampleGrocery.slug,
                        grocerybranchName: sampleGrocery.grocerybranchName,
                        Grocery: sampleGrocery.Grocery,
                        GroceryItem: sampleGrocery.GroceryItem,
                        groceryshopLogo: sampleGrocery.Grocery?.groceryshopLogo,
                        groceryshopName: sampleGrocery.Grocery?.groceryshopName,
                        groceryItemCount: sampleGrocery.GroceryItem?.length || 0
                    });

                    if (sampleGrocery.GroceryItem && sampleGrocery.GroceryItem.length > 0) {
                        console.log('Sample Grocery Items:', sampleGrocery.GroceryItem.slice(0, 3));
                    }
                }

                if (initialData.Pharmacies && initialData.Pharmacies.length > 0) {
                    console.log('=== SAMPLE PHARMACY DATA ===');
                    const samplePharmacy = initialData.Pharmacies[0];
                    console.log('Sample Pharmacy:', {
                        id: samplePharmacy.id,
                        slug: samplePharmacy.slug,
                        pharmacybranchName: samplePharmacy.pharmacybranchName,
                        Pharmacy: samplePharmacy.Pharmacy,
                        PharmacyItem: samplePharmacy.PharmacyItem,
                        pharmacyLogo: samplePharmacy.Pharmacy?.pharmacyLogo,
                        pharmacyName: samplePharmacy.Pharmacy?.pharmacyName,
                        pharmacyItemCount: samplePharmacy.PharmacyItem?.length || 0
                    });

                    if (samplePharmacy.PharmacyItem && samplePharmacy.PharmacyItem.length > 0) {
                        console.log('Sample Pharmacy Items:', samplePharmacy.PharmacyItem.slice(0, 3));
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchVendorData();
    }, []);

    // Function to load category data when tab changes
    const loadCategoryData = async (category: string) => {
        try {
            const categoryData = await fetchCategoryData(category);
            
            setVendorData(prev => ({
                ...prev!,
                [category.charAt(0).toUpperCase() + category.slice(1)]: categoryData
            }));
        } catch (err) {
            console.error(`Error loading ${category} data:`, err);
        }
    };

    // Handle tab changes
    const handleTabChange = (tab: string) => {
        console.log(`🔄 Tab changed to: ${tab}`);
        setActiveTab(tab);
        
        // All data is already loaded on page load, so just switch tabs
        console.log(`📦 ${tab} data already loaded from initial fetch`);
    };

    // Load user coordinates from localStorage
    useEffect(() => {
        const loadLocationData = () => {
            const savedLocationData = localStorage.getItem('userLocationData');
            if (savedLocationData) {
                const { lat, lng } = JSON.parse(savedLocationData);
                setUserCoordinates({ lat, lng });
            }
        };

        loadLocationData();

        // Listen for location updates
        const handleLocationUpdate = (event: CustomEvent) => {
            const locationData = event.detail;
            if (locationData && locationData.lat && locationData.lng) {
                setUserCoordinates({ lat: locationData.lat, lng: locationData.lng });
            }
        };

        window.addEventListener('locationUpdated', handleLocationUpdate as EventListener);
        return () => {
            window.removeEventListener('locationUpdated', handleLocationUpdate as EventListener);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header skeleton */}
                <div className="bg-white shadow-sm border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Search section skeleton */}
                <div className="container mx-auto px-4 py-6">
                    <div className="space-y-4 mb-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    
                    {/* Vendor grid skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: 15 }).map((_, index) => (
                            <VendorSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <StoreHeader 
                vendorData={vendorData} 
                onTabChange={handleTabChange}
                activeTab={activeTab}
            />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">

                {/* Vendor Grid */}
                {vendorData && (
                    <VendorGrid
                        vendorData={vendorData}
                        userCoordinates={userCoordinates}
                    />
                )}
            </div>
        </div>
    );
} 