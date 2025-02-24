"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MapPin, Search } from "lucide-react"
import { useEffect, useState } from "react"

interface LocationSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void
}

export function LocationSearchModal({ isOpen, onClose, onLocationSelect }: LocationSearchModalProps) {
  const [searchValue, setSearchValue] = useState("")
  const [suggestions, setSuggestions] = useState<Array<{ description: string; place_id: string }>>([])

  const searchLocation = async (query: string) => {
    if (!query) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.predictions) {
        setSuggestions(
          data.predictions.map((prediction: any) => ({
            description: prediction.description,
            place_id: prediction.place_id
          }))
        )
      }
    } catch (error) {
      console.error("Error searching location:", error)
    }
  }

  const handleSelect = async (address: string) => {
    try {
      const response = await fetch(
        `/api/places/geocode?address=${encodeURIComponent(address)}`
      )
      const data = await response.json()
      
      if (data.result) {
        onLocationSelect({
          address: data.result.formatted_address,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        })
        setSearchValue("")
        onClose()
      }
    } catch (error) {
      console.error("Error selecting location:", error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setSearchValue("")
      setSuggestions([])
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select your location</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for your location"
              className="pl-10"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                searchLocation(e.target.value)
              }}
            />
          </div>

          {suggestions.length > 0 && (
            <ul className="mt-4 space-y-2">
              {suggestions.map((suggestion) => (
                <li 
                  key={suggestion.place_id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => handleSelect(suggestion.description)}
                >
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{suggestion.description}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 