"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import LocationInput from './location-input'
import { DeliveryLocationData } from './location'

const formSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  business_type: z.string().min(1, "Please select a business type"),
  type_of_service: z.string().min(1, "Please select a type of service"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  location: z.object({
    longitude: z.number(),
    latitude: z.number(),
    name: z.string(),
    address: z.string(),
    city: z.string(),
  }).optional(),
  branches: z.object({
    name: z.string(),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string(),
    city: z.string(),
    longitude: z.number(),
    latitude: z.number(),
  }).optional(),
})

export function RestaurantSignupForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [locationData, setLocationData] = useState<DeliveryLocationData | undefined>(undefined)
  const [branchData, setBranchData] = useState<{ 
    name: string, 
    phone_number: string,
  }>({ name: '', phone_number: '' })
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_name: "",
      full_name: "",
      business_type: "",
      type_of_service: "",
      address: "",
      email: "",
      phone_number: "",
      location: undefined,
      branches: {
        name: "",
        phone_number: "",
        address: "",
        city: "",
        longitude: 0,
        latitude: 0,
      },
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setEmailError(false)
    try {
      const transformedData = {
        business_name: values.business_name,
        address: values.address,
        email: values.email,
        phone_number: values.phone_number,
        business_type: values.business_type,
        type_of_service: values.type_of_service,
        approval_status: "pending",
        full_name: values.full_name,
        location: locationData,
        branches: [{
          name: branchData.name,
          phoneNumber: branchData.phone_number,
          address: locationData?.address,
          city: locationData?.city,
          longitude: locationData?.longitude,
          latitude: locationData?.latitude
        }]
      }

      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/delika_restaurant_approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      })

      const data = await response.json()

      if (response.status === 403) {
        setEmailError(true)
        form.setValue('email', '')
        throw new Error('The email you have provided is already in use, please enter a new email.')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form')
      }

      setSubmittedEmail(values.email)
      setIsSuccessModalOpen(true)
      form.reset()
      setLocationData(undefined)
      setBranchData({ name: '', phone_number: '' })
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

  const handleLocationSelect = (location: DeliveryLocationData) => {
    setLocationData(location)
    form.setValue('address', location.address)
  }

  const handleBranchNameChange = (name: string) => {
    setBranchData(prev => ({ ...prev, name }))
    form.setValue('branches.name', name)
  }

  const handleBranchPhoneChange = (phone: string) => {
    const phoneWithoutSpaces = phone.replace(/\s/g, '');
    setBranchData(prev => ({ ...prev, phone_number: phoneWithoutSpaces }))
    form.setValue('branches.phone_number', phoneWithoutSpaces)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Partner with Delika!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start growing your business with us
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 relative ${isSubmitting ? 'pointer-events-none' : ''}`}>
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 rounded-lg flex items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="text-sm font-medium text-gray-700">Processing your application...</p>
                  <p className="text-xs text-gray-500">Please wait while we submit your details</p>
                </div>
              </div>
            )}
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your restaurant name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Restaurant">Restaurant</SelectItem>
                        <SelectItem value="Fast Food">Fast Food</SelectItem>
                        <SelectItem value="Cafe">Cafe</SelectItem>
                        <SelectItem value="Groceries">Groceries</SelectItem>
                        <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="Online Store">Online Store</SelectItem>
                        <SelectItem value="Supermarket">Supermarket</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type_of_service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Service</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full Service">Full Service</SelectItem>
                        <SelectItem value="Delivery Only">Delivery Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <LocationInput
                label="Business Location"
                onLocationSelect={handleLocationSelect}
                prefillData={locationData}
              />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your@email.com" 
                        type="email" 
                        {...field} 
                        className={emailError ? "border-orange-500 focus-visible:ring-orange-500" : ""}
                      />
                    </FormControl>
                    {emailError && (
                      <p className="text-sm text-orange-500 mt-1">
                        The email you have provided is already in use, please enter a new email.
                      </p>
                    )}
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
                      <Input 
                        placeholder="Your phone number" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Branch Information</h3>
              <div className="p-4 border rounded-lg space-y-4">
                <FormField
                  control={form.control}
                  name="branches.name"
                  render={() => (
                    <FormItem>
                      <FormLabel>Branch Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter branch name"
                          value={branchData.name}
                          onChange={(e) => handleBranchNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branches.phone_number"
                  render={() => (
                    <FormItem>
                      <FormLabel>Branch Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter branch phone number"
                          value={branchData.phone_number}
                          onChange={(e) => handleBranchPhoneChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 ${
                isSubmitting ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting your application...
                </>
              ) : (
                "Sign up as Restaurant Partner"
              )}
            </Button>
          </form>
        </Form>
      </div>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-green-600">
              Application Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center mt-4 space-y-3">
              <p>Thank you for applying to become a Delika restaurant partner.</p>
              <p>We will review your application and get back to you soon.</p>
              <p className="font-semibold text-gray-700">
                A confirmation email has been sent to <span className="text-orange-600">{submittedEmail}</span>
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
