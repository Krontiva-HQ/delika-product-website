"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import LocationInput from './location-input'
import { LocationData } from './location'

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
    city: z.string()
  }).optional(),
  branch_name: z.string().min(2, "Branch name must be at least 2 characters"),
  branch_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  branch_city: z.string().min(2, "City name is required"),
  branch_location: z.object({
    longitude: z.number(),
    latitude: z.number(),
    name: z.string(),
    address: z.string(),
    city: z.string()
  }).optional(),
})

export function RestaurantSignupForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | undefined>(undefined)
  
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
      branch_name: "",
      branch_phone: "",
      branch_city: "",
      branch_location: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true)
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
        branch_name: values.branch_name,
        branch_phone: values.branch_phone,
        branch_city: values.branch_city,
        branch_location: values.branch_location,
      }

      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/delika_restaurant_approvals', {
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

      toast({
        title: "Success!",
        description: "Your application has been submitted successfully. We'll be in touch soon!",
        variant: "default",
      })

      // Reset form after successful submission
      form.reset()
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

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location)
    form.setValue('address', location.address)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-8">
        <div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Partner with Delika!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Start growing your business with us
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Input placeholder="your@email.com" type="email" {...field} />
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Branch Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="branch_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Main Branch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Branch contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="hidden">
                <FormField
                  control={form.control}
                  name="branch_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <LocationInput
                  label="Branch Location"
                  onLocationSelect={(location) => {
                    form.setValue('branch_location', location);
                    form.setValue('branch_city', location.city || '');
                  }}
                  prefillData={form.getValues('branch_location')}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              onClick={(e) => {
                e.preventDefault()
                form.handleSubmit(onSubmit)()
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Sign up as Restaurant Partner"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
