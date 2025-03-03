"use client"

import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { SignupModal } from "@/components/signup-modal"
import { useState } from "react"

export function MainCTA() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

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
            <button 
              onClick={() => setIsSignupModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900"
            >
              Start your journey now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <SignupModal 
              isOpen={isSignupModalOpen}
              onClose={() => setIsSignupModalOpen(false)}
              onLoginClick={() => {
                setIsSignupModalOpen(false)
                // You might want to open a login modal here
              }}
              onSignupSuccess={(user) => {
                setIsSignupModalOpen(false)
                // Handle successful signup
              }}
            />
          </div>
          {/* Right image */}
          <div className="absolute -right-28 -bottom-16 h-[140%] w-[450px] md:w-[450px]">
            <Image
              src="/burger.png"
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
