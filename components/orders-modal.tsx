"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect, useCallback } from "react"
import { formatDate } from "@/lib/utils"

interface OrdersModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OrdersModal({ isOpen, onClose }: OrdersModalProps) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ORDERS_PER_PAGE = 6

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
    }
  }, [isOpen, fetchOrderHistory])

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE)
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  )

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
                {paginatedOrders.map((order) => (
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
                          ${order.totalPrice}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.products.map((product, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{product.name} x{product.quantity}</span>
                            <span className="text-gray-900">${product.price}</span>
                          </div>
                        ))}
                      </div>

                      {order.orderComment && (
                        <div className="mt-3 bg-yellow-50 rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <h4 className="text-xs font-medium text-gray-900">Notes</h4>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{order.orderComment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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