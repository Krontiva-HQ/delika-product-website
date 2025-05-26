import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Delika",
  description: "Find answers to common questions about Delika's services",
}

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <div className="space-y-8">
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-3">How do I place an order?</h2>
          <p className="text-gray-700">Browse through our restaurant listings, select your desired items, add them to your cart, and proceed to checkout. You can pay using various payment methods including mobile money and credit cards.</p>
        </section>

        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-3">How long does delivery take?</h2>
          <p className="text-gray-700">Delivery times vary depending on the restaurant's location and current order volume. Typically, deliveries are completed within 30-45 minutes.</p>
        </section>

        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-3">How can I become a restaurant partner?</h2>
          <p className="text-gray-700">Visit our "Join as Restaurant" page and fill out the application form. Our team will review your application and get back to you within 2-3 business days.</p>
        </section>

        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-3">How can I become a delivery courier?</h2>
          <p className="text-gray-700">Visit our "Join as Courier" page to apply. You'll need to provide necessary documentation and complete a brief orientation process.</p>
        </section>

        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-3">What if I have an issue with my order?</h2>
          <p className="text-gray-700">Contact our customer support team through the Help Center or call our support line. We'll assist you in resolving any issues with your order.</p>
        </section>

        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-3">What payment methods do you accept?</h2>
          <p className="text-gray-700">We accept various payment methods including mobile money (MTN, Vodafone, AirtelTigo), credit/debit cards, and cash on delivery.</p>
        </section>
      </div>
    </div>
  )
} 