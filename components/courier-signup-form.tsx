"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  residentialAddress: z.string().min(5, "Residential address must be at least 5 characters"),
  
  // Emergency Contact
  emergency_contact_name: z.string().min(2, "Emergency contact name must be at least 2 characters"),
  emergency_contact_relationship: z.string().min(2, "Relationship must be at least 2 characters"),
  emergency_contact_phoneNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  
  // ID Documents
  primaryID: z.enum(["national", "passport", "drivers"], {
    required_error: "Please select an ID type",
  }),
  idNumber: z.string().min(1, "ID number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  placeOfIssue: z.string().min(1, "Place of issue is required"),
  
  // Rider's License
  licenseNumber: z.string().min(1, "License number is required"),
  licenseClass: z.string().min(1, "License class is required"),
  licenseIssueDate: z.string().min(1, "License issue date is required"),
  licenseExpiryDate: z.string().min(1, "License expiry date is required"),
  
  // Employment History
  mostRecentEmployer: z.string().optional(),
  duration: z.string().optional(),
  role: z.string().optional(),
  
  // Guarantor Information
  guarantorName: z.string().min(2, "Guarantor name must be at least 2 characters"),
  guarantorRelationship: z.string().min(2, "Relationship must be at least 2 characters"),
  guarantorPhoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  guarantorAddress: z.string().min(5, "Address must be at least 5 characters"),
  guarantorOccupation: z.string().min(2, "Occupation must be at least 2 characters"),
  guarantorId: z.string().min(1, "Guarantor ID is required"),
  
  // Health Declaration
  healthDeclaration: z.string().optional(),
})

const FORM_STEPS = [
  {
    id: 'personal',
    title: 'Personal Information',
  },
  {
    id: 'emergency',
    title: 'Emergency Contact',
  },
  {
    id: 'identity',
    title: 'Identification Documents',
  },
  {
    id: 'license',
    title: 'Rider\'s License Details',
  },
  {
    id: 'employment',
    title: 'Employment History',
  },
  {
    id: 'guarantor',
    title: 'Guarantor Information',
  },
  {
    id: 'health',
    title: 'Health Declaration',
  },
] as const

export function CourierSignupForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoadingStep, setIsLoadingStep] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      address: "",
      dateOfBirth: "",
      nationality: "",
      residentialAddress: "",
      emergency_contact_name: "",
      emergency_contact_relationship: "",
      emergency_contact_phoneNumber: "",
      primaryID: "national",
      idNumber: "",
      issueDate: "",
      expiryDate: "",
      placeOfIssue: "",
      licenseNumber: "",
      licenseClass: "",
      licenseIssueDate: "",
      licenseExpiryDate: "",
      mostRecentEmployer: "",
      duration: "",
      role: "",
      guarantorName: "",
      guarantorRelationship: "",
      guarantorPhoneNumber: "",
      guarantorAddress: "",
      guarantorOccupation: "",
      guarantorId: "",
      healthDeclaration: "",
    },
  })

  const canProceed = () => {
    const currentFields = {
      0: ['full_name', 'email', 'phone_number', 'address', 'dateOfBirth', 'nationality', 'residentialAddress'],
      1: ['emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phoneNumber'],
      2: ['primaryID', 'idNumber', 'issueDate', 'expiryDate', 'placeOfIssue'],
      3: ['licenseNumber', 'licenseClass', 'licenseIssueDate', 'licenseExpiryDate'],
      4: ['mostRecentEmployer'], // Optional step
      5: ['guarantorName', 'guarantorRelationship', 'guarantorPhoneNumber', 'guarantorAddress', 'guarantorOccupation', 'guarantorId'],
      6: ['healthDeclaration'], // Optional step
    }

    const fieldsToValidate = currentFields[currentStep as keyof typeof currentFields]
    return fieldsToValidate.every(field => {
      const value = form.getValues(field as keyof z.infer<typeof formSchema>)
      return currentStep === 4 || currentStep === 6 ? true : Boolean(value)
    })
  }

  const getCurrentStepFields = () => {
    const values = form.getValues()
    const currentFields = {
      0: {
        title: 'Personal Information',
        fields: {
          full_name: values.full_name,
          email: values.email,
          phone_number: values.phone_number,
          address: values.address,
          dateOfBirth: values.dateOfBirth,
          nationality: values.nationality,
          residentialAddress: values.residentialAddress,
        }
      },
      1: {
        title: 'Emergency Contact',
        fields: {
          emergency_contact_name: values.emergency_contact_name,
          emergency_contact_relationship: values.emergency_contact_relationship,
          emergency_contact_phoneNumber: values.emergency_contact_phoneNumber,
        }
      },
      2: {
        title: 'Identification Documents',
        fields: {
          primaryID: values.primaryID,
          idNumber: values.idNumber,
          issueDate: values.issueDate,
          expiryDate: values.expiryDate,
          placeOfIssue: values.placeOfIssue,
        }
      },
      3: {
        title: 'Rider\'s License Details',
        fields: {
          licenseNumber: values.licenseNumber,
          licenseClass: values.licenseClass,
          licenseIssueDate: values.licenseIssueDate,
          licenseExpiryDate: values.licenseExpiryDate,
        }
      },
      4: {
        title: 'Employment History',
        fields: {
          mostRecentEmployer: values.mostRecentEmployer,
          duration: values.duration,
          role: values.role,
        }
      },
      5: {
        title: 'Guarantor Information',
        fields: {
          guarantorName: values.guarantorName,
          guarantorRelationship: values.guarantorRelationship,
          guarantorPhoneNumber: values.guarantorPhoneNumber,
          guarantorAddress: values.guarantorAddress,
          guarantorOccupation: values.guarantorOccupation,
          guarantorId: values.guarantorId,
        }
      },
      6: {
        title: 'Health Declaration',
        fields: {
          healthDeclaration: values.healthDeclaration,
        }
      }
    }
    return currentFields[currentStep as keyof typeof currentFields]
  }

  const nextStep = async () => {
    if (currentStep < FORM_STEPS.length - 1 && canProceed()) {
      const currentStepData = getCurrentStepFields()
      console.log(`Completing Step ${currentStep + 1}: ${currentStepData.title}`)
      console.log('Step Data:', currentStepData.fields)
      
      setIsLoadingStep(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setCurrentStep(currentStep + 1)
        console.log(`Moving to Step ${currentStep + 2}`)
      } finally {
        setIsLoadingStep(false)
      }
    } else if (!canProceed()) {
      console.log(`Validation failed for Step ${currentStep + 1}`)
      console.log('Missing Fields:', form.formState.errors)
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const currentStepData = getCurrentStepFields()
      console.log(`Moving back from Step ${currentStep + 1}: ${currentStepData.title}`)
      console.log('Current Step Data:', currentStepData.fields)
      setCurrentStep(currentStep - 1)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!canProceed()) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      })
      return
    }

    console.log('Starting form submission...')
    setIsSubmitting(true)
    try {
      const transformedData = {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        rider_approval_status: "pending",
        personalInformation: {
          nationality: values.nationality,
          residentialAddress: values.residentialAddress,
          emergencyContact: {
            name: values.emergency_contact_name,
            relationship: values.emergency_contact_relationship,
            phoneNumber: values.emergency_contact_phoneNumber
          },
          dateOfBirth: values.dateOfBirth || null
        },
        identityDocuments: {
          primaryID: values.primaryID,
          idNumber: values.idNumber,
          placeOfIssue: values.placeOfIssue,
          issueDate: values.issueDate || null,
          expiryDate: values.expiryDate || null
        },
        licenseDetails: {
          licenseNumber: values.licenseNumber,
          class: values.licenseClass,
          issueDate: values.licenseIssueDate || null,
          expiryDate: values.licenseExpiryDate || null
        },
        employmentHistory: {
          mostRecentEmployer: values.mostRecentEmployer || "",
          duration: values.duration || "",
          role: values.role || ""
        },
        guarantorInformation: {
          fullName: values.guarantorName,
          relationship: values.guarantorRelationship,
          phoneNumber: values.guarantorPhoneNumber,
          address: values.guarantorAddress,
          occupation: values.guarantorOccupation,
          id: values.guarantorId
        },
        healthDeclaration: values.healthDeclaration || ""
      }

      console.log('Transformed Data:', transformedData)

      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/delika_rider_approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(transformedData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form')
      }

      console.log('API Response:', data)

      toast({
        title: "Success!",
        description: "Your application has been submitted successfully. We'll be in touch soon!",
        variant: "default",
      })
      
      form.reset()
      setCurrentStep(0)
      
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error) {
      console.error('Submission error:', error)
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
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Join Our Delivery Team!</h2>
        <p className="mt-2 text-sm text-gray-600">
            Start earning with flexible hours
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {FORM_STEPS.length}</span>
            <span className="text-sm font-medium text-purple-600">
              {FORM_STEPS[currentStep].title}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / FORM_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Submitting your application...</p>
              </div>
            </div>
          )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                              <Input type="email" placeholder="Your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
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
                        name="dateOfBirth"
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
                        name="residentialAddress"
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

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Emergency Contact</h3>
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
                        name="emergency_contact_phoneNumber"
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

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Identification Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="primaryID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Type</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                              >
                                <option value="national">National ID</option>
                                <option value="passport">Passport</option>
                                <option value="drivers">Driver&apos;s License</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="idNumber"
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
                        name="issueDate"
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
                        name="expiryDate"
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
                        name="placeOfIssue"
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

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Rider&apos;s License Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="licenseNumber"
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
                        name="licenseClass"
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
                        name="licenseIssueDate"
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
                        name="licenseExpiryDate"
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

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Employment History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="mostRecentEmployer"
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
                        name="duration"
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
                        name="role"
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
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Guarantor Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="guarantorName"
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
                        name="guarantorRelationship"
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
                        name="guarantorPhoneNumber"
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
                        name="guarantorAddress"
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
                        name="guarantorOccupation"
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
                        name="guarantorId"
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

                {currentStep === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Health Declaration</h3>
                    <FormField
                      control={form.control}
                      name="healthDeclaration"
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isLoadingStep}
                  className="flex-1"
                >
                  {isLoadingStep ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  )}
                  Back
                </Button>

                {currentStep === FORM_STEPS.length - 1 ? (
            <Button
              type="submit"
              disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                      "Submit"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoadingStep}
                    className="flex-1"
                  >
                    {isLoadingStep ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
              )}
            </Button>
                )}
              </div>
          </form>
        </Form>
        </div>
      </div>
    </div>
  )
}
