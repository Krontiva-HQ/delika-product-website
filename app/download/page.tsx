import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, Bike } from "lucide-react"
import { ParticleBackground } from "@/components/particle-background"
import { Footer } from "@/components/footer"

export default function DownloadPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-black">
      <div className="absolute inset-0 z-0 bg-black/50" />
      <ParticleBackground />
      <div className="relative z-10">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Choose Your App
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Select the app that matches your role
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-10">
              <Link href="/download/rider" className="w-full">
                <div className="rounded-lg border border-gray-800 bg-black/50 backdrop-blur-sm text-white shadow-sm hover:shadow-md transition-shadow p-6">
                  <Bike className="w-12 h-12 mb-4 text-purple-400" />
                  <h3 className="text-2xl font-semibold mb-2">Rider App</h3>
                  <p className="text-gray-300">For delivery partners</p>
                </div>
              </Link>

              <Link href="/download/restaurant" className="w-full">
                <div className="rounded-lg border border-gray-800 bg-black/50 backdrop-blur-sm text-white shadow-sm hover:shadow-md transition-shadow p-6">
                  <ChefHat className="w-12 h-12 mb-4 text-orange-400" />
                  <h3 className="text-2xl font-semibold mb-2">Restaurant App</h3>
                  <p className="text-gray-300">For restaurant partners</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
        <Footer className="bg-transparent border-t border-gray-800" />
      </div>
    </div>
  )
} 