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
    <div className="w-full bg-white py-12">
      <div className="container px-4 md:px-8">
        <h2 className="text-center text-2xl sm:text-3xl font-medium text-muted-foreground mb-8 md:mb-12">
          Powering popular restaurants across Africa
        </h2>
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12 items-center w-full">
            {brands.map((brand, i) => (
              <div key={i} className="flex items-center justify-center w-full">
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={300}
                  height={100}
                  className="w-full h-12 sm:h-12 md:h-12 object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
  
  