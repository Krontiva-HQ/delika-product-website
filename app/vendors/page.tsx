'use client';

import { useState, useEffect } from 'react';
import { StoreHeader } from '@/components/store-header';
import { VendorGrid } from '@/components/vendor-grid';

interface VendorData {
  Restaurants: any[];
  Groceries: any[];
  Pharmacies: any[];
  Ratings: any[];
}

export default function VendorsPage() {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/allData');
        
        if (!response.ok) {
          throw new Error('Failed to fetch vendor data');
        }
        
        const data = await response.json();
        setVendorData(data);
        
        // Store allData in localStorage for detail pages to access
        localStorage.setItem('allData', JSON.stringify(data));
        console.log('Stored allData in localStorage for detail pages');
        
        // Console log the complete data structure
        console.log('=== COMPLETE ALLDATA STRUCTURE ===');
        console.log('Total Restaurants:', data.Restaurants?.length || 0);
        console.log('Total Groceries:', data.Groceries?.length || 0);
        console.log('Total Pharmacies:', data.Pharmacies?.length || 0);
        console.log('Total Ratings:', data.Ratings?.length || 0);
        
        // Log sample data from each category
        if (data.Groceries && data.Groceries.length > 0) {
          console.log('=== SAMPLE GROCERY DATA ===');
          const sampleGrocery = data.Groceries[0];
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
        
        if (data.Pharmacies && data.Pharmacies.length > 0) {
          console.log('=== SAMPLE PHARMACY DATA ===');
          const samplePharmacy = data.Pharmacies[0];
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
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
      <StoreHeader vendorData={vendorData} />
      
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