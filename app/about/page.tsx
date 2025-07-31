"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Building2, Users, Target, Sparkles } from "lucide-react"
import { SiteHeader } from "@/components/site-header"

const stats = [
  { number: "1000+", label: "Happy Customers" },
  { number: "150+", label: "Partner Vendors" },
  { number: "20+", label: "Delivery Partners" },
  { number: "100+", label: "Cities & Towns" },
]

const values = [
  {
    icon: Building2,
    title: "Innovation First",
    description: "Leveraging cutting-edge technology to revolutionize delivery services across Ghana with a seamless ordering experience."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Empowering local businesses, from restaurants to pharmacies, while creating opportunities for delivery partners."
  },
  {
    icon: Target,
    title: "Customer Focused",
    description: "Prioritizing convenience, reliability, and satisfaction in every delivery, from food to medicine."
  },
  {
    icon: Sparkles,
    title: "Quality Service",
    description: "Maintaining high standards across our entire platform - restaurants, groceries, pharmacies, and delivery services."
  }
]

export default function About() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#FAFAFA]">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/newrider.jpeg"
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
                Your Premier Delivery Platform
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Connecting you with the best restaurants, groceries, and pharmacies across Ghana, delivered to your doorstep.
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
                  At Delika, we're revolutionizing convenience in Ghana by bringing the best of local businesses to your doorstep. From your favorite restaurants to essential groceries and medicines, we're making everyday life easier through our comprehensive delivery platform.
                </p>
                <p className="text-xl text-gray-600">
                  We're building an ecosystem that connects customers with restaurants, grocery stores, pharmacies, and dedicated delivery partners, creating opportunities and enhancing lives through technology and reliable service.
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
                  src="/rider.jpeg"
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
      </main>
    </>
  )
} 