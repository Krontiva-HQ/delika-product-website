"use client"

import Image from "next/image"

export function MoreFeatures() {
  return (

    <section className="min-h-screen">
      <div className="grid lg:grid-cols-2">
        {/* Left content */}
        <div className="flex items-center justify-center">
          <div className="space-y-8 max-w-xl px-4 py-24">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              We help <span className="text-orange-500">restaurants</span> make
              <br />
              their business <span className="italic">better</span>
            </h2>
            <p className="text-xl text-gray-600">
              We help restaurants make their business <span className="italic text-orange-500">better</span> by providing them
              with the tools they need to succeed. We are a team of experienced developers and designers who are passionate
              about helping restaurants grow and succeed.
            </p>
          </div>
        </div>

        {/* Right content */}
        <div className="relative min-h-screen lg:h-auto">
          <div className="sticky top-0 h-screen">
            <Image
              src="/main.jpg"
              alt="Office environment"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}


