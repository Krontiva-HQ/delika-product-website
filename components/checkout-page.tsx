"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Plus, Minus, ArrowLeft, MapPin, Phone, User, FileText, ArrowRight } from "lucide-react"
import Image from "next/image"
import { CartItem } from "@/types/cart"
import { calculateDistance, calculateDeliveryFee } from "@/lib/distance"
import { OrderFeedback } from "@/components/order-feedback"
import { submitOrder } from '@/lib/api'
import { toast } from "@/components/ui/use-toast"
import { Dialog } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

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
  branchPhone
}: CheckoutPageProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
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
  const [deliveryFee, setDeliveryFee] = useState(10)
  const [distance, setDistance] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [deliveryType, setDeliveryType] = useState<'rider' | 'pedestrian' | 'pickup'>('rider')

  const router = useRouter();

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
        const locationData = localStorage.getItem('userLocationData')
        if (!locationData || !branchLocation) {
          setDeliveryFee(15) // Default to minimum fee if no location data
          return
        }

        const { lat, lng } = JSON.parse(locationData)
        
        // Calculate distance between user and branch
        const distance = await calculateDistance(
          { latitude: lat, longitude: lng },
          { latitude: branchLocation.latitude, longitude: branchLocation.longitude }
        )
        
        setDistance(distance)
        const fee = calculateDeliveryFee(distance)
        setDeliveryFee(fee)
        
        console.log('Distance:', distance, 'km')
        console.log('Calculated fee:', fee, 'GH₵')
      } catch (error) {
        console.error('Error calculating delivery fee:', error)
        setDeliveryFee(15) // Default to minimum fee on error
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const locationData = JSON.parse(localStorage.getItem('userLocationData') || '{}');

      // Ensure coordinates are numbers
      const branchLat = parseFloat(branchDetails?.branchLatitude?.toString() || '0');
      const branchLng = parseFloat(branchDetails?.branchLongitude?.toString() || '0');
      const userLat = parseFloat(locationData.lat?.toString() || '0');
      const userLng = parseFloat(locationData.lng?.toString() || '0');

      // Calculate delivery distance
      const deliveryDistance = await calculateDistance(
        { latitude: branchLat, longitude: branchLng },
        { latitude: userLat, longitude: userLng }
      );

      const deliveryFee = calculateDeliveryFee(deliveryDistance);

      // Generate a unique order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate total amount in GHS
      const totalAmount = cartTotal + deliveryFee;

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
        totalPrice: totalAmount.toString(),
        orderComment: customerInfo.notes || '',
        products: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity.toString()
        })),
        pickup: [{
          fromLatitude: branchLat.toString(),
          fromLongitude: branchLng.toString(),
          fromAddress: branchName
        }],
        dropOff: [{
          toLatitude: userLat.toString(),
          toLongitude: userLng.toString(),
          toAddress: locationData.address || customerInfo.address
        }],
        foodAndDeliveryFee: true,
        payNow: true,
        payLater: false,
        paymentStatus: "Pending",
        orderStatus: "ReadyForPickup",
        deliveryDistance: deliveryDistance.toString(),
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
      await submitOrder(orderData);

      // Redirect to /pay page with amount and orderId
      router.push(`/pay?amount=${cartTotal + deliveryFee}&orderId=${orderId}`);
    } catch (error) {
      console.error('Error submitting order:', error);
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
*Total: GH₵${(cartTotal + deliveryFee).toFixed(2)}*`
  }

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
                  <div key={item.id} className="py-4 flex items-center justify-between">
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
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900">
                      GH₵ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
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
                    {distance > 0 && (
                      <span className="px-2 py-1 bg-green-100 rounded-full text-xs text-green-700">
                        {distance.toFixed(1)}km
                      </span>
                    )}
                  </div>
                  <span className="font-medium">GH₵ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-4 border-t">
                  <span>Total</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-500">GH₵</span>
                    <span className="text-2xl text-orange-600">{(cartTotal + deliveryFee).toFixed(2)}</span>
                  </div>
                </div>
              </div>
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
                  <Input
                    name="address"
                    value={customerInfo.address}
                    onChange={handleChange}
                    placeholder="Enter your delivery address"
                    required
                    className="h-12 rounded-xl"
                  />
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
                  disabled={isSubmitting || cart.length === 0}
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
                        Place Order • GH₵ {(cartTotal + deliveryFee).toFixed(2)}
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