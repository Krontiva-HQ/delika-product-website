import Image from "next/image"

const brands = [
  { src: "/asaabea.png", alt: "Asaabea's Kitchen" },
  { src: "/livresto.png", alt: "Liv Resto" },
  { src: "/marinate.jpg", alt: "Mari Nate" },
  { src: "/snackshack.png", alt: "Snack Shack" },
  { src: "/thegoodbaker.png", alt: "The Good Baker" },
  { src: "/ufoburger.png", alt: "UFO Burger" },
]

export function BrandBanner() {
  return (
    <div className="w-full bg-gray-50 py-16">
      <div className="container px-4 md:px-8">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Powering Popular Restaurants
        </h2>
        <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Trusted by the best restaurants, grocery stores, and pharmacies across Africa
        </p>
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center w-full">
            {brands.map((brand, i) => (
              <div key={i} className="flex items-center justify-center w-full">
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={300}
                  height={100}
                  className="w-full h-16 sm:h-16 md:h-16 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
  
  