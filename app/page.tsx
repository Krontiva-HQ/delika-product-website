import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { MainCTA } from "@/components/main-cta"
import { NewFeature } from "@/components/new-feature"
import { MoreFeatures } from "@/components/more-features"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main className="relative">
        <HeroSection />
       {/* <BrandBanner /> */}
        <NewFeature />
        <MoreFeatures />
        <MainCTA />
        <Footer />
        <CookieConsentBanner />
      </main>
    </div>
  )
}

