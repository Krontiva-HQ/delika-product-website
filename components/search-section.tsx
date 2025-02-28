"use client"

import { MapPin, Search, SlidersHorizontal, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { LocationSearchModal } from "@/components/location-search-modal"
import { LocationModal } from "@/components/location-modal"

interface SearchSectionProps {
  onSearch?: (query: string) => void
  onCitySelect?: (city: string) => void
  cities?: string[]
  userLocation?: string
  onLocationSelect?: (location: { address: string; lat: number; lng: number }) => void
}

export function SearchSection({ 
  onSearch, 
  onCitySelect, 
  cities = [], 
  userLocation = "Loading...",
  onLocationSelect 
}: SearchSectionProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [savedLocation, setSavedLocation] = useState(userLocation)

  // Load saved location on mount
  useEffect(() => {
    const savedLocationData = localStorage.getItem('userLocation')
    if (savedLocationData) {
      try {
        const locationData = JSON.parse(savedLocationData)
        setSavedLocation(locationData.address)
        console.log('Loaded saved location:', locationData)
      } catch (e) {
        console.error("Error loading saved location:", e)
      }
    }
  }, [])

  const handleLocationSelect = (location: any) => {
    console.log('Raw location selected:', location)

    // Extract address from Google Places result
    const address = location.formatted_address || 
                   location.description || 
                   location.name || 
                   location.address

    const locationData = {
      address: address,
      placeId: location.place_id,
      coordinates: location.geometry?.location
    }

    console.log('Saving location data:', locationData)

    // Save to localStorage
    localStorage.setItem('userLocation', JSON.stringify(locationData))
    
    // Update UI
    setSavedLocation(address)
    setIsLocationModalOpen(false)

    // Notify parent
    if (onLocationSelect) {
      onLocationSelect({
        address: address,
        lat: location.geometry?.location.lat() || 0,
        lng: location.geometry?.location.lng() || 0
      })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 h-auto md:h-16 flex items-center justify-center py-3 md:py-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full max-w-3xl">
          <button 
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{savedLocation}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          <LocationSearchModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            onLocationSelect={handleLocationSelect}
          />
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-gray-200"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full flex items-center justify-center gap-2 w-full md:w-auto">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="text-sm">Filter</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onCitySelect?.('all')}>
                All Locations
              </DropdownMenuItem>
              {cities.map((city) => (
                <DropdownMenuItem key={city} onClick={() => onCitySelect?.(city)}>
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 