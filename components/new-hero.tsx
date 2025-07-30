"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Utensils, ShoppingBag, Pill } from "lucide-react"
import { useState, useEffect } from "react"

const sliderImages = [
  { id: 1, src: "/headerimage.png", alt: "Delika delivery illustration" },
  { id: 2, src: "/fast-food.jpg", alt: "Delika delivery illustration" },
  { id: 3, src: "/shopping-bag.jpg", alt: "Delika delivery illustration" },
]

export function NewHero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden" 
      style={{ 
        minHeight: 'calc(-4rem + 100vh)',
        height: 'calc(-84rem + 100vh)'
      }}
    >
      <div className="container mx-auto px-4 md:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-12 h-full">
        {/* Left: Text content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6">
          {/* Icons Row */}
          <div className="flex gap-8 mb-2 justify-center md:justify-start">
            <div className="flex flex-col items-center">
              <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-orange-100 mb-1">
                <Utensils className="w-6 h-6 text-orange-600" />
              </span>
              <span className="text-xs mt-1 font-medium text-orange-600">Food</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 mb-1">
                <ShoppingBag className="w-6 h-6 text-green-700" />
              </span>
              <span className="text-xs mt-1 font-medium text-green-700">Groceries</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 mb-1">
                <Pill className="w-6 h-6 text-blue-400" />
              </span>
              <span className="text-xs mt-1 font-medium text-blue-400">Pharmacy</span>
            </div>
          </div>
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
          >
            Order food, groceries, and pharmacy essentials<br className="hidden md:inline" />
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="max-w-xl text-sm md:text-lg text-muted-foreground"
          >
            Discover top restaurants, grocery stores, and pharmacies. <br className="hidden md:inline" />
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="flex flex-row gap-3 w-full justify-center md:justify-start"
          >
            <Button asChild size="lg" className="rounded-xl px-8 bg-orange-500 text-white">
              <Link href="/vendors">Browse</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl px-8 border-2 border-black text-black">
              <Link href="/restaurant-partner">Become a Vendor</Link>
            </Button>
          </motion.div>
        </div>
        {/* Right: Hero image slider */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="flex-1 flex items-center justify-center relative w-full max-w-md md:max-w-lg lg:max-w-2xl"
        >
          <div className="relative w-full aspect-square max-w-[450px] md:max-w-[550px] lg:max-w-[700px] h-auto">
            {sliderImages.map((img, idx) => (
              <Image
                key={img.id}
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-contain rounded-3xl border-4 border-white absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                priority={idx === 0}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
} 