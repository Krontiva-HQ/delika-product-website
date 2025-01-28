import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function NewFeature() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background video with overlay */}
      <video
        className="absolute inset-0 z-0 object-cover w-full h-full"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/food-delivery.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 container flex flex-col justify-center min-h-screen">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-8">
            Delivery that works
          </h1>
          <p className="text-2xl md:text-2xl text-white/90 mb-12 max-w-2xl">
            Our delivery is fast, reliable, and easy to use. We deliver to your customers in 30 minutes or less. We also offer a 100% satisfaction guarantee and a 100% refund guarantee.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-400 transition-colors"
          >
            Be an early adopter
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

