"use client"

import { motion } from "framer-motion"
import { 
  TrendingUp, 
  Clock, 
  Smartphone, 
  PieChart, 
  Users, 
  ShieldCheck,
  Truck,
  ChefHat,
  HeartHandshake
} from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase Revenue",
    description: "Tap into a larger customer base and boost your sales through our platform. Restaurants typically see a 25% increase in revenue within the first 3 months."
  },
  {
    icon: Clock,
    title: "Efficient Operations",
    description: "Our smart order management system streamlines your operations, reducing order processing time by up to 40% and minimizing errors."
  },
  {
    icon: Smartphone,
    title: "Mobile App & Dashboard",
    description: "Manage your restaurant on-the-go with our user-friendly mobile app and comprehensive dashboard. Real-time updates and analytics at your fingertips."
  },
  {
    icon: PieChart,
    title: "Data Insights",
    description: "Make informed decisions with detailed analytics on sales, customer preferences, and peak hours. We provide actionable insights to optimize your menu and pricing."
  },
  {
    icon: Users,
    title: "Customer Growth",
    description: "Reach new customers and build loyalty through our platform. Our marketing tools help you engage with customers and encourage repeat orders."
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description: "We maintain high standards for food quality and service. Our platform helps you track customer feedback and maintain consistent quality across all orders."
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Our network of professional delivery partners ensures your food reaches customers quickly and in perfect condition. Real-time delivery tracking included."
  },
  {
    icon: ChefHat,
    title: "Menu Optimization",
    description: "Get expert guidance on menu design and pricing. Our data-driven insights help you create offerings that maximize profitability and customer satisfaction."
  },
  {
    icon: HeartHandshake,
    title: "Partnership Growth",
    description: "We're committed to your success. Access exclusive promotions, marketing opportunities, and partnership benefits as you grow with us."
  }
]

export function RestaurantBenefits() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">Why Partner with Delika?</h2>
          <p className="text-xl text-gray-600">
            Join thousands of successful restaurants that have grown their business with Delika. 
            We provide the tools and support you need to thrive in the digital age.
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
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                <benefit.icon className="w-6 h-6 text-orange-600" />
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