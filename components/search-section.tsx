"use client"

import { useState, useEffect } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { loadGoogleMaps } from "@/lib/google-maps"

interface SearchSectionProps {
  onSearch: (query: string) => void
  userLocation: string
  onLocationClick: () => void
}

export function SearchSection({ onSearch, userLocation, onLocationClick }: SearchSectionProps) {
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    loadGoogleMaps().catch(console.error)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch(value)
  }

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for restaurants or dishes"
                value={searchValue}
                onChange={handleChange}
                className="w-full pl-10"
              />
            </div>
            <button
              type="button"
              onClick={onLocationClick}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <MapPin className="w-5 h-5" />
              <span className="max-w-[200px] truncate">{userLocation}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 