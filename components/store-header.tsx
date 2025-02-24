"use client"

import { MapPin, Search, SlidersHorizontal, Star, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Restaurant {
  id: string
  restaurantName: string
  restaurantLogo: {
    url: string
  }
  restaurantAddress: string
  restaurantEmail: string
  restaurantPhoneNumber: string
  created_at: number
}

export function StoreHeader() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [activeTab, setActiveTab] = useState<'restaurants' | 'menus'>('restaurants')

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_restaurants_table')
        const data = await response.json()
        setRestaurants(data)
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      }
    }

    fetchRestaurants()
  }, [])

  return (
    <div className="bg-white">
      {/* Search Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="flex items-center gap-4 max-w-3xl w-full">
            <button className="flex items-center gap-2 hover:text-gray-600">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Accra</span>
            </button>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Restaurants and stores"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="text-sm">Filter</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Branches</DropdownMenuLabel>
                <DropdownMenuItem>East Legon</DropdownMenuItem>
                <DropdownMenuItem>Osu</DropdownMenuItem>
                <DropdownMenuItem>Accra Mall</DropdownMenuItem>
                <DropdownMenuItem>Tema</DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Price Range</DropdownMenuLabel>
                <DropdownMenuItem>GH₵ Under 20</DropdownMenuItem>
                <DropdownMenuItem>GH₵ 20 - 50</DropdownMenuItem>
                <DropdownMenuItem>GH₵ 50 - 100</DropdownMenuItem>
                <DropdownMenuItem>GH₵ 100+</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-sm">
                Login
              </Button>
              <Button className="text-sm bg-orange-500 hover:bg-orange-600">
                Register
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-8 border-b mb-6">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'restaurants'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => setActiveTab('menus')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'menus'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Menus
          </button>
        </div>

        {/* Content */}
        {activeTab === 'restaurants' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {restaurants.map((restaurant) => (
              <Link 
                key={restaurant.id}
                href={`/restaurant/${restaurant.id}`}
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="relative aspect-[4/3] rounded-t-lg overflow-hidden">
                  <Image
                    src={restaurant.restaurantLogo.url}
                    alt={restaurant.restaurantName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                    4.7
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{restaurant.restaurantName}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>GH₵6.00</span>
                    <span>•</span>
                    <span>25-30 min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'menus' && (
          <div className="text-center text-gray-600 py-12">
            Menu content coming soon...
          </div>
        )}
      </div>
    </div>
  )
}

