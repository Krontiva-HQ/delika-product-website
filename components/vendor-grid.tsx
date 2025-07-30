'use client';

import { useState, useMemo, useCallback } from 'react';
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

// Function to calculate delivery fees for vendor on hover
const calculateDeliveryFeesForVendor = async (vendor: any) => {
  try {
    console.log('[VendorGrid] 🚀 Starting delivery fee calculation for vendor:', {
      id: vendor.id,
      type: vendor.type,
      name: vendor.displayName,
      slug: vendor.displaySlug
    });
    
    // Get user location from localStorage
    const locationData = localStorage.getItem('userLocationData');
    if (!locationData) {
      console.log('[VendorGrid] ❌ No user location data found, skipping delivery calculation');
      return;
    }

    const { lat, lng } = JSON.parse(locationData);
    console.log('[VendorGrid] 📍 User coordinates:', { lat, lng });
    
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
    
    console.log('[VendorGrid] 🏪 Branch coordinates:', { branchLat, branchLng });
    
    if (isNaN(branchLat) || isNaN(branchLng)) {
      console.log('[VendorGrid] ❌ Invalid branch coordinates, skipping delivery calculation');
      return;
    }
    
    // Calculate distance
    console.log('[VendorGrid] 📏 Calculating distance...');
    const calculatedDistance = await calculateDistance(
      { latitude: lat, longitude: lng },
      { latitude: branchLat, longitude: branchLng }
    );
    console.log('[VendorGrid] 📏 Calculated distance:', calculatedDistance, 'km');

    // Get userId from localStorage userData
    let userId = '';
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        userId = parsedUserData.id || '';
        console.log('[VendorGrid] 👤 User ID:', userId);
      }
    } catch (error) {
      console.log('[VendorGrid] ⚠️ Could not retrieve userId from userData:', error);
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

    console.log('[VendorGrid] 📤 Sending delivery payload to API:', deliveryPayload);

    // Get delivery prices from API
    console.log('[VendorGrid] 🌐 Calling delivery API...');
    const deliveryResponse = await calculateDeliveryPrices(deliveryPayload);
    const { 
      riderFee: newRiderFee, 
      pedestrianFee: newPedestrianFee,
      platformFee: newPlatformFee
    } = deliveryResponse;
    
    console.log('[VendorGrid] 📥 Delivery API response:', {
      riderFee: newRiderFee,
      pedestrianFee: newPedestrianFee,
      platformFee: newPlatformFee,
      distance: calculatedDistance
    });
    
    // Store delivery calculation results in localStorage with vendor-specific key
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
    
    // Store with vendor-specific key for quick access
    const vendorKey = `deliveryCalculationData_${vendor.type}_${vendor.id}`;
    localStorage.setItem(vendorKey, JSON.stringify(deliveryCalculationData));
    
    // Also store in the generic key for backward compatibility
    localStorage.setItem('deliveryCalculationData', JSON.stringify(deliveryCalculationData));
    
    console.log('[VendorGrid] 💾 Stored delivery calculation data:', {
      vendorId: vendor.id,
      vendorType: vendor.type,
      storageKey: vendorKey,
      data: deliveryCalculationData,
      timestamp: new Date(deliveryCalculationData.timestamp).toLocaleString()
    });
    
  } catch (error) {
    console.error('[VendorGrid] ❌ Error calculating delivery fees:', error);
  }
};

export function VendorGrid({ vendorData, searchQuery = '', activeTab = 'restaurants', userCoordinates }: VendorGridProps) {
  const router = useRouter();
  const [likedVendors, setLikedVendors] = useState<Set<string>>(new Set());
  const [searchRadius, setSearchRadius] = useState<number>(8); // Default 8km radius
  const [showExpandSearch, setShowExpandSearch] = useState<boolean>(false);
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);
  const [calculatingVendors, setCalculatingVendors] = useState<Set<string>>(new Set());

  // Memoized helper functions to get rating data
  const getRatingForVendor = useCallback((vendorId: string, ratings: any[]) => {
    const rating = ratings?.find(r => r.delika_branches_table_id === vendorId);
    return rating?.OverallRating || '0';
  }, []);

  const getDeliveryTimeForVendor = useCallback((vendorId: string, ratings: any[]) => {
    const rating = ratings?.find(r => r.delika_branches_table_id === vendorId);
    return rating?.deliveryTime || '';
  }, []);

  const getPickupForVendor = useCallback((vendorId: string, ratings: any[]) => {
    const rating = ratings?.find(r => r.delika_branches_table_id === vendorId);
    return rating?.pickup || false;
  }, []);

  // Handle vendor hover with pre-calculation
  const handleVendorHover = useCallback(async (vendor: any) => {
    if (!vendor || calculatingVendors.has(vendor.id)) {
      console.log('[VendorGrid] 🚫 Hover blocked - vendor invalid or already calculating:', vendor?.id);
      return; // Already calculating or invalid vendor
    }

    console.log('[VendorGrid] 🎯 Hover started for vendor:', {
      id: vendor.id,
      type: vendor.type,
      name: vendor.displayName,
      location: vendor.displayLocation,
      slug: vendor.displaySlug,
      coordinates: {
        lat: vendor.displayLatitude,
        lng: vendor.displayLongitude
      },
      userCoordinates: userCoordinates
    });

    setHoveredVendor(vendor.id);
    setCalculatingVendors(prev => new Set([...prev, vendor.id]));

    try {
      // Check if we already have cached delivery data for this vendor
      const vendorKey = `deliveryCalculationData_${vendor.type}_${vendor.id}`;
      const cachedData = localStorage.getItem(vendorKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const isStale = Date.now() - parsed.timestamp > 5 * 60 * 1000; // 5 minutes
        
        console.log('[VendorGrid] 📦 Found cached delivery data:', {
          vendorId: vendor.id,
          vendorType: vendor.type,
          cachedData: parsed,
          isStale: isStale,
          ageMinutes: Math.round((Date.now() - parsed.timestamp) / 60000)
        });
        
        if (!isStale) {
          console.log('[VendorGrid] ✅ Using cached delivery data for vendor:', vendor.id);
          return;
        } else {
          console.log('[VendorGrid] ⏰ Cached data is stale, recalculating...');
        }
      } else {
        console.log('[VendorGrid] ❌ No cached data found, calculating fresh...');
      }

      console.log('[VendorGrid] 🔄 Starting delivery calculation for vendor:', vendor.id);
      // Calculate delivery fees on hover
      await calculateDeliveryFeesForVendor(vendor);
      
      // Log the newly calculated data
      const newCachedData = localStorage.getItem(vendorKey);
      if (newCachedData) {
        const newParsed = JSON.parse(newCachedData);
        console.log('[VendorGrid] ✅ New delivery calculation completed:', {
          vendorId: vendor.id,
          vendorType: vendor.type,
          calculatedData: newParsed,
          timestamp: new Date(newParsed.timestamp).toLocaleString()
        });
      }
      
    } catch (error) {
      console.error('[VendorGrid] ❌ Error calculating delivery fees on hover:', error);
    } finally {
      setCalculatingVendors(prev => {
        const newSet = new Set(prev);
        newSet.delete(vendor.id);
        return newSet;
      });
      console.log('[VendorGrid] 🏁 Hover calculation completed for vendor:', vendor.id);
    }
  }, [calculatingVendors, userCoordinates]);

  // Handle vendor hover end
  const handleVendorHoverEnd = useCallback(() => {
    console.log('[VendorGrid] 👋 Hover ended for vendor:', hoveredVendor);
    setHoveredVendor(null);
  }, [hoveredVendor]);

  // Process only the active tab vendors for display
  const processedVendors = useMemo(() => {
    const vendors: any[] = [];
    
    // Only process vendors for the active tab to optimize performance
    if (activeTab === 'restaurants' && vendorData.Restaurants) {
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
    } else if (activeTab === 'groceries' && vendorData.Groceries) {
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
      });
    } else if (activeTab === 'pharmacies' && vendorData.Pharmacies) {
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
      });
    }
    
    return vendors;
  }, [vendorData, activeTab, userCoordinates, getRatingForVendor, getDeliveryTimeForVendor, getPickupForVendor]);

  // Filter vendors based on search query and distance
  const filteredVendors = useMemo(() => {
    let filtered = processedVendors;
    
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
  }, [processedVendors, searchQuery, userCoordinates, searchRadius]);

  // Handle vendor selection with data storage (now uses pre-calculated data)
  const handleVendorSelect = useCallback(async (vendor: any) => {
    try {
      // Validate vendor data
      if (!vendor) {
        throw new Error('Vendor is undefined');
      }

      console.log('[VendorGrid] 🖱️ Vendor clicked:', {
        id: vendor.id,
        type: vendor.type,
        name: vendor.displayName,
        slug: vendor.displaySlug
      });

      // Check if we have pre-calculated delivery data
      const vendorKey = `deliveryCalculationData_${vendor.type}_${vendor.id}`;
      const cachedData = localStorage.getItem(vendorKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const isStale = Date.now() - parsed.timestamp > 5 * 60 * 1000; // 5 minutes
        
        console.log('[VendorGrid] 📦 Found pre-calculated delivery data:', {
          vendorId: vendor.id,
          vendorType: vendor.type,
          cachedData: parsed,
          isStale: isStale,
          ageMinutes: Math.round((Date.now() - parsed.timestamp) / 60000)
        });
        
        if (!isStale) {
          console.log('[VendorGrid] ✅ Using pre-calculated delivery data for vendor:', vendor.id);
        } else {
          console.log('[VendorGrid] ⏰ Pre-calculated data is stale, recalculating...');
          await calculateDeliveryFeesForVendor(vendor);
        }
      } else {
        // If no pre-calculated data, calculate it now
        console.log('[VendorGrid] ❌ No pre-calculated data found, calculating now...');
        await calculateDeliveryFeesForVendor(vendor);
      }

      // Handle different data structures
      let vendorId = vendor.id;
      let vendorSlug = vendor.displaySlug;
      let vendorName = '';

      // For restaurant vendors
      if (vendor.type === 'restaurant') {
        vendorName = vendor.restaurantName || vendor.displayName || 'Restaurant';
        
        console.log('[VendorGrid] 🍽️ Navigating to restaurant:', {
          vendorId: vendorId,
          vendorSlug: vendorSlug,
          vendorName: vendorName
        });
        
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
        
        console.log('[VendorGrid] 🛒 Navigating to grocery:', {
          vendorId: vendorId,
          mainShopId: mainShopId,
          mainShopSlug: mainShopSlug,
          vendorName: vendorName
        });
        
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
        
        await router.push(`/groceries/${mainShopSlug}`);
      }
      // For pharmacy vendors
      else if (vendor.type === 'pharmacy') {
        vendorName = vendor.pharmacyName || vendor.displayName || 'Pharmacy';
        
        // Get main shop data from Pharmacy object
        const mainShopId = vendor.Pharmacy?.id || vendorId;
        const mainShopSlug = vendor.Pharmacy?.slug || vendorSlug;
        
        console.log('[VendorGrid] 💊 Navigating to pharmacy:', {
          vendorId: vendorId,
          mainShopId: mainShopId,
          mainShopSlug: mainShopSlug,
          vendorName: vendorName
        });
        
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
        
        await router.push(`/pharmacy/${mainShopSlug}`);
      }
      // For other vendors (fallback)
      else {
        vendorName = vendor.displayName || vendor.name || 'Store';
        
        console.log('[VendorGrid] 🏪 Navigating to generic store:', {
          vendorId: vendorId,
          vendorSlug: vendorSlug,
          vendorName: vendorName
        });
        
        localStorage.setItem('selectedBranchId', vendorId);
        localStorage.setItem('branchSlug', vendorSlug);
        localStorage.setItem('currentView', 'branch');
        await router.push(`/restaurants/${vendorSlug}`);
      }
      
      console.log('[VendorGrid] ✅ Navigation completed for vendor:', vendor.id);
    } catch (error) {
      console.error('[VendorGrid] ❌ Navigation error:', error);
    }
  }, [router]);

  const handleLikeToggle = useCallback((vendorId: string, e: React.MouseEvent) => {
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
  }, []);

  const getVendorTypeLabel = useCallback((type: string) => {
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
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredVendors.map((vendor) => {
        // Check if vendor is open based on working hours
        const isOpen = isVendorOpen(vendor.activeHours);
        const isHovered = hoveredVendor === vendor.id;
        const isCalculating = calculatingVendors.has(vendor.id);
        
        return (
        <div 
          key={vendor.id} 
          className={`group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${
            !isOpen ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
          } ${isHovered ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (!isOpen) {
              // Don't navigate if vendor is closed
              return;
            }
            handleVendorSelect(vendor);
          }}
          onMouseEnter={() => handleVendorHover(vendor)}
          onMouseLeave={handleVendorHoverEnd}
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

          {/* Calculating indicator */}
          {isCalculating && (
            <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Calculating...
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

            {/* Hover indicator */}
            {isHovered && !isCalculating && (
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Ready to order</span>
              </div>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
} 