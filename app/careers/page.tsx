import { 
  Rocket, 
  Handshake, 
  TrendingUp, 
  DollarSign, 
  Home, 
  Heart,
  BookOpen,
  Users,
  Star,
  Target,
  Zap,
  Shield
} from "lucide-react"

export default function CareersPage() {
  const jobOpenings = [
    {
      id: 1,
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "Accra, Ghana",
      type: "Full-time",
      experience: "3+ years",
      description: "We're looking for a talented software engineer to help build and scale our restaurant technology platform."
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Accra, Ghana",
      type: "Full-time",
      experience: "2+ years",
      description: "Join our product team to help shape the future of restaurant technology and customer experience."
    },
    {
      id: 3,
      title: "Sales Representative",
      department: "Sales",
      location: "Accra, Ghana",
      type: "Full-time",
      experience: "1+ years",
      description: "Help restaurants discover how Delika can transform their operations and grow their business."
    },
    {
      id: 4,
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Accra, Ghana",
      type: "Full-time",
      experience: "2+ years",
      description: "Ensure our restaurant partners achieve success and maximize the value of our platform."
    },
    {
      id: 5,
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Accra, Ghana",
      type: "Full-time",
      experience: "1+ years",
      description: "Create compelling content and campaigns to help restaurants discover Delika's solutions."
    },
    {
      id: 6,
      title: "Data Analyst",
      department: "Analytics",
      location: "Accra, Ghana",
      type: "Full-time",
      experience: "2+ years",
      description: "Turn data into insights that help restaurants make better business decisions."
    }
  ]

  const benefits = [
    {
      title: "Competitive Salary",
      description: "We offer competitive compensation packages with equity options",
      icon: DollarSign
    },
    {
      title: "Flexible Work",
      description: "Remote work options and flexible hours to support work-life balance",
      icon: Home
    },
    {
      title: "Health Benefits",
      description: "Comprehensive health insurance and wellness programs",
      icon: Heart
    },
    {
      title: "Learning & Growth",
      description: "Continuous learning opportunities and career development",
      icon: BookOpen
    },
    {
      title: "Team Events",
      description: "Regular team building activities and social events",
      icon: Users
    },
    {
      title: "Impact",
      description: "Make a real difference in the restaurant industry",
      icon: Target
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us revolutionize the restaurant industry with innovative technology solutions. We're building a team of passionate individuals who want to make a difference.
          </p>
        </div>

        {/* Company Culture */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Culture
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              At Delika, we believe in fostering a culture of innovation, collaboration, and continuous learning. Our team is passionate about helping restaurants succeed in the digital age.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">We constantly push boundaries to create cutting-edge solutions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Collaboration</h3>
              <p className="text-gray-600">We work together to achieve common goals and support each other</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-600">We invest in our people's development and career advancement</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Benefits & Perks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Job Openings */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Open Positions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-sm font-medium rounded-full">
                    {job.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span>{job.department}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.experience}</span>
                </div>
                <p className="text-gray-600 mb-4">{job.description}</p>
                <button className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-orange-600 rounded-2xl p-8 md:p-12 mt-16 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Don't See the Right Role?
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our team. Send us your resume and let's discuss how you can contribute to our mission.
          </p>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Send Resume
          </button>
        </div>
      </div>
    </div>
  )
} 