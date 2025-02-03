import Image from "next/image"
import { RestaurantSignupForm } from "@/components/restaurant-signup-form"

export default function RestaurantSignup() {
  return (
    <main className="min-h-screen flex">
      <div className="flex-1 relative hidden md:block">
        <Image 
          src="/main-cta.jpg" 
          alt="Restaurant interior" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="flex-1 bg-white overflow-y-auto">
        <RestaurantSignupForm />
      </div>
    </main>
  )
}
