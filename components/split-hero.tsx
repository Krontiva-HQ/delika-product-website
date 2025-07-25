import Image from "next/image"
import Link from "next/link"

const splits = [
  {
    title: "Restaurants",
    description: "Browse top restaurants and order your favorite meals.",
    image: "/restaurant-interior.jpg",
    button: { text: "View Restaurants", href: "/restaurants" },
  },
  {
    title: "Groceries",
    description: "Shop fresh groceries and essentials, delivered to your door.",
    image: "/small-food-2.png",
    button: { text: "Shop Groceries", href: "/groceries" },
  },
  {
    title: "Pharmacy",
    description: "Order pharmacy essentials and health products easily.",
    image: null, // No pharmacy image found, use a color background
    button: { text: "Shop Pharmacy", href: "/pharmacy" },
  },
]

export function SplitHero() {
  return (
    <section className="w-full h-[80vh] flex flex-col md:flex-row">
      {splits.map((split, i) => (
        <div
          key={split.title}
          className="relative flex-1 flex items-center justify-center overflow-hidden group"
          style={{ minWidth: 0 }}
        >
          {/* Background */}
          {split.image ? (
            <Image
              src={split.image}
              alt={split.title}
              fill
              className="object-cover object-center absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-105"
              priority={i === 0}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-white to-pink-100 z-0" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10" />
          {/* Centered Card */}
          <div className="relative z-20 flex flex-col items-center justify-center bg-black/80 rounded-xl px-8 py-10 md:px-10 md:py-12 shadow-xl text-center min-w-[220px] max-w-[90%]">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'cursive' }}>{split.title}</h2>
            <p className="text-white/80 mb-6 text-sm md:text-base max-w-xs">{split.description}</p>
            <Link
              href={split.button.href}
              className="inline-block border border-white text-white px-6 py-2 rounded transition-colors hover:bg-white hover:text-black font-medium tracking-wide"
            >
              {split.button.text}
            </Link>
          </div>
        </div>
      ))}
    </section>
  )
} 