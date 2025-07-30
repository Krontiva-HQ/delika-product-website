"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SettingsSection } from "@/components/settings-section";
import { UserData } from "@/components/auth-nav";

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
      <SettingsSection 
        userData={userData} 
        onUserDataUpdate={handleUserDataUpdate}
      />
    </div>
  );
} 