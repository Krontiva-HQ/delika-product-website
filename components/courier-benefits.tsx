"use client"

import { motion } from "framer-motion"
import { 
  Banknote, 
  Clock, 
  Calendar, 
  MapPin, 
  Shield, 
  Smartphone,
  Award,
  Users,
  Sparkles
} from "lucide-react"

const benefits = [
  {
    icon: Banknote,
    title: "Competitive Earnings",
    description: "Earn competitive rates per delivery with opportunities for bonuses during peak hours. Get paid weekly with transparent earnings breakdown."
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Work when it suits you. Choose your own schedule and delivery times. Perfect for full-time drivers or those looking for extra income."
  },
  {
    icon: Calendar,
    title: "Work-Life Balance",
    description: "No minimum hours required. Take time off when you need it and work as much or as little as you want. You're in control of your schedule."
  },
  {
    icon: MapPin,
    title: "Smart Route Planning",
    description: "Our intelligent system optimizes your routes for maximum efficiency. Spend less time planning and more time earning."
  },
  {
    icon: Shield,
    title: "Insurance Coverage",
    description: "Comprehensive insurance coverage while you're delivering. Drive with peace of mind knowing you're protected on the job."
  },
  {
    icon: Smartphone,
    title: "User-Friendly App",
    description: "Easy-to-use mobile app with real-time updates, GPS navigation, and instant earnings tracking. Everything you need in one place."
  },
  {
    icon: Award,
    title: "Performance Rewards",
    description: "Earn rewards and bonuses for maintaining high customer ratings and completing delivery milestones. Excellence is recognized."
  },
  {
    icon: Users,
    title: "Supportive Community",
    description: "Join a community of delivery partners. Share tips, experiences, and build connections while earning with Delika."
  },
  {
    icon: Sparkles,
    title: "Growth Opportunities",
    description: "Access training resources and advancement opportunities. Top performers can become team leaders and earn additional incentives."
  }
]

export function CourierBenefits() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">Why Deliver with Delika?</h2>
          <p className="text-xl text-gray-600">
            Join our growing network of delivery partners and enjoy the freedom to earn on your own terms. 
            We provide everything you need to succeed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <benefit.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 