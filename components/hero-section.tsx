import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div
        className="absolute top-0 left-0 right-0 h-[300px] md:h-[500px] bg-gradient-to-tr from-purple-100 via-pink-100 to-blue-100 opacity-50 blur-3xl"
        aria-hidden="true"
      />
      <div className="container relative flex flex-col items-center justify-center gap-4 py-12 md:py-24 lg:py-32 text-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl px-4">
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

