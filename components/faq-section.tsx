"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "You can place an order through our mobile app or website. Simply browse the menu, select your items, and proceed to checkout.",
  },
  {
    question: "What are your delivery hours?",
    answer:
      "Our delivery hours vary by restaurant. You can check the delivery times for each restaurant within the app or website.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is confirmed, you can track its status in real-time through the 'Order Tracking' feature in our app or website.",
  },
  {
    question: "Do you offer vegetarian or vegan options?",
    answer:
      "Yes, we have a wide range of vegetarian and vegan options. You can use filters in our app to find restaurants that cater to your dietary preferences.",
  },
  {
    question: "How can I become a partner restaurant?",
    answer:
      "If you're interested in becoming a partner restaurant, please visit our 'Partner With Us' page on the website or contact our business development team.",
  },
]

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className="flex justify-between items-center w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={`transform transition-transform ${activeIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="p-4 bg-gray-50 rounded-b-lg">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-grow">
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

