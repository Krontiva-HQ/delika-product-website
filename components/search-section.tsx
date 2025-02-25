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
import { useState } from "react"
import { LocationSearchModal } from "@/components/location-search-modal"

interface SearchSectionProps {
  onSearch?: (query: string) => void
  onCitySelect?: (city: string) => void
  cities?: string[]
  userLocation?: string
}

export function SearchSection({ onSearch, onCitySelect, cities = [], userLocation = "Loading..." }: SearchSectionProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        <div className="flex items-center gap-4 max-w-3xl w-full">
          <button 
            onClick={() => setIsLocationModalOpen(true)} 
            className="flex items-center gap-2 hover:text-gray-600 max-w-[200px]"
          >
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium truncate">{userLocation}</span>
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
              <button className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2">
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
        onLocationSelect={() => {}}
      />
    </div>
  )
} 