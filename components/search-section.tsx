"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Settings2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadGoogleMaps } from "@/lib/google-maps"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface SearchSectionProps {
  onSearch: (query: string) => void
  userLocation: string
  onLocationClick: () => void
  activeTab: string
  onTabChange: (value: string) => void
  onFilterClick?: () => void
  branches: any[] // Add this prop
}

export function SearchSection({ onSearch, userLocation, onLocationClick, activeTab, onTabChange, onFilterClick, branches }: SearchSectionProps) {
  const [searchValue, setSearchValue] = useState("")
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const router = useRouter();

  // Banner images data based on active tab
  const getBannerImages = () => {
    switch (activeTab) {
      case "restaurants":
        return [
          {
            src: "/banner/restuarants/Can you generate restaurant sbanner images for a burger promo_ Text FREE BURGER.jpg",
            alt: "Free Burger Promo"
          },
          {
            src: "/banner/restuarants/Can you generate restaurant sbanner images for apizza promo_ Text 30 days of pizza 3d charater.jpg",
            alt: "30 Days of Pizza Promo"
          },
          {
            src: "/banner/restuarants/Can you generate restaurant sbanner images, randon food item with random messaging.jpg",
            alt: "Food Promo Banner"
          }
        ];
      case "groceries":
        return [
          {
            src: "/banner/groceries/grocery1.png",
            alt: "Grocery Promo 1"
          },
          {
            src: "/banner/groceries/grocery2.png",
            alt: "Grocery Promo 2"
          },
          {
            src: "/banner/groceries/grocery3.png",
            alt: "Grocery Promo 3"
          }
        ];
      case "pharmacy":
        return [
          {
            src: "/banner/pharmacies/phamarcy1.png",
            alt: "Pharmacy Promo 1"
          },
          {
            src: "/banner/pharmacies/phamarcy2.png",
            alt: "Pharmacy Promo 2"
          }
        ];
      default:
        return [
          {
            src: "/banner/restuarants/Can you generate restaurant sbanner images for a burger promo_ Text FREE BURGER.jpg",
            alt: "Free Burger Promo"
          },
          {
            src: "/banner/restuarants/Can you generate restaurant sbanner images for apizza promo_ Text 30 days of pizza 3d charater.jpg",
            alt: "30 Days of Pizza Promo"
          },
          {
            src: "/banner/restuarants/Can you generate restaurant sbanner images, randon food item with random messaging.jpg",
            alt: "Food Promo Banner"
          }
        ];
    }
  };

  const bannerImages = getBannerImages();

  // Reset banner index when tab changes
  useEffect(() => {
    setCurrentBannerIndex(0);
  }, [activeTab]);

  // Auto-scroll banner every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) =>
        (prevIndex + 1) % bannerImages.length
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [bannerImages.length])

  useEffect(() => {
    loadGoogleMaps().catch(console.error)

    // Log current location data when component mounts
    const locationData = localStorage.getItem('userLocationData')
    if (locationData) {
      const parsedData = JSON.parse(locationData)
      console.log('Current Location Data:', {
        address: parsedData.address,
        coordinates: {
          latitude: parsedData.lat,
          longitude: parsedData.lng
        }
      })
    }
  }, [])

  // Log when location changes
  useEffect(() => {
    if (userLocation) {
      const locationData = localStorage.getItem('userLocationData')
      if (locationData) {
        const parsedData = JSON.parse(locationData)
        console.log('Location Updated:', {
          address: userLocation,
          coordinates: {
            latitude: parsedData.lat,
            longitude: parsedData.lng
          }
        })
      }
    }
  }, [userLocation])

  // In-memory dropdown search
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch(value)
    // Emit search events for grocery and pharmacy components
    window.dispatchEvent(new CustomEvent('grocerySearchUpdate', {
      detail: { query: value }
    }));
    window.dispatchEvent(new CustomEvent('pharmacySearchUpdate', {
      detail: { query: value }
    }));
    
    // Disable dropdown functionality
  }

  // Hide dropdown on blur (with slight delay for click)
  const handleBlur = () => {
    // Dropdown functionality disabled
  }

  // Handle result click
  const handleResultClick = (result: any) => {
    setSearchValue("")
    // Navigate to detail page based on result type
    if (result.type === 'restaurant') {
      router.push(`/restaurants/${result.slug || result.id}`);
    } else if (result.type === 'grocery') {
      router.push(`/groceries/${result.slug || result.id}`);
    } else if (result.type === 'pharmacy') {
      router.push(`/pharmacy/${result.slug || result.id}`);
    } else if (result.type === 'food') {
      router.push(`/restaurants/${result.slug || result.id}`);
    }
  }

  const handleLocationClick = () => {
    console.log('Location button clicked')
    const locationData = localStorage.getItem('userLocationData')
    if (locationData) {
      console.log('Current Location Data before change:', JSON.parse(locationData))
    }
    onLocationClick()
  }

  const getPlaceholder = () => {
    if (activeTab === 'restaurants') return 'Search Restaurants';
    if (activeTab === 'groceries') return 'Search Groceries';
    if (activeTab === 'pharmacy') return 'Search Pharmacy';
    return 'Search';
  };

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="py-4">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Location Row */}
            <div className="mb-3">
              <button
                type="button"
                onClick={handleLocationClick}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white w-full justify-start"
                aria-label="Select delivery location"
              >
                <MapPin className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <span className="font-medium text-sm text-gray-700 truncate">{userLocation}</span>
              </button>
            </div>
            
            {/* Search Row */}
            <div className="mb-4">
              {/* Mobile search input: */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={getPlaceholder()}
                  value={searchValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full pl-10 pr-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  autoComplete="off"
                />
                {/* Dropdown results - DISABLED */}
                {/* Filter button */}
                {onFilterClick && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full flex items-center gap-2 flex-shrink-0"
                    onClick={onFilterClick}
                    aria-label="Open filter options"
                  >
                    <Settings2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs Row */}
            <div className="w-full mb-4">
              <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                  <TabsTrigger value="groceries">Groceries</TabsTrigger>
                  <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Mobile Auto-Scrolling Banner */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
              >
                {bannerImages.map((banner, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-2">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-sm">
                      <Image
                        src={banner.src}
                        alt={banner.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 0px"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Banner Indicators - REMOVED */}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between w-full">
            {/* Location */}
            <button
              type="button"
              onClick={handleLocationClick}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap flex-shrink-0"
            >
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{userLocation}</span>
            </button>

            {/* Search */}
            {/* Desktop search input: */}
            <div className="flex-1 relative mx-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={getPlaceholder()}
                value={searchValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full pl-10 pr-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                autoComplete="off"
              />
              {/* Dropdown results - DISABLED */}
              {/* Filter button */}
              {onFilterClick && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full flex items-center gap-2 flex-shrink-0"
                  onClick={onFilterClick}
                  aria-label="Open filter options"
                >
                  <Settings2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0">
              <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList>
                  <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                  <TabsTrigger value="groceries">Groceries</TabsTrigger>
                  <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 