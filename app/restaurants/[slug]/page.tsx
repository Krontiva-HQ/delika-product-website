"use client"

import { BranchPage } from "@/components/branch-page"
import { AuthNav, UserData } from "@/components/auth-nav"
import { BrowserHistoryManager } from "@/components/browser-history-manager"
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const branchId = searchParams?.get('id') || localStorage.getItem('selectedBranchId')
  const categoryParam = searchParams?.get('category')
  const nameParam = searchParams?.get('name')

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
    localStorage.removeItem('authToken')
    setUserData(null)
    router.push('/')
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  const handleBackToRestaurants = () => {
    // Use router.push for proper browser history management
    router.push('/vendors')
  }

  try {
    if (!branchId) {
      // If no ID in query, try to get it from localStorage
      const storedId = localStorage.getItem('selectedBranchId')
      if (!storedId) {
        throw new Error('Branch ID not found')
      }
      return (
        <div className="flex flex-col min-h-screen">
          <BrowserHistoryManager pageType="restaurant" slug={resolvedParams.slug} />
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
          <BranchPage params={{ id: storedId }} urlParams={{ category: categoryParam, name: nameParam }} />
        </div>
      )
    }
    
    // Pass the actual branch ID to BranchPage
    return (
      <div className="flex flex-col min-h-screen">
        <BrowserHistoryManager pageType="restaurant" slug={resolvedParams.slug} />
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
        <BranchPage params={{ id: branchId! }} urlParams={{ category: categoryParam, name: nameParam }} />
      </div>
    )
  } catch (error) {
    console.error('Error in RestaurantPage:', error)
    return (
      <div className="flex flex-col min-h-screen">
        <BrowserHistoryManager pageType="restaurant" slug={resolvedParams.slug} />
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
          <div className="text-center p-8 text-red-600 font-semibold">
            Restaurant not found
          </div>
          <p className="text-gray-500 text-sm">
            The restaurant you're looking for might have been moved or doesn't exist.
          </p>
          <div className="mt-4 flex gap-4">
            <button 
              onClick={handleBackToRestaurants}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              Back to Vendors
            </button>
            <button 
              onClick={handleHomeClick}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }
}

// Make the page dynamic since we're fetching fresh data each time
export const dynamic = 'force-dynamic' 