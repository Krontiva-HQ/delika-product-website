"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Crosshair } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { loadGoogleMaps } from "@/lib/google-maps"

interface LocationSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void
}

export function LocationSearchModal({ isOpen, onClose, onLocationSelect }: LocationSearchModalProps) {
  const [searchValue, setSearchValue] = useState("")
  const [suggestions, setSuggestions] = useState<Array<{ 
    description: string; 
    place_id: string; 
    enhanced_name: string;
    types: string[];
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !mapsLoaded) {
      loadGoogleMaps()
        .then(() => {
          setMapsLoaded(true)
          setLoadError(null)
        })
        .catch((error) => {
          console.error('Failed to load Google Maps:', error)
          setLoadError('Failed to load location services. Please try again later.')
        })
    }
  }, [isOpen, mapsLoaded])

  const getCurrentLocation = () => {
    if (!mapsLoaded) {
      console.error('Google Maps not loaded yet')
      return
    }

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
              const result = data.results[0]
              // Try to get a more readable place name from the address components
              const addressComponents = result.address_components || []
              
              // Look for a business/point of interest name first
              const placeName = addressComponents.find((component: any) => 
                component.types.includes('establishment') || 
                component.types.includes('point_of_interest')
              )?.long_name ||
              // Fall back to route + sublocality
              `${addressComponents.find((component: any) => component.types.includes('route'))?.long_name || ''} ${
                addressComponents.find((component: any) => component.types.includes('sublocality'))?.long_name || ''
              }`.trim() ||
              // Finally fall back to formatted address first part
              result.formatted_address.split(',')[0] ||
              'Current Location'

              const locationData = {
                address: placeName,
                lat: latitude,
                lng: longitude
              }
              console.log('Current location selected:', locationData)
              // Save to localStorage with consistent key
              localStorage.setItem('userLocationData', JSON.stringify(locationData))
              onLocationSelect(locationData)
              onClose()
            }
          } catch (error) {
            console.error("Error fetching address:", error)
            setLoadError('Failed to get your location. Please try searching instead.')
          } finally {
            setIsLoading(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
          setLoadError('Unable to access your location. Please check your browser settings.')
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
          data.predictions.slice(0, 10).map((prediction: any) => {
            // Enhanced place name extraction for display
            const description = prediction.description
            const parts = description.split(',')
            
            // Check if this is likely a business/establishment
            const types = prediction.types || []
            const isEstablishment = types.includes('establishment') || 
                                   types.includes('point_of_interest') ||
                                   types.includes('premise')
            
            let placeName = parts[0].trim()
            
            // If it's not an establishment, try to create a more meaningful name
            if (!isEstablishment && parts.length > 1) {
              // Look for patterns like "Street Name, Area" or "Area, City"
              const firstPart = parts[0].trim()
              const secondPart = parts[1].trim()
              
              // If first part looks like a street number + name, use first two parts
              if (/^\d+/.test(firstPart) && parts.length > 2) {
                placeName = `${firstPart}, ${secondPart}`
              } else if (firstPart.length < 30) { // Keep concise place names
                placeName = firstPart
              }
            }
            
            return {
              description: prediction.description,
              place_id: prediction.place_id,
              enhanced_name: placeName,
              types: types
            }
          })
        )
      }
    } catch (error) {
      console.error("Error searching location:", error)
    }
  }

  const handleSelect = async (description: string, placeName?: string) => {
    try {
      const response = await fetch(`/api/places/geocode?address=${encodeURIComponent(description)}`)
      const data = await response.json()
      
      if (data.result) {
        const address = data.result.formatted_address
        const addressComponents = data.result.address_components || []
        
        // Enhanced place name extraction - prioritize meaningful location names
        let displayName = placeName || description.split(',')[0] || ''
        
        // Try to get better place names from address components
        const establishment = addressComponents.find((component: any) => 
          component.types.includes('establishment') || 
          component.types.includes('point_of_interest')
        )?.long_name
        
        const premise = addressComponents.find((component: any) => 
          component.types.includes('premise')
        )?.long_name
        
        const subpremise = addressComponents.find((component: any) => 
          component.types.includes('subpremise')
        )?.long_name
        
        const route = addressComponents.find((component: any) => 
          component.types.includes('route')
        )?.long_name
        
        const sublocality = addressComponents.find((component: any) => 
          component.types.includes('sublocality') || 
          component.types.includes('sublocality_level_1')
        )?.long_name
        
        const locality = addressComponents.find((component: any) => 
          component.types.includes('locality')
        )?.long_name
        
        // Priority order for display name
        if (establishment) {
          displayName = establishment
        } else if (premise) {
          displayName = premise
        } else if (route && sublocality) {
          displayName = `${route}, ${sublocality}`
        } else if (route) {
          displayName = route
        } else if (sublocality) {
          displayName = sublocality
        } else if (locality) {
          displayName = locality
        }
        
        const locationData = {
          address: displayName, // Use enhanced place name for display
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        }
        console.log('Location selected from search:', locationData)
        // Save to localStorage with consistent key
        localStorage.setItem('userLocationData', JSON.stringify(locationData))
        
        onLocationSelect(locationData)
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
      <DialogContent 
        className="sm:max-w-[425px]" 
        aria-describedby="location-search-description"
      >
        <DialogHeader>
          <DialogTitle>Set Your Delivery Location</DialogTitle>
          <DialogDescription id="location-search-description">
            Enter your delivery address or use your current location to find restaurants that deliver to you.
          </DialogDescription>
        </DialogHeader>
        
        {loadError ? (
          <div className="text-red-500 text-sm mb-4">{loadError}</div>
        ) : (
          <div className="mt-4 space-y-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center"
              onClick={getCurrentLocation}
              disabled={isLoading || !mapsLoaded}
            >
              <Crosshair className="w-4 h-4" />
              {isLoading ? "Getting delivery location..." : "Use current location for delivery"}
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for your delivery location"
                className="pl-10"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  searchLocation(e.target.value)
                }}
                disabled={!mapsLoaded}
              />
            </div>

            {suggestions.length > 0 && (
              <ul className="mt-4 space-y-2">
                {suggestions.map((suggestion) => {
                  const parts = suggestion.description.split(',');
                  // Use enhanced name for better display
                  const placeName = suggestion.enhanced_name;
                  const location = parts.slice(1).join(',').trim();
                  
                  // Show a pin icon for businesses/establishments, different icon for addresses
                  const isEstablishment = suggestion.types?.includes('establishment') || 
                                         suggestion.types?.includes('point_of_interest');
                  
                  return (
                    <li 
                      key={suggestion.place_id}
                      className="flex items-start gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                      onClick={() => handleSelect(suggestion.description, suggestion.enhanced_name)}
                    >
                      <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isEstablishment ? 'text-orange-500' : 'text-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          isEstablishment ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {placeName}
                          {isEstablishment && (
                            <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                              Business
                            </span>
                          )}
                        </div>
                        {location && (
                          <div className="text-xs text-gray-500 mt-1">{location}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 