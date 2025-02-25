"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AuthNavProps {
  userName: string
  onViewChange: (view: 'stores' | 'orders' | 'favorites' | 'profile' | 'settings') => void
  currentView: string
}

export function AuthNav({ userName, onViewChange, currentView }: AuthNavProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onViewChange('stores')}
              className={`font-medium ${currentView === 'stores' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onViewChange('orders')}
              className={`font-medium ${currentView === 'orders' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
              title="View your order history"
            >
              Orders
            </button>
            <button 
              onClick={() => onViewChange('favorites')}
              className={`font-medium ${currentView === 'favorites' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
              title="View your favorite restaurants and items"
            >
              Favorites
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-600">
                    {userName[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium">{userName}</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onViewChange('profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onViewChange('settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
} 