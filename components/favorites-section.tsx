"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star, MapPin, Trash2, ChevronLeft } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { BranchPage } from "@/components/branch-page"

interface Branch {
  id: string
  branchName: string
  branchLocation: string
  branchCity: string
  _restaurantTable: Array<{
    restaurantName: string
    restaurantLogo: {
      url: string
    }
  }>
}

interface UserLocation {
  lat: string;
  long: string;
}

interface DeliveryAddress {
  fromAddress: string;
  fromLatitude: string;
  fromLongitude: string;
}

interface FavoriteRestaurant {
  branchName: string;
}

interface CustomerTable {
  id: string;
  userId: string;
  created_at: number;
  deliveryAddress: DeliveryAddress;
  favoriteRestaurants: FavoriteRestaurant[];
}

interface UserData {
  id: string;
  customerTable: CustomerTable[];
}

export function FavoritesSection() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [favoriteBranches, setFavoriteBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'favorites' | 'branch'>('favorites');

  useEffect(() => {
    // Check localStorage for selected branch on mount
    const savedBranchId = localStorage.getItem('selectedBranchId');
    const savedView = localStorage.getItem('currentView') as 'favorites' | 'branch' | null;
    if (savedBranchId && savedView === 'branch') {
      setSelectedBranchId(savedBranchId);
      setCurrentView('branch');
    }
  }, []);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setIsLoading(true);
        setError(null);

        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}') as UserData;
        const favoriteIds = userData.customerTable?.[0]?.favoriteRestaurants.map(fav => fav.branchName) || [];

        if (favoriteIds.length === 0) {
          setFavoriteBranches([]);
          setIsLoading(false);
          return;
        }

        // Fetch all branches
        const response = await fetch(
          'https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_branches_table',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allBranches = await response.json();
        
        // Filter branches to only include favorites
        const userFavorites = allBranches.filter((branch: Branch) => 
          favoriteIds.includes(branch.id)
        );

        setFavoriteBranches(userFavorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Failed to load favorite restaurants');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  // Handle branch selection
  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranchId(branch.id);
    setCurrentView('branch');
    localStorage.setItem('selectedBranchId', branch.id);
    localStorage.setItem('currentView', 'branch');
  };

  // Handle back to favorites
  const handleBackToFavorites = () => {
    setCurrentView('favorites');
    setSelectedBranchId(null);
    localStorage.removeItem('selectedBranchId');
    localStorage.removeItem('currentView');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your favorites...</div>;
  }

  if (error) {
    return <EmptyState title="Error" description={error} icon="store" />;
  }

  if (currentView === 'branch' && selectedBranchId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={handleBackToFavorites}
          className="mb-4 text-orange-500 hover:text-orange-600 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Favorites
        </button>
        <BranchPage params={{ id: selectedBranchId }} />
      </div>
    );
  }

  if (favoriteBranches.length === 0) {
    return (
      <EmptyState 
        title="No Favorites Yet" 
        description="You haven't added any restaurants to your favorites yet." 
        icon="store"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Favorite Restaurants</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favoriteBranches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleBranchSelect(branch)}
          >
            <div className="relative h-48">
              <Image
                src={branch._restaurantTable[0].restaurantLogo.url}
                alt={branch._restaurantTable[0].restaurantName}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">
                {branch._restaurantTable[0].restaurantName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{branch.branchName}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{branch.branchLocation}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>4.5</span>
                  <span className="text-gray-600">(500+)</span>
                </div>
                <button 
                  className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent branch selection when clicking remove
                    // TODO: Implement remove from favorites functionality
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 