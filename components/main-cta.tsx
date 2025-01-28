import { ArrowRight } from "lucide-react"

export function MainCTA() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="bg-orange-500 rounded-3xl overflow-hidden max-w-9xl mx-auto">
        <div className="grid md:grid-cols-2 items-center gap-8 p-8 md:p-12">
          {/* Left content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">Get started with Delika today</h2>
            <p className="text-lg md:text-xl text-white/80">
              Try Delika forfree and you will have access to every feature.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Start your journey now
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

