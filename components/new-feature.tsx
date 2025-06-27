"use client"

import Image from "next/image"

export function NewFeature() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="relative h-[500px] rounded-2xl overflow-hidden">
        <Image
          src="/new-feature.webp"
          alt="New feature illustration"
          fill
          className="object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Text content positioned on top of the image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Experience the Future of Food Delivery
            </h2>
            <p className="text-lg md:text-xl text-gray-200">
              We&apos;re bringing innovative solutions to make your food delivery experience better than ever.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

