"use client"

import { BranchPage } from "@/components/branch-page"
import { AuthNav, UserData } from "@/components/auth-nav"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { use } from "react"
import { useState as useClientState } from "react"

function GroceryShopPage({ id }: { id: string }) {
  const [items, setItems] = useClientState<any[]>([]);
  const [loading, setLoading] = useClientState(true);
  const [error, setError] = useClientState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`https://api-server.krontiva.africa/api:uEBBwbSs/get/grocery/shop/${id}/${id}`)
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load inventory');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading inventory...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Grocery Shop Inventory</h2>
      {items.length === 0 ? (
        <div>No items found for this branch.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map(item => (
            <li key={item.id} className="py-2 flex justify-between">
              <span>{item.productName}</span>
              <span className="font-semibold">{item.price}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PharmacyPage({ id }: { id: string }) {
  const [items, setItems] = useClientState<any[]>([]);
  const [loading, setLoading] = useClientState(true);
  const [error, setError] = useClientState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`https://api-server.krontiva.africa/api:uEBBwbSs/delika_pharmacyinventory_table/${id}/${id}`)
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load inventory');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading inventory...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Pharmacy Inventory</h2>
      {items.length === 0 ? (
        <div>No items found for this branch.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map(item => (
            <li key={item.id} className="py-2 flex justify-between">
              <span>{item.productName}</span>
              <span className="font-semibold">{item.price}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function RestaurantPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentView, setCurrentView] = useState('stores')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams?.get('id') || localStorage.getItem('selectedBranchId')
  const type = searchParams?.get('type') || 'restaurant' // default to restaurant if not specified

  useEffect(() => {
    // Check for user data in localStorage on component mount
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleViewChange = (view: 'stores' | 'orders' | 'favorites' | 'profile' | 'settings') => {
    setCurrentView(view)
  }

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  const handleSignupClick = () => {
    setShowSignupModal(true)
  }

  const handleLogout = async () => {
    localStorage.removeItem('userData')
    localStorage.removeItem('selectedBranchId')
    localStorage.removeItem('branchSlug')
    setUserData(null)
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  const handleBackToRestaurants = () => {
    router.push('/restaurants')
  }

  if (!id) {
    // If no ID in query, try to get it from localStorage
    const storedId = localStorage.getItem('selectedBranchId')
    if (!storedId) {
      return (
        <div className="flex flex-col min-h-screen">
          <AuthNav
            userData={userData}
            onViewChange={handleViewChange}
            currentView={currentView}
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            onLogout={handleLogout}
            onHomeClick={handleHomeClick}
          />
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={handleBackToRestaurants}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Vendors
            </button>
          </div>
          <div className="text-center p-8 text-red-600 font-semibold">
            Vendor not found
          </div>
        </div>
      )
    }
  }

  // Render the correct page based on type
  let Content: React.ReactNode = null;
  if (type === 'grocery') {
    Content = <GroceryShopPage id={id!} />;
  } else if (type === 'pharmacy') {
    Content = <PharmacyPage id={id!} />;
  } else {
    Content = <BranchPage params={{ id }} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AuthNav
        userData={userData}
        onViewChange={handleViewChange}
        currentView={currentView}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onLogout={handleLogout}
        onHomeClick={handleHomeClick}
      />
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={handleBackToRestaurants}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Vendors
        </button>
      </div>
      {Content}
    </div>
  )
}

// Make the page dynamic since we're fetching fresh data each time
export const dynamic = 'force-dynamic' 