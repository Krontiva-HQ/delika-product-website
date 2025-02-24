"use client"

import { ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface MenuItem {
  id: string
  name: string
  image: string
  description: string
  price: string
}

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Fruit salad",
    image: "/main.jpg",
    description: "Consectetur adipisicing elit. Soluta, impedit, saepe.",
    price: "GH₵10.00",
  },
  {
    id: "2",
    name: "Pancakes",
    image: "/main.jpg",
    description: "Consectetur adipisicing elit. Soluta, impedit, saepe.",
    price: "GH₵3.50",
  },
  // Add more items as needed
]

export function MenuItemsSection() {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Popular Menu Items</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Link 
              key={item.id}
              href={`/menu-item/${item.id}`}
              className="flex gap-4 items-center bg-white p-4 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{item.price}</span>
                <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full">
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 