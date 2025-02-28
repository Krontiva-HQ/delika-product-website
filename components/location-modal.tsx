"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GooglePlacesAutocomplete } from "@/components/google-places-autocomplete"

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: google.maps.places.PlaceResult) => void
}

export function LocationModal({ isOpen, onClose, onLocationSelect }: LocationModalProps) {
  const handleSelect = (location: google.maps.places.PlaceResult) => {
    console.log('Location selected in modal:', location)
    onLocationSelect(location)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        <GooglePlacesAutocomplete onPlaceSelect={handleSelect} />
      </DialogContent>
    </Dialog>
  )
} 