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
import { useRouter } from "next/navigation"

interface FormData {
  first_name: string
  last_name: string
  email_address: string
  phone_number: string
  nationality: string
  id_type: string
  id_number: string
  licenseFront: File | null
  licenseBack: File | null
  address: string
  selfie: File | null
}

export function NewCourierForm() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    nationality: "",
    id_type: "",
    id_number: "",
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
    
    try {
      // Create FormData object to handle file uploads
      const formDataToSend = new FormData()
      
      // Append all text fields
      formDataToSend.append('first_name', formData.first_name)
      formDataToSend.append('last_name', formData.last_name)
      formDataToSend.append('email_address', formData.email_address)
      formDataToSend.append('phone_number', formData.phone_number)
      formDataToSend.append('nationality', formData.nationality)
      formDataToSend.append('id_type', formData.id_type)
      formDataToSend.append('id_number', formData.id_number)
      formDataToSend.append('address', formData.address)
      
      // Append files
      if (formData.licenseFront) {
        formDataToSend.append('licenseFront', formData.licenseFront)
      }
      if (formData.licenseBack) {
        formDataToSend.append('licenseBack', formData.licenseBack)
      }
      if (formData.selfie) {
        formDataToSend.append('selfie', formData.selfie)
      }

      const response = await fetch(process.env.NEXT_PUBLIC_NEW_RIDER_APPROVAL_API!, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_XANO_AUTH_TOKEN}`
        }
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data = await response.json()
      
      // Set submitted state to true
      setIsSubmitted(true)
      
      // Wait for 3 seconds to show the success message
      setTimeout(() => {
        // Redirect to home page
        router.push('/')
      }, 3000)
      
    } catch (error) {
      // Handle error (show error message to user)
    }
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
                <Label htmlFor="first_name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name *
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
                  Last Name *
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
                  Email Address *
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
                  Phone Number *
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
                  Nationality *
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
                  Address *
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
            <h3 className="text-2xl font-semibold mb-6">Identification Information</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="id_type" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    ID Type *
                  </Label>
                  <Select
                    value={formData.id_type}
                    onValueChange={(value) => handleSelectChange("id_type", value)}
                    required
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Driver's License">Driver&apos;s License</SelectItem>
                      <SelectItem value="Ghana Card">Ghana Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_number" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    ID Number *
                  </Label>
                  <Input
                    id="id_number"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                    placeholder={formData.id_type === "Driver's License" ? "Enter License Number" : "Enter Ghana Card Number"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="licenseFront" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {formData.id_type === "Driver's License" ? "License Front" : "Ghana Card Front"} *
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
                          alt="ID Front Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseBack" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {formData.id_type === "Driver's License" ? "License Back" : "Ghana Card Back"} *
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
                          alt="ID Back Preview"
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
                Upload a Selfie *
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
            disabled={isSubmitted}
          >
            {isSubmitted ? (
              <div className="flex items-center justify-center gap-2">
                <span>Your details have been submitted!</span>
              </div>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </div>
    </section>
  )
} 