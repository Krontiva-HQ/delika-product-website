"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Crosshair } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

interface LocationSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void
}

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export function LocationSearchModal({ isOpen, onClose, onLocationSelect }: LocationSearchModalProps) {
  const [searchValue, setSearchValue] = useState("")
  const [suggestions, setSuggestions] = useState<Array<{ description: string; place_id: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const getCurrentLocation = () => {
    setIsLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            )
            const data = await response.json()
            if (data.results[0]) {
              const address = data.results[0].formatted_address
              onLocationSelect({
                address,
                lat: latitude,
                lng: longitude
              })
              onClose()
            }
          } catch (error) {
            console.error("Error fetching address:", error)
          } finally {
            setIsLoading(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
        }
      )
    }
  }

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
          data.predictions.slice(0, 10).map((prediction: { description: string; place_id: string }) => ({
            description: prediction.description,
            place_id: prediction.place_id
          }))
        )
      }
    } catch (error) {
      console.error("Error searching location:", error)
    }
  }

  const handleSelect = async (description: string) => {
    try {
      const response = await fetch(`/api/places/geocode?address=${encodeURIComponent(description)}`)
      const data = await response.json()
      
      if (data.result) {
        const addressComponents = data.result.address_components as AddressComponent[]
        const city = addressComponents.find(
          (component: AddressComponent) => 
            component.types.includes("locality") || 
            component.types.includes("administrative_area_level_2")
        )
        
        const address = data.result.formatted_address
        onLocationSelect({
          address,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        })
        setSearchValue("")
        onClose()
      }
    } catch (error) {
      console.error("Error getting location details:", error)
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
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 justify-center"
            onClick={getCurrentLocation}
            disabled={isLoading}
          >
            <Crosshair className="w-4 h-4" />
            {isLoading ? "Getting location..." : "Use current location"}
          </Button>

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