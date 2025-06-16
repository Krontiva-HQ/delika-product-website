import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const response = await fetch(process.env.NEXT_PUBLIC_BETA_TESTERS_API!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: data.full_name,
        age_range: data.age_range,
        phone_number: data.phone_number,
        email_address: data.email_address,
        delivery_address: data.delivery_address,
        longitude: data.longitude,
        latitude: data.latitude,
        payment_method: data.payment_method,
        consent_use_of_image: data.consent_use_of_image,
        prior_experience: data.prior_experience,
        expectations: data.expectations
      })
    })

    if (!response.ok) {
      throw new Error('Failed to submit application')
    }

    return NextResponse.json(
      { message: "Application submitted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error submitting beta tester application:", error)
    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 }
    )
  }
} 