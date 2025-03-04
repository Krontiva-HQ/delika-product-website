"use client"

import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

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
  OTP: string;
  city: string;
  role: string;
  email: string;
  image: string | null;
  Status: boolean;
  onTrip: boolean;
  address: string;
  country: string;
  Location: UserLocation;
  branchId: string | null;
  deviceId: string;
  fullName: string;
  userName: string;
  tripCount: number;
  created_at: number;
  postalCode: string;
  addressFrom: string[];
  dateOfBirth: string | null;
  phoneNumber: string;
  restaurantId: string | null;
  customerTable: CustomerTable[];
}

interface AuthNavProps {
  userData?: UserData | null;
  onViewChange: (view: 'stores' | 'orders' | 'favorites' | 'profile' | 'settings') => void;
  currentView: string;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
  onHomeClick: () => void;
}

export function AuthNav({ 
  userData, 
  onViewChange, 
  currentView,
  onLoginClick,
  onSignupClick,
  onLogout,
  onHomeClick
}: AuthNavProps) {
  const userName = userData?.fullName || null;

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button 
              onClick={onHomeClick}
              className={`font-semibold ${currentView === 'stores' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </button>
            {userName && (
              <>
                <button 
                  onClick={() => onViewChange('orders')}
                  className={`${currentView === 'orders' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Orders
                </button>
                <button 
                  onClick={() => onViewChange('favorites')}
                  className={`${currentView === 'favorites' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Favorites ({userData?.customerTable[0]?.favoriteRestaurants.length || 0})
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {userName ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2">
                  <div className="hidden md:flex w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
                    <span className="text-sm font-medium text-orange-600">
                      {userName[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium max-w-[100px] md:max-w-none truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="px-2 py-1.5">
                    <div className="text-sm font-medium">{userData?.email}</div>
                    <div className="text-xs text-gray-500">{userData?.phoneNumber}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={() => onViewChange('profile')}
                    className={currentView === 'profile' ? 'bg-orange-50 text-orange-500' : ''}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onSelect={() => onViewChange('settings')}
                    className={currentView === 'settings' ? 'bg-orange-50 text-orange-500' : ''}
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <div className="text-xs text-gray-500">
                      <div>Role: {userData?.role}</div>
                      <div>Trip Count: {userData?.tripCount}</div>
                      <div>Member since: {new Date(userData?.created_at || 0).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onSelect={onLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={onLoginClick}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Button>
                <Button 
                  onClick={onSignupClick}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 