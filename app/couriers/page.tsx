import Image from "next/image"
import { CourierSignupForm } from "@/components/courier-signup-form"
import { CourierBenefits } from "@/components/courier-benefits"

export default function CourierSignup() {
  return (
    <main>
      <div className="min-h-screen flex">
        <div className="flex-1 relative hidden md:block">
          <Image 
            src="/courier-image.jpg" 
            alt="Courier delivering food" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="flex-1 bg-white overflow-y-auto">
          <CourierSignupForm />
        </div>
      </div>
      <CourierBenefits />
    </main>
  )
}
