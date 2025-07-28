"use client";

import { X } from "lucide-react";

interface ActiveFiltersProps {
  filterTypes: string[];
  filterCategories: string[];
  filterRating: string;
  filterDeliveryTime: number | null;
  filterPickup: boolean;
  onClearFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filterTypes,
  filterCategories,
  filterRating,
  filterDeliveryTime,
  filterPickup,
  onClearFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters = [];

  // Type filter
  if (filterTypes.length > 0 && filterTypes[0] !== 'all') {
    activeFilters.push({
      type: 'type',
      label: filterTypes[0].charAt(0).toUpperCase() + filterTypes[0].slice(1),
      value: filterTypes[0],
    });
  }

  // Rating filter
  if (filterRating && filterRating !== 'all') {
    activeFilters.push({
      type: 'rating',
      label: `${filterRating} stars`,
      value: filterRating,
    });
  }

  // Delivery time filter
  if (filterDeliveryTime) {
    activeFilters.push({
      type: 'deliveryTime',
      label: `${filterDeliveryTime} min or less`,
      value: filterDeliveryTime.toString(),
    });
  }

  // Pickup filter
  if (filterPickup) {
    activeFilters.push({
      type: 'pickup',
      label: 'Pickup available',
      value: 'true',
    });
  }

  // Category filters
  filterCategories.forEach((category) => {
    activeFilters.push({
      type: 'category',
      label: category,
      value: category,
    });
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
        <button
          onClick={onClearAll}
          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.type}-${filter.value}-${index}`}
            className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 text-xs"
          >
            <span className="text-gray-700">{filter.label}</span>
            <button
              onClick={() => onClearFilter(filter.type, filter.value)}
              className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 