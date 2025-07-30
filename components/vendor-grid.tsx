'use client';

import { useState, useMemo } from 'react';
import { Heart, MapPin, Star, Clock, Truck, Expand } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isVendorOpen } from "@/lib/utils"
import { calculateDeliveryPrices } from "@/lib/api"
import { calculateDistance } from "@/lib/distance"

interface VendorData {
  Restaurants: any[];
  Groceries: any[];
  Pharmacies: any[];
  Ratings: any[];
}

interface VendorGridProps {
  vendorData: VendorData;
  searchQuery?: string;
  activeTab?: string;
  userCoordinates?: { lat: number; lng: number } | null;
}

// Calculate distance between two points using Haversine formula
function calculateVendorDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Helper function to safely convert values to numbers
const toNumber = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  const parsed = parseFloat(value?.toString());
  return isNaN(parsed) ? 0 : parsed;
}

// Function to calculate delivery fees for restaurant vendors
const calculateDeliveryFeesForVendor = async (vendor: any) => {
  try {
    console.log('[VendorGrid] Starting delivery fee calculation for vendor:', vendor.id);
    console.log('[VendorGrid] Vendor data structure:', {
      id: vendor.id,
      type: vendor.type,
      slug: vendor.slug,
      displaySlug: vendor.displaySlug,
      branchName: vendor.branchName,
      restaurantName: vendor.restaurantName,
      branchLatitude: vendor.branchLatitude,
      branchLongitude: vendor.branchLongitude,
      grocerybranchLatitude: vendor.grocerybranchLatitude,
      grocerybranchLongitude: vendor.grocerybranchLongitude,
      pharmacybranchLatitude: vendor.pharmacybranchLatitude,
      pharmacybranchLongitude: vendor.pharmacybranchLongitude
    });
    
    // Get user location from localStorage
    const locationData = localStorage.getItem('userLocationData');
    if (!locationData) {
      console.log('[VendorGrid] No user location data found, skipping delivery calculation');
      return;
    }

    const { lat, lng } = JSON.parse(locationData);
    
    // Get branch coordinates based on vendor type
    let branchLat, branchLng;
    
    if (vendor.type === 'restaurant') {
      branchLat = parseFloat(vendor.branchLatitude);
      branchLng = parseFloat(vendor.branchLongitude);
    } else if (vendor.type === 'grocery') {
      branchLat = parseFloat(vendor.grocerybranchLatitude);
      branchLng = parseFloat(vendor.grocerybranchLongitude);
    } else if (vendor.type === 'pharmacy') {
      branchLat = parseFloat(vendor.pharmacybranchLatitude);
      branchLng = parseFloat(vendor.pharmacybranchLongitude);
    } else {
      // Fallback to any available coordinates
      branchLat = parseFloat(vendor.branchLatitude || vendor.grocerybranchLatitude || vendor.pharmacybranchLatitude);
      branchLng = parseFloat(vendor.branchLongitude || vendor.grocerybranchLongitude || vendor.pharmacybranchLongitude);
    }
    
    if (isNaN(branchLat) || isNaN(branchLng)) {
      console.log('[VendorGrid] Invalid branch coordinates, skipping delivery calculation');
      return;
    }
    
    console.log('[VendorGrid] User coordinates:', { lat, lng });
    console.log('[VendorGrid] Branch coordinates:', { branchLat, branchLng });
    
    // Calculate distance
    const calculatedDistance = await calculateDistance(
      { latitude: lat, longitude: lng },
      { latitude: branchLat, longitude: branchLng }
    );
    
    console.log('[VendorGrid] Calculated distance:', calculatedDistance, 'km');

    // Get userId from localStorage userData
    let userId = '';
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        userId = parsedUserData.id || '';
      }
    } catch (error) {
      console.log('[VendorGrid] Could not retrieve userId from userData:', error);
    }

    // Prepare the payload for delivery price calculation
    const deliveryPayload = {
      pickup: {
        fromLatitude: branchLat.toString(),
        fromLongitude: branchLng.toString(),
      },
      dropOff: {
        toLatitude: lat.toString(),
        toLongitude: lng.toString(),
      },
      rider: true,
      pedestrian: true,
      total: 0, // No cart items yet
      subTotal: 0,
      userId: userId
    };

    console.log('[VendorGrid] Sending delivery payload to API:', deliveryPayload);

    // Get delivery prices from API
    const deliveryResponse = await calculateDeliveryPrices(deliveryPayload);
    const { 
      riderFee: newRiderFee, 
      pedestrianFee: newPedestrianFee,
      platformFee: newPlatformFee
    } = deliveryResponse;

    console.log('[VendorGrid] Delivery API response:', deliveryResponse);
    
    // Store delivery calculation results in localStorage with a generic key
    const deliveryCalculationData = {
      riderFee: toNumber(newRiderFee),
      pedestrianFee: toNumber(newPedestrianFee),
      platformFee: toNumber(newPlatformFee),
      distance: toNumber(calculatedDistance),
      cartTotal: 0,
      branchId: vendor.id,
      branchSlug: vendor.slug || vendor.displaySlug,
      vendorType: vendor.type,
      timestamp: Date.now(),
      deliveryType: 'rider' // Default to rider
    };
    localStorage.setItem('deliveryCalculationData', JSON.stringify(deliveryCalculationData));
    console.log('[VendorGrid] ✅ Stored delivery calculation data in localStorage with key: deliveryCalculationData', deliveryCalculationData);
    
  } catch (error) {
    console.error('[VendorGrid] Error calculating delivery fees:', error);
  }
};

export function VendorGrid({ vendorData, searchQuery = '', activeTab = 'all', userCoordinates }: VendorGridProps) {
  const router = useRouter();
  const [likedVendors, setLikedVendors] = useState<Set<string>>(new Set());
  const [searchRadius, setSearchRadius] = useState<number>(8); // Default 8km radius
  const [showExpandSearch, setShowExpandSearch] = useState<boolean>(false);

  // Handle vendor selection with data storage
  const handleVendorSelect = async (vendor: any) => {
    try {
      // Validate vendor data
      if (!vendor) {
        throw new Error('Vendor is undefined');
      }

      // Handle different data structures
      let vendorId = vendor.id;
      let vendorSlug = vendor.displaySlug;
      let vendorName = '';

      // Calculate delivery fees for all vendor types
      await calculateDeliveryFeesForVendor(vendor);

      // For restaurant vendors
      if (vendor.type === 'restaurant') {
        vendorName = vendor.restaurantName || vendor.displayName || 'Restaurant';
        
        // Store restaurant data
        localStorage.setItem('selectedBranchId', vendorId);
        localStorage.setItem('branchSlug', vendorSlug);
        localStorage.setItem('currentView', 'branch');
        await router.push(`/restaurants/${vendorSlug}`);
      }
      // For grocery vendors
      else if (vendor.type === 'grocery') {
        vendorName = vendor.groceryName || vendor.displayName || 'Grocery';
        
        // Get main shop data from Grocery object
        const mainShopId = vendor.Grocery?.id || vendorId;
        const mainShopSlug = vendor.Grocery?.slug || vendorSlug;
        
        // Store main shop data instead of branch data
        localStorage.setItem('selectedGroceryShopId', mainShopId);
        localStorage.setItem('selectedGroceryShopData', JSON.stringify({
          id: mainShopId,
          slug: mainShopSlug,
          groceryshopName: vendor.Grocery?.groceryshopName || 'Grocery Store',
          groceryshopLogo: vendor.Grocery?.groceryshopLogo,
          groceryshopAddress: vendor.Grocery?.groceryshopAddress,
          groceryshopPhoneNumber: vendor.Grocery?.groceryshopPhoneNumber,
          groceryshopEmail: vendor.Grocery?.groceryshopEmail,
          GroceryItem: vendor.GroceryItem || []
        }));
        
        console.log('Storing main grocery shop data:', {
          id: mainShopId,
          slug: mainShopSlug,
          name: vendor.Grocery?.groceryshopName,
          itemCount: vendor.GroceryItem?.length || 0
        });
        console.log('Navigating to grocery with main shop slug:', mainShopSlug);
        await router.push(`/groceries/${mainShopSlug}`);
      }
      // For pharmacy vendors
      else if (vendor.type === 'pharmacy') {
        vendorName = vendor.pharmacyName || vendor.displayName || 'Pharmacy';
        
        // Get main shop data from Pharmacy object
        const mainShopId = vendor.Pharmacy?.id || vendorId;
        const mainShopSlug = vendor.Pharmacy?.slug || vendorSlug;
        
        // Store main shop data instead of branch data
        localStorage.setItem('selectedPharmacyShopId', mainShopId);
        localStorage.setItem('selectedPharmacyShopData', JSON.stringify({
          id: mainShopId,
          slug: mainShopSlug,
          pharmacyName: vendor.Pharmacy?.pharmacyName || 'Pharmacy',
          pharmacyLogo: vendor.Pharmacy?.pharmacyLogo,
          pharmacyAddress: vendor.Pharmacy?.pharmacyAddress,
          pharmacyPhoneNumber: vendor.Pharmacy?.pharmacyPhoneNumber,
          pharmacyEmail: vendor.Pharmacy?.pharmacyEmail,
          PharmacyItem: vendor.PharmacyItem || []
        }));
        
        console.log('Storing main pharmacy shop data:', {
          id: mainShopId,
          slug: mainShopSlug,
          name: vendor.Pharmacy?.pharmacyName,
          itemCount: vendor.PharmacyItem?.length || 0
        });
        console.log('Navigating to pharmacy with main shop slug:', mainShopSlug);
        await router.push(`/pharmacy/${mainShopSlug}`);
      }
      // For other vendors (fallback)
      else {
        vendorName = vendor.displayName || vendor.name || 'Store';
        localStorage.setItem('selectedBranchId', vendorId);
        localStorage.setItem('branchSlug', vendorSlug);
        localStorage.setItem('currentView', 'branch');
        await router.push(`/restaurants/${vendorSlug}`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Combine all vendors with their type and calculate distances
  const allVendors = useMemo(() => {
    const vendors: any[] = [];
    
    // Add restaurants
    if (vendorData.Restaurants) {
      vendorData.Restaurants.forEach(restaurant => {
        let distance = null;
        if (userCoordinates && restaurant.branchLatitude && restaurant.branchLongitude) {
          try {
            const lat = parseFloat(restaurant.branchLatitude);
            const lng = parseFloat(restaurant.branchLongitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              distance = calculateVendorDistance(
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
        
        vendors.push({
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
          rating: getRatingForVendor(restaurant.id, vendorData.Ratings),
          deliveryTime: getDeliveryTimeForVendor(restaurant.id, vendorData.Ratings),
          pickup: getPickupForVendor(restaurant.id, vendorData.Ratings),
          distance,
        });
      });
    }
    
    // Add groceries
    if (vendorData.Groceries) {
      vendorData.Groceries.forEach(grocery => {
        let distance = null;
        if (userCoordinates && grocery.grocerybranchLatitude && grocery.grocerybranchLongitude) {
          try {
            const lat = parseFloat(grocery.grocerybranchLatitude);
            const lng = parseFloat(grocery.grocerybranchLongitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              distance = calculateVendorDistance(
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
        
        vendors.push({
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
          rating: getRatingForVendor(grocery.id, vendorData.Ratings),
          deliveryTime: getDeliveryTimeForVendor(grocery.id, vendorData.Ratings),
          pickup: getPickupForVendor(grocery.id, vendorData.Ratings),
          distance,
        });
        
        // Debug log for grocery data structure
        console.log('Grocery data structure:', {
          id: grocery.id,
          name: grocery.grocerybranchName,
          slug: grocery.slug,
          Grocery: grocery.Grocery,
          groceryshopLogo: grocery.Grocery?.groceryshopLogo,
          groceryshopName: grocery.Grocery?.groceryshopName
        });
      });
    }
    
    // Add pharmacies
    if (vendorData.Pharmacies) {
      vendorData.Pharmacies.forEach(pharmacy => {
        let distance = null;
        if (userCoordinates && pharmacy.pharmacybranchLatitude && pharmacy.pharmacybranchLongitude) {
          try {
            const lat = parseFloat(pharmacy.pharmacybranchLatitude);
            const lng = parseFloat(pharmacy.pharmacybranchLongitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              distance = calculateVendorDistance(
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
        
        vendors.push({
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
          rating: getRatingForVendor(pharmacy.id, vendorData.Ratings),
          deliveryTime: getDeliveryTimeForVendor(pharmacy.id, vendorData.Ratings),
          pickup: getPickupForVendor(pharmacy.id, vendorData.Ratings),
          distance,
        });
        
        // Debug log for pharmacy slug
        console.log('Pharmacy slug data:', {
          id: pharmacy.id,
          name: pharmacy.pharmacybranchName,
          slug: pharmacy.slug,
          displaySlug: pharmacy.slug
        });
      });
    }
    
    return vendors;
  }, [vendorData]);

  // Filter vendors based on search query, active tab, and distance
  const filteredVendors = useMemo(() => {
    let filtered = allVendors;
    
    // Filter by active tab (always filter by type since no "all" option)
    filtered = filtered.filter(vendor => vendor.type === activeTab);
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vendor => 
        vendor.displayName?.toLowerCase().includes(query) ||
        vendor.displayLocation?.toLowerCase().includes(query) ||
        vendor.restaurantName?.toLowerCase().includes(query) ||
        vendor.groceryName?.toLowerCase().includes(query) ||
        vendor.pharmacyName?.toLowerCase().includes(query)
      );
    }
    
    // Filter by distance if user coordinates are available
    if (userCoordinates) {
      filtered = filtered.filter(vendor => 
        vendor.distance === null || vendor.distance <= searchRadius
      );
    }
    
    return filtered;
  }, [allVendors, searchQuery, activeTab, userCoordinates, searchRadius]);

  // Calculate vendors outside current radius but within expanded radius
  const vendorsOutsideRadius = useMemo(() => {
    if (!userCoordinates) return [];
    
    return allVendors.filter(vendor => {
      if (vendor.type !== activeTab) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = vendor.displayName?.toLowerCase().includes(query) ||
          vendor.displayLocation?.toLowerCase().includes(query) ||
          vendor.restaurantName?.toLowerCase().includes(query) ||
          vendor.groceryName?.toLowerCase().includes(query) ||
          vendor.pharmacyName?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      return vendor.distance !== null && 
             vendor.distance > searchRadius && 
             vendor.distance <= searchRadius + 4; // 4km additional radius
    });
  }, [allVendors, searchQuery, activeTab, userCoordinates, searchRadius]);

  // Helper functions to get rating data
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

  const handleLikeToggle = (vendorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLikedVendors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        newSet.add(vendorId);
      }
      return newSet;
    });
  };

  const getVendorLink = (vendor: any) => {
    switch (vendor.type) {
      case 'restaurant':
        return `/restaurants/${vendor.displaySlug}`;
      case 'grocery':
        return `/groceries/${vendor.displaySlug}`;
      case 'pharmacy':
        return `/pharmacy/${vendor.displaySlug}`;
      default:
        return '#';
    }
  };

  const getVendorTypeLabel = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'Restaurant';
      case 'grocery':
        return 'Grocery';
      case 'pharmacy':
        return 'Pharmacy';
      default:
        return 'Vendor';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredVendors.map((vendor) => {
        // Check if vendor is open based on working hours
        const isOpen = isVendorOpen(vendor.activeHours);
        
        return (
        <div 
          key={vendor.id} 
          className={`group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${
            !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={(e) => {
            e.preventDefault();
            if (!isOpen) {
              // Don't navigate if vendor is closed
              return;
            }
            handleVendorSelect(vendor);
          }}
        >
          {/* Like Button */}
          <button
            onClick={(e) => handleLikeToggle(vendor.id, e)}
            className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Heart
              size={16}
              className={`${
                likedVendors.has(vendor.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              } transition-colors`}
            />
          </button>

          {/* Closed indicator */}
          {!isOpen && (
            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Closed
            </div>
          )}

          {/* Vendor Image */}
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={vendor.displayLogo || '/fallbackResto.jpg'}
              alt={vendor.displayName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/fallbackResto.jpg';
              }}
            />
            {/* Type Badge */}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                {getVendorTypeLabel(vendor.type)}
              </span>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
              {vendor.displayName}
            </h3>
            
            <p className="text-gray-600 text-xs mb-2 line-clamp-1 flex items-center gap-1">
              <MapPin size={12} />
              {vendor.displayLocation}
            </p>

            {/* Rating, Delivery, and Distance Info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-current" />
                <span className="text-gray-700">{vendor.rating}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {vendor.deliveryTime && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock size={12} />
                    <span>{vendor.deliveryTime}min</span>
                  </div>
                )}
                
                {vendor.distance !== null && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin size={12} />
                    <span>{vendor.distance.toFixed(1)}km</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup/Delivery Badge */}
            {vendor.pickup && (
              <div className="mt-2 flex items-center gap-1">
                <Truck size={12} className="text-green-600" />
                <span className="text-xs text-green-600">Pickup Available</span>
              </div>
            )}

            {/* Status indicator */}
            {!isOpen && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-500">Closed</span>
              </div>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
} 