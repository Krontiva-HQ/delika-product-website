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
                Shops
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
                      <div className="px-2 py-1.5">
                        <div className="text-xs text-gray-500">
                          <div>Role: {userData?.role}</div>
                          <div>Trip Count: {userData?.tripCount}</div>
                          <div>Member since: {new Date(userData?.created_at || 0).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
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
          
          {/* Replace the orders display section with this 2-column version */}
          {currentView === 'orders' && (
            <div className="py-8 max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                <div className="text-sm text-gray-500">
                  Showing {orders.length} orders
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="p-4">
                        {/* Header Section - Made more compact */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">#{order.orderNumber}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.orderStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                order.orderStatus === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                                order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {order.orderStatus}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">₵{Number(order.totalPrice).toFixed(2)}</div>
                            <p className="text-xs text-gray-500">{order.paymentStatus}</p>
                          </div>
                        </div>

                        {/* Order Details - More compact layout */}
                        <div className="space-y-4">
                          {/* Products Section */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                            <div className="space-y-2">
                              {order.products.map((product, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full text-xs">
                                      {product.quantity}
                                    </span>
                                    <span className="text-gray-700 text-sm">{product.name}</span>
                                  </div>
                                  <span className="font-medium text-gray-900 text-sm">
                                    ₵{(Number(product.price) * Number(product.quantity)).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Details - More compact */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-1 mb-1">
                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                </svg>
                                <h4 className="text-xs font-medium text-gray-900">Pickup</h4>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{order.pickupName}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-1 mb-1">
                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                </svg>
                                <h4 className="text-xs font-medium text-gray-900">Delivery</h4>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{order.dropoffName}</p>
                            </div>
                          </div>

                          {/* Order Notes - More compact */}
                          {order.orderComment && (
                            <div className="bg-yellow-50 rounded-lg p-3">
                              <div className="flex items-center gap-1 mb-1">
                                <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <h4 className="text-xs font-medium text-gray-900">Notes</h4>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{order.orderComment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                  <p className="text-gray-500">When you place orders, they will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 