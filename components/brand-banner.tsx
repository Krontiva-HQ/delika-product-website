import Image from "next/image"

const brands = [
  { src: "/starbites.png", alt: "Starbites" },
  { src: "/papas-logo.png", alt: "Papas Pizza" },
  { src: "/eddys-pizza.png", alt: "Eddy's Pizza" },
  { src: "/wingman-logo.png", alt: "Wingman" },
  { src: "/dominos.svg", alt: "Dominos" },
  { src: "/pizzaman.png", alt: "Pizza Man" },
  { src: "/pizarea-logo.png", alt: "Pizarea" },
  { src: "/cafe-de-boba.png", alt: "Cafe de Boba" },
]

export function BrandBanner() {
  return (
    <div className="w-full bg-white py-12">
      <div className="container px-4 md:px-8">
        <h2 className="text-center text-2xl sm:text-3xl font-medium text-muted-foreground mb-8 md:mb-12">
          Powering popular restaurants across Africa
        </h2>
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 md:gap-12 items-center w-full">
            {brands.map((brand, i) => (
              <div key={i} className="flex items-center justify-center w-full">
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={300}
                  height={100}
                  className="w-full h-6 sm:h-8 md:h-10 object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
  
  