"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"


export function HeroSection() {

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[300px] md:h-[500px] bg-gradient-to-tr from-purple-100 via-pink-100 to-blue-100 opacity-50 blur-3xl"
        aria-hidden="true"
      />
      <div className="container relative flex flex-col items-center justify-center gap-4 py-12 md:py-24 lg:py-32 text-center min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.5 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute -right-40 md:-right-48 lg:-right-32 top-0 w-[400px] md:w-[500px] lg:w-[600px] aspect-square animate-float"
          >
            <Image
              src="/hero-image.png"
              alt="Decorative restaurant illustration"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 0.5 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="absolute left-10 bottom-10 md:bottom-20 w-[150px] md:w-[200px] lg:w-[250px] aspect-square animate-float-delay"
          >
            <Image
              src="/small-food.png"
              alt="Decorative icon"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl px-4 relative text-black">
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Delika,
          </span> the easiest <br /> way to order
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="max-w-[800px] text-base sm:text-lg md:text-xl text-muted-foreground px-4"
        >
          Driven by you, delivered for all.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 px-4"
        >
          <Link 
            href="/restaurants" 
            className="rounded-full px-6 md:px-8 py-3 w-full sm:w-auto bg-black text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 relative overflow-hidden group"
          >
            <span className="relative z-10 group-hover:text-white">Browse Shops</span>
          </Link>
          <Link 
            href="/restaurant-partner" 
            className="rounded-full px-6 md:px-8 py-3 w-full sm:w-auto border-2 border-black text-black font-medium transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none hover:border-transparent hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white relative overflow-hidden group"
          >
            <span className="relative z-10 group-hover:text-white">Sign up as vendor</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
