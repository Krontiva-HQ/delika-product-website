"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import React from "react";
import { useRouter } from "next/navigation";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterTypes: string[];
  setFilterTypes: React.Dispatch<React.SetStateAction<string[]>>;
  filterCategories: string[];
  setFilterCategories: React.Dispatch<React.SetStateAction<string[]>>;
  filterRating: string;
  setFilterRating: React.Dispatch<React.SetStateAction<string>>;
  filterDeliveryTime: number | null;
  setFilterDeliveryTime: React.Dispatch<React.SetStateAction<number | null>>;
  filterPickup: boolean;
  setFilterPickup: React.Dispatch<React.SetStateAction<boolean>>;
  foodPage: number;
  setFoodPage: React.Dispatch<React.SetStateAction<number>>;
  groceryPage: number;
  setGroceryPage: React.Dispatch<React.SetStateAction<number>>;
  pharmacyPage: number;
  setPharmacyPage: React.Dispatch<React.SetStateAction<number>>;
  RESTAURANT_CATEGORIES: string[];
  GROCERY_CATEGORIES: string[];
  PHARMACY_CATEGORIES: string[];
  PAGE_SIZE: number;
  onApply: (filteredResults?: any[]) => void;
  onReset?: () => void;
  isLoading?: boolean;
  vendorData?: any;
  ratings?: any[];
  userCoordinates?: { lat: number; lng: number } | null;
  searchRadius?: number;
}

// 1. Replace RESTAURANT_CATEGORIES with the provided food categories list
const FOOD_CATEGORIES = [
  "Alcohol", "Angwamo Dishes", "Appetizer", "Assorted Fried Rice", "Bake", "Bakery", "Beef Pizza", "Beer", "Beverages", "Boba - Fruit Tea (Reg / Large)", "Boba - Milk Tea (Reg/ Large)", "Boba Tea", "Boiled Yam", "Bread", "Breakfast", "Burger", "Burger Size", "Burgers", "Burgers & Sandwiches", "Cakes & Pastries", "Chicken", "Chicken Meals", "Chicken Noodles", "Chicken Pizza", "Classic Cocktails", "Classic Cocktails / Mocktails", "Cocktail Mixes", "Coffee", "Coffee & Tea", "Crispy Fries", "Croissant", "Day Time Tucker Menu", "Dessert", "Desserts & Sweets", "Doughnuts", "Drink", "Drinks", "Drinks / Beer", "Energy Drinks", "Evening Menu", "Fast Food", "Flour", "Food, Beverages & Tobacco", "Fresh Juice", "Fried Dishes", "Fries", "Fries / Chips", "Fruit Juice", "Fruit Tea", "Ghana Jollof", "Grills / Fried", "Hot Beverages", "Juice", "Juices", "Juices & Smoothies", "Khebab", "Krontiva Menu", "Light Soup", "Loaded Fries", "Local Dish", "Local Dishes", "Local Food", "Local Foods", "Lunch", "Lunch Special", "Main Menu", "Margherita Pizza", "Menu For Classic Plate- Rice Dishes", "Milk Series", "Milk Shakes", "Milkshake", "Milkshakes", "Morning Menu", "Nigerian Local Food", "Noodles", "Okro Soup", "Other Dishes", "Pastries", "Pizza", "Pork", "Protein", "Proteins", "Ribs", "Rice", "Rice & Grains", "Rice Dishes", "Rice Meals", "Rice Menu", "Rich Dishes", "Salad", "Salad Dressing", "Salads", "Sandwich", "Sandwiches", "Sauce / Soups", "Sauces", "Sausage Pizza", "Seafood Lovers", "Self- Treat Dishes", "Shawarma", "Side Dish", "Side Meals", "Signature Cocktails / Mocktails", "Smoothies", "Smoothies (Reg / Large)", "Snack", "Snack Bar", "Snack Bites", "Sobolo", "Soft Drinks", "Soup", "Soups", "Soups Only", "Spaghetti", "Special Stir Fries", "Springrolls And Samosa", "Starter", "Starters", "Starters / Appetizers / Small Bites", "Stew", "Stir Fry Noodles", "Stir Fry Spaghetti", "Swallow Dish", "Test Foods", "Traditional Foods", "Unique Series", "Vegetarian Pizza", "Waakye", "Wine", "Wrap", "Wrap & Sandwich", "Wraps", "Yam/Plantain", "면류 (Noodles)", "식사류 (Meal)", "한식요리 (Korean Dish_Meats & Others)"
];

// Helper Functions
function getRatingForVendor(vendorId: string, ratings: any[]) {
  const rating = ratings?.find(r => r.delika_branches_table_id === vendorId);
  return rating?.OverallRating || '0';
}

function getDeliveryTimeForVendor(vendorId: string, ratings: any[]) {
  const rating = ratings?.find(r => r.delika_branches_table_id === vendorId);
  return rating?.deliveryTime || '';
}

function getPickupForVendor(vendorId: string, ratings: any[]) {
  const rating = ratings?.find(r => r.delika_branches_table_id === vendorId);
  return rating?.pickup || false;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Vendor Data Normalization and Filtering Logic
function getFilteredResults(
  vendorData: any,
  ratings: any[],
  filterTypes: string[],
  filterCategories: string[],
  filterRating: string,
  filterDeliveryTime: number | null,
  filterPickup: boolean,
  userCoordinates: { lat: number; lng: number } | null = null,
  searchRadius: number = 8,
  isTestMode: boolean = false
) {
  if (!vendorData) return [];

  console.log('🔍 [FilterModal] Input vendorData:', {
    hasRestaurants: !!vendorData.Restaurants,
    restaurantsCount: vendorData.Restaurants?.length || 0,
    hasGroceries: !!vendorData.Groceries,
    groceriesCount: vendorData.Groceries?.length || 0,
    hasPharmacies: !!vendorData.Pharmacies,
    pharmaciesCount: vendorData.Pharmacies?.length || 0,
    sampleRestaurantItems: vendorData.Restaurants?.[0]?.RestaurantItem?.length || 0
  });

  // Combine all vendor types into a single array
  const allVendors: any[] = [];

  // Add restaurants
  if (vendorData.Restaurants) {
    vendorData.Restaurants.forEach((restaurant: any) => {
      let distance = null;
      if (userCoordinates && restaurant.branchLatitude && restaurant.branchLongitude) {
        try {
          const lat = parseFloat(restaurant.branchLatitude);
          const lng = parseFloat(restaurant.branchLongitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            distance = calculateDistance(
              userCoordinates.lat,
              userCoordinates.lng,
              lat,
              lng
            );
          }
        } catch (error) {
          console.warn('Error calculating distance for restaurant:', restaurant.id, error);
        }
      }

      allVendors.push({
        ...restaurant,
        type: 'restaurant',
        displayName: restaurant.branchName,
        displayLocation: restaurant.branchLocation,
        displayPhone: restaurant.branchPhoneNumber,
        displayCity: restaurant.branchCity,
        displayLatitude: restaurant.branchLatitude,
        displayLongitude: restaurant.branchLongitude,
        displaySlug: restaurant.slug,
        displayLogo: restaurant.Restaurant?.[0]?.image_url || restaurant.Restaurant?.[0]?.restaurantLogo?.url,
        restaurantName: restaurant.Restaurant?.[0]?.restaurantName,
        active: restaurant.active,
        rating: getRatingForVendor(restaurant.id, ratings),
        deliveryTime: getDeliveryTimeForVendor(restaurant.id, ratings),
        pickup: getPickupForVendor(restaurant.id, ratings),
        distance,
        // Preserve menu items for category filtering
        RestaurantItem: restaurant.RestaurantItem || [],
      });
    });
  }

  // Add groceries
  if (vendorData.Groceries) {
    vendorData.Groceries.forEach((grocery: any) => {
      let distance = null;
      if (userCoordinates && grocery.grocerybranchLatitude && grocery.grocerybranchLongitude) {
        try {
          const lat = parseFloat(grocery.grocerybranchLatitude);
          const lng = parseFloat(grocery.grocerybranchLongitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            distance = calculateDistance(
              userCoordinates.lat,
              userCoordinates.lng,
              lat,
              lng
            );
          }
        } catch (error) {
          console.warn('Error calculating distance for grocery:', grocery.id, error);
        }
      }

      allVendors.push({
        ...grocery,
        type: 'grocery',
        displayName: grocery.grocerybranchName,
        displayLocation: grocery.grocerybranchLocation,
        displayPhone: grocery.grocerybranchPhoneNumber,
        displayCity: grocery.grocerybranchCity,
        displayLatitude: grocery.grocerybranchLatitude,
        displayLongitude: grocery.grocerybranchLongitude,
        displaySlug: grocery.slug,
        displayLogo: grocery.Grocery?.image_url || grocery.Grocery?.groceryshopLogo?.url,
        groceryName: grocery.Grocery?.groceryshopName,
        active: grocery.active,
        rating: getRatingForVendor(grocery.id, ratings),
        deliveryTime: getDeliveryTimeForVendor(grocery.id, ratings),
        pickup: getPickupForVendor(grocery.id, ratings),
        distance,
        // Preserve grocery items for category filtering
        GroceryItem: grocery.GroceryItem || [],
      });
    });
  }

  // Add pharmacies
  if (vendorData.Pharmacies) {
    vendorData.Pharmacies.forEach((pharmacy: any) => {
      let distance = null;
      if (userCoordinates && pharmacy.pharmacybranchLatitude && pharmacy.pharmacybranchLongitude) {
        try {
          const lat = parseFloat(pharmacy.pharmacybranchLatitude);
          const lng = parseFloat(pharmacy.pharmacybranchLongitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            distance = calculateDistance(
              userCoordinates.lat,
              userCoordinates.lng,
              lat,
              lng
            );
          }
        } catch (error) {
          console.warn('Error calculating distance for pharmacy:', pharmacy.id, error);
        }
      }

      allVendors.push({
        ...pharmacy,
        type: 'pharmacy',
        displayName: pharmacy.pharmacybranchName,
        displayLocation: pharmacy.pharmacybranchLocation,
        displayPhone: pharmacy.pharmacybranchPhoneNumber,
        displayCity: pharmacy.pharmacybranchCity,
        displayLatitude: pharmacy.pharmacybranchLatitude,
        displayLongitude: pharmacy.pharmacybranchLongitude,
        displaySlug: pharmacy.slug,
        displayLogo: pharmacy.Pharmacy?.image_url || pharmacy.Pharmacy?.pharmacyLogo?.url,
        pharmacyName: pharmacy.Pharmacy?.pharmacyName,
        active: pharmacy.active,
        rating: getRatingForVendor(pharmacy.id, ratings),
        deliveryTime: getDeliveryTimeForVendor(pharmacy.id, ratings),
        pickup: getPickupForVendor(pharmacy.id, ratings),
        distance,
        // Preserve pharmacy items for category filtering
        PharmacyItem: pharmacy.PharmacyItem || [],
      });
    });
  }

  // Apply filters sequentially
  let filteredVendors = allVendors;

  // Type filter
  if (filterTypes.length > 0 && filterTypes[0] !== 'all') {
    filteredVendors = filteredVendors.filter(vendor => 
      filterTypes.includes(vendor.type)
    );
  }

  // Rating filter
  if (filterRating && filterRating !== 'all') {
    const minRating = parseInt(filterRating);
    filteredVendors = filteredVendors.filter(vendor => {
      const vendorRating = parseFloat(vendor.rating || '0');
      return vendorRating >= minRating;
    });
  }

  // Delivery time filter
  if (filterDeliveryTime) {
    filteredVendors = filteredVendors.filter(vendor => {
      const vendorDeliveryTime = parseInt(vendor.deliveryTime || '0');
      return vendorDeliveryTime <= filterDeliveryTime;
    });
  }

  // Pickup filter
  if (filterPickup) {
    filteredVendors = filteredVendors.filter(vendor => vendor.pickup === true);
  }

  // Category filter
  if (filterCategories.length > 0) {
    console.log('🔍 [FilterModal] Applying category filter for:', filterCategories);
    console.log('🔍 [FilterModal] Total vendors before category filter:', filteredVendors.length);
    
    filteredVendors = filteredVendors.filter(vendor => {
      // Check if vendor has items that match any of the selected categories
      const vendorItems = (vendor.RestaurantItem || vendor.GroceryItem || vendor.PharmacyItem || []) as any[];
      
      console.log(`🔍 [FilterModal] Vendor ${vendor.displayName} has ${vendorItems.length} items`);
      
      if (vendorItems.length > 0) {
        const categories = vendorItems.map(item => item.foodType || item.itemType || item.category || '');
        console.log(`🔍 [FilterModal] Vendor ${vendor.displayName} categories:`, categories);
      }
      
      const hasMatchingCategory = vendorItems.some((item: any) => {
        const itemCategory = item.foodType || item.itemType || item.category || '';
        return filterCategories.includes(itemCategory);
      });
      
      if (hasMatchingCategory) {
        console.log(`✅ [FilterModal] Vendor ${vendor.displayName} matches category filter`);
      }
      
      return hasMatchingCategory;
    });
    
    console.log('🔍 [FilterModal] Total vendors after category filter:', filteredVendors.length);
  }

  // Distance filter - only show vendors within search radius
  if (userCoordinates) {
    filteredVendors = filteredVendors.filter(vendor => 
      vendor.distance === null || vendor.distance <= searchRadius
    );
  }

  // Test mode: return only first 3 results for testing
  if (isTestMode) {
    return filteredVendors.slice(0, 3);
  }

  return filteredVendors;
}

export function FilterModal({
  open,
  onOpenChange,
  filterTypes,
  setFilterTypes,
  filterCategories,
  setFilterCategories,
  filterRating,
  setFilterRating,
  filterDeliveryTime,
  setFilterDeliveryTime,
  filterPickup,
  setFilterPickup,
  foodPage,
  setFoodPage,
  groceryPage,
  setGroceryPage,
  pharmacyPage,
  setPharmacyPage,
  RESTAURANT_CATEGORIES,
  GROCERY_CATEGORIES,
  PHARMACY_CATEGORIES,
  PAGE_SIZE,
  onApply,
  onReset,
  isLoading = false,
  vendorData,
  ratings,
  userCoordinates,
  searchRadius,
}: FilterModalProps) {
  const router = useRouter();

  const handleApplyFilters = async () => {
    try {
      // Get filtered results using the helper function
      const filteredResults = getFilteredResults(
        vendorData,
        ratings || [],
        filterTypes,
        filterCategories,
        filterRating,
        filterDeliveryTime,
        filterPickup,
        userCoordinates,
        searchRadius || 8,
        false // Disable test mode to show all results
      );

      // Call the onApply callback with the filtered results
      onApply(filteredResults);
    } catch (error) {
      console.error('Error applying filters:', error);
      // Still call onApply with empty array in case of error
      onApply([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 flex-shrink-0">
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>
            Customize your search by selecting filters for type, rating, delivery time, and more.
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
            {/* Type Filter */}
            <div>
              <div className="font-medium flex items-center gap-2 mb-2">Type</div>
              <div className="flex gap-3">
                {[
                  { label: "Restaurant", value: "restaurant" },
                  { label: "Grocery", value: "grocery" },
                  { label: "Pharmacy", value: "pharmacy" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`px-5 py-2 rounded-xl font-medium bg-gray-100 ${filterTypes[0] === type.value
                        ? "ring-2 ring-orange-500 bg-orange-50"
                        : ""
                      }`}
                    onClick={() => {
                      setFilterTypes([type.value]);
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Rating Filter */}
            <div>
              <div className="font-medium flex items-center gap-2 mb-2">
                <span>☆</span> Rating
              </div>
              <div className="flex gap-3">
                {["3", "4", "5"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`px-5 py-2 rounded-xl font-medium bg-gray-100 ${filterRating === val
                        ? "ring-2 ring-orange-500 bg-orange-50"
                        : ""
                      }`}
                    onClick={() => setFilterRating(val)}
                  >
                    {val} stars
                  </button>
                ))}
              </div>
            </div>
            {/* Delivery Time Filter */}
            <div>
              <div className="font-medium flex items-center gap-2 mb-2">
                <span>⏱️</span> Delivery time
              </div>
              <div className="flex gap-3">
                {[5, 10, 20].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`px-5 py-2 rounded-xl font-medium bg-gray-100 ${filterDeliveryTime === val
                        ? "ring-2 ring-orange-500 bg-orange-50"
                        : ""
                      }`}
                    onClick={() => setFilterDeliveryTime(val)}
                  >
                    {val} min or less
                  </button>
                ))}
              </div>
            </div>
            {/* Pickup Toggle */}
            <div>
              <div className="font-medium flex items-center gap-2 mb-2">
                <span>🚶‍♂️</span> Pickup
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={filterPickup}
                  onCheckedChange={setFilterPickup}
                  id="pickup-switch"
                />
                <label htmlFor="pickup-switch" className="text-sm">
                  Only show places with the option to collect orders yourself
                </label>
              </div>
            </div>
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium mb-1">Categories</label>
              <div className="space-y-4">
                {/* Food Categories */}
                {filterTypes.includes("restaurant") && (
                  <div>
                    <div className="font-semibold mb-2">Food</div>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {FOOD_CATEGORIES.map((category: string) => (
                          <button
                            key={category}
                            type="button"
                            className={`px-3 py-2 rounded-lg font-medium bg-gray-100 text-sm text-left ${filterCategories.includes(category)
                                ? "ring-2 ring-orange-500 bg-orange-50"
                                : ""
                              }`}
                            onClick={() => {
                              if (filterCategories.includes(category)) {
                                setFilterCategories(
                                  filterCategories.filter((c: string) => c !== category)
                                );
                              } else {
                                setFilterCategories([
                                  ...filterCategories,
                                  category,
                                ]);
                              }
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Grocery Categories */}
                {filterTypes.includes("grocery") && (
                  <div>
                    <div className="font-semibold mb-2">Grocery</div>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {GROCERY_CATEGORIES.map((category: string) => (
                          <button
                            key={category}
                            type="button"
                            className={`px-3 py-2 rounded-lg font-medium bg-gray-100 text-sm text-left ${filterCategories.includes(category)
                                ? "ring-2 ring-orange-500 bg-orange-50"
                                : ""
                              }`}
                            onClick={() => {
                              if (filterCategories.includes(category)) {
                                setFilterCategories(
                                  filterCategories.filter((c: string) => c !== category)
                                );
                              } else {
                                setFilterCategories([
                                  ...filterCategories,
                                  category,
                                ]);
                              }
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Pharmacy Categories */}
                {filterTypes.includes("pharmacy") && (
                  <div>
                    <div className="font-semibold mb-2">Pharmacy</div>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {PHARMACY_CATEGORIES.map((category: string) => (
                          <button
                            key={category}
                            type="button"
                            className={`px-3 py-2 rounded-lg font-medium bg-gray-100 text-sm text-left ${filterCategories.includes(category)
                                ? "ring-2 ring-orange-500 bg-orange-50"
                                : ""
                              }`}
                            onClick={() => {
                              if (filterCategories.includes(category)) {
                                setFilterCategories(
                                  filterCategories.filter((c: string) => c !== category)
                                );
                              } else {
                                setFilterCategories([
                                  ...filterCategories,
                                  category,
                                ]);
                              }
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
        
        {/* Sticky Bottom Buttons */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleApplyFilters}
              disabled={isLoading}
              type="button"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}