"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ClipboardList, Truck, BarChart3, Smartphone } from "lucide-react"

const features = [
  {
    title: "Smart Order Management",
    description: "Streamline your operations with our intelligent order management system. Track orders in real-time, manage inventory, and optimize your kitchen workflow.",
    icon: ClipboardList,
  },
  {
    title: "Delivery Optimization",
    description: "Maximize efficiency with our AI-powered delivery routing system. Reduce delivery times and costs while improving customer satisfaction.",
    icon: Truck,
  },
  {
    title: "Customer Insights",
    description: "Gain valuable insights into customer behavior and preferences. Make data-driven decisions to grow your business.",
    icon: BarChart3,
  },
  {
    title: "Mobile App",
    description: "Stay connected with our powerful mobile app. Manage your restaurant on the go with real-time updates and notifications.",
    icon: Smartphone,
  },
]

export function MoreFeatures() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6"
          >
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-orange-600 to-orange-600 bg-clip-text text-transparent">
              run your business
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Powerful features designed to help you manage, grow, and succeed in the restaurant business
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg">
                  <feature.icon className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        
      </div>
    </section>
  )
}


