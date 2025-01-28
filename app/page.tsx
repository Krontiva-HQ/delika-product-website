import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { BrandBanner } from "@/components/brand-banner"
import { MainCTA } from "@/components/main-cta"
import { NewFeature } from "@/components/new-feature"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main className="relative">
        <HeroSection />
        <BrandBanner />
        <NewFeature />
        <MainCTA />
      </main>
    </div>
  )
}

