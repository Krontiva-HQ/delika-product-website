import { Cookie, Settings, Shield, Eye, Database, Globe } from "lucide-react"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Cookie className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              This Cookie Policy explains how Delika uses cookies and similar technologies to recognize you when you visit our website and use our services. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Cookie className="w-6 h-6 text-orange-600" />
                What Are Cookies?
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
                </p>
                <p>
                  Cookies set by the website owner (in this case, Delika) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-orange-600" />
                Why Do We Use Cookies?
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>We use cookies for several reasons:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems.</li>
                  <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
                  <li><strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization.</li>
                  <li><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
                  <li><strong>Marketing Cookies:</strong> These cookies may be set through our site by our advertising partners to build a profile of your interests.</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Database className="w-6 h-6 text-orange-600" />
                Types of Cookies We Use
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Essential Cookies</h3>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-gray-600 mb-2">
                      <strong>Purpose:</strong> These cookies are essential for the website to function properly and cannot be disabled.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                      <li>Authentication and security</li>
                      <li>Session management</li>
                      <li>Load balancing</li>
                      <li>User preferences storage</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Analytics Cookies</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-600 mb-2">
                      <strong>Purpose:</strong> These cookies help us understand how visitors use our website.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                      <li>Page views and navigation patterns</li>
                      <li>User behavior analysis</li>
                      <li>Performance monitoring</li>
                      <li>Error tracking</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Functional Cookies</h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-gray-600 mb-2">
                      <strong>Purpose:</strong> These cookies enable enhanced functionality and personalization.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                      <li>Language preferences</li>
                      <li>Theme settings</li>
                      <li>Form data retention</li>
                      <li>User interface customization</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Marketing Cookies</h3>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-gray-600 mb-2">
                      <strong>Purpose:</strong> These cookies are used to track visitors across websites to display relevant advertisements.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                      <li>Ad targeting and retargeting</li>
                      <li>Campaign performance tracking</li>
                      <li>Social media integration</li>
                      <li>Conversion tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-orange-600" />
                Third-Party Cookies
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on.
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Services We Use:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                    <li><strong>Google Ads:</strong> For advertising and conversion tracking</li>
                    <li><strong>Facebook Pixel:</strong> For social media advertising and analytics</li>
                    <li><strong>Stripe:</strong> For payment processing and security</li>
                    <li><strong>Intercom:</strong> For customer support and communication</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-orange-600" />
                How to Control Cookies
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  You have several options for controlling cookies:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Settings</h3>
                    <p>
                      Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookie Consent</h3>
                    <p>
                      When you first visit our website, you will see a cookie consent banner that allows you to accept or decline non-essential cookies.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Opt-Out Links</h3>
                    <p>
                      For third-party cookies, you can often opt out through the respective third-party's website or privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookie Retention</h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  The length of time a cookie remains on your computer or mobile device depends on whether it is a "persistent" or "session" cookie. Session cookies last only for the duration of your browser session, while persistent cookies remain on your device for the period of time specified in the cookie.
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Lifespans:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                    <li><strong>Persistent Cookies:</strong> Remain for up to 2 years</li>
                    <li><strong>Analytics Cookies:</strong> Typically expire after 1-2 years</li>
                    <li><strong>Marketing Cookies:</strong> Usually expire after 90 days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
              <div className="text-gray-600">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <div className="text-gray-600">
                <p>If you have any questions about our use of cookies, please contact us:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> privacy@delika.app</p>
                  <p><strong>Phone:</strong> +233 00 000 0000</p>
                  <p><strong>Address:</strong> Accra, Ghana</p>
                </div>
              </div>
            </section>

            <div className="bg-orange-50 rounded-lg p-6 mt-12">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Your Privacy Matters</h3>
                  <p className="text-sm text-gray-600">
                    We are committed to protecting your privacy and being transparent about our use of cookies. You can control your cookie preferences at any time through your browser settings or our cookie consent banner.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 