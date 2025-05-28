import { Metadata } from "next"
import { Mail, Phone, MessageCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Help Center - Delika",
  description: "Get support and help with Delika's services",
}

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="mr-2" /> Email Support
            </h2>
            <p className="text-gray-700 mb-4">For general inquiries and support:</p>
            <a href="mailto:support@delika.com" className="text-blue-600 hover:underline">
              support@krontiva.africa
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Phone className="mr-2" /> Phone Support
            </h2>
            <p className="text-gray-700 mb-4">Available Monday to Friday, 9 AM - 6 PM:</p>
            <a href="tel:+233225689200" className="text-blue-600 hover:underline">
            +233 25 689 9200
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MessageCircle className="mr-2" /> WhatsApp Chat
          </h2>
          <p className="text-gray-700 mb-4">
            Our customer service is available 24/7 to reply to your messages. Click the number below to start a conversation with our support team.
          </p>
          <a href="tel:+23325689200" className="text-blue-600 hover:underline">
              +233 25 689 9200
            </a>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Common Issues</h2>
          <ul className="space-y-4">
            <li>
              <h3 className="font-medium">Order Tracking</h3>
              <p className="text-gray-700">Track your order status in real-time through your account dashboard or the mobile app.</p>
            </li>
            <li>
              <h3 className="font-medium">Payment Issues</h3>
              <p className="text-gray-700">If you're experiencing payment problems, please check your payment method or contact our support team.</p>
            </li>
            <li>
              <h3 className="font-medium">Account Management</h3>
              <p className="text-gray-700">Manage your account settings, update personal information, and view order history through your account dashboard.</p>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
} 