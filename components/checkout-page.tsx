"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Check, Plus, Minus, ArrowLeft, MapPin, Phone, User, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { CartItem } from "@/types/cart"
import { calculateDistance, calculateDeliveryFee } from "@/lib/distance"

interface CheckoutPageProps {
  cart: CartItem[]
  cartTotal: number
  onSubmitOrder: (customerInfo: CustomerInfo) => void
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
}

interface CustomerInfo {
  name: string
  phone: string
  address: string
  notes: string
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
}

export function CheckoutPage({
  cart,
  cartTotal,
  onSubmitOrder,
  onAddItem,
  onRemoveItem,
  menuCategories,
  branchId,
  branchName,
  restaurantName,
  branchCity,
  onBackToCart,
  branchLocation
}: CheckoutPageProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    notes: ""
  })
  const [formErrors, setFormErrors] = useState<Partial<CustomerInfo>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>(
    menuCategories?.[0]?.foodType || ""
  )
  const [branchDetails, setBranchDetails] = useState<BranchDetails | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(10) // Default fee
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    console.log('Loading customer info and location...');
    
    // Try to get the saved location first
    const savedLocation = localStorage.getItem('userLocation');
    console.log('Raw saved location:', savedLocation);
    
    if (savedLocation) {
      try {
        const locationData = JSON.parse(savedLocation);
        console.log('Parsed location data:', locationData);
        
        if (locationData.address) {
          console.log('Setting address:', locationData.address);
          setCustomerInfo(prev => {
            const updated = {
              ...prev,
              address: locationData.address
            };
            console.log('Updated customer info:', updated);
            return updated;
          });
        }
      } catch (e) {
        console.error('Error parsing saved location:', e);
      }
    }
    
    // Then try to load saved customer info
    const savedInfo = localStorage.getItem('customerInfo');
    console.log('Saved customer info:', savedInfo);
    
    if (savedInfo) {
      try {
        const parsedInfo = JSON.parse(savedInfo);
        setCustomerInfo(prev => ({
          ...prev,
          ...parsedInfo
        }));
      } catch (e) {
        console.error('Error parsing saved customer info:', e);
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
        console.error('Error fetching branch details:', error);
        setMenuError("Failed to load menu items");
      } finally {
        setIsLoadingMenu(false);
      }
    }

    fetchBranchDetails();
  }, [branchId, selectedCategory]);

  useEffect(() => {
    const calculateFee = async () => {
      try {
        // Get user's location from localStorage
        const locationData = localStorage.getItem('userLocation')
        if (!locationData || !branchLocation) {
          setDeliveryFee(10) // Default fee if no location data
          return
        }

        const userLocation = JSON.parse(locationData)
        const distance = await calculateDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: branchLocation.latitude, longitude: branchLocation.longitude }
        )
        
        setDistance(distance)
        setDeliveryFee(calculateDeliveryFee(distance))
      } catch (error) {
        console.error('Error calculating delivery fee:', error)
        setDeliveryFee(10) // Default fee on error
      }
    }

    calculateFee()
  }, [branchLocation])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      onSubmitOrder(customerInfo)
      setIsSubmitting(false)
      setIsSuccess(true)
      
      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  const currentCategory = branchDetails?._menutable?.find(
    cat => cat.foodType === selectedCategory
  );

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-8">Your order receipt has been sent to your phone.</p>
            <Link href={`/branch/${branchId}`}>
              <Button className="bg-orange-500 hover:bg-orange-600 h-12 px-8 font-medium">
                Return to Restaurant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBackToCart}
              className="flex items-center text-gray-600 hover:text-orange-500 font-medium transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Cart
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
            <div className="w-24" /> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                <div className="text-right">
                  <h3 className="font-medium text-gray-900">{restaurantName || 'Restaurant'}</h3>
                  <p className="text-sm text-gray-500">
                    {branchName} {branchCity ? `• ${branchCity}` : ''}
                  </p>
                </div>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Your cart is empty
                </div>
              ) : (
                <div className="divide-y">
                  {cart.map(item => (
                    <div key={item.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        {item.image && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-medium">
                        GH₵ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">GH₵ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <div className="flex items-center">
                    <span className="font-medium">GH₵ {deliveryFee.toFixed(2)}</span>
                    {distance > 0 && (
                      <span className="text-xs text-gray-500 ml-2">({distance.toFixed(1)}km)</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                  <span>Total</span>
                  <span>GH₵ {(cartTotal + deliveryFee).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Add More Items Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Add More Items</h2>
                {!isLoadingMenu && !menuError && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {branchDetails?._menutable?.map(category => (
                      <button
                        key={category.foodType}
                        onClick={() => setSelectedCategory(category.foodType)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                          selectedCategory === category.foodType
                            ? 'bg-orange-500 text-white'
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
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading menu items...</p>
                </div>
              ) : menuError ? (
                <div className="text-center py-8 text-red-500">{menuError}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCategory?.foods.map(item => {
                    const itemInCart = cart.find(cartItem => cartItem.id === item.name);
                    const quantity = itemInCart?.quantity || 0;

                    return (
                      <div
                        key={item.name}
                        className={`flex gap-4 p-4 rounded-xl border ${
                          !item.available ? 'opacity-60 bg-gray-50' : 'hover:border-orange-200'
                        }`}
                      >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          {item.foodImage?.url ? (
                            <Image
                              src={item.foodImage.url}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className={`object-cover ${!item.available ? 'grayscale' : ''}`}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-medium text-gray-900">GH₵ {item.price}</span>
                            {item.available ? (
                              quantity > 0 ? (
                                <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-full"
                                    onClick={() => onRemoveItem(item.name)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-4 text-center font-medium">{quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-full"
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
                                  className="bg-orange-500 hover:bg-orange-600"
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
                              <span className="text-sm text-gray-500">Not Available</span>
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

          {/* Right Column - Delivery Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-36">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Delivery Information</h2>
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
                    pattern="[A-Za-z\s]+"
                    title="Please enter only letters and spaces"
                    aria-invalid={!!formErrors.name}
                    className={`${
                      formErrors.name 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-orange-500 focus:border-orange-500"
                    } h-11 transition-colors`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500 mr-1" />
                      {formErrors.name}
                    </p>
                  )}
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
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    title="Please enter only numbers"
                    aria-invalid={!!formErrors.phone}
                    className={`${
                      formErrors.phone 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-orange-500 focus:border-orange-500"
                    } h-11 transition-colors`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500 mr-1" />
                      {formErrors.phone}
                    </p>
                  )}
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
                          ? "border-red-500" 
                          : "border-gray-200"
                      } bg-gray-50 cursor-not-allowed h-11`}
                    />
                  </div>
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500 mr-1" />
                      {formErrors.address}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
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
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm min-h-[100px] resize-none focus:border-orange-500 focus:ring-orange-500 transition-colors"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-medium transition-colors relative overflow-hidden group"
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center justify-center gap-2 group-hover:translate-y-[-100%] transition-transform duration-200">
                        <ShoppingBag className="h-5 w-5" />
                        Place Order • GH₵ {(cartTotal + deliveryFee).toFixed(2)}
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                        Confirm Order →
                      </span>
                    </>
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