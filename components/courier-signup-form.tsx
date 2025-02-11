"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  residential_address: z.string().min(5, "Residential address must be at least 5 characters"),
  
  // Emergency Contact
  emergency_contact_name: z.string().min(2, "Emergency contact name must be at least 2 characters"),
  emergency_contact_relationship: z.string().min(2, "Relationship must be at least 2 characters"),
  emergency_contact_number: z.string().min(10, "Contact number must be at least 10 digits"),
  
  // ID Documents
  id_type: z.enum(["national", "passport", "drivers"], {
    required_error: "Please select an ID type",
  }),
  id_number: z.string().min(1, "ID number is required"),
  id_issue_date: z.string().min(1, "Issue date is required"),
  id_expiry_date: z.string().min(1, "Expiry date is required"),
  id_place_of_issue: z.string().min(1, "Place of issue is required"),
  
  // Rider's License
  riders_license_number: z.string().min(1, "License number is required"),
  license_class: z.string().min(1, "License class is required"),
  license_issue_date: z.string().min(1, "License issue date is required"),
  license_expiry_date: z.string().min(1, "License expiry date is required"),
  
  // Employment History
  previous_employer: z.string().optional(),
  employment_duration: z.string().optional(),
  position_held: z.string().optional(),
  reason_for_leaving: z.string().optional(),
  
  // Guarantor Information
  guarantor_name: z.string().min(2, "Guarantor name must be at least 2 characters"),
  guarantor_relationship: z.string().min(2, "Relationship must be at least 2 characters"),
  guarantor_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  guarantor_address: z.string().min(5, "Address must be at least 5 characters"),
  guarantor_occupation: z.string().min(2, "Occupation must be at least 2 characters"),
  guarantor_id: z.string().min(1, "Guarantor ID is required"),
  
  // Health Declaration
  medical_conditions: z.string().optional(),
})

export function CourierSignupForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add state for section expansion
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    emergency: false,
    identity: false,
    license: false,
    employment: false,
    guarantor: false,
    health: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      address: "",
      date_of_birth: "",
      nationality: "",
      residential_address: "",
      emergency_contact_name: "",
      emergency_contact_relationship: "",
      emergency_contact_number: "",
      id_type: "national",
      id_number: "",
      id_issue_date: "",
      id_expiry_date: "",
      id_place_of_issue: "",
      riders_license_number: "",
      license_class: "",
      license_issue_date: "",
      license_expiry_date: "",
      previous_employer: "",
      employment_duration: "",
      position_held: "",
      reason_for_leaving: "",
      guarantor_name: "",
      guarantor_relationship: "",
      guarantor_phone: "",
      guarantor_address: "",
      guarantor_occupation: "",
      guarantor_id: "",
      medical_conditions: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Transform the form values to match the expected database structure
      const transformedData = {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        rider_approval_status: "pending", // Default status for new applications
        personalInformation: {
          nationality: values.nationality,
          residentialAddress: values.residential_address,
          emergencyContact: {
            name: values.emergency_contact_name,
            relationship: values.emergency_contact_relationship,
            phoneNumber: values.emergency_contact_number
          },
          dateOfBirth: values.date_of_birth ? new Date(values.date_of_birth).toISOString() : null
        },
        identityDocuments: {
          primaryID: values.id_type,
          idNumber: values.id_number,
          placeOfIssue: values.id_place_of_issue,
          issueDate: values.id_issue_date ? new Date(values.id_issue_date).toISOString() : null,
          expiryDate: values.id_expiry_date ? new Date(values.id_expiry_date).toISOString() : null
        },
        licenseDetails: {
          licenseNumber: values.riders_license_number,
          class: values.license_class,
          issueDate: values.license_issue_date ? new Date(values.license_issue_date).toISOString() : null,
          expiryDate: values.license_expiry_date ? new Date(values.license_expiry_date).toISOString() : null
        },
        employmentHistory: {
          mostRecentEmployer: values.previous_employer || "",
          duration: values.employment_duration || "",
          role: values.position_held || ""
        },
        guarantorInformation: {
          fullName: values.guarantor_name,
          relationship: values.guarantor_relationship,
          phoneNumber: values.guarantor_phone,
          address: values.guarantor_address,
          occupation: values.guarantor_occupation,
          id: values.guarantor_id
        },
        healthDeclaration: values.medical_conditions || ""
      }

      const response = await fetch('/api/courier-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form')
      }

      toast({
        title: "Success!",
        description: "Your application has been submitted successfully. We'll be in touch soon!",
        variant: "default",
      })
      
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Join Our Delivery Team!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start earning with flexible hours
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => toggleSection('personal')}
              >
                <h3 className="text-xl font-semibold">Personal Information</h3>
                {expandedSections.personal ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.personal && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Your address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="residential_address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Residential Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact Section */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => toggleSection('emergency')}
              >
                <h3 className="text-xl font-semibold">Emergency Contact</h3>
                {expandedSections.emergency ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.emergency && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="emergency_contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergency_contact_relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergency_contact_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ID Documents Section */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => toggleSection('identity')}
              >
                <h3 className="text-xl font-semibold">Identification Documents</h3>
                {expandedSections.identity ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.identity && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="id_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Type</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                            >
                              <option value="national_id">National ID</option>
                              <option value="passport">Passport</option>
                              <option value="drivers_license">Driver's License</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="id_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="id_issue_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="id_expiry_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="id_place_of_issue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Place of Issue</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rider's License Section */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => toggleSection('license')}
              >
                <h3 className="text-xl font-semibold">Rider's License Details</h3>
                {expandedSections.license ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.license && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="riders_license_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="license_class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Class</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="license_issue_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="license_expiry_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Employment History Section */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => toggleSection('employment')}
              >
                <h3 className="text-xl font-semibold">Employment History</h3>
                {expandedSections.employment ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.employment && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="previous_employer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Employer</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employment_duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration of Employment</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position_held"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position Held</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reason_for_leaving"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Leaving</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Guarantor Information Section */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => toggleSection('guarantor')}
              >
                <h3 className="text-xl font-semibold">Guarantor Information</h3>
                {expandedSections.guarantor ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.guarantor && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="guarantor_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guarantor_relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guarantor_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guarantor_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guarantor_occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guarantor_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Health Declaration Section */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => toggleSection('health')}
              >
                <h3 className="text-xl font-semibold">Health Declaration</h3>
                {expandedSections.health ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.health && (
                <div className="p-4 pt-0">
                  <FormField
                    control={form.control}
                    name="medical_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions (if any)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="List any medical conditions here" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Sign up as Delivery Partner"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
