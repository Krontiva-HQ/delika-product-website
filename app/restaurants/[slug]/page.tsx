"use client"

import { BranchPage } from "@/components/branch-page"
import { AuthNav, UserData } from "@/components/auth-nav"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { use } from "react"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function RestaurantPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentView, setCurrentView] = useState('stores')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [branchId, setBranchId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get branch ID from search params or localStorage (client-side only)
    const idFromParams = searchParams?.get('id')
    if (idFromParams) {
      setBranchId(idFromParams)
    } else {
      const storedId = localStorage.getItem('selectedBranchId')
      setBranchId(storedId)
    }

    // Check for user data in localStorage on component mount
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [searchParams])

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
    router.push('/vendors')
  }

  // Show loading while branchId is being determined
  if (!branchId) {
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
          <div className="text-center p-8 text-gray-600 font-semibold">
            Loading restaurant...
          </div>
        </div>
      </div>
    )
  }
    
  // Pass the actual branch ID to BranchPage
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
      <BranchPage params={{ id: branchId }} />
    </div>
  )
}

// Make the page dynamic since we're fetching fresh data each time
export const dynamic = 'force-dynamic' 