import { SiteHeader } from "@/components/site-header"
import { NewHero } from "@/components/new-hero"
import { YourFavorites } from "@/components/your-favorites"
import { HowItWorks } from "@/components/how-it-works"
import { BrandBanner } from "@/components/brand-banner"
import { NewFeature } from "@/components/new-feature"
import { MoreFeatures } from "@/components/more-features"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main className="relative">
        <NewHero />
        <HowItWorks />
        <YourFavorites />
        <MoreFeatures />
        
        {/* Hidden sections - uncomment to show */}
        {/* <BrandBanner /> */}
        {/* <NewFeature /> */}
        {/* <MoreFeatures /> */}
        <Footer />
        <CookieConsentBanner />
      </main>
    </div>
  )
}

