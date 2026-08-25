import { Resend } from 'resend'
import { format } from 'date-fns'
import type { Booking } from './supabase/types'
import { brand } from '@/config/brand'

// Check if Resend is configured
export const isResendConfigured = () => {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
}

// Create Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendBookingConfirmationEmail(booking: Booking) {
  if (!isResendConfigured() || !resend) {
    console.warn('Resend not configured, skipping email')
    return { success: false, reason: 'not_configured' }
  }

  const scheduledDate = new Date(booking.scheduled_at)

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: booking.customer_email,
      subject: `Booking Confirmed - ${brand.name}`,
      html: generateConfirmationEmailHtml(booking, scheduledDate),
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    console.log('Confirmation email sent:', data?.id)
    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

function generateConfirmationEmailHtml(booking: Booking, scheduledDate: Date): string {
  const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${booking.service_address}, ${booking.service_city}, ${booking.service_state} ${booking.service_zip}`
  )}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(to right, #2563eb, #3b82f6);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: white;
            border: 1px solid #e5e7eb;
            border-top: none;
            padding: 30px 20px;
            border-radius: 0 0 8px 8px;
          }
          .detail-row {
            margin: 20px 0;
            padding: 15px;
            background: #f9fafb;
            border-radius: 6px;
          }
          .detail-row strong {
            display: block;
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .detail-row p {
            margin: 5px 0;
            color: #111827;
          }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .success-icon {
            font-size: 48px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${brand.name}</h1>
        </div>
        
        <div class="content">
          <div class="success-icon">✅</div>
          
          <h2 style="text-align: center; color: #111827;">Booking Confirmed!</h2>
          
          <p>Hi ${booking.customer_name},</p>
          
          <p>Your mobile detailing service has been confirmed. We'll see you soon!</p>

          <div class="detail-row">
            <strong>Date & Time</strong>
            <p>${format(scheduledDate, "EEEE, MMMM d, yyyy")}</p>
            <p>${format(scheduledDate, "h:mm a")} (${booking.duration_minutes} minutes)</p>
          </div>

          <div class="detail-row">
            <strong>Service Location</strong>
            <p>${booking.service_address}</p>
            <p>${booking.service_city}, ${booking.service_state} ${booking.service_zip}</p>
            ${booking.address_notes ? `<p style="font-size: 14px; color: #6b7280; margin-top: 5px;">Note: ${booking.address_notes}</p>` : ''}
          </div>

          <div class="detail-row">
            <strong>Vehicle</strong>
            <p>${booking.vehicle_make} ${booking.vehicle_model}${booking.vehicle_color ? ` - ${booking.vehicle_color}` : ''}</p>
          </div>

          <div class="detail-row">
            <strong>Total Paid</strong>
            <p style="font-size: 20px; font-weight: bold;">$${(booking.amount_cents / 100).toFixed(2)}</p>
            <p style="font-size: 14px; color: #6b7280;">Booking ID: ${booking.id.slice(0, 8)}</p>
          </div>

          <div style="text-align: center;">
            <a href="${mapUrl}" class="button">View Location on Map</a>
          </div>

          <h3>What to Expect</h3>
          <ol style="padding-left: 20px; color: #374151;">
            <li>We'll arrive at your location at the scheduled time</li>
            <li>Our professional detailer will work on your vehicle on-site</li>
            <li>You can relax while we make your vehicle look amazing!</li>
          </ol>

          ${booking.customer_notes ? `
            <div class="detail-row">
              <strong>Your Notes</strong>
              <p>${booking.customer_notes}</p>
            </div>
          ` : ''}

          <p style="margin-top: 30px;">If you need to reschedule or have any questions, please contact us:</p>
          <p>
            📞 Phone: <a href="tel:${brand.phone.replace(/\D/g, '')}" style="color: #2563eb; text-decoration: none;">${brand.phone}</a><br>
            ✉️ Email: <a href="mailto:${brand.email}" style="color: #2563eb; text-decoration: none;">${brand.email}</a>
          </p>
        </div>

        <div class="footer">
          <p>${brand.name} - ${brand.tagline}</p>
          <p>${brand.serviceArea} | ${brand.phone}</p>
        </div>
      </body>
    </html>
  `
}
