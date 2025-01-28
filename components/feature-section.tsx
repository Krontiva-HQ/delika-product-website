import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          <div className="relative aspect-video overflow-hidden rounded-xl shadow-2xl">
            <Image
              src="/placeholder.svg?height=720&width=1280"
              alt="Plasmic App Interface"
              layout="fill"
              objectFit="cover"
              className="object-center"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Build visually, <br />
              code seamlessly
            </h2>
            <p className="text-lg text-muted-foreground">
              Plasmic empowers designers and developers to create stunning, responsive websites without compromising on
              code quality. Our intuitive interface bridges the gap between design and development.
            </p>
            <Button
              size="lg"
              className="rounded-full px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Explore features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

