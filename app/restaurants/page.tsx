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
      </div>
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        <RestaurantSignupForm />
      </div>
    </main>
  )
}
