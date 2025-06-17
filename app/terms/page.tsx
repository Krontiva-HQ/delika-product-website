import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { FileText, AlertTriangle, Shield, Users, CreditCard, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service - Delika",
  description: "Terms and conditions for using Delika's services",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Welcome to Delika. These Terms of Service govern your use of our restaurant technology platform and services. By accessing or using Delika, you agree to be bound by these terms and all applicable laws and regulations.
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-600" />
                Acceptance of Terms
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services.
                </p>
                <p>
                  These terms apply to all users of the Delika platform, including restaurant owners, staff members, delivery partners, and customers.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-orange-600" />
                Description of Services
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  Delika provides a comprehensive restaurant management platform that includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Order management and processing systems</li>
                  <li>Inventory and menu management tools</li>
                  <li>Delivery optimization and rider management</li>
                  <li>Customer relationship management</li>
                  <li>Analytics and reporting features</li>
                  <li>Payment processing and billing</li>
                  <li>Mobile applications for various user types</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-600" />
                User Accounts and Registration
              </h2>
              <div className="text-gray-600 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Creation</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You must provide accurate and complete information when creating an account</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must notify us immediately of any unauthorized use of your account</li>
                    <li>You must be at least 18 years old to create an account</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>You must not share your account credentials with others</li>
                    <li>You must not use another person's account without permission</li>
                    <li>You must comply with all applicable laws and regulations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-orange-600" />
                Payment Terms
              </h2>
              <div className="text-gray-600 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Subscription Fees</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                    <li>All fees are non-refundable except as required by law</li>
                    <li>We reserve the right to change our pricing with 30 days notice</li>
                    <li>Late payments may result in service suspension or termination</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Processing</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Payments are processed through secure third-party payment processors</li>
                    <li>You authorize us to charge your payment method for all fees</li>
                    <li>Failed payments may result in service interruption</li>
                    <li>All fees are exclusive of applicable taxes</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                Acceptable Use Policy
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>You agree not to use our services to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on the rights of others</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of our platform</li>
                  <li>Use our services for any illegal or unauthorized purpose</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Distribute malware or other harmful software</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Intellectual Property</h2>
              <div className="text-gray-600 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Rights</h3>
                  <p>
                    Delika and its content, features, and functionality are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written consent.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Content</h3>
                  <p>
                    You retain ownership of content you upload to our platform. By uploading content, you grant us a license to use, store, and display that content in connection with providing our services.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy and Data Protection</h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms of Service by reference.
                </p>
                <p>
                  By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Availability</h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  We strive to provide reliable and continuous service, but we do not guarantee that our services will be available 100% of the time. We may temporarily suspend services for maintenance, updates, or other operational reasons.
                </p>
                <p>
                  We are not responsible for any losses or damages resulting from service interruptions or downtime.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  To the maximum extent permitted by law, Delika shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.
                </p>
                <p>
                  Our total liability to you for any claims arising from these terms or your use of our services shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
              <div className="text-gray-600 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Termination by You</h3>
                  <p>
                    You may terminate your account at any time by contacting our support team. Upon termination, your access to our services will cease immediately.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Termination by Us</h3>
                  <p>
                    We may terminate or suspend your account immediately if you violate these terms or for any other reason at our sole discretion. We will provide notice when possible.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Effect of Termination</h3>
                  <p>
                    Upon termination, your right to use our services ceases immediately. We may delete your account and data, though we may retain certain information as required by law or for legitimate business purposes.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law</h2>
              <div className="text-gray-600">
                <p>
                  These Terms of Service are governed by and construed in accordance with the laws of Ghana. Any disputes arising from these terms or your use of our services shall be resolved in the courts of Ghana.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
              <div className="text-gray-600">
                <p>
                  We reserve the right to modify these Terms of Service at any time. We will notify you of any material changes by posting the updated terms on our website and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated terms.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="text-gray-600">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> legal@delika.app</p>
                  <p><strong>Phone:</strong> +233 00 000 0000</p>
                  <p><strong>Address:</strong> Accra, Ghana</p>
                </div>
              </div>
            </section>

            <div className="bg-gray-50 rounded-lg p-6 mt-12">
              <p className="text-sm text-gray-600 text-center">
                These Terms of Service are effective as of the date listed above and apply to all users of Delika's services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 