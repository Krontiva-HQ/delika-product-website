"use client"

import Image from "next/image"

export function MainCTA() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="bg-orange-500 rounded-3xl overflow-hidden max-w-9xl mx-auto relative">
        <div className="grid md:grid-cols-2 items-center gap-8 p-8 md:p-12">
          {/* Left content */}
          <div className="space-y-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">Get started with Delika today</h2>
            <p className="text-lg md:text-xl text-white/80">
              Try Delika for free whether on the web or mobile.
            </p>
          </div>
          {/* Right image */}
          <div className="absolute -right-28 -bottom-16 h-[140%] w-[450px] md:w-[450px]">
            <Image
              src="/burger.webp"
              alt="Delika illustration"
              fill
              className="object-contain object-right-bottom opacity-20 md:opacity-100"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
