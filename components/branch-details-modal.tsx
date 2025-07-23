"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Phone, Clock } from "lucide-react"

interface BranchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  branch: {
    branchName?: string
    branchLocation?: string
    branchPhoneNumber?: string
    branchLongitude?: string
    branchLatitude?: string
    branchCity?: string
    openTime?: string
    closeTime?: string
    activeHours?: Array<{
      day: string
      openingTime: string
      closingTime: string
      isActive?: boolean
    }>
    _restaurantTable?: Array<{
      restaurantName?: string
      restaurantLogo?: {
        url: string
      }
    }>
  }
}

export function BranchDetailsModal({ isOpen, onClose, branch }: BranchDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 max-h-[80vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-bold mb-6 px-6 pt-6">
          {branch.branchName || 'Branch Details'}
        </DialogTitle>
        
        <div className="space-y-4 px-6 pb-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="w-full">
              <h4 className="font-medium text-gray-900">Location</h4>
              {(branch.branchLatitude && branch.branchLongitude) ? (
                <div className="mt-2 -mx-6">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${branch.branchLatitude},${branch.branchLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden w-full"
                    title="Open in Google Maps"
                  >
                    <iframe
                      src={`https://www.google.com/maps?q=${branch.branchLatitude},${branch.branchLongitude}&z=16&output=embed`}
                      className="w-full"
                      height="220"
                      style={{ border: 0, width: '100%', borderRadius: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Branch Location Map"
                    />
                  </a>
                  <p className="text-xs text-gray-500 mt-1 px-6">
                    Click the map to open a larger view
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">{branch.branchLocation || 'Location not available'}</p>
              )}
              {(branch.branchLatitude && branch.branchLongitude) && (
                null
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Phone</h4>
              <p className="text-gray-600">{branch.branchPhoneNumber || 'Phone not available'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Hours</h4>
              {branch.activeHours && branch.activeHours.length > 0 ? (
                <div className="space-y-1">
                  {branch.activeHours.map((hours) => (
                    <div key={hours.day} className="flex justify-between text-sm">
                      <span className={`${hours.isActive !== false ? 'text-gray-900' : 'text-gray-400'}`}>
                        {hours.day}:
                      </span>
                      <span className={`${hours.isActive !== false ? 'text-gray-600' : 'text-gray-400'}`}>
                        {hours.isActive !== false ? `${hours.openingTime} - ${hours.closingTime}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  {branch.openTime && branch.closeTime 
                    ? `Open ${branch.openTime} - ${branch.closeTime}`
                    : 'Hours not available'}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 