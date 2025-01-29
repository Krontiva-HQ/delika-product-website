import Image from "next/image"
import { CourierSignupForm } from "@/components/courier-signup-form"

export default function CourierSignup() {
  return (
    <main className="min-h-screen flex">
      <div className="flex-1 relative hidden md:block">
        <Image 
          src="/courier-image.jpg" 
          alt="Courier delivering food" 
          fill 
          className="object-cover"
          priority
        />
      </div>
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        <CourierSignupForm />
      </div>
    </main>
  )
}
