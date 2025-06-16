"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, User, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"

interface BetaTesterForm {
  full_name: string
  age_range: string
  phone_number: string
  email_address: string
  delivery_address: string
  longitude: number | null
  latitude: number | null
  payment_method: "momo" | "cash"
  consent_use_of_image: boolean
  prior_experience: string
  expectations: string
}

const ageRanges = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+"
]

export function BetaTesterForm() {
  const [formData, setFormData] = useState<BetaTesterForm>({
    full_name: "",
    age_range: "",
    phone_number: "",
    email_address: "",
    delivery_address: "",
    longitude: null,
    latitude: null,
    payment_method: "momo",
    consent_use_of_image: false,
    prior_experience: "",
    expectations: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    
    if (type === "radio") {
      setFormData(prev => ({
        ...prev,
        [name]: value === "true"
      }))
      return
    }
    
    // Phone number validation
    if (name === 'phone_number') {
      const numbersOnly = value.replace(/\D/g, '')
      if (numbersOnly.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numbersOnly
        }))
      }
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace()
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        
        setFormData(prev => ({
          ...prev,
          delivery_address: place.formatted_address || "",
          latitude: lat || null,
          longitude: lng || null
        }))
      }
    }
  }

  const validateForm = () => {
    if (formData.phone_number.length !== 10) {
      setError("Phone number must be exactly 10 digits")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email_address)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.delivery_address || !formData.latitude || !formData.longitude) {
      setError("Please select a valid delivery address")
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

      const response = await fetch(process.env.NEXT_PUBLIC_BETA_TESTERS_API!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      setIsSuccess(true)
      setFormData({
        full_name: "",
        age_range: "",
        phone_number: "",
        email_address: "",
        delivery_address: "",
        longitude: null,
        latitude: null,
        payment_method: "momo",
        consent_use_of_image: false,
        prior_experience: "",
        expectations: ""
      })
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <>
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
            <Label htmlFor="age_range">
              Age Range
            </Label>
            <select
              id="age_range"
              name="age_range"
              value={formData.age_range}
              onChange={handleInputChange}
              required
              className="w-full h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="">Select age range</option>
              {ageRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number (WhatsApp preferred)
            </Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
              placeholder="Enter 10-digit phone number"
              type="tel"
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_address" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email_address"
              name="email_address"
              type="email"
              value={formData.email_address}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="delivery_address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Delivery Address / Zone
            </Label>
            <Autocomplete
              onLoad={setAutocomplete}
              onPlaceChanged={onPlaceSelected}
            >
              <Input
                id="delivery_address"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleInputChange}
                required
                placeholder="Enter your delivery address"
              />
            </Autocomplete>
          </div>

          <div className="space-y-2">
            <Label>Preferred Payment Method</Label>
            <RadioGroup
              name="payment_method"
              value={formData.payment_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value as "momo" | "cash" }))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="momo" id="momo" />
                <Label htmlFor="momo">MoMo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash on Delivery</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Consent for use of photos/videos</Label>
            <RadioGroup
              name="consent_use_of_image"
              value={formData.consent_use_of_image.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, consent_use_of_image: value === "true" }))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="consent-yes" />
                <Label htmlFor="consent-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="consent-no" />
                <Label htmlFor="consent-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="prior_experience">
              Prior experience with delivery apps
            </Label>
            <Textarea
              id="prior_experience"
              name="prior_experience"
              value={formData.prior_experience}
              onChange={handleInputChange}
              required
              placeholder="Tell us about your experience with other delivery apps..."
              className="h-24"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="expectations">
              What do you look forward to in the testing phase?
            </Label>
            <Textarea
              id="expectations"
              name="expectations"
              value={formData.expectations}
              onChange={handleInputChange}
              required
              placeholder="Share your expectations and what you hope to achieve..."
              className="h-24"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Apply to be a Beta Tester"}
        </Button>
      </form>

      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">Thank You!</DialogTitle>
            <DialogDescription className="text-gray-600">
              Your application has been received. We'll review it and get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setIsSuccess(false)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
} 