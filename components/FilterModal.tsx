"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import React from "react";

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
  vendorData?: any;
  ratings?: any[];
  onApply: (filteredResults: any[]) => void;
  onReset?: () => void;
  isLoading?: boolean;
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
  vendorData,
  ratings,
  onApply,
  onReset,
  isLoading = false,
}: FilterModalProps) {
  
  // Helper function to get rating for a vendor
  const getRatingForVendor = (vendorId: string) => {
    if (!ratings) return '0';
    const rating = ratings.find(r => r.delika_branches_table_id === vendorId);
    return rating?.OverallRating || '0';
  };

  // Helper function to get delivery time for a vendor
  const getDeliveryTimeForVendor = (vendorId: string) => {
    if (!ratings) return null;
    const rating = ratings.find(r => r.delika_branches_table_id === vendorId);
    return rating?.deliveryTime || null;
  };

  // Helper function to get pickup status for a vendor
  const getPickupForVendor = (vendorId: string) => {
    if (!ratings) return false;
    const rating = ratings.find(r => r.delika_branches_table_id === vendorId);
    return rating?.pickup || false;
  };

  // Filter vendors based on current filters
  const getFilteredResults = () => {
    console.log('FilterModal: getFilteredResults called');
    console.log('FilterModal: vendorData:', vendorData);
    if (!vendorData) return [];

    let allVendors: any[] = [];

    // Add restaurants
    if (vendorData.Restaurants) {
      vendorData.Restaurants.forEach((restaurant: any) => {
        allVendors.push({
          ...restaurant,
          type: 'restaurant',
          displayName: restaurant.Restaurant?.[0]?.restaurantName || restaurant.branchName,
          displayLocation: restaurant.branchLocation,
          displayLogo: restaurant.Restaurant?.[0]?.restaurantLogo?.url,
          restaurantName: restaurant.Restaurant?.[0]?.restaurantName,
          rating: getRatingForVendor(restaurant.id),
          deliveryTime: getDeliveryTimeForVendor(restaurant.id),
          pickup: getPickupForVendor(restaurant.id),
        });
      });
    }

    // Add groceries
    if (vendorData.Groceries) {
      vendorData.Groceries.forEach((grocery: any) => {
        allVendors.push({
          ...grocery,
          type: 'grocery',
          displayName: grocery.Grocery?.groceryshopName || grocery.grocerybranchName,
          displayLocation: grocery.grocerybranchLocation,
          displayLogo: grocery.Grocery?.groceryshopLogo?.url,
          groceryName: grocery.Grocery?.groceryshopName,
          rating: getRatingForVendor(grocery.id),
          deliveryTime: getDeliveryTimeForVendor(grocery.id),
          pickup: getPickupForVendor(grocery.id),
        });
      });
    }

    // Add pharmacies
    if (vendorData.Pharmacies) {
      vendorData.Pharmacies.forEach((pharmacy: any) => {
        allVendors.push({
          ...pharmacy,
          type: 'pharmacy',
          displayName: pharmacy.Pharmacy?.pharmacyName || pharmacy.pharmacybranchName,
          displayLocation: pharmacy.pharmacybranchLocation,
          displayLogo: pharmacy.Pharmacy?.pharmacyLogo?.url,
          pharmacyName: pharmacy.Pharmacy?.pharmacyName,
          rating: getRatingForVendor(pharmacy.id),
          deliveryTime: getDeliveryTimeForVendor(pharmacy.id),
          pickup: getPickupForVendor(pharmacy.id),
        });
      });
    }

    // Apply filters
    let filtered = allVendors;

    // Filter by type
    if (filterTypes.length > 0) {
      filtered = filtered.filter(vendor => filterTypes.includes(vendor.type));
    }

    // Filter by rating
    if (filterRating && filterRating !== 'all') {
      filtered = filtered.filter(vendor => {
        const rating = parseFloat(vendor.rating);
        return rating >= parseFloat(filterRating);
      });
    }

    // Filter by delivery time
    if (filterDeliveryTime) {
      filtered = filtered.filter(vendor => {
        const deliveryTime = vendor.deliveryTime;
        return deliveryTime && deliveryTime <= filterDeliveryTime;
      });
    }

    // Filter by pickup
    if (filterPickup) {
      filtered = filtered.filter(vendor => vendor.pickup);
    }

    // Filter by categories
    if (filterCategories.length > 0) {
      filtered = filtered.filter(vendor => {
        // For restaurants, check food categories
        if (vendor.type === 'restaurant') {
          const restaurantItems = vendor.RestaurantItem || vendor.restaurantItem || [];
          return restaurantItems.some((item: any) => {
            // Check if the item's foodType matches any selected category
            if (item.foodType && filterCategories.includes(item.foodType)) {
              return true;
            }
            // Also check individual food names if they match category names
            if (item.foods && Array.isArray(item.foods)) {
              return item.foods.some((food: any) => 
                food.name && filterCategories.includes(food.name)
              );
            }
            return false;
          });
        }
        
        // For groceries, check product categories
        if (vendor.type === 'grocery') {
          const groceryItems = vendor.GroceryItem || vendor.groceryItem || [];
          return groceryItems.some((item: any) => {
            return item.category && filterCategories.includes(item.category);
          });
        }
        
        // For pharmacies, check product categories
        if (vendor.type === 'pharmacy') {
          const pharmacyItems = vendor.PharmacyItem || vendor.pharmacyItem || [];
          return pharmacyItems.some((item: any) => {
            return item.category && filterCategories.includes(item.category);
          });
        }
        
        return false;
      });
    }

    return filtered;
  };

  const handleApply = async () => {
    try {
      // Get filtered results
      let filteredResults = getFilteredResults();
      console.log('FilterModal: initial filteredResults:', filteredResults);
      
      // If no filters are applied, return first 3 results as a test
      if (filterTypes.length === 0 && filterCategories.length === 0 && filterRating === 'all' && !filterDeliveryTime && !filterPickup) {
        filteredResults = filteredResults.slice(0, 3);
        console.log('FilterModal: applying test filter, returning first 3 results:', filteredResults);
      }
      
      // Call onApply with the filtered results
      console.log('FilterModal: calling onApply with:', filteredResults);
      onApply(filteredResults);
      
      // The modal will be closed by the parent component after data is set
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="text-xl font-bold text-center">Filters</div>
          </div>
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
                  className={`px-5 py-2 rounded-xl font-medium bg-gray-100 ${
                    filterTypes[0] === type.value
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
                  className={`px-5 py-2 rounded-xl font-medium bg-gray-100 ${
                    filterRating === val
                      ? "ring-2 ring-orange-500 bg-orange-50"
                      : ""
                  }`}
                  onClick={() => setFilterRating(val)}
                >
                  {val} or more
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
                  className={`px-5 py-2 rounded-xl font-medium bg-gray-100 ${
                    filterDeliveryTime === val
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
                  <div className="font-semibold mb-1">Food</div>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                    {RESTAURANT_CATEGORIES.map((category: string) => (
                      <button
                        key={category}
                        type="button"
                        className={`px-3 py-2 rounded-xl font-medium bg-gray-100 text-sm ${
                          filterCategories.includes(category)
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
              )}
              {/* Grocery Categories */}
              {filterTypes.includes("grocery") && (
                <div>
                  <div className="font-semibold mb-1">Grocery</div>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                    {GROCERY_CATEGORIES.map((category: string) => (
                      <button
                        key={category}
                        type="button"
                        className={`px-3 py-2 rounded-xl font-medium bg-gray-100 text-sm ${
                          filterCategories.includes(category)
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
              )}
              {/* Pharmacy Categories */}
              {filterTypes.includes("pharmacy") && (
                <div>
                  <div className="font-semibold mb-1">Pharmacy</div>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                    {PHARMACY_CATEGORIES.map((category: string) => (
                      <button
                        key={category}
                        type="button"
                        className={`px-3 py-2 rounded-xl font-medium bg-gray-100 text-sm ${
                          filterCategories.includes(category)
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
              )}
            </div>
          </div>
          {/* Step navigation */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-medium"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={() => {
                console.log('Apply button clicked');
                handleApply();
              }}
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