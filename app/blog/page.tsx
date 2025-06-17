import Link from "next/link"
import Image from "next/image"

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "5 Ways Technology is Transforming Restaurant Operations in 2024",
      excerpt: "Discover how modern technology solutions are revolutionizing the way restaurants operate, from order management to customer experience.",
      author: "Delika Team",
      date: "March 15, 2024",
      category: "Technology",
      readTime: "5 min read",
      image: "/restaurant-interior.jpg"
    },
    {
      id: 2,
      title: "The Future of Food Delivery: Trends to Watch",
      excerpt: "Explore the latest trends in food delivery and how they're shaping the future of the restaurant industry.",
      author: "Sarah Johnson",
      date: "March 10, 2024",
      category: "Industry Trends",
      readTime: "7 min read",
      image: "/rider.jpeg"
    },
    {
      id: 3,
      title: "How to Optimize Your Restaurant's Inventory Management",
      excerpt: "Learn practical strategies for managing your restaurant's inventory more efficiently and reducing waste.",
      author: "Michael Chen",
      date: "March 5, 2024",
      category: "Operations",
      readTime: "6 min read",
      image: "/burger.webp"
    },
    {
      id: 4,
      title: "Building Customer Loyalty in the Digital Age",
      excerpt: "Strategies for creating lasting customer relationships through technology and personalized experiences.",
      author: "Emily Rodriguez",
      date: "February 28, 2024",
      category: "Customer Experience",
      readTime: "4 min read",
      image: "/pizzaman.png"
    },
    {
      id: 5,
      title: "The Impact of Mobile Apps on Restaurant Success",
      excerpt: "How mobile applications are becoming essential tools for restaurant growth and customer engagement.",
      author: "David Kim",
      date: "February 20, 2024",
      category: "Technology",
      readTime: "8 min read",
      image: "/main.webp"
    },
    {
      id: 6,
      title: "Sustainability in Restaurant Operations",
      excerpt: "Practical ways restaurants can implement sustainable practices while maintaining profitability.",
      author: "Lisa Thompson",
      date: "February 15, 2024",
      category: "Sustainability",
      readTime: "6 min read",
      image: "/marinate.jpg"
    }
  ]

  const categories = ["All", "Technology", "Industry Trends", "Operations", "Customer Experience", "Sustainability"]

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Delika Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tips, and industry trends to help your restaurant thrive in the digital age.
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                category === "All"
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-full">
              <Image
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
                  {blogPosts[0].category}
                </span>
                <span className="text-gray-500 text-sm">{blogPosts[0].readTime}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {blogPosts[0].title}
              </h2>
              <p className="text-gray-600 mb-6">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">D</span>
                  </div>
                  <span className="text-sm text-gray-600">{blogPosts[0].author}</span>
                </div>
                <span className="text-sm text-gray-500">{blogPosts[0].date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-sm">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-xs">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{post.author}</span>
                  </div>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-orange-600 rounded-2xl p-8 md:p-12 mt-16 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Get the latest insights, tips, and industry trends delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 