"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [text, setText] = useState("")
  const fullText = "Delika"

  useEffect(() => {
    setText("")
    const timeout = 100 // Faster typing speed
    let currentIndex = 0
    
    const typeText = () => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex))
        currentIndex++
        setTimeout(typeText, timeout)
      }
    }

    setTimeout(typeText, 500) // Slight delay before starting

    return () => setText("")
  }, [])

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
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl px-4 relative">
          Choose{" "}
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent inline-flex items-center">
            {text}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [1, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="inline-block ml-1 w-[4px] md:w-[6px] h-[1em] bg-orange-500 rounded-full"
            />
          </span>{" "}
          for
          <br className="hidden sm:block" />
          your restaurant
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="max-w-[800px] text-base sm:text-lg md:text-xl text-muted-foreground px-4"
        >
          Streamlining restaurants management with our comprehensive platform.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 px-4"
        >
          <Link 
            href="/restaurants" 
            className="rounded-full px-6 md:px-8 py-3 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
          >
            Sign up as restaurant
          </Link>
          <Link 
            href="/couriers" 
            className="rounded-full px-6 md:px-8 py-3 w-full sm:w-auto bg-gradient-to-r from-pink-600 to-orange-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:outline-none"
          >
            Sign up as courier
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
