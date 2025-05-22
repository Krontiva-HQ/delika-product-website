import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Privacy Policy</h1>
          <p className="text-gray-500 text-center mb-12">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Introduction
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Welcome to Delika, a restaurant management system designed to help restaurant owners and dispatch riders streamline operations, manage inventory, track staff, and optimize deliveries. At Delika, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our website and services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Delika, you agree to the terms of this Privacy Policy. If you do not agree with these terms, please do not use our website or services.
              </p>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Information We Collect
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">When you use Delika, we may collect the following types of information:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Personal Data:</strong> Name, email address, phone number, and payment details.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Business Data:</strong> Restaurant name, business address, transaction history, and operational details.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Technical Data:</strong> IP addresses, browser type, device information, cookies, and tracking technologies.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                How We Collect Data
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">We collect information in the following ways:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Directly from Users:</strong> When you sign up, place orders, or contact support.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Automatically:</strong> Through cookies, analytics, and tracking technologies when you use our platform.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">From Third Parties:</strong> Such as payment processors, business partners, and marketing tools.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
                How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">We use the information we collect for the following purposes:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">To provide, maintain, and improve our services.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">To process transactions and manage subscriptions.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">To communicate with you about updates, promotions, and support requests.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">To monitor and analyze usage trends to enhance user experience.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">To ensure the security and integrity of our platform.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">To comply with legal obligations and enforce our terms of service.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
                Data Sharing and Disclosure
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">We do not sell your personal information. However, we may share your data with:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Service Providers:</strong> Payment processors, cloud storage providers, and delivery partners.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Legal Authorities:</strong> When required by law or to protect our rights.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Business Partners:</strong> If necessary for the seamless operation of Delika.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">6</span>
                Data Security Measures
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">We implement industry-standard security measures, including:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Encryption protocols for secure transactions.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Access control mechanisms to prevent unauthorized access.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Regular security audits and monitoring.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">7</span>
                User Rights and Choices
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">You have the right to:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Access, update, or delete your personal data.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Opt-out of marketing communications.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Request clarification on how your data is used.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">8</span>
                Security Measures
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">We implement industry-standard security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Encryption of sensitive data during transmission and storage.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Regular security audits and vulnerability assessments.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">Access controls to limit data access to authorized personnel only.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">9</span>
                Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or to comply with legal obligations. When data is no longer needed, it will be securely deleted or anonymized.
              </p>
            </section>

            <section className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">10</span>
                Contact Us
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-center">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Email:</strong> info@krontiva.africa</span>
                </li>
                <li className="flex items-center">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Phone:</strong> 0256899200</span>
                </li>
                <li className="flex items-center">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700"><strong className="text-gray-900">Address:</strong> The Octagon, Accra.</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 