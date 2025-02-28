import { LocationSearchModalProps } from "@/components/location-search-modal"

export function LocationModal({ isOpen, onClose, onLocationSelect }: LocationSearchModalProps) {
  const handleSelect = (location: any) => {
    console.log('Location selected in modal:', location)
    onLocationSelect(location)
    onClose()
  }

  return (
    // ... your modal JSX ...
  )
} 