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
import { Button } from "@/components/ui/button"

interface AuthNavProps {
  userName?: string | null
  onViewChange: (view: 'stores' | 'orders' | 'favorites' | 'profile' | 'settings') => void
  currentView: string
  onLoginClick: () => void
  onSignupClick: () => void
  onLogout: () => void
}

export function AuthNav({ 
  userName, 
  onViewChange, 
  currentView,
  onLoginClick,
  onSignupClick,
  onLogout
}: AuthNavProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/shop" className="font-semibold text-orange-500">
              Home
            </Link>
            {userName && (
              <>
                <button 
                  onClick={() => onViewChange('orders')}
                  className={`text-gray-600 hover:text-gray-900 ${currentView === 'orders' ? 'text-orange-500' : ''}`}
                  title="View your order history"
                >
                  Orders
                </button>
                <button 
                  onClick={() => onViewChange('favorites')}
                  className={`text-gray-600 hover:text-gray-900 ${currentView === 'favorites' ? 'text-orange-500' : ''}`}
                  title="View your favorite restaurants and items"
                >
                  Favorites
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {userName ? (
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
                  <DropdownMenuItem className="text-red-600" onSelect={onLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={onLoginClick}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Button>
                <Button 
                  onClick={onSignupClick}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 