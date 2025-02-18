import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ParticleBackground } from "@/components/particle-background"
import { Footer } from "@/components/footer"

export default function RestaurantDownloadPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Download Delika Restaurant App
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Manage your restaurant operations efficiently
              </p>
            </div>
            <div className="mx-auto max-w-md mt-8">
              <div className="rounded-lg border border-gray-800 bg-black/50 backdrop-blur-sm text-white shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">Restaurants App</h3>
                  <p className="text-sm text-muted-foreground">
                    For restaurant partners
                  </p>
                </div>
                <div className="p-6 pt-0 space-y-4">
                  <p className="text-sm text-gray-300">
                    Manage your restaurant orders, menu, and deliveries all in one place. Grow your business with Delika.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
                    asChild
                  >
                    <Link href="/delikarestaurant.apk" download>
                      <Download className="mr-2 h-4 w-4" />
                      Download Restaurant App
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  )
} 