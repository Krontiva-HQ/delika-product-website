"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Phone, Star } from "lucide-react"

interface BranchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  branch: {
    branchName: string
    branchLocation: string
    branchPhoneNumber: string
    branchCity: string
    branchLatitude: string
    branchLongitude: string
    _restaurantTable: Array<{
      restaurantName: string
      restaurantPhoneNumber: string
      restaurantLogo: {
        url: string
      }
    }>
  }
}

export function BranchDetailsModal({ isOpen, onClose, branch }: BranchDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{branch.branchName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Restaurant</h3>
            <p className="text-sm text-gray-600">{branch._restaurantTable[0].restaurantName}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">Contact</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>Branch: {branch.branchPhoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>Restaurant: {branch._restaurantTable[0].restaurantPhoneNumber}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">Location</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{branch.branchLocation}</span>
              </div>
              <div className="text-sm text-gray-600">
                {branch.branchCity}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 