"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  onApply: () => void;
  onReset?: () => void;
  isLoading?: boolean;
}

// 1. Replace RESTAURANT_CATEGORIES with the provided food categories list
const FOOD_CATEGORIES = [
  "Alcohol", "Angwamo Dishes", "Appetizer", "Assorted Fried Rice", "Bake", "Bakery", "Beef Pizza", "Beer", "Beverages", "Boba - Fruit Tea (Reg / Large)", "Boba - Milk Tea (Reg/ Large)", "Boba Tea", "Boiled Yam", "Bread", "Breakfast", "Burger", "Burger Size", "Burgers", "Burgers & Sandwiches", "Cakes & Pastries", "Chicken", "Chicken Meals", "Chicken Noodles", "Chicken Pizza", "Classic Cocktails", "Classic Cocktails / Mocktails", "Cocktail Mixes", "Coffee", "Coffee & Tea", "Crispy Fries", "Croissant", "Day Time “Tucker” Menu", "Dessert", "Desserts & Sweets", "Doughnuts", "Drink", "Drinks", "Drinks / Beer", "Energy Drinks", "Evening Menu", "Fast Food", "Flour", "Food, Beverages & Tobacco", "Fresh Juice", "Fried Dishes", "Fries", "Fries / Chips", "Fruit Juice", "Fruit Tea", "Ghana Jollof", "Grills / Fried", "Hot Beverages", "Juice", "Juices", "Juices & Smoothies", "Khebab", "Krontiva Menu", "Light Soup", "Loaded Fries", "Local Dish", "Local Dishes", "Local Food", "Local Foods", "Lunch", "Lunch Special", "Main Menu", "Margherita Pizza", "Menu For Classic Plate- Rice Dishes", "Milk Series", "Milk Shakes", "Milkshake", "Milkshakes", "Morning Menu", "Nigerian Local Food", "Noodles", "Okro Soup", "Other Dishes", "Pastries", "Pizza", "Pork", "Protein", "Proteins", "Ribs", "Rice", "Rice & Grains", "Rice Dishes", "Rice Meals", "Rice Menu", "Rich Dishes", "Salad", "Salad Dressing", "Salads", "Sandwich", "Sandwiches", "Sauce / Soups", "Sauces", "Sausage Pizza", "Seafood Lovers", "Self- Treat Dishes", "Shawarma", "Side Dish", "Side Meals", "Signature Cocktails / Mocktails", "Smoothies", "Smoothies (Reg / Large)", "Snack", "Snack Bar", "Snack Bites", "Sobolo", "Soft Drinks", "Soup", "Soups", "Soups Only", "Spaghetti", "Special Stir Fries", "Springrolls And Samosa", "Starter", "Starters", "Starters / Appetizers / Small Bites", "Stew", "Stir Fry Noodles", "Stir Fry Spaghetti", "Swallow Dish", "Test Foods", "Traditional Foods", "Unique Series", "Vegetarian Pizza", "Waakye", "Wine", "Wrap", "Wrap & Sandwich", "Wraps", "Yam/Plantain", "면류 (Noodles)", "식사류 (Meal)", "한식요리 (Korean Dish_Meats & Others)"
];

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
}: FilterModalProps) {
  const router = useRouter();

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
                {[15, 20, 30].map((val) => (
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
                    <div className="font-semibold mb-1">Food</div>
                    <div className="grid grid-cols-4 gap-3 max-h-24 overflow-hidden">
                      {FOOD_CATEGORIES.map((category: string) => (
                        <button
                          key={category}
                          type="button"
                          className={`px-3 py-2 rounded-xl font-medium bg-gray-100 text-sm ${filterCategories.includes(category)
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
                    <div className="grid grid-cols-4 gap-3 max-h-24 overflow-hidden">
                      {GROCERY_CATEGORIES.map((category: string) => (
                        <button
                          key={category}
                          type="button"
                          className={`px-3 py-2 rounded-xl font-medium bg-gray-100 text-sm ${filterCategories.includes(category)
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
                    <div className="grid grid-cols-4 gap-3 max-h-24 overflow-hidden">
                      {PHARMACY_CATEGORIES.map((category: string) => (
                        <button
                          key={category}
                          type="button"
                          className={`px-3 py-2 rounded-xl font-medium bg-gray-100 text-sm ${filterCategories.includes(category)
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
                onClick={onApply}
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