"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

const allVendors = [
  {
    name: "Asaabea's Kitchen",
    image: "/asaabea.png",
    type: "Restaurant",
    rating: 4.8,
    deliveryTime: "25-35 min",
    slug: "asaabeas-kitchen"
  },
  {
    name: "The Good Baker",
    image: "/thegoodbaker.png", 
    type: "Bakery",
    rating: 4.9,
    deliveryTime: "20-30 min",
    slug: "the-good-baker"
  },
  {
    name: "UFO Burger",
    image: "/ufoburger.png",
    type: "Fast Food",
    rating: 4.7,
    deliveryTime: "15-25 min",
    slug: "ufo-burger"
  },
  {
    name: "Liv Resto",
    image: "/livresto.png",
    type: "Restaurant",
    rating: 4.6,
    deliveryTime: "30-40 min",
    slug: "liv-resto"
  },
  {
    name: "Mari Nate",
    image: "/marinate.jpg",
    type: "Restaurant",
    rating: 4.5,
    deliveryTime: "25-35 min",
    slug: "mari-nate"
  },
  {
    name: "Snack Shack",
    image: "/snackshack.png",
    type: "Fast Food",
    rating: 4.4,
    deliveryTime: "10-20 min",
    slug: "snack-shack"
  }
]

export function YourFavorites() {
  const [featuredVendors, setFeaturedVendors] = useState(allVendors.slice(0, 6))

  useEffect(() => {
    // Shuffle the vendors array and take the first 6
    const shuffled = [...allVendors].sort(() => Math.random() - 0.5)
    setFeaturedVendors(shuffled.slice(0, 6))
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Favorites, Just a Tap Away
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Craving waakye? Need cold meds? Out of baby formula?<br />
            With Delika, you don't have to choose — just shop and relax.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
          {featuredVendors.map((vendor, index) => (
            <motion.div
              key={`${vendor.name}-${index}`}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4"
            >
              <Link href={`/restaurants/${vendor.slug}`} className="block">
                <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={vendor.image}
                    alt={vendor.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    {vendor.type}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {vendor.name}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{vendor.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">🕒</span>
                      <span>{vendor.deliveryTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Button asChild size="lg" className="rounded-xl px-8 bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/vendors">
              Explore All Vendors
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
} 