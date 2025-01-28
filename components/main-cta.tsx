import { ArrowRight } from "lucide-react"
import Image from "next/image"

export function MainCTA() {
  return (
    <div className="bg-[#1a0b2e] rounded-3xl overflow-hidden">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 items-center gap-8 p-8 md:p-12">
          {/* Left content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">Get started with Outseta today</h2>
            <p className="text-lg md:text-xl text-white/80">
              Try Outseta free for 7 days—you'll have access to every feature. Cancel any time.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-300 transition-colors"
            >
              Start your free trial
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          {/* Right image */}
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="/main-cta.jpg"
              alt="Outseta dashboard preview"
              fill
              className="object-contain object-center"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

