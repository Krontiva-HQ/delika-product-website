import { Shield, Eye, Lock, Users, Database, Globe } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              At Delika, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our restaurant technology platform and services.
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-orange-600" />
                Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Name, email address, and phone number</li>
                    <li>Restaurant business information and location details</li>
                    <li>Payment and billing information</li>
                    <li>Account credentials and profile information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Order and transaction data</li>
                    <li>Inventory and menu management data</li>
                    <li>Customer interaction and feedback</li>
                    <li>System usage patterns and analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Device information and IP addresses</li>
                    <li>Browser type and operating system</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Log files and system performance data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Database className="w-6 h-6 text-orange-600" />
                How We Use Your Information
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our restaurant technology platform</li>
                  <li>Process orders and manage delivery operations</li>
                  <li>Improve our services and develop new features</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send important updates and notifications</li>
                  <li>Analyze usage patterns to optimize performance</li>
                  <li>Comply with legal obligations and enforce our terms</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-600" />
                Information Sharing and Disclosure
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">We may share your information with:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform</li>
                    <li><strong>Delivery Partners:</strong> Riders and logistics providers for order fulfillment</li>
                    <li><strong>Payment Processors:</strong> Secure payment processing services</li>
                    <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">We will never:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Sell your personal information to third parties</li>
                    <li>Share your data for marketing purposes without consent</li>
                    <li>Use your information for purposes unrelated to our services</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-orange-600" />
                Data Security
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <p>We implement comprehensive security measures to protect your information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data centers with physical and digital protection</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-orange-600" />
                Your Rights and Choices
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">You have the right to:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Access and review your personal information</li>
                    <li>Update or correct inaccurate data</li>
                    <li>Request deletion of your information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Export your data in a portable format</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Preferences</h3>
                  <p className="text-gray-600">
                    You can control cookie settings through your browser preferences. However, disabling certain cookies may affect the functionality of our platform.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Retention</h2>
              <div className="text-gray-600">
                <p>We retain your information for as long as necessary to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                  <li>Provide our services and maintain your account</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>Improve our services and develop new features</li>
                </ul>
                <p className="mt-4">
                  When we no longer need your information, we will securely delete or anonymize it.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
              <div className="text-gray-600">
                <p>
                  Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
              <div className="text-gray-600">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <div className="text-gray-600">
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> privacy@delika.app</p>
                  <p><strong>Phone:</strong> +233 00 000 0000</p>
                  <p><strong>Address:</strong> Accra, Ghana</p>
                </div>
              </div>
            </section>

            <div className="bg-gray-50 rounded-lg p-6 mt-12">
              <p className="text-sm text-gray-600 text-center">
                This Privacy Policy is effective as of the date listed above and applies to all users of Delika's services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 