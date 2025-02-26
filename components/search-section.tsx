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

  useEffect(() => {
    // Load saved location on mount
    const savedLocationData = localStorage.getItem('userLocationData')
    if (savedLocationData) {
      const { address } = JSON.parse(savedLocationData)
      setSavedLocation(address)
    }
  }, [])

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    // Save to localStorage
    localStorage.setItem('userLocationData', JSON.stringify(location))
    setSavedLocation(location.address)
    onLocationSelect?.(location)
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
            className="flex items-center gap-2 hover:text-gray-600 w-full md:w-auto md:max-w-[200px]"
          >
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span className="hidden md:inline font-medium truncate">{savedLocation}</span>
          </button>

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

      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  )
} 