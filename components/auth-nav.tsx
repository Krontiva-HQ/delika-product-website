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
import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserLocation {
  lat: string;
  long: string;
}

export interface DeliveryAddress {
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

export interface UserData {
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

interface OrderProduct {
  name: string;
  price: number;
  quantity: number;
}

interface OrderPickup {
  fromLatitude: number;
  fromLongitude: number;
  fromAddress: string;
}

interface OrderDropOff {
  toLatitude: string;
  toLongitude: string;
  toAddress: string;
}

interface OrderHistory {
  id: string;
  created_at: number;
  restaurantId: string;
  branchId: string;
  customerName: string;
  customerPhoneNumber: string;
  courierName: string;
  courierId: string;
  courierPhoneNumber: string;
  deliveryPrice: number;
  totalPrice: number;
  orderNumber: number;
  orderStatus: string;
  orderDate: string;
  orderPrice: number;
  pickupName: string;
  dropoffName: string;
  paymentStatus: string;
  dropOffCity: string;
  orderComment: string;
  products: OrderProduct[];
  pickup: OrderPickup[];
  dropOff: OrderDropOff[];
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
  const [filteredFavoritesCount, setFilteredFavoritesCount] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update favorites count when it changes in localStorage
  useEffect(() => {
    const updateFavoritesCount = () => {
      const count = parseInt(localStorage.getItem('filteredFavoritesCount') || '0', 10);
      setFilteredFavoritesCount(count);
    };

    // Initial count
    updateFavoritesCount();

    // Listen for changes in localStorage
    window.addEventListener('storage', updateFavoritesCount);

    // Check for changes every second (as a fallback)
    const interval = setInterval(updateFavoritesCount, 1000);

    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      clearInterval(interval);
    };
  }, []);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await onLogout();
    // Refresh the page after logout
    window.location.reload();
  };

  const fetchOrderHistory = useCallback(async () => {
    if (!userData?.id) return;

    setIsLoading(true);
    try {
      const url = new URL(process.env.NEXT_PUBLIC_GET_ORDER_PER_CUSTOMER_API || '');
      url.searchParams.append('userId', userData.id);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      const data = await response.json();
      setOrders(data);
      onViewChange('orders');
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData?.id, onViewChange]);

  // Add a function to format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-16 border-b">
            <div className="flex items-center gap-8">
              <button 
                onClick={onHomeClick}
                className={`font-semibold ${currentView === 'stores' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Vendors
              </button>
              {userName && (
                <>
                  <button 
                    onClick={fetchOrderHistory}
                    className={`${currentView === 'orders' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Orders
                  </button>
                  <button 
                    onClick={() => onViewChange('favorites')}
                    className={`${currentView === 'favorites' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Favorites ({filteredFavoritesCount})
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {userName ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center flex">
                        <span className="text-sm font-medium text-orange-600">
                          {userName[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium">
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
                      <DropdownMenuItem onSelect={() => onViewChange('settings')}>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onSelect={handleLogoutClick}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to log out? You will need to log in again to access your account.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button
                          variant="outline"
                          onClick={() => setIsLogoutModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleConfirmLogout}
                        >
                          Logout
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
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
    </div>
  )
} 