import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, phone_number, restaurant_name, restaurant_type, preferred_date, preferred_time, message } = body;

    if (!email || !full_name) {
      console.error('Missing required fields:', { email, full_name });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Attempting to send email with Resend...', {
      to: email,
      name: full_name,
      apiKey: process.env.RESEND_API_KEY ? 'Present' : 'Missing'
    });

    const { data, error } = await resend.emails.send({
      from: 'Delika App <info@krontiva.com>',
      to: [email],
      subject: 'Your Delika Demo Request Confirmation',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Thank You for Your Demo Request!</h2>
          
          <p>Dear ${full_name},</p>
          
          <p>We've received your demo request for Delika. Here's a summary of your request:</p>
          
          <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Restaurant Name:</strong> ${restaurant_name}</p>
            <p><strong>Restaurant Type:</strong> ${restaurant_type}</p>
            <p><strong>Preferred Date:</strong> ${new Date(preferred_date).toLocaleDateString()}</p>
            <p><strong>Preferred Time:</strong> ${new Date(preferred_time).toLocaleTimeString()}</p>
            ${message ? `<p><strong>Additional Information:</strong> ${message}</p>` : ''}
          </div>
          
          <p>Our team will review your request and contact you within 24 hours to schedule your personalized demo.</p>
          
          <p>If you have any questions in the meantime, feel free to reply to this email.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The Delika Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 400 }
      );
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({ 
      success: true,
      data,
      message: 'Confirmation email sent successfully' 
    });

  } catch (error) {
    console.error('Unexpected error in send-demo-email:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 