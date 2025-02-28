"use client"

import { useEffect, useRef } from 'react'
import { Input } from './ui/input'

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
}

export function GooglePlacesAutocomplete({ onPlaceSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (inputRef.current && window.google) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current)
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (place) {
          onPlaceSelect(place)
        }
      })
    }
  }, [onPlaceSelect])

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder="Enter your location"
      className="w-full"
    />
  )
} 