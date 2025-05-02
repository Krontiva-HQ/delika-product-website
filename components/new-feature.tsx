"use client"

import Image from "next/image"

export function NewFeature() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="relative h-[500px] rounded-2xl overflow-hidden">
          <Image
            src="/new-feature.webp"
            alt="New feature illustration"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-6">Experience the Future of Food Delivery</h2>
          <p className="text-xl text-gray-600 mb-8">
            We&apos;re bringing innovative solutions to make your food delivery experience better than ever.
          </p>
        </div>
      </div>
    </div>
  )
}

