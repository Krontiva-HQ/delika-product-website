"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect, useCallback } from "react"
import { formatDate } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  orderDate: string
  totalPrice: string
  orderPrice: string
  deliveryPrice: string
  paymentStatus: string
  orderStatus: string
  orderComment?: string
  restaurantName?: string
  groceryName?: string
  pharmacyName?: string
  restaurantId?: string
  groceryShopId?: string
  pharmacyShopId?: string
  pickupName?: string
  dropoffName?: string
  products: Array<{
    name: string
    quantity: string
    price: string
  }>
  dropOff: Array<{
    toAddress: string
  }>
  pickUp?: Array<{
    fromAddress: string
  }>
}

interface OrdersModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OrdersModal({ isOpen, onClose }: OrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [vendorData, setVendorData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const ORDERS_PER_PAGE = 6

  const fetchVendorData = useCallback(async () => {
    try {
      const [restaurantsResponse, groceriesResponse, pharmaciesResponse] = await Promise.all([
        fetch('https://api-server.krontiva.africa/api:uEBBwbSs/allData_restaurants'),
        fetch('https://api-server.krontiva.africa/api:uEBBwbSs/allData_groceries'),
        fetch('https://api-server.krontiva.africa/api:uEBBwbSs/allData_pharmacies')
      ])

      const [restaurantsData, groceriesData, pharmaciesData] = await Promise.all([
        restaurantsResponse.json(),
        groceriesResponse.json(),
        pharmaciesResponse.json()
      ])

      setVendorData({
        restaurants: restaurantsData.Restaurants || [],
        groceries: groceriesData.Groceries || [],
        pharmacies: pharmaciesData.Pharmacies || []
      })
    } catch (error) {
      console.error('Error fetching vendor data:', error)
    }
  }, [])

  const getStoreName = useCallback((order: Order) => {
    if (!vendorData) return 'Loading...'
    
    // Check for restaurant
    if (order.restaurantId) {
      const restaurant = vendorData.restaurants.find((r: any) => r.id === order.restaurantId)
      if (restaurant) {
        return restaurant.Restaurant?.[0]?.restaurantName || restaurant.branchName || 'Unknown Restaurant'
      }
    }
    
    // Check for grocery
    if (order.groceryShopId) {
      const grocery = vendorData.groceries.find((g: any) => g.id === order.groceryShopId)
      if (grocery) {
        return grocery.Grocery?.groceryshopName || grocery.grocerybranchName || 'Unknown Grocery'
      }
    }
    
    // Check for pharmacy
    if (order.pharmacyShopId) {
      const pharmacy = vendorData.pharmacies.find((p: any) => p.id === order.pharmacyShopId)
      if (pharmacy) {
        return pharmacy.Pharmacy?.pharmacyName || pharmacy.pharmacybranchName || 'Unknown Pharmacy'
      }
    }
    
    return 'Unknown Store'
  }, [vendorData])

  const fetchOrderHistory = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (!userData?.id) return

    setIsLoading(true)
    try {
      const url = new URL(process.env.NEXT_PUBLIC_GET_ORDER_PER_CUSTOMER_API || '')
      url.searchParams.append('userId', userData.id)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to fetch order history')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching order history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchOrderHistory()
      fetchVendorData()
    }
  }, [isOpen, fetchOrderHistory, fetchVendorData])

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE)
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  )

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order History</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders found</div>
          ) : (
                          <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.id
                    const storeName = getStoreName(order)
                    
                    return (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Order #{order.orderNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(order.orderDate)}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              GHC {order.totalPrice}
                            </div>
                          </div>

                          {/* Expandable Details Section */}
                          <div className="mt-4">
                            <button
                              onClick={() => toggleOrderExpansion(order.id)}
                              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              {isExpanded ? 'Hide Details' : 'Show Details'}
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                {/* Products List */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-xs font-medium text-gray-900 mb-2">Order Items</h4>
                                  <div className="space-y-2">
                                    {order.products.map((product, index) => (
                                      <div key={index} className="flex justify-between text-xs">
                                        <span className="text-gray-600">{product.name} x{product.quantity}</span>
                                        <span className="text-gray-900">GHC {product.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-xs font-medium text-gray-900 mb-2">Price Breakdown</h4>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal</span>
                                      <span className="text-gray-900">GHC {order.orderPrice || '0'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Delivery Fee</span>
                                      <span className="text-gray-900">GHC {order.deliveryPrice || '0'}</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-1 border-t border-gray-200">
                                      <span className="text-gray-900">Total</span>
                                      <span className="text-gray-900">GHC {order.totalPrice}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Store Information */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-xs font-medium text-gray-900 mb-2">Store Information</h4>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Store Name:</span>
                                      <span className="text-gray-900">{storeName}</span>
                                    </div>
                                    {order.pickupName && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Pickup Location:</span>
                                        <span className="text-gray-900">{order.pickupName}</span>
                                      </div>
                                    )}
                                    {order.dropoffName && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Location:</span>
                                        <span className="text-gray-900">{order.dropoffName}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Order Status */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-xs font-medium text-gray-900 mb-2">Order Status</h4>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Payment Status:</span>
                                      <span className={`font-medium ${
                                        order.paymentStatus === 'Paid' ? 'text-green-600' : 
                                        order.paymentStatus === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                                      }`}>
                                        {order.paymentStatus}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Order Status:</span>
                                      <span className="text-gray-900">{order.orderStatus || 'Processing'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Delivery Details */}
                                {order.pickUp && order.pickUp.length > 0 && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-xs font-medium text-gray-900 mb-2">Pickup Details</h4>
                                    <div className="space-y-1 text-xs">
                                      {order.pickUp.map((pickup, index) => (
                                        <div key={index} className="text-gray-600">
                                          {pickup.fromAddress}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {order.dropOff && order.dropOff.length > 0 && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-xs font-medium text-gray-900 mb-2">Delivery Details</h4>
                                    <div className="space-y-1 text-xs">
                                      {order.dropOff.map((dropoff, index) => (
                                        <div key={index} className="text-gray-600">
                                          {dropoff.toAddress}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Order Notes */}
                                {order.orderComment && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-xs font-medium text-gray-900 mb-2">Order Notes</h4>
                                    <p className="text-xs text-gray-600">{order.orderComment}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}