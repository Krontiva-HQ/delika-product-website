import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const featuredStores = [
  {
    id: "1",
    name: "Fair Way Minimarket Labone",
    image: "/main.jpg", // Add this image to your public folder
    category: "Groceries and more",
    rating: 4.7,
    reviews: "500+",
    price: "GH₵16.00",
    deliveryTime: "45-50 min",
  },
  // Add more stores as needed
]

export function ShopHero() {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Featured Stores</h2>
        </div>

        {featuredStores.map((store) => (
          <Link 
            key={store.id} 
            href={`/store/${store.id}`}
            className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="grid md:grid-cols-2 gap-6 bg-yellow-100">
              <div className="relative h-[400px]">
                <Image
                  src={store.image}
                  alt={store.name}
                  fill
                  className="object-cover rounded-l-lg"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="text-sm text-gray-600 mb-2">{store.category}</div>
                <h3 className="text-3xl font-semibold mb-4">{store.name}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-400" />
                    <span className="font-medium">{store.rating}</span>
                    <span className="text-gray-600">({store.reviews})</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <span>{store.price}</span>
                  <span className="text-gray-600">•</span>
                  <span>{store.deliveryTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
} 