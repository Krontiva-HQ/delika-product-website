"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Plus, Minus, ArrowLeft, MapPin, Phone, User, FileText, ArrowRight } from "lucide-react"
import Image from "next/image"
import { CartItem as BaseCartItem } from "@/types/cart"
import { OrderFeedback } from "@/components/order-feedback"
import { submitOrder } from '@/lib/api'
import { toast } from "@/components/ui/use-toast"
import { Dialog } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { BranchPage } from "@/components/branch-page"

interface CartItem extends Omit<BaseCartItem, 'available'> {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
  available: boolean
  selectedExtras?: Array<{
    id: string
    name: string
    price: string
    quantity: number
  }>
}

interface CheckoutPageProps {
  cart: CartItem[]
  cartTotal: number
  onAddItem: (item: CartItem) => void
  onRemoveItem: (itemId: string) => void
  menuCategories: Array<{
    foodType: string
    foods: CartItem[]
  }>
  branchId: string
  branchName: string
  restaurantName: string
  branchCity: string
  onBackToCart: () => void
  branchLocation?: { latitude: number; longitude: number }
  branchPhone: string
  initialFullName?: string
  initialPhoneNumber?: string
}

interface CustomerInfo {
  name: string
  phone: string
  address: string
  notes: string
  rating?: number
}

interface BranchDetails {
  _menutable?: Array<{
    foodType: string
    foods: Array<{
      name: string
      price: string
      available: boolean
      description?: string
      foodImage?: { url: string }
    }>
    foodTypeImage?: { url: string }
  }>
  restaurant?: Array<{
    id: string
    restaurantLogo?: { url: string }
    restaurantName?: string
  }>
  branchLocation: string
  branchPhoneNumber: string
  branchName?: string
  branchCity?: string
  branchLatitude?: number
  branchLongitude?: number
  openTime?: string
  closeTime?: string
}

export function CheckoutPage({
  cart,
  cartTotal,
  onAddItem,
  onRemoveItem,
  menuCategories,
  branchId,
  branchName,
  restaurantName,
  branchCity,
  onBackToCart,
  branchLocation,
  branchPhone,
  initialFullName = "",
  initialPhoneNumber = ""
}: CheckoutPageProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: initialFullName,
    phone: initialPhoneNumber,
    address: "",
    notes: "",
    rating: 0
  })
  const [formErrors, setFormErrors] = useState<Partial<CustomerInfo>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>(
    menuCategories?.[0]?.foodType || ""
  )
  const [branchDetails, setBranchDetails] = useState<BranchDetails | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [deliveryType, setDeliveryType] = useState<'rider' | 'pedestrian' | 'pickup'>('rider')
  const platformFee = 3 // Platform fee of GHC3

  const router = useRouter();

  useEffect(() => {
    // Try to get the saved location first
    const savedLocation = localStorage.getItem('userLocation');
    
    if (savedLocation) {
      try {
        const locationData = JSON.parse(savedLocation);
        
        if (locationData.address) {
          setCustomerInfo(prev => {
            const updated = {
              ...prev,
              address: locationData.address
            };
            return updated;
          });
        }
      } catch (e) {
      }
    }
    
    // Then try to load saved customer info
    const savedInfo = localStorage.getItem('customerInfo');
    
    if (savedInfo) {
      try {
        const parsedInfo = JSON.parse(savedInfo);
        setCustomerInfo(prev => ({
          ...prev,
          ...parsedInfo
        }));
      } catch (e) {
      }
    }

    // Load the saved location from localStorage when component mounts
    const savedLocationData = localStorage.getItem('userLocationData')
    if (savedLocationData) {
      const { address } = JSON.parse(savedLocationData)
      setCustomerInfo(prev => ({
        ...prev,
        address: address
      }))
    }

    // Load the selected delivery type from localStorage
    const savedDeliveryType = localStorage.getItem('selectedDeliveryType')
    if (savedDeliveryType) {
      setDeliveryType(savedDeliveryType as 'rider' | 'pedestrian' | 'pickup')
    }
  }, []);

  useEffect(() => {
    async function fetchBranchDetails() {
      try {
        setIsLoadingMenu(true);
        setMenuError(null);
        
        const response = await fetch(
          `https://api-server.krontiva.africa/api:uEBBwbSs/get/branch/details?branchId=${branchId}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }
        );
        
        const data = await response.json();
        
        if (!data || !data._menutable) {
          setMenuError("Failed to load menu items");
          return;
        }

        setBranchDetails(data);
        // Only set selected category if it's not already set
        if (!selectedCategory && data._menutable?.[0]) {
          setSelectedCategory(data._menutable[0].foodType);
        }
      } catch (error) {
        setMenuError("Failed to load menu items");
      } finally {
        setIsLoadingMenu(false);
      }
    }

    fetchBranchDetails();
  }, [branchId, selectedCategory]);

  useEffect(() => {
    const storedFee = localStorage.getItem('checkoutDeliveryFee')
    const storedType = localStorage.getItem('selectedDeliveryType')
    if (storedFee && storedType) {
      setDeliveryFee(Number(storedFee))
      setDeliveryType(storedType as 'rider' | 'pedestrian' | 'pickup')
      // DO NOT clear here! Only clear after payment success.
    }
  }, [])

  // Sync customerInfo with initialFullName and initialPhoneNumber if they change
  useEffect(() => {
    setCustomerInfo((prev) => ({
      ...prev,
      name: initialFullName,
      phone: initialPhoneNumber,
    }));
  }, [initialFullName, initialPhoneNumber]);

  const validatePhoneNumber = (value: string) => {
    return /^\d+$/.test(value); // Only allows digits
  }

  const validateName = (value: string) => {
    return /^[A-Za-z\s]+$/.test(value); // Only allows letters and spaces
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Validation for phone numbers - only allow digits
    if (name === 'phone') {
      if (!validatePhoneNumber(value) && value !== '') {
        return; // Don't update if input contains non-digits
      }
    }
    
    // Validation for name - only allow letters and spaces
    if (name === 'name') {
      if (!validateName(value) && value !== '') {
        return; // Don't update if input contains numbers or special characters
      }
    }

    const updatedInfo = { ...customerInfo, [name]: value }
    setCustomerInfo(updatedInfo)
    localStorage.setItem('customerInfo', JSON.stringify(updatedInfo))
  }

  const validateForm = () => {
    const errors: Partial<CustomerInfo> = {}
    
    if (!customerInfo.name.trim()) {
      errors.name = "Full name is required"
    }
    
    if (!customerInfo.phone.trim()) {
      errors.phone = "Phone number is required"
    }
    
    if (!customerInfo.address.trim()) {
      errors.address = "Delivery address is required"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const locationData = JSON.parse(localStorage.getItem('userLocationData') || '{}');

      // Generate a unique order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate total amount in GHS including platform fee
      const totalAmount = cartTotal + deliveryFee + platformFee;

      // Prepare order data
      const orderData = {
        id: orderId,
        restaurantId: branchDetails?.restaurant?.[0]?.id || '',
        branchId: branchId,
        customerName: customerInfo.name,
        customerPhoneNumber: customerInfo.phone,
        pickupName: branchName,
        dropoffName: customerInfo.address,
        orderPrice: cartTotal.toString(),
        deliveryPrice: deliveryFee.toString(),
        platformFee: platformFee.toString(),
        totalPrice: totalAmount.toString(),
        orderComment: customerInfo.notes || '',
        products: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity.toString(),
          extras: item.selectedExtras?.map(extra => ({
            extrasName: extra.name,
            extrasQuantity: extra.quantity,
            extrasPrice: parseFloat(extra.price)
          })) || []
        })),
        pickup: [{
          fromLatitude: branchDetails?.branchLatitude?.toString() || '0',
          fromLongitude: branchDetails?.branchLongitude?.toString() || '0',
          fromAddress: branchName
        }],
        dropOff: [{
          toLatitude: locationData.lat?.toString() || '0',
          toLongitude: locationData.lng?.toString() || '0',
          toAddress: locationData.address || customerInfo.address
        }],
        foodAndDeliveryFee: true,
        payNow: true,
        payLater: false,
        paymentStatus: "Pending",
        orderStatus: "ReadyForPickup",
        trackingUrl: "",
        dropOffCity: branchCity || "",
        customerId: userData?.id || null,
        orderDate: new Date().toISOString().split('T')[0],
        orderReceivedTime: Date.now(),
        completed: false,
        Walkin: false,
        payVisaCard: false
      };

      // Submit order first
      const orderResponse = await submitOrder(orderData);
      
      // Store the full response in localStorage
      localStorage.setItem('orderSubmissionResponse', JSON.stringify({
        response: orderResponse,
        timestamp: new Date().toISOString()
      }));

      const backendOrderId = orderResponse?.result1?.id || orderId;
      // Redirect to /pay page with amount, orderId from backend and customerId
      router.push(`/pay?amount=${totalAmount}&orderId=${backendOrderId}&customerId=${userData?.id || ''}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategory = branchDetails?._menutable?.find(
    cat => cat.foodType === selectedCategory
  );

  const formatOrderForWhatsApp = () => {
    const items = cart.map(item => 
      `• ${item.name} x${item.quantity} - GH₵${(parseFloat(item.price) * item.quantity).toFixed(2)}`
    ).join('\n')

    return `🛍️ *New Order from ${customerInfo.name}*
📍 Delivery to: ${customerInfo.address}
📱 Phone: ${customerInfo.phone}
${customerInfo.notes ? `📝 Notes: ${customerInfo.notes}\n` : ''}
*Order Details:*
${items}

*Summary:*
Subtotal: GH₵${cartTotal.toFixed(2)}
Delivery Fee: GH₵${deliveryFee.toFixed(2)}
Platform Fee: GH₵${platformFee.toFixed(2)}
*Total: GH₵${(cartTotal + deliveryFee + platformFee).toFixed(2)}*`
  }

  const handlePayment = () => {
    const totalAmount = cartTotal + deliveryFee;
    // Open Paystack modal with the amount
  }

  // Validation for required fields
  const isPlaceOrderDisabled =
    isSubmitting ||
    cart.length === 0 ||
    !customerInfo.name.trim() ||
    !customerInfo.phone.trim() ||
    !customerInfo.address.trim();

  if (showFeedback) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <OrderFeedback branchId={branchId} customerPhone={customerInfo.phone} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm backdrop-blur-lg bg-white/80">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBackToCart}
              className="flex items-center text-gray-600 hover:text-orange-500 font-medium transition-colors group"
            >
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Back to Cart
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Complete Your Order</h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-orange-100/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                </div>
                <div className="text-right">
                  <h3 className="font-medium text-gray-900">{restaurantName || 'Restaurant'}</h3>
                  <p className="text-sm text-gray-500">
                    {branchName} {branchCity ? `• ${branchCity}` : ''}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        {item.image && (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full"
                            onClick={() => onAddItem(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="font-medium text-gray-900">
                          GH₵ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Extras Section */}
                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                      <div className="mt-2 pl-6 space-y-1 border-l-2 border-gray-200">
                        {item.selectedExtras.map(extra => (
                          <div key={extra.id} className="flex justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <span className="text-orange-500">+</span>
                              <span>{extra.quantity} × {extra.name}</span>
                            </div>
                            <span>GH₵ {(parseFloat(extra.price) * extra.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-medium text-gray-700 pt-1 border-t border-gray-100">
                          <span>Item Total</span>
                          <span>GH₵ {(
                            (parseFloat(item.price) * item.quantity) + 
                            (item.selectedExtras.reduce((sum, extra) => 
                              sum + (parseFloat(extra.price) * extra.quantity), 0))
                          ).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-dashed space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">GH₵ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Delivery Fee</span>
                    <span className="px-2 py-1 bg-orange-100 rounded-full text-xs text-orange-700">
                      {deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)}
                    </span>
                  </div>
                  <span className="font-medium">GH₵ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span className="font-medium">GH₵ {platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-4 border-t">
                  <span>Total</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-500">GH₵</span>
                    <span className="text-2xl text-orange-600">{(cartTotal + deliveryFee + platformFee).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add More Items Section */}
            <div className="bg-white rounded-3xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-orange-100/50 mt-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Add More Items</h2>
                </div>
                {!isLoadingMenu && !menuError && (
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                    {branchDetails?._menutable?.map(category => (
                      <button
                        key={category.foodType}
                        onClick={() => setSelectedCategory(category.foodType)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                          selectedCategory === category.foodType
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.foodType}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {isLoadingMenu ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading menu items...</p>
                </div>
              ) : menuError ? (
                <div className="text-center py-12 text-red-500">{menuError}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCategory?.foods.map(item => {
                    const itemInCart = cart.find(cartItem => cartItem.id === item.name);
                    const quantity = itemInCart?.quantity || 0;

                    return (
                      <div
                        key={item.name}
                        className={`flex gap-4 p-4 rounded-2xl border group transition-all duration-300 ${
                          !item.available 
                            ? 'opacity-60 bg-gray-50' 
                            : 'hover:border-orange-200 hover:shadow-sm hover:bg-orange-50/30'
                        }`}
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 group-hover:shadow-lg transition-shadow">
                          {item.foodImage?.url ? (
                            <Image
                              src={item.foodImage.url}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className={`object-cover ${!item.available ? 'grayscale' : ''} transition-transform group-hover:scale-110`}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-medium text-gray-900">GH₵ {item.price}</span>
                            {item.available ? (
                              quantity > 0 ? (
                                <div className="flex items-center gap-3 bg-orange-100/50 rounded-full p-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full hover:bg-orange-200/50"
                                    onClick={() => onRemoveItem(item.name)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-6 text-center font-medium">{quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full hover:bg-orange-200/50"
                                    onClick={() => onAddItem({
                                      id: item.name,
                                      name: item.name,
                                      price: item.price,
                                      quantity: 1,
                                      image: item.foodImage?.url,
                                      available: item.available
                                    })}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-orange-500 hover:bg-orange-600 shadow-sm hover:shadow-md transition-all"
                                  onClick={() => onAddItem({
                                    id: item.name,
                                    name: item.name,
                                    price: item.price,
                                    quantity: 1,
                                    image: item.foodImage?.url,
                                    available: item.available
                                  })}
                                >
                                  Add to Order
                                </Button>
                              )
                            ) : (
                              <span className="text-sm text-red-500 font-medium">Not Available</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Delivery Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-36 border border-orange-100/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Delivery Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      Full Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <Input
                    name="name"
                    value={customerInfo.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      Phone Number <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <Input
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Delivery Address <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <Input
                      name="address"
                      value={customerInfo.address}
                      readOnly
                      placeholder="Your delivery address will be shown here"
                      required
                      aria-invalid={!!formErrors.address}
                      className={`${
                        formErrors.address 
                          ? "border-red-300 bg-red-50" 
                          : "border-gray-200 bg-gray-50"
                      } h-12 rounded-xl cursor-not-allowed`}
                    />
                  </div>
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500 mr-1" />
                      {formErrors.address}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2 italic">
                    To change delivery address, please select a different location from the main page
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Additional Notes
                    </div>
                  </label>
                  <textarea
                    name="notes"
                    value={customerInfo.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions for delivery"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm min-h-[100px]"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-base font-medium transition-all relative overflow-hidden group rounded-xl shadow-orange-200/50 shadow-lg hover:shadow-xl"
                  disabled={isPlaceOrderDisabled}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      Processing...
                    </span>
                  ) : (
                    <div className="relative w-full h-full">
                      <span className="absolute inset-0 flex items-center justify-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform group-hover:-translate-y-full">
                        <ShoppingBag className="h-5 w-5" />
                        Place Order • GH₵ {(cartTotal + deliveryFee + platformFee).toFixed(2)}
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform translate-y-full group-hover:translate-y-0">
                        <span className="flex items-center gap-2">
                          Confirm Order
                          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}