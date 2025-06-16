import { Metadata } from "next"
import { BetaTesterForm } from "@/components/beta-tester-form"

export const metadata: Metadata = {
  title: "Beta Testers - Delika",
  description: "Join Delika's beta testing program and help shape the future of delivery.",
}

export default function BetaTestersPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          Join Our Beta Testing Program
        </h1>
        <p className="text-lg text-gray-600">
          Be among the first to experience Delika's innovative delivery platform and help us shape its future.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <BetaTesterForm />
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-orange-800 mb-3">Why Join?</h3>
          <ul className="space-y-3 text-gray-700">
            <li>• Early access to new features</li>
            <li>• Direct influence on product development</li>
            <li>• Exclusive rewards and incentives</li>
            <li>• Be part of our community</li>
          </ul>
        </div>

        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-orange-800 mb-3">What to Expect</h3>
          <ul className="space-y-3 text-gray-700">
            <li>• Regular feedback sessions</li>
            <li>• Testing new features</li>
            <li>• Bug reporting opportunities</li>
            <li>• Community discussions</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 