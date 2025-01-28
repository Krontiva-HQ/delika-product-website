import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[300px] md:h-[500px] bg-gradient-to-tr from-purple-100 via-pink-100 to-blue-100 opacity-50 blur-3xl"
        aria-hidden="true"
      />
      <div className="container relative flex flex-col items-center justify-center gap-4 py-12 md:py-24 lg:py-32 text-center min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="absolute -right-32 md:-right-40 lg:-right-20 top-0 w-[400px] md:w-[500px] lg:w-[600px] aspect-square animate-float opacity-10 md:opacity-20">
            <Image
              src="/hero-image.png"
              alt="Decorative restaurant illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute left-10 bottom-10 md:bottom-20 w-[150px] md:w-[200px] lg:w-[250px] aspect-square animate-float-delay opacity-10 md:opacity-15">
            <Image
              src="/small-food.png"
              alt="Decorative icon"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl px-4 relative">
          Choose{" "}
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Delika
          </span>{" "}
          for
          <br className="hidden sm:block" />
          your restaurant
        </h1>
        <p className="max-w-[800px] text-base sm:text-lg md:text-xl text-muted-foreground px-4">
          Streamlining restaurants management with our comprehensive platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 px-4">
          <Button size="lg" className="rounded-full px-6 md:px-8 w-full sm:w-auto">
            Sign up as restaurant
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-6 md:px-8 w-full sm:w-auto">
            Sign up as courier
          </Button>
        </div>
      </div>
    </div>
  )
}

