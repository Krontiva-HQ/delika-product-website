"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, User, Building, Calendar, Clock } from "lucide-react"

interface DemoFormData {
  full_name: string
  email: string
  phone: string
  company: string
  restaurant_type: string
  preferred_date: string
  preferred_time: string
  message: string
}

export function DemoRequestForm() {
  const [formData, setFormData] = useState<DemoFormData>({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    restaurant_type: "",
    preferred_date: "",
    preferred_time: "",
    message: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const restaurantTypes = [
    "Fast Food",
    "Fine Dining",
    "Casual Dining",
    "Cafe",
    "Bakery",
    "Pizza",
    "Street Food",
    "Catering",
    "Other"
  ]

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM"
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError("Please enter your full name")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.company.trim()) {
      setError("Please enter your company/restaurant name")
      return false
    }

    if (!formData.restaurant_type) {
      setError("Please select your restaurant type")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      if (!validateForm()) {
        setIsLoading(false)
        return
      }

      // Here you would typically send the form data to your API
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))

      setIsSuccess(true)
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        company: "",
        restaurant_type: "",
        preferred_date: "",
        preferred_time: "",
        message: ""
      })
      
    } catch (error) {
      setError('Failed to submit demo request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Demo Request Submitted!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for your interest in Delika. Our team will contact you within 24 hours to schedule your personalized demo.
        </p>
        <Button
          onClick={() => setIsSuccess(false)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Request Another Demo
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name
          </Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Restaurant/Company Name
          </Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            required
            placeholder="Enter your restaurant name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="restaurant_type">Restaurant Type</Label>
        <select
          id="restaurant_type"
          name="restaurant_type"
          value={formData.restaurant_type}
          onChange={handleInputChange}
          required
          className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Select restaurant type</option>
          {restaurantTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="preferred_date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Preferred Date
          </Label>
          <Input
            id="preferred_date"
            name="preferred_date"
            type="date"
            value={formData.preferred_date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_time" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Preferred Time
          </Label>
          <select
            id="preferred_time"
            name="preferred_time"
            value={formData.preferred_time}
            onChange={handleInputChange}
            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select preferred time</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Additional Information</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about your current challenges and what you hope to achieve with Delika..."
          className="h-24"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Request Demo"}
      </Button>
    </form>
  )
} 