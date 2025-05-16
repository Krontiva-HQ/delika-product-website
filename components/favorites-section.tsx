"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { MapPin, ChevronLeft, Heart } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { BranchPage } from "@/components/branch-page"
import { calculateDistance } from "@/utils/distance"
import { updateFavorites } from "@/lib/api"

interface Branch {
  id: string
  branchName: string
  branchLocation: string
  branchCity: string
  branchLatitude: string
  branchLongitude: string
  _restaurantTable: Array<{
    restaurantName: string
    restaurantLogo: {
      url: string
    }
  }>
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
  const [favoriteBranches, setFavoriteBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'favorites' | 'branch'>('favorites');
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [removingFavorites, setRemovingFavorites] = useState<Set<string>>(new Set());

  // Update localStorage with filtered count for AuthNav
  useEffect(() => {
    localStorage.setItem('filteredFavoritesCount', favoriteBranches.length.toString());
  }, [favoriteBranches]);

  useEffect(() => {
    // Load saved location from localStorage
    const savedLocationData = localStorage.getItem('userLocationData');
    if (savedLocationData) {
      const { lat, lng } = JSON.parse(savedLocationData);
      setUserCoordinates({ lat, lng });
    }
  }, []);

  // Filter branches by distance
  const filterBranchesByDistance = (branches: Branch[], userLat?: number, userLng?: number) => {
    if (!userLat || !userLng) return branches;

    return branches.filter(branch => {
      const distance = calculateDistance(
        userLat,
        userLng,
        parseFloat(branch.branchLatitude),
        parseFloat(branch.branchLongitude)
      );
      return distance <= 8; // Only show branches within 8km
    });
  };

  useEffect(() => {
    let isMounted = true; // For cleanup

    async function fetchFavorites() {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}') as UserData;
        
        if (!userData.id) {
          if (isMounted) {
            setFavoriteBranches([]);
            setIsLoading(false);
          }
          return;
        }

        // Fetch user's favorites from new endpoint
        const customerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_CUSTOMER_DETAILS_API}?userId=${userData.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!customerResponse.ok) {
          throw new Error(`HTTP error! status: ${customerResponse.status}`);
        }

        const customerData = await customerResponse.json();
        const favoriteIds = customerData.favoriteRestaurants?.map((fav: FavoriteRestaurant) => fav.branchName) || [];

        if (favoriteIds.length === 0) {
          if (isMounted) {
            setFavoriteBranches([]);
            setIsLoading(false);
          }
          return;
        }

        // Fetch all branches
        const branchesResponse = await fetch(process.env.NEXT_PUBLIC_BRANCHES_API!);

        if (!branchesResponse.ok) {
          throw new Error(`HTTP error! status: ${branchesResponse.status}`);
        }

        const allBranches = await branchesResponse.json();
        
        // Filter branches to only include favorites
        let userFavorites = allBranches.filter((branch: Branch) => 
          favoriteIds.includes(branch.id)
        );

        // Further filter by distance if user location is available
        if (userCoordinates) {
          userFavorites = filterBranchesByDistance(
            userFavorites,
            userCoordinates.lat,
            userCoordinates.lng
          );
        }

        if (isMounted) {
          setFavoriteBranches(userFavorites);
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load favorite restaurants');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchFavorites();

    return () => {
      isMounted = false; // Cleanup to prevent setting state on unmounted component
    };
  }, [userCoordinates]); // Re-run when user coordinates change

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

  // Handle removing from favorites
  const handleRemoveFavorite = async (branchId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent branch selection when clicking unlike
    
    try {
      // Add to removing set for UI feedback
      setRemovingFavorites(prev => new Set(prev).add(branchId));
      
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}') as UserData;
      
      if (!userData.id) {

        return;
      }
      
      // Call the favorites API to remove the restaurant
      await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/customer/favorites/add/remove/restaurant', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: userData.id,
          branchName: branchId,
          liked: false,
          field_value: userData.id
        }),
      });
      
      // Update local state to remove the branch from favorites
      setFavoriteBranches(prevBranches => 
        prevBranches.filter(branch => branch.id !== branchId)
      );
      
      // Update count in localStorage
      localStorage.setItem('filteredFavoritesCount', 
        (favoriteBranches.length - 1).toString()
      );
      
      // Show feedback
      const feedbackElem = document.createElement('div');
      feedbackElem.textContent = 'Removed from favorites';
      feedbackElem.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-md z-50';
      document.body.appendChild(feedbackElem);
      setTimeout(() => document.body.removeChild(feedbackElem), 2000);
      
    } catch (error) {

      // Show error feedback
      const feedbackElem = document.createElement('div');
      feedbackElem.textContent = 'Failed to remove from favorites';
      feedbackElem.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-md z-50';
      document.body.appendChild(feedbackElem);
      setTimeout(() => document.body.removeChild(feedbackElem), 2000);
    } finally {
      // Remove from removing set
      setRemovingFavorites(prev => {
        const updated = new Set(prev);
        updated.delete(branchId);
        return updated;
      });
    }
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
        title="No Nearby Favorites" 
        description={userCoordinates 
          ? "None of your favorite restaurants are within 8km of your location." 
          : "You haven't added any restaurants to your favorites yet."} 
        icon="store"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Favorite Restaurants</h1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6">
        {favoriteBranches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
            onClick={() => handleBranchSelect(branch)}
          >
            <button 
              className={`absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-200 transform ${
                removingFavorites.has(branch.id)
                  ? 'opacity-50 pointer-events-none'
                  : favoriteBranches.some(b => b.id === branch.id)
                  ? 'text-orange-500 scale-110 hover:scale-105'
                  : 'text-gray-400 hover:text-orange-500 hover:bg-white hover:scale-105'
              }`}
              onClick={(e) => handleRemoveFavorite(branch.id, e)}
              aria-label="Remove from favorites"
              disabled={removingFavorites.has(branch.id)}
            >
              <Heart className={`w-5 h-5 transition-all duration-200 ${favoriteBranches.some(b => b.id === branch.id) ? 'fill-current' : ''}`} />
            </button>
            <div className="relative h-48">
              <Image
                src={branch._restaurantTable[0].restaurantLogo.url}
                alt={branch._restaurantTable[0].restaurantName}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold truncate text-gray-900">
                {branch._restaurantTable[0].restaurantName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{branch.branchName}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{branch.branchLocation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 