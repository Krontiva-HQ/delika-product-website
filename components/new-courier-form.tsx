"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Upload, User, Mail, Phone, Globe, FileText, MapPin, Camera } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface FormData {
  first_name: string
  last_name: string
  email_address: string
  phone_number: string
  nationality: string
  courier_type: "Pedestrian" | "Rider"
  address: string
  // Ghana Card fields
  ghana_card_number: string
  ghana_card_front: File | null
  ghana_card_back: File | null
  // License fields
  license_number: string
  license_front: File | null
  license_back: File | null
  selfie: File | null
}

export function NewCourierForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    nationality: "",
    courier_type: "Pedestrian",
    address: "",
    // Ghana Card fields
    ghana_card_number: "",
    ghana_card_front: null,
    ghana_card_back: null,
    // License fields
    license_number: "",
    license_front: null,
    license_back: null,
    selfie: null
  })

  const [previews, setPreviews] = useState({
    ghana_card_front: "",
    ghana_card_back: "",
    license_front: "",
    license_back: "",
    selfie: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB")
        return
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file")
        return
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }))
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreviews(prev => ({
        ...prev,
        [name]: previewUrl
      }))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (formData.courier_type === "Pedestrian" || formData.courier_type === "Rider") {
        if (!formData.ghana_card_number || !formData.ghana_card_front || !formData.ghana_card_back) {
          throw new Error("Please fill in all Ghana Card information")
        }
      }

      if (formData.courier_type === "Rider") {
        if (!formData.license_number || !formData.license_front || !formData.license_back) {
          throw new Error("Please fill in all Driver's License information")
        }
      }

      const formDataToSend = new FormData()
      
      // Append personal information
      formDataToSend.append('first_name', formData.first_name)
      formDataToSend.append('last_name', formData.last_name)
      formDataToSend.append('email_address', formData.email_address)
      formDataToSend.append('phone_number', formData.phone_number)
      formDataToSend.append('nationality', formData.nationality)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('courier_type', formData.courier_type)
      formDataToSend.append('ghanaCard', JSON.stringify([{ id_number: formData.ghana_card_number }]))
      formDataToSend.append('license', JSON.stringify(formData.courier_type === 'Rider' ? [{ id_number: formData.license_number }] : []))

      // Add files
      if (formData.ghana_card_front) {
        formDataToSend.append('cardFront', formData.ghana_card_front)
      }
      if (formData.ghana_card_back) {
        formDataToSend.append('cardBack', formData.ghana_card_back)
      }
      if (formData.license_front) {
        formDataToSend.append('licenseFront', formData.license_front)
      }
      if (formData.license_back) {
        formDataToSend.append('licenseBack', formData.license_back)
      }
      if (formData.selfie) {
        formDataToSend.append('selfie', formData.selfie)
      }

      // Add a delay of 2 seconds to simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch(process.env.NEXT_PUBLIC_NEW_RIDER_APPROVAL_API!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_XANO_AUTH_TOKEN}`
        },
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      setIsSuccessModalOpen(true)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Become a Delika Courier</h2>
            <p className="text-xl text-gray-600">
              Complete the form below to start your journey as a delivery partner
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="h-12"
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
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Nationality
                  </Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                {/* Courier Type Selection */}
                <div className="col-span-2 space-y-4">
                  <Label className="text-lg font-medium">Courier Type</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pedestrian"
                        name="courier_type"
                        value="Pedestrian"
                        checked={formData.courier_type === "Pedestrian"}
                        onChange={(e) => handleSelectChange("courier_type", e.target.value)}
                        className="h-4 w-4 text-orange-600"
                      />
                      <Label htmlFor="pedestrian" className="text-base">Pedestrian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="rider"
                        name="courier_type"
                        value="Rider"
                        checked={formData.courier_type === "Rider"}
                        onChange={(e) => handleSelectChange("courier_type", e.target.value)}
                        className="h-4 w-4 text-orange-600"
                      />
                      <Label htmlFor="rider" className="text-base">Rider</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ghana Card Information - Always shown */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">Ghana Card Information <span className="text-red-500">*</span></h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ghana_card_number" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Ghana Card Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ghana_card_number"
                      name="ghana_card_number"
                      value={formData.ghana_card_number}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                      placeholder="Enter Ghana Card Number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ghana_card_front" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Ghana Card Front <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="ghana_card_front"
                        name="ghana_card_front"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="h-12"
                      />
                      {previews.ghana_card_front && (
                        <div className="mt-2">
                          <img
                            src={previews.ghana_card_front}
                            alt="Ghana Card Front Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ghana_card_back" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Ghana Card Back <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="ghana_card_back"
                        name="ghana_card_back"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="h-12"
                      />
                      {previews.ghana_card_back && (
                        <div className="mt-2">
                          <img
                            src={previews.ghana_card_back}
                            alt="Ghana Card Back Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* License Information - Only shown for Riders */}
            {formData.courier_type === "Rider" && (
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold mb-6">Driver's License Information <span className="text-red-500">*</span></h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="license_number" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        License Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="license_number"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                        placeholder="Enter License Number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="license_front" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        License Front <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="license_front"
                          name="license_front"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                          className="h-12"
                        />
                        {previews.license_front && (
                          <div className="mt-2">
                            <img
                              src={previews.license_front}
                              alt="License Front Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license_back" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        License Back <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="license_back"
                          name="license_back"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                          className="h-12"
                        />
                        {previews.license_back && (
                          <div className="mt-2">
                            <img
                              src={previews.license_back}
                              alt="License Back Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selfie Upload */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">Verification Photo</h3>
              <div className="space-y-2">
                <Label htmlFor="selfie" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Upload a Selfie
                </Label>
                <div className="relative">
                  <Input
                    id="selfie"
                    name="selfie"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="h-12"
                  />
                  {previews.selfie && (
                    <div className="mt-2">
                      <img
                        src={previews.selfie}
                        alt="Selfie Preview"
                        className="w-32 h-32 object-cover rounded-full mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </section>

      <Dialog open={isSuccessModalOpen} onOpenChange={(open) => {
        if (!open) {
          router.push('/')
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-black-600">
              Application Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center mt-4">
              Thank you for applying to become a Delika courier. We will review your application and get back to you soon.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
} 