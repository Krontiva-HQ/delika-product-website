import Image from "next/image"
import { Button } from "@/components/ui/button"

export function AppDownloadSection() {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Download Our App</h2>
            <p className="text-gray-600 mb-6">
              Get the best restaurant experience right at your fingertips. Order, track, and enjoy your favorite meals
              with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-black text-white hover:bg-gray-800">
                <Image
                  src="/placeholder.svg?height=24&width=24"
                  alt="App Store"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Download on App Store
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Image
                  src="/placeholder.svg?height=24&width=24"
                  alt="Google Play"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Get it on Google Play
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/placeholder.svg?height=400&width=300"
              alt="App Screenshot"
              width={300}
              height={400}
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

