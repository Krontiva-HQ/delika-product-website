import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function MainSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Supercharge your restaurant sales <br />
          and ease your delivery burden
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Our all-in-one platform streamlines your operations, boosts your online presence, and optimizes your delivery
          process.
        </p>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}

