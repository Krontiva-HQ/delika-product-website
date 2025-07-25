"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Utensils, ShoppingBag, Pill } from "lucide-react"
import { useState, useEffect } from "react"

const sliderImages = [
  { src: "/asthma.jpg", alt: "Delika delivery illustration" },
  { src: "/fast-food.jpg", alt: "Delika burger" },
  { src: "/shopping-bag.jpg", alt: "Delika hero" },
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
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      <div className="container relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-12 py-16 md:py-32">
        {/* Left: Text content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6">
          {/* Icons Row */}
          <div className="flex gap-8 mb-2 justify-center md:justify-start">
            <div className="flex flex-col items-center">
              <Utensils className="w-10 h-10 text-orange-600" />
              <span className="text-xs mt-1 font-medium text-orange-600">Food</span>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingBag className="w-10 h-10 text-green-700" />
              <span className="text-xs mt-1 font-medium text-green-700">Groceries</span>
            </div>
            <div className="flex flex-col items-center">
              <Pill className="w-10 h-10 text-blue-400" />
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
            <Button asChild size="lg" className="rounded-full px-8 text-white">
              <Link href="/restaurants">Browse Shops</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-2 border-black text-black">
              <Link href="/restaurant-partner">Become a Vendor</Link>
            </Button>
          </motion.div>
        </div>
        {/* Right: Hero image slider */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="flex-1 flex items-center justify-center relative w-full max-w-md md:max-w-lg lg:max-w-xl"
        >
          <div className="relative w-full aspect-square max-w-[400px] md:max-w-[500px] lg:max-w-[600px] h-auto">
            {sliderImages.map((img, idx) => (
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                fill
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