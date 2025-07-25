"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Utensils, ShoppingBag, Pill } from "lucide-react"

export function NewHero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-purple-100 overflow-hidden">
      {/* Decorative background shapes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-orange-200 via-pink-200 to-purple-200 rounded-full blur-3xl z-0"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-200 via-pink-100 to-orange-100 rounded-full blur-2xl z-0"
        aria-hidden="true"
      />
      <div className="container relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-12 py-16 md:py-32">
        {/* Left: Text content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6">
          {/* Icons Row */}
          <div className="flex gap-8 mb-2 justify-center md:justify-start">
            <div className="flex flex-col items-center">
              <Utensils className="w-10 h-10 text-orange-500" />
              <span className="text-xs mt-1 font-medium text-orange-500">Food</span>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingBag className="w-10 h-10 text-pink-500" />
              <span className="text-xs mt-1 font-medium text-pink-500">Groceries</span>
            </div>
            <div className="flex flex-col items-center">
              <Pill className="w-10 h-10 text-purple-500" />
              <span className="text-xs mt-1 font-medium text-purple-500">Pharmacy</span>
            </div>
          </div>
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg"
          >
            Order food, groceries, and pharmacy essentials<br className="hidden md:inline" />
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="max-w-xl text-sm md:text-lg text-muted-foreground font-medium"
          >
            Discover top restaurants, grocery stores, and pharmacies. <br className="hidden md:inline" />
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start"
          >
            <Button asChild size="lg" className="rounded-full px-8 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg">
              <Link href="/restaurants">Browse Shops</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-2 border-black text-black hover:bg-gradient-to-r hover:from-purple-100 hover:to-orange-100">
              <Link href="/restaurant-partner">Become a Vendor</Link>
            </Button>
          </motion.div>
        </div>
        {/* Right: Hero image */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="flex-1 flex items-center justify-center relative w-full max-w-md md:max-w-lg lg:max-w-xl"
        >
          <Image
            src="/main.webp"
            alt="Delika delivery illustration"
            width={600}
            height={600}
            className="object-contain drop-shadow-2xl rounded-3xl border-4 border-white"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
} 