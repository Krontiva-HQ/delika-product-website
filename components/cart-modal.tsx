"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Minus, Plus, Trash2, AlertCircle, Bike, User, Store, Lock, UserPlus, LogIn, AlertCircle as AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { CartItem } from "@/types/cart"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { calculateDistance } from "@/lib/distance"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { calculateDeliveryPrices, getCustomerDetails } from "@/lib/api"
import { Wallet } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { UserData } from "@/lib/api"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cart: (CartItem & {
    selectedExtras?: Array<{
      id: string
      name: string
      price: string
      quantity: number
    }>
  })[]
  onAddItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
  onDeleteItem: (itemId: string) => void
  cartTotal: number
  branchId: string
  branchName: string
  menuCategories: Array<{
    foodType: string
    foods: Array<CartItem>
  }>
  isAuthenticated: boolean
  branchLocation?: { latitude: number; longitude: number }
  onLoginClick?: () => void
  onCheckout?: () => void
  storeType?: 'restaurant' | 'pharmacy' | 'grocery'
  onLoginSuccess?: (userData: UserData) => void
  preCalculatedFees?: {
    riderFee: number
    pedestrianFee: number
    platformFee: number
    distance: number
    isLoadingDelivery: boolean
  }
}

export function CartModal({
  isOpen,
  onClose,
  cart,
  onAddItem,
  onRemoveItem,
  onDeleteItem,
  cartTotal,
  branchId,
  branchName,
  menuCategories,
  isAuthenticated,
  branchLocation,
  onLoginClick,
  onCheckout,
  storeType = 'restaurant',
  onLoginSuccess,
  preCalculatedFees
}: CartModalProps) {
  // Console logging for cart modal vs user auth status
  useEffect(() => {
    console.log('🛒 [CartModal] Modal Status:', {
      isOpen,
      isAuthenticated,
      storeType,
      branchId,
      branchName,
      cartLength: cart.length,
      cartTotal,
      mode: isAuthenticated ? 'Mode 1: Authenticated User' : 'Mode 2: Non-Authenticated User'
    });
  }, [isOpen, isAuthenticated, storeType, branchId, branchName, cart.length, cartTotal]);

  // Log authentication state changes
  useEffect(() => {
    console.log('🔐 [CartModal] Authentication State Changed:', {
      isAuthenticated,
      hasUserData: !!localStorage.getItem('userData'),
      hasAuthToken: !!localStorage.getItem('authToken'),
      userData: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') || '{}') : null
    });
  }, [isAuthenticated]);
  const router = useRouter()
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  
  // Authentication states for Mode 2
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Login states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showOTP, setShowOTP] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [authToken, setAuthToken] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  
  // Signup states
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupFullName, setSignupFullName] = useState("")
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email')
  const [signupAuthToken, setSignupAuthToken] = useState("")
  const [signupUserData, setSignupUserData] = useState<UserData | null>(null)
  const [showSignupOTP, setShowSignupOTP] = useState(false)
  const [signupOtpError, setSignupOtpError] = useState("")
  
  // Helper function to safely convert values to numbers
  const toNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    const parsed = parseFloat(value?.toString());
    return isNaN(parsed) ? 0 : parsed;
  }

  // Load stored delivery data or use pre-calculated fees
  const loadStoredDeliveryData = () => {
    // If pre-calculated fees are provided, use them
    if (preCalculatedFees) {
      console.log('[CartModal] Using pre-calculated fees from branch page:', preCalculatedFees);
      setRiderFee(preCalculatedFees.riderFee);
      setPedestrianFee(preCalculatedFees.pedestrianFee);
      setPlatformFee(preCalculatedFees.platformFee);
      setDistance(preCalculatedFees.distance);
      setIsLoadingDelivery(preCalculatedFees.isLoadingDelivery);
      return true; // Indicate that we loaded pre-calculated data
    }

    // Otherwise, try to load stored data using the generic key
    try {
      const storedData = localStorage.getItem('deliveryCalculationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        const now = Date.now();
        const dataAge = now - data.timestamp;
        const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        // Check if data is still valid (not too old)
        if (dataAge < maxAge) {
          console.log('[Delivery Calculation] Loading stored data with key: deliveryCalculationData', data);
          console.log('[Delivery Calculation] Data age:', Math.round(dataAge / 1000), 'seconds');
          
          setRiderFee(data.riderFee || 0);
          setPedestrianFee(data.pedestrianFee || 0);
          setPlatformFee(data.platformFee || 0);
          setDistance(data.distance || 0);
          setDeliveryType(data.deliveryType || 'rider');
          
          // Set delivery fee based on current delivery type
          const currentFee = data.deliveryType === 'rider' ? data.riderFee : data.pedestrianFee;
          setDeliveryFee(currentFee || 0);
          
          console.log('[Delivery Calculation] ✅ Loaded stored delivery data successfully');
          return true; // Indicate that we loaded stored data
        } else {
          console.log('[Delivery Calculation] Stored data is too old, will recalculate');
          localStorage.removeItem('deliveryCalculationData');
        }
      }
    } catch (error) {
      console.error('[Delivery Calculation] Error loading stored delivery data:', error);
      localStorage.removeItem('deliveryCalculationData');
    }
    return false; // Indicate that we need to calculate fresh data
  }

  // Helper function to clear stored delivery data when cart changes significantly
  const clearStoredDeliveryData = () => {
    try {
      const storedData = localStorage.getItem('deliveryCalculationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        const currentCartTotal = cart.reduce((total, item) => {
          const base = parseFloat(item.price) * item.quantity;
          const extrasTotal = (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0) * item.quantity;
          return total + base + extrasTotal;
        }, 0);
        
        // Clear stored data if cart total changed significantly (more than 10% difference)
        const cartTotalDifference = Math.abs(currentCartTotal - data.cartTotal);
        const cartTotalPercentage = (cartTotalDifference / data.cartTotal) * 100;
        
        if (cartTotalPercentage > 10) {
          console.log('[Delivery Calculation] Cart total changed significantly (', cartTotalPercentage.toFixed(1), '%), clearing stored data');
          localStorage.removeItem('deliveryCalculationData');
          return true; // Indicate that we cleared the data
        }
      }
    } catch (error) {
      console.error('[Delivery Calculation] Error checking stored delivery data:', error);
      localStorage.removeItem('deliveryCalculationData');
    }
    return false;
  }

  const [deliveryFee, setDeliveryFee] = useState<number>(0)
  const [distance, setDistance] = useState<number>(0)
  const [deliveryType, setDeliveryType] = useState<'rider' | 'pedestrian'>('rider')
  const [riderFee, setRiderFee] = useState<number>(0)
  const [pedestrianFee, setPedestrianFee] = useState<number>(0)
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [useWallet, setUseWallet] = useState(false)
  const [platformFee, setPlatformFee] = useState<number>(0) // Platform fee from NEXT_PUBLIC_DELIVERY_PRICE API

  useEffect(() => {
    console.log('📦 [CartModal] Cart Items:', cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedExtras: item.selectedExtras,
      total: (parseFloat(item.price) * item.quantity) + 
        (item.selectedExtras?.reduce((sum, extra) => 
          sum + (parseFloat(extra.price) * extra.quantity), 0) || 0)
    })));
  }, [cart]);

  useEffect(() => {
    // Recalculate total when delivery fee changes
    console.log('[Price Calculation] Delivery fee changed:', deliveryFee);
  }, [deliveryType, deliveryFee, platformFee, walletBalance, useWallet])

  // Update delivery fee when rider/pedestrian fees change
  useEffect(() => {
    if (riderFee > 0 || pedestrianFee > 0) {
      const currentFee = deliveryType === 'rider' ? riderFee : pedestrianFee;
      console.log('[Fee Update] Updating delivery fee to:', currentFee, 'for type:', deliveryType);
      setDeliveryFee(currentFee);
    }
  }, [riderFee, pedestrianFee, deliveryType])

  // Fetch delikaBalance from customer details API when modal opens
  useEffect(() => {
    const fetchDelikaBalance = async () => {
      if (isOpen && isAuthenticated) {
        try {
          // Get userId from localStorage userData
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            const userId = parsedUserData.id;
            
            if (userId) {
              console.log('[Wallet] Fetching customer details for userId:', userId);
              
              // Fetch customer details from API
              const customerDetails = await getCustomerDetails(userId);
              console.log('[Wallet] Customer details response:', customerDetails);
              
              // Extract delikaBalance from API response
              // Try different possible field names for delikaBalance
              const balance = customerDetails.delikaBalance || 
                             customerDetails.walletBalance || 
                             customerDetails.balance || 
                             customerDetails.wallet?.balance ||
                             customerDetails.customerTable?.[0]?.delikaBalance ||
                             customerDetails.customerTable?.[0]?.walletBalance ||
                             0;
              
              const numericBalance = toNumber(balance);
              console.log('[Wallet] Extracted delikaBalance:', balance, '-> Converted to numeric:', numericBalance);
              setWalletBalance(numericBalance);
              
              // Automatically use wallet if balance is available
              if (numericBalance > 0) {
                setUseWallet(true);
                console.log('[Wallet] Auto-enabling wallet usage - balance available:', numericBalance);
              }
            } else {
              console.log('[Wallet] No userId found in userData');
              setWalletBalance(0);
              setUseWallet(false);
            }
          } else {
            console.log('[Wallet] No userData found in localStorage');
            setWalletBalance(0);
            setUseWallet(false);
          }
        } catch (error) {
          console.error('[Wallet] Error fetching delikaBalance from API:', error);
          // Fallback to localStorage delikaBalance
                      try {
              const userData = localStorage.getItem('userData');
              if (userData) {
                const parsedUserData = JSON.parse(userData);
                                const balance = parsedUserData.delikaBalance || parsedUserData.walletBalance || parsedUserData.balance || 0;
                const numericBalance = toNumber(balance);
                console.log('[Wallet] Fallback to localStorage delikaBalance:', balance, '-> Converted to numeric:', numericBalance);
                setWalletBalance(numericBalance);
                
                // Automatically use wallet if balance is available
                if (numericBalance > 0) {
                  setUseWallet(true);
                  console.log('[Wallet] Auto-enabling wallet usage from localStorage - balance available:', numericBalance);
                }
            } else {
              setWalletBalance(0);
              setUseWallet(false);
            }
          } catch (fallbackError) {
            console.log('[Wallet] Fallback error, setting balance to 0:', fallbackError);
            setWalletBalance(0);
            setUseWallet(false);
          }
        }
      } else if (isOpen && !isAuthenticated) {
        // User not authenticated, set wallet balance to 0
        setWalletBalance(0);
        setUseWallet(false);
      }
    };

    fetchDelikaBalance();
  }, [isOpen, isAuthenticated])

  useEffect(() => {
    const calculateFee = async () => {
      try {
        setIsLoadingDelivery(true)
        const locationData = localStorage.getItem('userLocationData')
        
        console.log('[Delivery Calculation] Starting delivery fee calculation');
        console.log('[Delivery Calculation] Triggered by cart/total change - Cart items:', cart.length, 'Cart total:', cartTotal);
        console.log('[Delivery Calculation] Branch location prop:', branchLocation);
        console.log('[Delivery Calculation] Raw user location data:', locationData);
        console.log('[Delivery Calculation] Mode:', isAuthenticated ? 'Mode 1 (Authenticated)' : 'Mode 2 (Non-authenticated)');
        
        if (!locationData || !branchLocation) {
          console.log('[Delivery Calculation] Missing location data - locationData:', !!locationData, 'branchLocation:', !!branchLocation);
          setIsLoadingDelivery(false)
          return
        }

        const { lat, lng } = JSON.parse(locationData)
        const branchLat = parseFloat(branchLocation.latitude.toString())
        const branchLng = parseFloat(branchLocation.longitude.toString())
        
        console.log('[Delivery Calculation] User coordinates:', { lat, lng });
        console.log('[Delivery Calculation] Branch coordinates:', { branchLat, branchLng });
        
        const distance = await calculateDistance(
          { latitude: lat, longitude: lng },
          { latitude: branchLat, longitude: branchLng }
        )
        
        console.log('[Delivery Calculation] Calculated distance:', distance, 'km');
        setDistance(toNumber(distance))

        // Get userId from localStorage userData
        let userId = '';
        try {
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            userId = parsedUserData.id || '';
          }
        } catch (error) {
          console.log('[Delivery Calculation] Could not retrieve userId from userData:', error);
        }

        // Calculate total including extras for all cart items
        const currentCartTotal = cart.reduce((total, item) => {
          const base = parseFloat(item.price) * item.quantity;
          const extrasTotal = (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0) * item.quantity;
          return total + base + extrasTotal;
        }, 0);

        console.log('[Delivery Calculation] Calculated currentCartTotal:', currentCartTotal, 'from cart items:', cart.length);

        // Prepare the payload for delivery price calculation
        const deliveryPayload = {
          pickup: {
            fromLatitude: branchLat.toString(),
            fromLongitude: branchLng.toString(),
          },
          dropOff: {
            toLatitude: lat.toString(),
            toLongitude: lng.toString(),
          },
          rider: true,
          pedestrian: true,
          total: currentCartTotal,
          subTotal: currentCartTotal,
          userId: userId
        };

        console.log('[Delivery Calculation] Sending payload to API:', deliveryPayload);

        // Get delivery prices from API
        const deliveryResponse = await calculateDeliveryPrices(deliveryPayload);
        const { 
          riderFee: newRiderFee, 
          pedestrianFee: newPedestrianFee,
          platformFee: newPlatformFee,
          delikaBalance: newDelikaBalance,
          distance: apiDistance,
          amountToBePaid
        } = deliveryResponse;

        console.log('[Delivery Calculation] Full API response:', deliveryResponse);
        console.log('[Delivery Calculation] Extracted values - Rider fee:', newRiderFee, 'Pedestrian fee:', newPedestrianFee, 'Platform fee:', newPlatformFee, 'DelikaBalance:', newDelikaBalance);
        
        setRiderFee(toNumber(newRiderFee))
        setPedestrianFee(toNumber(newPedestrianFee))
        
        // Always update platform fee from API response  
        const numericPlatformFee = toNumber(newPlatformFee);
        setPlatformFee(numericPlatformFee)
        console.log('[Delivery Calculation] ✅ Platform fee updated from', platformFee, 'to', numericPlatformFee, '(from API)');
        
        // Store delivery calculation results in localStorage for persistence
        const deliveryCalculationData = {
          riderFee: toNumber(newRiderFee),
          pedestrianFee: toNumber(newPedestrianFee),
          platformFee: numericPlatformFee,
          distance: toNumber(distance),
          cartTotal: currentCartTotal,
          branchId: branchId,
          timestamp: Date.now(),
          deliveryType: deliveryType
        };
        
        // Create unique identifier for this branch's delivery data
        const deliveryDataKey = `deliveryCalculationData_${storeType}_${branchId}`;
        
        localStorage.setItem(deliveryDataKey, JSON.stringify(deliveryCalculationData));
        console.log('[Delivery Calculation] ✅ Stored delivery calculation data in localStorage with key:', deliveryDataKey, deliveryCalculationData);
        
        // Update wallet balance if provided by API (more up-to-date than localStorage)
        if (newDelikaBalance !== undefined && newDelikaBalance !== null) {
          const numericBalance = toNumber(newDelikaBalance);
          setWalletBalance(numericBalance)
          console.log('[Delivery Calculation] Updated delikaBalance from API to:', numericBalance, '(converted from:', newDelikaBalance, ')');
          
          // Automatically use wallet if balance is available
          if (numericBalance > 0) {
            setUseWallet(true);
            console.log('[Delivery Calculation] Auto-enabling wallet usage - balance available:', numericBalance);
          }
        }
        
        // If distance > 2km and pedestrian is selected, switch to rider
        if (distance > 2 && deliveryType === 'pedestrian') {
          console.log('[Delivery Calculation] Distance > 2km, switching from pedestrian to rider');
          setDeliveryType('rider')
          setDeliveryFee(toNumber(newRiderFee))
        } else {
          // Set the fee based on the selected delivery type
          const currentFee = deliveryType === 'rider' ? newRiderFee : newPedestrianFee
          console.log('[Delivery Calculation] Setting delivery fee for', deliveryType, ':', currentFee);
          setDeliveryFee(toNumber(currentFee))
        }
        
        // Debug logging for price calculation
        console.log('[Price Calculation] Final values:', {
          cartTotal,
          deliveryFee: toNumber(deliveryType === 'rider' ? newRiderFee : newPedestrianFee),
          platformFee: numericPlatformFee,
          walletBalance: toNumber(newDelikaBalance || 0),
          useWallet,
          finalTotal: Math.max(0, (cartTotal + toNumber(deliveryType === 'rider' ? newRiderFee : newPedestrianFee) + numericPlatformFee) - (useWallet ? Math.min(toNumber(newDelikaBalance || 0), cartTotal + toNumber(deliveryType === 'rider' ? newRiderFee : newPedestrianFee) + numericPlatformFee) : 0))
        });
      } catch (error) {
        console.error('[Delivery Calculation] Error calculating delivery fee:', error);
        // Handle error silently
      } finally {
        setIsLoadingDelivery(false)
      }
    }

    if (isOpen) {
      console.log('[CartModal] Modal opened, triggering fee calculation for Mode:', isAuthenticated ? '1' : '2');
      
      // If pre-calculated fees are provided, use them directly
      if (preCalculatedFees) {
        console.log('[CartModal] Using pre-calculated fees, skipping calculation');
        setRiderFee(preCalculatedFees.riderFee);
        setPedestrianFee(preCalculatedFees.pedestrianFee);
        setPlatformFee(preCalculatedFees.platformFee);
        setDistance(preCalculatedFees.distance);
        setIsLoadingDelivery(preCalculatedFees.isLoadingDelivery);
        return;
      }
      
      // First try to load stored delivery data
      const loadedStoredData = loadStoredDeliveryData();
      
      // Only calculate fresh data if we don't have valid stored data
      if (!loadedStoredData) {
        console.log('[CartModal] No valid stored data found, calculating fresh delivery fees');
        calculateFee()
      } else {
        console.log('[CartModal] Using stored delivery data, skipping API call');
      }
    }

    // Listen for location updates
    const handleLocationUpdate = () => {
      if (isOpen) {
        console.log('[CartModal] Location updated, recalculating fees');
        calculateFee()
      }
    }

    window.addEventListener('locationUpdated', handleLocationUpdate)
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate)
    }
  }, [isOpen, branchLocation, deliveryType, cartTotal, cart, isAuthenticated, preCalculatedFees])

  // Additional effect for Mode 2 to ensure calculation triggers when cart changes
  useEffect(() => {
    if (!isAuthenticated && isOpen && cart.length > 0) {
      console.log('[Mode 2] Cart changed, triggering fee calculation for non-authenticated user');
      console.log('[Mode 2] Cart items:', cart.length, 'Cart total:', cartTotal);
      
      // Check if we need to clear stored data due to significant cart changes
      const clearedStoredData = clearStoredDeliveryData();
      
      // Trigger calculation with a small delay to ensure state updates are processed
      const timer = setTimeout(() => {
        const calculateFeeForMode2 = async () => {
          try {
            setIsLoadingDelivery(true)
            const locationData = localStorage.getItem('userLocationData')
            
            if (!locationData || !branchLocation) {
              console.log('[Mode 2] Missing location data, skipping calculation');
              setIsLoadingDelivery(false)
              return
            }

            const { lat, lng } = JSON.parse(locationData)
            const branchLat = parseFloat(branchLocation.latitude.toString())
            const branchLng = parseFloat(branchLocation.longitude.toString())
            
            const distance = await calculateDistance(
              { latitude: lat, longitude: lng },
              { latitude: branchLat, longitude: branchLng }
            )
            
            setDistance(toNumber(distance))

            // Calculate total including extras for all cart items
            const currentCartTotal = cart.reduce((total, item) => {
              const base = parseFloat(item.price) * item.quantity;
              const extrasTotal = (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0) * item.quantity;
              return total + base + extrasTotal;
            }, 0);

            console.log('[Mode 2] Recalculating fees with cart total:', currentCartTotal);

            // Prepare the payload for delivery price calculation
            const deliveryPayload = {
              pickup: {
                fromLatitude: branchLat.toString(),
                fromLongitude: branchLng.toString(),
              },
              dropOff: {
                toLatitude: lat.toString(),
                toLongitude: lng.toString(),
              },
              rider: true,
              pedestrian: true,
              total: currentCartTotal,
              subTotal: currentCartTotal,
              userId: ''
            };

            // Get delivery prices from API
            const deliveryResponse = await calculateDeliveryPrices(deliveryPayload);
            const { 
              riderFee: newRiderFee, 
              pedestrianFee: newPedestrianFee,
              platformFee: newPlatformFee
            } = deliveryResponse;

            console.log('[Mode 2] Updated fees - Rider:', newRiderFee, 'Pedestrian:', newPedestrianFee, 'Platform:', newPlatformFee);
            
            setRiderFee(toNumber(newRiderFee))
            setPedestrianFee(toNumber(newPedestrianFee))
            setPlatformFee(toNumber(newPlatformFee))
            
            // Set the fee based on the selected delivery type
            const currentFee = deliveryType === 'rider' ? newRiderFee : newPedestrianFee
            setDeliveryFee(toNumber(currentFee))
            
            // Store delivery calculation results in localStorage for persistence (Mode 2)
            const deliveryCalculationData = {
              riderFee: toNumber(newRiderFee),
              pedestrianFee: toNumber(newPedestrianFee),
              platformFee: toNumber(newPlatformFee),
              distance: toNumber(distance),
              cartTotal: currentCartTotal,
              branchId: branchId,
              timestamp: Date.now(),
              deliveryType: deliveryType
            };
            
            // Create unique identifier for this branch's delivery data
            const deliveryDataKey = `deliveryCalculationData_${storeType}_${branchId}`;
            
            localStorage.setItem(deliveryDataKey, JSON.stringify(deliveryCalculationData));
            console.log('[Mode 2] ✅ Stored delivery calculation data in localStorage with key:', deliveryDataKey, deliveryCalculationData);
            
            console.log('[Mode 2] ✅ Fees updated successfully');
          } catch (error) {
            console.error('[Mode 2] Error calculating delivery fee:', error);
          } finally {
            setIsLoadingDelivery(false)
          }
        }

        calculateFeeForMode2()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [cart, cartTotal, isAuthenticated, isOpen, branchLocation, deliveryType])

  // Authentication handlers for Mode 2
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log('🚀 [CartModal] Login attempt started:', {
      method: e.currentTarget.getAttribute('data-mode') === 'email' ? 'email' : 'phone',
      email: email || 'not provided',
      phone: phone || 'not provided',
      isAuthenticated: isAuthenticated,
      cartLength: cart.length,
      cartTotal
    });

    try {
      // Determine login method based on active tab
      const isEmailMode = e.currentTarget.getAttribute('data-mode') === 'email'
      setLoginMethod(isEmailMode ? 'email' : 'phone')

      let data: any;
      if (isEmailMode) {
        // Email login
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
      } else {
        // Phone login
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/login/phoneNumber/customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: phone }),
        });
        data = await response.json();
      }
      
      // Handle different response structures for email vs phone login
      let token: string;
      let phoneUserData: UserData | null = null;
      
      if (isEmailMode) {
        // Email login returns: { authToken: "...", ... }
        if (data.authToken) {
          token = data.authToken;
        } else {
          if (data.message) {
            setError(data.message)
          } else {
            setError("Invalid email or password")
          }
          return;
        }
      } else {
        // Phone login returns: [{ id: "...", OTP: "token...", role: "Customer", ... }]
        if (Array.isArray(data) && data.length > 0) {
          const userData = data[0] as UserData;
          
          // Check if user role is Customer
          if (userData.role !== 'Customer') {
            setError('Invalid credentials');
            return;
          }
          
          // Extract token from OTP field
          token = userData.OTP || '';
          phoneUserData = userData;
          
          if (!token) {
            setError('Authentication failed. Please try again.');
            return;
          }
        } else {
          setError('Sorry, you do not have an account with this phone number as a customer.');
          return;
        }
      }
      
      if (token) {
        setAuthToken(token)
        
        if (phoneUserData) {
          // For phone login, we already have user data
          setUserData(phoneUserData)
          setOtpError("")
          setShowOTP(true)
        } else {
          // For email login, try to fetch user data
          try {
            const userResponse = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              
              // Check if user role is Customer
              if (userData.role !== 'Customer') {
                setError('Invalid credentials');
                return;
              }
              
              setUserData(userData)
              setOtpError("")
              setShowOTP(true)
            } else {
              // Even if we can't fetch user data, we can still show OTP
              setOtpError("")
              setShowOTP(true);
            }
          } catch (userDataError) {
            setOtpError("")
            setShowOTP(true);
          }
        }
      } else {
        if (data.message) {
          setError(data.message)
        } else if (isEmailMode) {
          setError("Invalid email or password")
        } else {
          setError("Invalid phone number")
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (otp: string) => {
    console.log('🔐 [CartModal] OTP verification started:', {
      otpLength: otp.length,
      loginMethod,
      isAuthenticated,
      hasAuthToken: !!authToken,
      cartLength: cart.length
    });

    try {
      setOtpError("")
      setIsLoading(true)

      const endpoint = loginMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber';
      
      const payload = loginMethod === 'email'
        ? {
            OTP: parseInt(otp),
            type: true,
            contact: email
          }
        : {
            OTP: parseInt(otp),
            contact: phone
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.otpValidate === 'otpFound') {
        // Store auth token in localStorage
        localStorage.setItem('authToken', authToken);
        
        // Use userData if available, otherwise try to fetch it
        let finalUserData = userData;
        if (!finalUserData && authToken) {
          try {
            const userResponse = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              }
            });
            
            if (userResponse.ok) {
              finalUserData = await userResponse.json();
            }
          } catch (userDataError) {
            console.error('Failed to fetch user data:', userDataError);
          }
        }
        
        if (finalUserData) {
          console.log('✅ [CartModal] OTP verification successful:', {
            userId: finalUserData.id,
            userEmail: finalUserData.email,
            userPhone: finalUserData.phoneNumber,
            cartLength: cart.length,
            cartTotal,
            branchId
          });

          localStorage.setItem('userData', JSON.stringify(finalUserData));
          
          // Store cart context for after login
          localStorage.setItem('cartContext', JSON.stringify({
            branchId,
            total: cartTotal,
            itemCount: cart.length,
            branchLocation
          }));
          
          if (onLoginSuccess) {
            onLoginSuccess(finalUserData);
          }
        }
        
        setShowOTP(false);
        onClose();
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const endpoint = signupMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/auth/signup'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/auth/signup/phoneNumber/customer';
      
      const payload = signupMethod === 'email'
        ? {
            email: signupEmail,
            password: signupPassword,
            fullName: signupFullName
          }
        : {
            phoneNumber: signupPhone,
            fullName: signupFullName
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.authToken) {
        setSignupAuthToken(data.authToken);
        setSignupUserData(data);
        setSignupOtpError("");
        setShowSignupOTP(true);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupOTPVerification = async (otp: string) => {
    try {
      setSignupOtpError("")
      setIsLoading(true)

      const endpoint = signupMethod === 'email'
        ? 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code'
        : 'https://api-server.krontiva.africa/api:uEBBwbSs/verify/otp/code/phoneNumber';
      
      const payload = signupMethod === 'email'
        ? {
            OTP: parseInt(otp),
            type: true,
            contact: signupEmail
          }
        : {
            OTP: parseInt(otp),
            contact: signupPhone
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupAuthToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.otpValidate === 'otpFound' && signupUserData) {
        localStorage.setItem('authToken', signupAuthToken);
        localStorage.setItem('userData', JSON.stringify(signupUserData));
        
        // Store cart context for after signup
        localStorage.setItem('cartContext', JSON.stringify({
          branchId,
          total: cartTotal,
          itemCount: cart.length,
          branchLocation
        }));
        
        if (onLoginSuccess) {
          onLoginSuccess(signupUserData);
        }
        setShowSignupOTP(false);
        onClose();
      } else {
        setSignupOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Signup OTP verification error:', error);
      setSignupOtpError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  // Check authentication status whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const userData = localStorage.getItem('userData')
      if (userData && isProcessingAuth) {
        setIsProcessingAuth(false)
        router.push(`/checkout/${branchId}`)
      }
    }
  }, [isOpen, branchId, isProcessingAuth, router])

  const handleCheckout = () => {
    console.log('💳 [CartModal] Checkout attempt:', {
      isAuthenticated,
      cartLength: cart.length,
      cartTotal,
      branchId,
      storeType,
      hasUserData: !!localStorage.getItem('userData'),
      hasAuthToken: !!localStorage.getItem('authToken')
    });

    if (!isAuthenticated) {
      console.log('❌ [CartModal] Checkout blocked - user not authenticated, redirecting to login');
      // Store checkout data for after login
      const redirectUrl = getCheckoutUrl()
      localStorage.setItem('loginRedirectUrl', redirectUrl)
      localStorage.setItem('selectedDeliveryType', deliveryType)
      localStorage.setItem('checkoutDeliveryFee', deliveryFee.toString())
      localStorage.setItem('checkoutPlatformFee', platformFee.toString())
      localStorage.setItem('useWalletBalance', useWallet.toString())
      localStorage.setItem('walletDeduction', useWallet ? Math.min(toNumber(walletBalance), cartTotal + deliveryFee + platformFee).toString() : '0')
      localStorage.setItem('delikaBalance', useWallet.toString()) // Boolean
      localStorage.setItem('delikaBalanceAmount', useWallet ? Math.min(toNumber(walletBalance), cartTotal + deliveryFee + platformFee).toString() : '0') // Number
      // Store cart items with extras in localStorage
      localStorage.setItem('checkoutCartItems', JSON.stringify(cart))
      
      // Close cart modal and open login modal
      onClose()
      if (onLoginClick) {
        onLoginClick()
      } else {
        // Fallback to router navigation if onLoginClick is not provided
        setIsProcessingAuth(true)
        router.push('/login')
      }
      return
    }
    
    // Store delivery type, delivery fee, platform fee, and wallet info
    localStorage.setItem('selectedDeliveryType', deliveryType)
    localStorage.setItem('checkoutDeliveryFee', deliveryFee.toString())
    localStorage.setItem('checkoutPlatformFee', platformFee.toString())
    localStorage.setItem('useWalletBalance', useWallet.toString())
    localStorage.setItem('walletDeduction', useWallet ? Math.min(toNumber(walletBalance), cartTotal + deliveryFee + platformFee).toString() : '0')
    localStorage.setItem('delikaBalance', useWallet.toString()) // Boolean
    localStorage.setItem('delikaBalanceAmount', useWallet ? Math.min(toNumber(walletBalance), cartTotal + deliveryFee + platformFee).toString() : '0') // Number
    // Store cart items with extras in localStorage
    localStorage.setItem('checkoutCartItems', JSON.stringify(cart))
    
    if (onCheckout) {
      // Use custom checkout handler if provided
      onClose()
      onCheckout()
    } else {
      // Navigate to appropriate checkout page
      const checkoutUrl = getCheckoutUrl()
      router.push(checkoutUrl)
      onClose()
    }
  }

  const getCheckoutUrl = () => {
    switch (storeType) {
      case 'pharmacy':
        return `/checkout/pharmacy/${branchId}`
      case 'grocery':
        return `/checkout/grocery/${branchId}`
      case 'restaurant':
      default:
        return `/checkout/${branchId}`
    }
  }

  const hasUnavailableItems = cart.some(item => {
    // If menuCategories is empty, fall back to item.available
    if (!menuCategories || menuCategories.length === 0) {
      return item.available === false;
    }
    const menuItem = menuCategories
      .flatMap(cat => cat.foods)
      .find(food => food.name === item.name);
    // If menuItem is found, use its available, else fallback to item.available
    return menuItem ? menuItem.available === false : item.available === false;
  })

  // Mode 2: OTP Verification Screens
  if (showOTP) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Verify Your Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification code to your {loginMethod === 'email' ? 'email' : 'phone'}. Please enter it below.
            </p>
            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                <AlertCircleIcon className="h-4 w-4 mr-2 mt-0.5" />
                {otpError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 4-digit code"
                maxLength={4}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length === 4) {
                    handleOTPVerification(value);
                  }
                }}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button 
              onClick={() => setShowOTP(false)} 
              variant="outline" 
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (showSignupOTP) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Verify Your Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification code to your {signupMethod === 'email' ? 'email' : 'phone'}. Please enter it below.
            </p>
            {signupOtpError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                <AlertCircleIcon className="h-4 w-4 mr-2 mt-0.5" />
                {signupOtpError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="signup-otp">Verification Code</Label>
              <Input
                id="signup-otp"
                type="text"
                placeholder="Enter 4-digit code"
                maxLength={4}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length === 4) {
                    handleSignupOTPVerification(value);
                  }
                }}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button 
              onClick={() => setShowSignupOTP(false)} 
              variant="outline" 
              className="w-full"
            >
              Back to Signup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 bg-white overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="font-semibold">{branchName}</div>
              <div className="text-sm text-gray-500 font-normal">Your Cart</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          // Mode 2: Non-authenticated users - Show cart summary + login interface
          <div className="flex flex-col h-full">
            {/* Cart Summary Section for Mode 2 */}
            {cart.length > 0 && (
              <>
                <div className="px-6 py-4 border-b">
                  <h3 className="font-medium text-gray-900 mb-3">Your Order Summary</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {cart.map((item, index) => {
                      let isAvailable = true;
                      if (!menuCategories || menuCategories.length === 0) {
                        isAvailable = item.available !== false;
                      } else {
                        const menuItem = menuCategories
                          .flatMap(cat => cat.foods)
                          .find(food => food.name === item.name);
                        isAvailable = menuItem ? menuItem.available !== false : item.available !== false;
                      }
                      
                      return (
                        <div key={`${item.id}-${index}`} className={`flex gap-3 p-3 rounded-lg border ${!isAvailable ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className={`object-cover ${!isAvailable ? 'grayscale' : ''}`}
                              />
                            ) : (
                              <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${!isAvailable ? 'grayscale' : ''}`}>
                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium text-gray-900 truncate text-sm">{item.name}</h4>
                                {!isAvailable && (
                                  <span className="text-xs text-red-500 font-medium">No longer available</span>
                                )}
                              </div>
                              <span className="text-sm font-medium">GH₵ {((parseFloat(item.price) + (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0)) * item.quantity).toFixed(2)}</span>
                            </div>
                            {item.selectedExtras && item.selectedExtras.length > 0 && (
                              <div className="mt-1 pl-2 space-y-1 border-l-2 border-gray-200">
                                {item.selectedExtras.map(extra => (
                                  <div key={extra.id} className="flex justify-between text-xs text-gray-600">
                                    <span>+{extra.quantity} × {extra.name}</span>
                                    <span>GH₵ {(parseFloat(extra.price) * extra.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price Summary for Mode 2 */}
                <div className="px-6 py-4 border-b bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">GH₵ {cart.reduce((total, item) => {
                        const base = parseFloat(item.price) * item.quantity;
                        const extrasTotal = (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0) * item.quantity;
                        return total + base + extrasTotal;
                      }, 0).toFixed(2)}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">Choose Delivery Type</span>
                      </div>
                      <RadioGroup
                        value={deliveryType}
                        onValueChange={(value) => {
                          const newDeliveryType = value as 'rider' | 'pedestrian';
                          setDeliveryType(newDeliveryType);
                          
                          // Update delivery fee based on the new delivery type
                          const newFee = newDeliveryType === 'rider' ? riderFee : pedestrianFee;
                          console.log('[Delivery Type Change] Switching to', newDeliveryType, 'with fee:', newFee);
                          setDeliveryFee(newFee);
                        }}
                        className="grid grid-cols-2 gap-2"
                      >
                        <div>
                          <RadioGroupItem
                            value="rider"
                            id="rider-mode2"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="rider-mode2"
                            className={cn(
                              "flex items-center gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50 cursor-pointer",
                              "peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50",
                              "transition-all duration-200"
                            )}
                          >
                            <Bike className="h-4 w-4 text-gray-600" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Rider</div>
                              <div className="text-xs text-gray-500">GH₵ {riderFee.toFixed(2)}</div>
                            </div>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="pedestrian"
                            id="pedestrian-mode2"
                            className="peer sr-only"
                            disabled={distance > 2}
                          />
                          <Label
                            htmlFor="pedestrian-mode2"
                            className={cn(
                              "flex items-center gap-2 rounded-md border border-gray-200 p-2 cursor-pointer transition-all duration-200",
                              distance > 2 
                                ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300" 
                                : "hover:bg-gray-50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50"
                            )}
                          >
                            <User className={cn(
                              "h-4 w-4",
                              distance > 2 ? "text-gray-400" : "text-gray-600"
                            )} />
                            <div>
                              <div className={cn(
                                "text-sm font-medium",
                                distance > 2 ? "text-gray-400" : "text-gray-900"
                              )}>
                                Pedestrian
                                {distance > 2 && (
                                  <span className="ml-1 text-xs text-red-500">(Not available)</span>
                                )}
                              </div>
                              <div className={cn(
                                "text-xs",
                                distance > 2 ? "text-gray-400" : "text-gray-500"
                              )}>
                                {distance > 2 ? "Distance too far" : `GH₵ ${pedestrianFee.toFixed(2)}`}
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Delivery Fee</span>
                        {distance > 0 && (
                          <span className="px-2 py-1 bg-green-100 rounded-full text-xs text-green-700">
                            {distance.toFixed(1)}km
                          </span>
                        )}
                      </div>
                      <span className="font-medium">GH₵ {deliveryFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-medium">GH₵ {platformFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">Total</span>
                      <span className="font-semibold text-lg">
                        GH₵ {(() => {
                          const finalTotal = Math.max(0, (cartTotal + deliveryFee + platformFee) - (useWallet ? Math.min(toNumber(walletBalance), cartTotal + deliveryFee + platformFee) : 0));
                          console.log('[Cart Total Mode 2] Calculation: CartTotal(', cartTotal, ') + DeliveryFee(', deliveryFee, ') + PlatformFee(', platformFee, ') - WalletDeduction = ', finalTotal);
                          return finalTotal.toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Login/Signup Interface for Mode 2 */}
            <div className="px-6 py-6 flex-1">
              {(() => { console.log('🔒 [CartModal] Rendering Mode 2: Non-authenticated user interface'); return null; })()}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start mb-4">
                  <AlertCircleIcon className="h-4 w-4 mr-2 mt-0.5" />
                  {error}
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Already have an account? Log in to continue with your order.
                    </p>
                  </div>
                  
                  <Tabs defaultValue="email" className="w-full" onValueChange={() => setError("")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email">Email</TabsTrigger>
                      <TabsTrigger value="phone">Phone</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="email">
                      <form onSubmit={handleLoginSubmit} data-mode="email" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setError("")
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              setError("")
                            }}
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          disabled={isLoading}
                        >
                          {isLoading ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="phone">
                      <form onSubmit={handleLoginSubmit} data-mode="phone" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-phone">Phone Number</Label>
                          <Input
                            id="login-phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value)
                              setError("")
                            }}
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending code..." : "Send Code"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      New to Delika? Create an account to start ordering.
                    </p>
                  </div>
                  
                  <Tabs defaultValue="email" className="w-full" onValueChange={() => setError("")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email">Email</TabsTrigger>
                      <TabsTrigger value="phone">Phone</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="email">
                      <form onSubmit={handleSignupSubmit} data-mode="email" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-fullname">Full Name</Label>
                          <Input
                            id="signup-fullname"
                            type="text"
                            placeholder="Enter your full name"
                            value={signupFullName}
                            onChange={(e) => {
                              setSignupFullName(e.target.value)
                              setError("")
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signupEmail}
                            onChange={(e) => {
                              setSignupEmail(e.target.value)
                              setError("")
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Create a password"
                            value={signupPassword}
                            onChange={(e) => {
                              setSignupPassword(e.target.value)
                              setError("")
                            }}
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="phone">
                      <form onSubmit={handleSignupSubmit} data-mode="phone" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-fullname-phone">Full Name</Label>
                          <Input
                            id="signup-fullname-phone"
                            type="text"
                            placeholder="Enter your full name"
                            value={signupFullName}
                            onChange={(e) => {
                              setSignupFullName(e.target.value)
                              setError("")
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-phone">Phone Number</Label>
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={signupPhone}
                            onChange={(e) => {
                              setSignupPhone(e.target.value)
                              setError("")
                            }}
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : cart.length > 0 ? (
          // Mode 1: Authenticated users - Show current cart design
          <>
            {(() => { console.log('🛒 [CartModal] Rendering Mode 1: Authenticated user interface'); return null; })()}
            <div className="px-6 space-y-4 overflow-y-auto flex-1 py-6">
              {hasUnavailableItems && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      Some items in your cart are no longer available. <strong>Click the red trash icon</strong> to remove them and proceed with checkout.
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                    onClick={() => {
                      // Remove all unavailable items
                      const unavailableItems = cart.filter(item => {
                        if (!menuCategories || menuCategories.length === 0) {
                          return item.available === false;
                        }
                        const menuItem = menuCategories
                          .flatMap(cat => cat.foods)
                          .find(food => food.name === item.name);
                        return menuItem ? menuItem.available === false : item.available === false;
                      });
                      unavailableItems.forEach(item => {
                        // Use different key formats based on store type
                        if (storeType === 'restaurant') {
                          // Generate cart item key for restaurants with extras
                          const extrasKey = item.selectedExtras && item.selectedExtras.length > 0
                            ? JSON.stringify([...item.selectedExtras].sort((a, b) => a.id.localeCompare(b.id)))
                            : '';
                          const cartItemKey = `${item.id}__${extrasKey}`;
                          onDeleteItem(cartItemKey);
                        } else {
                          // Simple ID for pharmacy and grocery
                          onDeleteItem(item.id);
                        }
                      });
                    }}
                  >
                    Remove All
                  </Button>
                </div>
              )}
              
              <AnimatePresence>
                {cart.map((item, index) => {
                  // If menuCategories is empty, use item.available; else use menuItem.available if found, else fallback to item.available
                  let isAvailable = true;
                  if (!menuCategories || menuCategories.length === 0) {
                    isAvailable = item.available !== false;
                  } else {
                    const menuItem = menuCategories
                      .flatMap(cat => cat.foods)
                      .find(food => food.name === item.name);
                    isAvailable = menuItem ? menuItem.available !== false : item.available !== false;
                  }
                  return (
                    <motion.div
                      key={`${item.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex gap-4 p-4 rounded-xl border ${!isAvailable ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100'}`}
                    >
                                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className={`object-cover ${!isAvailable ? 'grayscale' : ''}`}
                          />
                        ) : (
                          <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${!isAvailable ? 'grayscale' : ''}`}>
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                            {!isAvailable && (
                              <span className="text-xs text-red-500 font-medium">No longer available</span>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-8 w-8 ${!isAvailable ? 'text-red-500 hover:text-red-600 hover:bg-red-100 border border-red-200' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                            onClick={() => {
                              // Use different key formats based on store type
                              if (storeType === 'restaurant') {
                                // Generate cart item key for restaurants with extras
                                const extrasKey = item.selectedExtras && item.selectedExtras.length > 0
                                  ? JSON.stringify([...item.selectedExtras].sort((a, b) => a.id.localeCompare(b.id)))
                                  : '';
                                const cartItemKey = `${item.id}__${extrasKey}`;
                                onDeleteItem(cartItemKey);
                              } else {
                                // Simple ID for pharmacy and grocery
                                onDeleteItem(item.id);
                              }
                            }}
                            title={!isAvailable ? "Remove unavailable item" : "Remove item"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Extras Section */}
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="mt-2 pl-2 space-y-1 border-l-2 border-gray-200">
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
                              <span>GH₵ {((parseFloat(item.price) + (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0)) * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-medium">GH₵ {((parseFloat(item.price) + (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0)) * item.quantity).toFixed(2)}</span>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full"
                              onClick={() => {
                                // Use different key formats based on store type
                                if (storeType === 'restaurant') {
                                  // Generate cart item key for restaurants with extras
                                  const extrasKey = item.selectedExtras && item.selectedExtras.length > 0
                                    ? JSON.stringify([...item.selectedExtras].sort((a, b) => a.id.localeCompare(b.id)))
                                    : '';
                                  const cartItemKey = `${item.id}__${extrasKey}`;
                                  onRemoveItem(cartItemKey);
                                } else {
                                  // Simple ID for pharmacy and grocery
                                  onRemoveItem(item.id);
                                }
                              }}
                              disabled={!isAvailable}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full"
                              onClick={() => {
                                // Use different key formats based on store type
                                if (storeType === 'restaurant') {
                                  // Generate cart item key for restaurants with extras
                                  const extrasKey = item.selectedExtras && item.selectedExtras.length > 0
                                    ? JSON.stringify([...item.selectedExtras].sort((a, b) => a.id.localeCompare(b.id)))
                                    : '';
                                  const cartItemKey = `${item.id}__${extrasKey}`;
                                  onAddItem(cartItemKey);
                                } else {
                                  // Simple ID for pharmacy and grocery
                                  onAddItem(item.id);
                                }
                              }}
                              disabled={!isAvailable}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="border-t bg-white px-6 py-4 sticky bottom-0">
              <div className="space-y-3">
                {/* Wallet Section - Moved to top */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">DelikaBalance</span>
                    </div>
                    <span className="font-medium text-green-600">GH₵ {toNumber(walletBalance).toFixed(2)}</span>
                  </div>
                  
                  {walletBalance > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          Auto-applied
                        </span>
                      </div>
                      <span className="text-sm text-orange-600">
                        -GH₵ {Math.min(toNumber(walletBalance), cartTotal + deliveryFee + platformFee).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">GH₵ {cart.reduce((total, item) => {
                    const base = parseFloat(item.price) * item.quantity;
                    const extrasTotal = (item.selectedExtras?.reduce((sum, extra) => sum + parseFloat(extra.price), 0) || 0) * item.quantity;
                    return total + base + extrasTotal;
                  }, 0).toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Choose Delivery Type</span>
                  </div>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(value) => {
                      const newDeliveryType = value as 'rider' | 'pedestrian';
                      setDeliveryType(newDeliveryType);
                      
                      // Update delivery fee based on the new delivery type
                      const newFee = newDeliveryType === 'rider' ? riderFee : pedestrianFee;
                      console.log('[Delivery Type Change] Switching to', newDeliveryType, 'with fee:', newFee);
                      setDeliveryFee(newFee);
                    }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div>
                      <RadioGroupItem
                        value="rider"
                        id="rider"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="rider"
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50 cursor-pointer",
                          "peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50",
                          "transition-all duration-200"
                        )}
                      >
                        <Bike className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Rider</div>
                          <div className="text-xs text-gray-500">GH₵ {riderFee.toFixed(2)}</div>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="pedestrian"
                        id="pedestrian"
                        className="peer sr-only"
                        disabled={distance > 2}
                      />
                      <Label
                        htmlFor="pedestrian"
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-gray-200 p-2 cursor-pointer transition-all duration-200",
                          distance > 2 
                            ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300" 
                            : "hover:bg-gray-50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50"
                        )}
                      >
                        <User className={cn(
                          "h-4 w-4",
                          distance > 2 ? "text-gray-400" : "text-gray-600"
                        )} />
                        <div>
                          <div className={cn(
                            "text-sm font-medium",
                            distance > 2 ? "text-gray-400" : "text-gray-900"
                          )}>
                            Pedestrian
                            {distance > 2 && (
                              <span className="ml-1 text-xs text-red-500">(Not available)</span>
                            )}
                          </div>
                          <div className={cn(
                            "text-xs",
                            distance > 2 ? "text-gray-400" : "text-gray-500"
                          )}>
                            {distance > 2 ? "Distance too far" : `GH₵ ${pedestrianFee.toFixed(2)}`}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Delivery Fee</span>
                    {distance > 0 && (
                      <span className="px-2 py-1 bg-green-100 rounded-full text-xs text-green-700">
                        {distance.toFixed(1)}km
                      </span>
                    )}
                  </div>
                  <span className="font-medium">GH₵ {deliveryFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">GH₵ {platformFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold text-lg">
                    GH₵ {(() => {
                      const finalTotal = Math.max(0, (cartTotal + deliveryFee + platformFee) - (useWallet ? Math.min(toNumber(walletBalance), cartTotal + deliveryFee + platformFee) : 0));
                      console.log('[Cart Total] Calculation: CartTotal(', cartTotal, ') + DeliveryFee(', deliveryFee, ') + PlatformFee(', platformFee, ') - WalletDeduction = ', finalTotal);
                      return finalTotal.toFixed(2);
                    })()}
                  </span>
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 h-12 text-lg font-medium"
                onClick={handleCheckout}
                disabled={hasUnavailableItems || isLoadingDelivery}
              >
                {hasUnavailableItems
                  ? 'Remove Unavailable Items'
                  : (() => {
                      const finalTotal = Math.max(0, (cartTotal + deliveryFee + platformFee) - (useWallet ? Math.min(toNumber(walletBalance), cartTotal + deliveryFee + platformFee) : 0));
                      const isFullyPaidByWallet = finalTotal === 0 && useWallet;
                      return isFullyPaidByWallet ? 'Confirm Order' : 'Proceed to Checkout';
                    })()}
              </Button>
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  You&apos;ll need to log in to complete your order
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 px-6 text-center">
            {(() => { console.log('🛒 [CartModal] Rendering empty cart state'); return null; })()}
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 text-sm">
              Add items from the menu to start your order
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 