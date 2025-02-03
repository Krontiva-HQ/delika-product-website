"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Building2, Users, Target, Sparkles } from "lucide-react"
import { SignupModal } from "@/components/signup-modal"

const stats = [
  { number: "1M+", label: "Happy Customers" },
  { number: "500+", label: "Restaurant Partners" },
  { number: "1000+", label: "Delivery Partners" },
  { number: "50+", label: "Cities Covered" },
]

const values = [
  {
    icon: Building2,
    title: "Innovation First",
    description: "We leverage cutting-edge technology to revolutionize food delivery in Ghana."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Supporting local businesses and creating opportunities for delivery partners."
  },
  {
    icon: Target,
    title: "Customer Focused",
    description: "Every decision we make starts with our customers' needs and satisfaction."
  },
  {
    icon: Sparkles,
    title: "Quality Service",
    description: "Maintaining high standards in food quality, delivery speed, and customer support."
  }
]

export default function About() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/courier-image.jpg"
            alt="Delika team"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative container mx-auto px-4"
        >
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Transforming Food Delivery in Ghana
            </h1>
            <p className="text-xl text-white/90 mb-8">
              We are building the future of food delivery, one order at a time.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-white"
                >
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 mb-8">
                At Delika, we are on a mission to transform the food delivery industry in Ghana. We believe everyone deserves access to their favorite restaurants, delivered quickly and reliably.
              </p>
              <p className="text-xl text-gray-600">
                We are building technology that connects restaurants, delivery partners, and customers in ways that create opportunities and enhance lives.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative h-[500px] rounded-2xl overflow-hidden"
            >
              <Image
                src="/new-feature.jpg"
                alt="Delika mission"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do at Delika
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6">Join Our Journey</h2>
            <p className="text-xl text-gray-600 mb-12">
              Whether you are a restaurant owner, delivery partner, or customer, be part of our story in revolutionizing food delivery in Ghana.
            </p>
            <SignupModal 
              trigger={
                <button className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-full hover:bg-orange-600 transition-colors">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              }
            />
          </motion.div>
        </div>
      </section>
    </main>
  )
} 