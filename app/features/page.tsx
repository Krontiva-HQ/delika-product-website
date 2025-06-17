import { 
  ClipboardList, 
  Package, 
  Truck, 
  Users, 
  BarChart3, 
  Building2,
  CreditCard,
  TrendingUp,
  Smartphone,
  Heart,
  Zap,
  Shield,
  Settings,
  Sparkles
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      title: "Order Management",
      description: "Streamline your order process with real-time notifications, automated order routing, and integrated payment processing.",
      icon: ClipboardList,
      benefits: ["Real-time order tracking", "Automated order routing", "Payment integration", "Order history"]
    },
    {
      title: "Inventory Management",
      description: "Keep track of your stock levels, set up automatic reorder points, and manage your menu items efficiently.",
      icon: Package,
      benefits: ["Stock level tracking", "Automatic reorder alerts", "Menu management", "Waste tracking"]
    },
    {
      title: "Delivery Optimization",
      description: "Optimize delivery routes, track riders in real-time, and provide customers with accurate delivery estimates.",
      icon: Truck,
      benefits: ["Route optimization", "Real-time tracking", "Delivery estimates", "Rider management"]
    },
    {
      title: "Customer Management",
      description: "Build customer loyalty with personalized experiences, order history, and targeted marketing campaigns.",
      icon: Users,
      benefits: ["Customer profiles", "Order history", "Loyalty programs", "Marketing tools"]
    },
    {
      title: "Analytics & Reporting",
      description: "Get insights into your business performance with detailed analytics, sales reports, and customer behavior data.",
      icon: BarChart3,
      benefits: ["Sales analytics", "Customer insights", "Performance reports", "Trend analysis"]
    },
    {
      title: "Multi-location Support",
      description: "Manage multiple restaurant locations from a single dashboard with centralized control and reporting.",
      icon: Building2,
      benefits: ["Centralized management", "Location-specific settings", "Unified reporting", "Brand consistency"]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Restaurants
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Delika provides everything you need to run a successful restaurant business. From order management to analytics, we've got you covered.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Additional Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Take your restaurant to the next level with our advanced features designed for growth and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Processing</h3>
              <p className="text-sm text-gray-600">Secure payment processing with multiple payment options</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-sm text-gray-600">Live insights into your business performance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile App</h3>
              <p className="text-sm text-gray-600">Manage your restaurant on the go</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Loyalty</h3>
              <p className="text-sm text-gray-600">Build lasting relationships with your customers</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of restaurants that have transformed their operations with Delika.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/demo"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Request Demo
            </a>
            <a
              href="/contact"
              className="border border-orange-600 text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 