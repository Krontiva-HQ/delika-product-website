import Image from "next/image"
import { CourierSignupForm } from "@/components/courier-signup-form"
import { CourierBenefits } from "@/components/courier-benefits"
import { NewCourierForm } from "@/components/new-courier-form"
import { SiteHeader } from "@/components/site-header"

export default function CourierSignup() {
  return (
    <>
      <SiteHeader />
      <main>
         {/*<div className="min-h-screen flex">
          <div className="flex-1 relative hidden md:block">
            <Image 
              src="/rider.jpeg" 
              alt="Courier on bike" 
              fill 
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="flex-1 bg-white overflow-y-auto">
            <CourierSignupForm />
          </div> 
        </div>*/}
        <NewCourierForm />
        <CourierBenefits />
      </main>
    </>
  )
}
