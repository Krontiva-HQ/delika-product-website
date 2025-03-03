import Image from "next/image"
import { RestaurantSignupForm } from "@/components/restaurant-signup-form"
import { RestaurantBenefits } from "@/components/restaurant-benefits"
import { SiteHeader } from "@/components/site-header"

export default function RestaurantSignup() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="min-h-screen flex">
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
        </div>
        <RestaurantBenefits />
      </main>
    </>
  )
}
