"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { SliderCard } from "./slider-card"

const slides = [
  {
    title: "Using Delika to improve your restaurant",
    description:
      "Use Delika to improve your restaurant by providing you with the tools you need to succeed. We are a team of experienced developers and designers who are passionate about helping restaurants grow and succeed.",
    image: "/main.jpg",
  },
  {
    title: "Making an impact through digital transformation",
    description: "We help charities leverage technology to increase their reach and impact in meaningful ways.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Building sustainable digital solutions",
    description: "Our approach focuses on creating lasting digital infrastructure that grows with your organization.",
    image: "/placeholder.svg?height=400&width=600",
  },
]

export function MoreFeatures() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="min-h-screen">
      <div className="grid lg:grid-cols-2">
        {/* Left content */}
        <div className="flex items-center justify-center">
          <div className="space-y-8 max-w-xl px-4 py-24">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              We help <span className="text-orange-500">restaurants</span> make
              <br />
              their business <span className="italic">better</span>
            </h2>
            <p className="text-xl text-gray-600">
              We help restaurants make their business <span className="italic text-orange-500">better</span> by providing them
              with the tools they need to succeed. We are a team of experienced developers and designers who are passionate
              about helping restaurants grow and succeed.
            </p>
          </div>
        </div>

        {/* Right content */}
        <div className="relative min-h-screen lg:h-auto">
          <div className="sticky top-0 h-screen">
            <Image
              src="/main.jpg"
              alt="Office environment"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-center pb-36">
              <SliderCard
                {...slides[currentSlide]}
                currentSlide={currentSlide}
                totalSlides={slides.length}
                onNext={nextSlide}
                onPrev={prevSlide}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

