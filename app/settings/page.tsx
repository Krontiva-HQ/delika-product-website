"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SettingsSection } from "@/components/settings-section";
import { StoreHeader } from "@/components/store-header";

// Define UserData interface locally to avoid import issues
interface CustomerTable {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  activeTill: string;
  profilePicture?: {
    url: string;
  };
  created_at: number;
  deliveryAddress?: {
    fromAddress: string;
    fromLatitude: string;
    fromLongitude: string;
  };
  favoriteRestaurants?: Array<{
    branchName: string;
  }>;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  activeTill: string;
  profilePicture?: {
    url: string;
  };
  created_at: number;
  deliveryAddress?: {
    fromAddress: string;
    fromLatitude: string;
    fromLongitude: string;
  };
  favoriteRestaurants?: Array<{
    branchName: string;
  }>;
  customerTable: CustomerTable[];
}

export default function SettingsPage() {
  const router = useRouter();
  
  // User data state
  const [userData, setUserData] = useState<UserData | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userData');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Check authentication on mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    
    if (!authToken || !storedUserData) {
      // Redirect to home page if not authenticated
      router.push('/');
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  }, [router]);

  // Handle user data updates
  const handleUserDataUpdate = (updatedUserData: UserData) => {
    setUserData(updatedUserData);
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
  };

  // Show loading state while checking authentication
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader hideCards={true} />
      <div className="container mx-auto px-4 py-8">
        <SettingsSection 
          userData={userData} 
          onUserDataUpdate={handleUserDataUpdate}
        />
      </div>
    </div>
  );
} 