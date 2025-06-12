"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Upload, User, Mail, Phone, Globe, FileText, MapPin, Camera } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  nationality: string
  licenseNumber: string
  licenseFront: File | null
  licenseBack: File | null
  address: string
  selfie: File | null
}

export function NewCourierForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nationality: "",
    licenseNumber: "",
    licenseFront: null,
    licenseBack: null,
    address: "",
    selfie: null
  })

  const [previews, setPreviews] = useState({
    licenseFront: "",
    licenseBack: "",
    selfie: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log(formData)
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Become a Delika Courier</h2>
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
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="h-12"
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
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
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
            </div>
          </div>

          {/* License Information */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold mb-6">License Information</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  License Number
                </Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="licenseFront" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    License Front
                  </Label>
                  <div className="relative">
                    <Input
                      id="licenseFront"
                      name="licenseFront"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="h-12"
                    />
                    {previews.licenseFront && (
                      <div className="mt-2">
                        <img
                          src={previews.licenseFront}
                          alt="License Front Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseBack" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    License Back
                  </Label>
                  <div className="relative">
                    <Input
                      id="licenseBack"
                      name="licenseBack"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="h-12"
                    />
                    {previews.licenseBack && (
                      <div className="mt-2">
                        <img
                          src={previews.licenseBack}
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
          >
            Submit Application
          </Button>
        </form>
      </div>
    </section>
  )
} 