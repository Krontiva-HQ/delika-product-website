"use client"

import { Star, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"

interface Restaurant {
  id: string
  name: string
  image: string
  rating: number
  reviews: string
  price: string
  deliveryTime: string
}

const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Ilona",
    image: "/main.jpg",
    rating: 4.8,
    reviews: "27",
    price: "GH₵6.00",
    deliveryTime: "25-30 min",
  },
  {
    id: "2",
    name: "Capitol Cafe and Restaurant",
    image: "/main.jpg",
    rating: 4.8,
    reviews: "500+",
    price: "GH₵16.00",
    deliveryTime: "40-45 min",
  },
  {
    id: "3",
    name: "Executivez Coconut",
    image: "/main.jpg",
    rating: 4.8,
    reviews: "81",
    price: "GH₵17.00",
    deliveryTime: "40-45 min",
  },
  {
    id: "4",
    name: "Baffy's Eatery",
    image: "/main.jpg",
    rating: 4.8,
    reviews: "500+",
    price: "GH₵19.00",
    deliveryTime: "35-40 min",
  },
  {
    id: "5",
    name: "Pinocchio - Airport",
    image: "/main.jpg",
    rating: 4.7,
    reviews: "145",
    price: "GH₵6.00",
    deliveryTime: "15-20 min",
  },
  {
    id: "6",
    name: "Yoofin",
    image: "/main.jpg",
    rating: 4.7,
    reviews: "500+",
    price: "GH₵8.00",
    deliveryTime: "35-40 min",
  },
]

export function TopRatedSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600
      const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Top-rated</h2>
          <Link href="/all" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors -mr-2"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-hidden pb-4 -mx-4 px-4 scroll-smooth"
          >
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="flex-none w-[280px]">
                <Link href={`/restaurant/${restaurant.id}`}>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                    <Image
                      src={restaurant.image || "/main.jpg"}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                      {restaurant.rating} ({restaurant.reviews})
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{restaurant.price}</span>
                      <span>•</span>
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

