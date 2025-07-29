"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function NewFeature() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="relative h-[500px] rounded-2xl overflow-hidden">
        <Image
          src="/new-feature.webp"
          alt="Experience the future of delivery"
          fill
          className="object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Text content positioned on top of the image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-3xl px-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Experience the Future of Delivery
            </h2>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              From your favorite local restaurants to essential groceries and pharmacy items, 
              we're bringing everything you need right to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm">Vendors</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">50,000+</div>
                <div className="text-sm">Happy Customers</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">30min</div>
                <div className="text-sm">Average Delivery</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

