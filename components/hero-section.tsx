import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div
        className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-tr from-purple-100 via-pink-100 to-blue-100 opacity-50 blur-3xl"
        aria-hidden="true"
      />
      <div className="container relative flex flex-col items-center justify-center gap-4 py-24 text-center md:py-32 min-h-[calc(100vh-4rem)]">
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl/none lg:text-8xl">
          Choose{" "}
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Delika
          </span>{" "}
          for
          <br />
          your restaurant
        </h1>
        <p className="max-w-[800px] text-lg text-muted-foreground sm:text-xl">
        Streamlining restaurants management with our comprehensive platform.
        </p>
        <div className="flex gap-4">
          <Button size="lg" className="rounded-full px-8">
            Sign up as restaurant
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8">
            Sign up as courier
          </Button>
        </div>
      </div>
    </div>
  )
}

