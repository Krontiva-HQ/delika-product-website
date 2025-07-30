"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

interface CollapsibleSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function CollapsibleSection({ id, title, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section id={id} className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
        aria-expanded={isOpen}
      >
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-orange-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-orange-600" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 p-6 bg-white rounded-lg border border-gray-200">
          {children}
        </div>
      )}
    </section>
  )
}

export default function CookiePolicyPage() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Back to Top handler
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
      <SiteHeader />
      <div className="py-12 relative">
      <div className="container mx-auto px-4 max-w-4xl">
          {/* Main Content */}
          <main className="bg-white rounded-2xl shadow-lg p-6 md:p-12 overflow-y-auto">
            <header className="mb-10 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
              <p className="text-gray-500 text-lg">Effective Date: July 30, 2025</p>
            </header>
            
          <div className="prose prose-lg max-w-none">
              <div className="mb-8">
                <p className="text-gray-600 mb-6">
                  At Delika, we respect your privacy and are committed to protecting your personal data. 
                  This Cookie Policy explains our use of cookies when you visit our website.
                </p>
              </div>

              <CollapsibleSection id="do-we-use-cookies" title="Do We Use Cookies?">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    <strong>No, we do not use cookies on our website for any purpose.</strong> This means:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>We do not track your browsing activity.</li>
                    <li>We do not store any personal data through cookies.</li>
                    <li>We do not use cookies for analytics, advertising, or user personalization.</li>
                  </ul>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="third-party-cookies" title="Third-Party Cookies">
                <p className="text-gray-600">
                  Our website does not permit third-party services to set cookies through your browser.
                </p>
              </CollapsibleSection>

              <CollapsibleSection id="updates" title="Updates to This Policy">
                <p className="text-gray-600">
                  If our use of cookies ever changes in the future, we will update this Cookie Policy 
                  and notify users accordingly.
                </p>
              </CollapsibleSection>

              <CollapsibleSection id="contact" title="Contact Us">
                <p className="text-gray-600">
                  If you have any questions about this policy, please contact us at{" "}
                  <a href="mailto:support@krontiva.africa" className="text-orange-600 hover:text-orange-700 underline">
                    support@krontiva.africa
                  </a>
                </p>
              </CollapsibleSection>
            </div>
          </main>

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={handleBackToTop}
              className="fixed bottom-8 right-8 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg p-4 transition-colors focus:outline-none"
              aria-label="Back to top"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
} 