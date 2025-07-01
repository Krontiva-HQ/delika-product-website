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

    // Check if this is the user's first visit and get their location
    const locationData = localStorage.getItem('userLocationData')
    if (!locationData) {
      // First visit - automatically get user's location
      if ("geolocation" in navigator) {
        console.log('First visit detected - getting user location...')
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            console.log('Got user coordinates:', { latitude, longitude })
            
            try {
              // Convert coordinates to address using Google Geocoding
              const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              if (apiKey) {
                const response = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
                )
                const data = await response.json()
                
                if (data.results && data.results[0]) {
                  const address = data.results[0].formatted_address
                  const locationData = {
                    address: address,
                    lat: latitude,
                    lng: longitude
                  }
                  
                  // Save to localStorage
                  localStorage.setItem('userLocationData', JSON.stringify(locationData))
                  console.log('Saved user location:', locationData)
                  
                  // Trigger a custom event to notify other components
                  window.dispatchEvent(new CustomEvent('locationUpdated', { detail: locationData }))
                } else {
                  throw new Error('No geocoding results')
                }
              } else {
                throw new Error('Google Maps API key not configured')
              }
            } catch (error) {
              console.error('Error converting coordinates to address:', error)
              // Save coordinates even if geocoding fails
              const locationData = {
                address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                lat: latitude,
                lng: longitude
              }
              localStorage.setItem('userLocationData', JSON.stringify(locationData))
              window.dispatchEvent(new CustomEvent('locationUpdated', { detail: locationData }))
            }
          },
          (error) => {
            console.error('Error getting user location:', error)
            // Set a default location (Accra, Ghana) if geolocation fails
            const defaultLocation = {
              address: 'Accra, Ghana',
              lat: 5.6037,
              lng: -0.1870
            }
            localStorage.setItem('userLocationData', JSON.stringify(defaultLocation))
            window.dispatchEvent(new CustomEvent('locationUpdated', { detail: defaultLocation }))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      } else {
        console.log('Geolocation not supported - using default location')
        // Set default location if geolocation is not supported
        const defaultLocation = {
          address: 'Accra, Ghana',
          lat: 5.6037,
          lng: -0.1870
        }
        localStorage.setItem('userLocationData', JSON.stringify(defaultLocation))
        window.dispatchEvent(new CustomEvent('locationUpdated', { detail: defaultLocation }))
      }
    } else {
      // Log existing location data
      const parsedData = JSON.parse(locationData)
      console.log('Existing Location Data:', {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch(value)
  }

  const handleLocationClick = () => {
    console.log('Location button clicked')
    const locationData = localStorage.getItem('userLocationData')
    if (locationData) {
      console.log('Current Location Data before change:', JSON.parse(locationData))
    }
    onLocationClick()
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
              onClick={handleLocationClick}
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