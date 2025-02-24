"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Star, MapPin, Phone, Clock, Info } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface BranchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  branch: {
    branchName: string
    branchLocation: string
    branchPhoneNumber: string
    _restaurantTable: Array<{
      restaurantName: string
      restaurantLogo: {
        url: string
      }
    }>
  }
}

export function BranchDetailsModal({ isOpen, onClose, branch }: BranchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'info'>('menu')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        {/* Header Section */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 relative">
            <Image
              src={branch._restaurantTable[0].restaurantLogo.url}
              alt={branch._restaurantTable[0].restaurantName}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Restaurant Info Overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold mb-1">
              {branch.branchName}
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="ml-1">4.4</span>
                <span className="text-gray-300 ml-1">(500+)</span>
              </div>
              <span>•</span>
              <span>Delivery</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-8 border-b mb-6">
            <button
              onClick={() => setActiveTab('menu')}
              className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                activeTab === 'menu'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                activeTab === 'info'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Info
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'menu' ? (
            <div className="text-center text-gray-500 py-8">
              Menu content coming soon...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Location</h4>
                  <p className="text-gray-600">{branch.branchLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Phone</h4>
                  <p className="text-gray-600">{branch.branchPhoneNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Hours</h4>
                  <p className="text-gray-600">Open 8:00 AM - 10:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Additional Info</h4>
                  <p className="text-gray-600">Delivery available • Dine-in • Takeaway</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 