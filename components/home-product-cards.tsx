import Image from "next/image"
import { Plus } from "lucide-react"

const products = [
  {
    name: "Classic Burger",
    image: "/burger.webp",
    calories: 480,
    persons: 1,
    price: "$4.99",
    featured: false,
  },
  {
    name: "Delika Special",
    image: "/main.webp",
    calories: 520,
    persons: 2,
    price: "$7.99",
    featured: true,
  },
  {
    name: "Hero Platter",
    image: "/hero-image.png",
    calories: 650,
    persons: 3,
    price: "$9.99",
    featured: false,
  },
]

export function HomeProductCards() {
  return (
    <section className="relative py-16 bg-white overflow-hidden">
      {/* Decorative floating images (optional, can add later) */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Wake Up Early,<br />Eat Fresh & Healthy</h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg">
          Aside from their natural good taste and great crunchy texture alongside wonderful colors and fragrances, eating a large serving of fresh.
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-5xl mx-auto z-10 relative">
        {products.map((product, i) => (
          <div
            key={product.name}
            className={`relative flex flex-col items-center bg-white rounded-3xl shadow-lg px-6 pt-14 pb-8 w-72 transition-all duration-300 ${product.featured ? "bg-yellow-400 text-white scale-105 z-20" : "bg-white text-gray-900 z-10"}`}
            style={{ boxShadow: product.featured ? "0 8px 32px 0 rgba(255,193,7,0.25)" : undefined }}
          >
            {/* Circular image */}
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full shadow-lg border-4 ${product.featured ? "border-yellow-400 bg-white" : "border-white bg-gray-100"} flex items-center justify-center overflow-hidden`}>
              <Image src={product.image} alt={product.name} width={96} height={96} className="object-cover w-full h-full" />
            </div>
            <h3 className={`mt-14 mb-2 text-lg font-semibold ${product.featured ? "text-white" : "text-gray-900"}`}>{product.name}</h3>
            <div className={`flex items-center justify-center gap-4 text-xs mb-4 ${product.featured ? "text-white/80" : "text-gray-400"}`}>
              <span>{product.calories} calories</span>
              <span className="mx-1">•</span>
              <span>{product.persons} {product.persons === 1 ? "person" : "persons"}</span>
            </div>
            <div className="flex items-center justify-between w-full mt-auto">
              <span className={`text-2xl font-bold ${product.featured ? "text-white" : "text-gray-900"}`}>{product.price}</span>
              <button className={`ml-auto rounded-full p-2 ${product.featured ? "bg-white text-yellow-400" : "bg-yellow-400 text-white"} shadow-md hover:scale-110 transition-transform`}>
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 