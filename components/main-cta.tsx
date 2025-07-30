"use client"

import Image from "next/image"
import { useState } from "react"

export function MainCTA() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    countryCode: "",
    phoneNumber: "",
    deviceType: "",
  })
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  const sanitize = (value: string) => value.trim()

  const validate = () => {
    const newErrors: any = {}
    if (!sanitize(form.fullName)) newErrors.fullName = "Full Name is required"
    if (!sanitize(form.email) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = "Valid email is required"
    if (!sanitize(form.countryCode)) newErrors.countryCode = "Country code is required"
    if (!sanitize(form.phoneNumber) || !/^\d{6,}$/.test(form.phoneNumber)) newErrors.phoneNumber = "Valid phone number is required"
    if (!form.deviceType) newErrors.deviceType = "Device type is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      // Check if email already exists
      const checkRes = await fetch("https://api-server.krontiva.africa/api:uEBBwbSs/delika_interested")
      const existing = await checkRes.json()
      if (Array.isArray(existing) && existing.some((entry: any) => entry.email.toLowerCase() === form.email.toLowerCase())) {
        setAlreadySubmitted(true)
        setTimeout(() => {
          setModalOpen(false)
        }, 2000)
        setLoading(false)
        return
      }
      // Submit if not exists
      const res = await fetch("https://api-server.krontiva.africa/api:uEBBwbSs/delika_interested", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: sanitize(form.fullName),
          email: sanitize(form.email),
          countryCode: sanitize(form.countryCode),
          phoneNumber: sanitize(form.phoneNumber),
          deviceType: form.deviceType,
        }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      setSubmitted(true)
      setTimeout(() => {
        setModalOpen(false)
      }, 1500)
    } catch {
      setErrors({ submit: "Submission failed. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="bg-orange-500 rounded-3xl overflow-hidden max-w-9xl mx-auto relative">
        <div className="grid md:grid-cols-2 items-center gap-8 p-8 md:p-12">
          {/* Left content */}
          <div className="space-y-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">Get started with Delika today</h2>
            <p className="text-sm md:text-base text-white/80">
              Your favorite meals, one tap away.
            </p>
            <button
              className="bg-white text-orange-500 px-6 py-3 rounded text-sm font-semibold hover:bg-orange-100 transition-colors disabled:opacity-60"
              onClick={() => setModalOpen(true)}
              disabled={submitted}
            >
              Register Your Interest
            </button>
          </div>
          {/* Right image */}
          <div className="absolute -right-28 -bottom-16 h-[140%] w-[450px] md:w-[450px]">
            <Image
              src="/burger.webp"
              alt="Delika illustration"
              fill
              sizes="(max-width: 768px) 100vw, 450px"
              className="object-contain object-right-bottom opacity-20 md:opacity-100"
              priority
            />
          </div>
        </div>
        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                onClick={() => setModalOpen(false)}
                disabled={loading}
                aria-label="Close"
              >
                ×
              </button>
              {alreadySubmitted ? (
                <div className="text-center py-8">
                  <h3 className="text-2xl font-bold mb-2 text-orange-500">Your submission was received at an earlier time.</h3>
                  <p className="text-gray-700">Thank you for your interest!</p>
                </div>
              ) : !submitted ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <h3 className="text-2xl font-bold mb-2">Register Your Interest</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={loading}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={loading}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium mb-1">Country Code</label>
                      <input
                        type="text"
                        name="countryCode"
                        value={form.countryCode}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                        disabled={loading}
                        placeholder="+233"
                      />
                      {errors.countryCode && <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>}
                    </div>
                    <div className="w-2/3">
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                        disabled={loading}
                        placeholder="123456789"
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Device Type</label>
                    <select
                      name="deviceType"
                      value={form.deviceType}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={loading}
                    >
                      <option value="">Select device</option>
                      <option value="iOS">iOS</option>
                      <option value="Android">Android</option>
                    </select>
                    {errors.deviceType && <p className="text-red-500 text-xs mt-1">{errors.deviceType}</p>}
                  </div>
                  {errors.submit && <p className="text-red-500 text-xs mt-1">{errors.submit}</p>}
                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 rounded font-semibold mt-2 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-2xl font-bold mb-2 text-orange-500">Thank you for submitting your interest!</h3>
                  <p className="text-gray-700">We appreciate your interest and will be in touch soon.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
