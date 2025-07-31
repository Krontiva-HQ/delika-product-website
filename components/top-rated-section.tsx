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
  vendorType?: string
}

const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Asaabea's Kitchen",
    image: "/asaabea.png",
    rating: 4.8,
    reviews: "500+",
    price: "GH₵8.00",
    deliveryTime: "35-40 min",
    vendorType: "restaurant"
  },
  {
    id: "2",
    name: "The Good Baker",
    image: "/thegoodbaker.png",
    rating: 4.9,
    reviews: "300+",
    price: "GH₵12.00",
    deliveryTime: "20-30 min",
    vendorType: "restaurant"
  },
  {
    id: "3",
    name: "UFO Burger",
    image: "/ufoburger.png",
    rating: 4.7,
    reviews: "200+",
    price: "GH₵15.00",
    deliveryTime: "15-25 min",
    vendorType: "restaurant"
  },
  {
    id: "4",
    name: "Liv Resto",
    image: "/livresto.png",
    rating: 4.6,
    reviews: "150+",
    price: "GH₵10.00",
    deliveryTime: "30-40 min",
    vendorType: "restaurant"
  },
  {
    id: "5",
    name: "Mari Nate",
    image: "/marinate.jpg",
    rating: 4.5,
    reviews: "100+",
    price: "GH₵9.00",
    deliveryTime: "25-35 min",
    vendorType: "restaurant"
  },
  {
    id: "6",
    name: "Snack Shack",
    image: "/snackshack.png",
    rating: 4.4,
    reviews: "80+",
    price: "GH₵6.00",
    deliveryTime: "10-20 min",
    vendorType: "restaurant"
  },
]

export function TopRatedSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  // Function to determine the correct URL based on vendor type
  const getVendorUrl = (restaurant: Restaurant) => {
    const slug = slugify(restaurant.name)
    switch (restaurant.vendorType) {
      case 'grocery':
        return `/groceries/${slug}`
      case 'pharmacy':
        return `/pharmacy/${slug}`
      case 'restaurant':
      default:
        return `/restaurants/${slug}`
    }
  }

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
                <Link href={getVendorUrl(restaurant)}>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                    <Image
                      src={restaurant.image || "/main.jpg"}
                      alt={restaurant.name}
                      fill
                      sizes="(max-width: 768px) 280px, 280px"
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

