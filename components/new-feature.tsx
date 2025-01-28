import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function NewFeature() {
  return (
    <div className="w-full bg-white py-24">
      <div className="container px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Healthy food for your customers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-[600px]">
              Provide your customers with healthy and delicious meals. Our platform helps you manage your menu, orders, and delivery seamlessly.
            </p>
          </div>
          <div className="relative aspect-square">
            <Image
              src="/new-feature.jpg"
              alt="Healthy food bowl with quinoa and vegetables"
              fill
              className="object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

