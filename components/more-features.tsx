"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SliderCard } from "./slider-card"

const slides = [
  {
    title: "What being a B Corp means for our charity partners",
    description:
      "Choosing a digital partner is tough for charities and that's exactly why we spent two years going through the rigorous B Corp certification process.",
    image: "/placeholder.svg?height=400&width=600",
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
        <div className="container px-4">
          <div className="flex items-center py-24">
            <div className="space-y-8">
              <h2 className="text-5xl font-light leading-tight">
                We help restaurants make
                <br />
                their business <span className="italic">better</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-xl">
                We're a B Corp Certified digital agency that creates brands, websites and fundraising campaigns to make
                charities resonate with funders and those they help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-black text-white rounded-none hover:bg-black/90">About us</Button>
                <Button variant="ghost" className="group">
                  Book a Call
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="relative min-h-screen lg:h-auto">
          <div className="sticky top-0 h-screen">
            <Image
              src="/new-feature.jpg"
              alt="Office environment"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-center pb-12">
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

