import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main className="relative">
        <HeroSection />
      </main>
    </div>
  )
}

