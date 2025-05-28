import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms of Service - Delika",
  description: "Terms and conditions for using Delika's services",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Delika's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use of Services</h2>
            <p>Our services are designed to facilitate food delivery and restaurant management. Users must use these services in accordance with all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Privacy Policy</h2>
            <p>Your use of our services is also governed by our Privacy Policy, which can be found on our website.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Modifications to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Users will be notified of any significant changes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
            <p>For any questions regarding these terms, please contact us at support@delika.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
} 