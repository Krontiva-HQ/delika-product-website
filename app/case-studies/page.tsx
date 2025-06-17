import Image from "next/image"

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      id: 1,
      restaurant: "The Good Baker",
      industry: "Bakery & Pastry",
      location: "Accra, Ghana",
      challenge: "Struggling with order management and delivery coordination during peak hours",
      solution: "Implemented Delika's order management system with automated delivery routing",
      results: [
        "40% increase in order processing speed",
        "25% reduction in delivery time",
        "30% increase in customer satisfaction",
        "50% reduction in order errors"
      ],
      image: "/thegoodbaker.png",
      testimonial: "Delika transformed our bakery operations. We can now handle twice the orders with half the stress."
    },
    {
      id: 2,
      restaurant: "Pizza Man",
      industry: "Pizza & Fast Food",
      location: "Kumasi, Ghana",
      challenge: "Manual inventory tracking leading to stockouts and waste",
      solution: "Deployed Delika's inventory management system with automated reorder alerts",
      results: [
        "60% reduction in stockouts",
        "35% decrease in food waste",
        "20% improvement in profit margins",
        "Real-time inventory visibility"
      ],
      image: "/pizzaman.png",
      testimonial: "The inventory management feature alone has saved us thousands in waste reduction."
    },
    {
      id: 3,
      restaurant: "Snack Shack",
      industry: "Street Food",
      location: "Tema, Ghana",
      challenge: "Difficulty managing multiple delivery partners and tracking orders",
      solution: "Integrated Delika's delivery optimization platform with rider management",
      results: [
        "45% faster delivery times",
        "Better rider coordination",
        "Improved customer tracking",
        "Increased delivery radius"
      ],
      image: "/snackshack.png",
      testimonial: "Our customers love the real-time tracking, and our delivery partners are more efficient than ever."
    },
    {
      id: 4,
      restaurant: "Star Bites",
      industry: "Restaurant",
      location: "Takoradi, Ghana",
      challenge: "Lack of customer data and loyalty program management",
      solution: "Implemented Delika's customer management system with loyalty features",
      results: [
        "50% increase in repeat customers",
        "25% boost in average order value",
        "Successful loyalty program launch",
        "Better customer insights"
      ],
      image: "/starbites.png",
      testimonial: "The customer insights we get from Delika help us make better business decisions every day."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how restaurants across Ghana are transforming their operations and growing their businesses with Delika.
          </p>
        </div>

        {/* Case Studies */}
        <div className="space-y-16">
          {caseStudies.map((study, index) => (
            <div key={study.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
              index % 2 === 0 ? '' : 'lg:flex-row-reverse'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-full">
                  <Image
                    src={study.image}
                    alt={study.restaurant}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
                      {study.industry}
                    </span>
                    <span className="text-gray-500 text-sm">{study.location}</span>
                  </div>
                  
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                    {study.restaurant}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">The Challenge</h3>
                      <p className="text-gray-600">{study.challenge}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">The Solution</h3>
                      <p className="text-gray-600">{study.solution}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">The Results</h3>
                      <ul className="space-y-2">
                        {study.results.map((result, resultIndex) => (
                          <li key={resultIndex} className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-gray-700 italic">"{study.testimonial}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-orange-600 rounded-2xl p-8 md:p-12 mt-16 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Delika by the Numbers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Restaurants</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50,000+</div>
              <div className="text-orange-100">Orders Processed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">95%</div>
              <div className="text-orange-100">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">40%</div>
              <div className="text-orange-100">Average Efficiency Gain</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of restaurants that have transformed their operations with Delika.
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