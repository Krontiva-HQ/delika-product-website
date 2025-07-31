"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronDown, User, LogOut, ClipboardList, Heart } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { OrdersModal } from "@/components/orders-modal"
import { FavoritesModal } from "@/components/favorites-modal"

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
  fromAddress: string;
  fromLatitude: string;
  fromLongitude: string;
}

interface OrderDropOff {
  toAddress: string;
  toLatitude: string;
  toLongitude: string;
}

interface OrderHistory {
  id: string;
  customerName: string;
  customerPhoneNumber: string;
  pickupName: string;
  dropoffName: string;
  orderPrice: string;
  deliveryPrice: string;
  totalPrice: string;
  orderComment: string;
  orderStatus: string;
  orderDate: string;
  orderReceivedTime: number;
  completed: boolean;
  paymentStatus: string;

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
  
  const [filteredFavoritesCount, setFilteredFavoritesCount] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
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
    // Redirect to home page after logout
    window.location.href = '/';
  };

  const handleOrdersClick = () => {
    setIsOrdersModalOpen(true);
  };

  const handleFavoritesClick = () => {
    setIsFavoritesModalOpen(true);
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

  const userName = userData?.fullName || userData?.customerTable?.[0]?.fullName;

  return (
    <>
      <div className="bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-16 border-b">
              <div className="flex items-center gap-8">
                <Link 
                  href="/"
                  className={`font-semibold ${currentView === 'stores' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Delika
                </Link>
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
                        <DropdownMenuItem onClick={handleOrdersClick}>
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleFavoritesClick}>
                          <Heart className="w-4 h-4 mr-2" />
                          Favorites ({filteredFavoritesCount})
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href="/settings" passHref>
                          <DropdownMenuItem>
                            Settings
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-red-600" onSelect={handleLogoutClick}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Logout</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to log out?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleConfirmLogout}>
                            Logout
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={onLoginClick}>
                      Login
                    </Button>
                    <Button size="sm" onClick={onSignupClick}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OrdersModal 
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />
      <FavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
      />
    </>
  );
}