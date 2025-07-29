"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, ShoppingCart, Truck, CheckCircle, MessageCircle, Heart, Star, Clock } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Browse & Discover",
      description: "Find top restaurants, local grocery shops, and trusted pharmacies near you.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: ShoppingCart,
      title: "Add to Cart",
      description: "Mix and match products from multiple vendors — we make checkout seamless.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Truck,
      title: "Track & Receive",
      description: "We deliver fast. Real-time tracking so you're never left guessing.",
      color: "bg-blue-100 text-blue-600"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-orange-50 to-gray-100">
      <div className="container mx-auto px-4 md:px-8">
        {/* How It Works Steps */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6 text-black"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-black"
          >
            Simple steps to get everything you need delivered to your doorstep
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${step.color}`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 