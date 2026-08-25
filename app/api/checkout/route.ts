import { NextRequest, NextResponse } from 'next/server'
import { stripe, isStripeConfigured, formatPriceForStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { services } from '@/config/brand'
import type { Booking } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceId,
      scheduledAt,
      duration,
      customerName,
      customerEmail,
      customerPhone,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      serviceAddress,
      serviceCity,
      serviceState,
      serviceZip,
      addressNotes,
      customerNotes,
    } = body

    // Validate required fields
    if (!serviceId || !scheduledAt || !customerName || !customerEmail || !customerPhone ||
        !vehicleMake || !vehicleModel || !serviceAddress || !serviceCity || !serviceZip) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the service
    const service = services.find((s) => s.id === serviceId)
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { 
          error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables. See README for setup instructions.' 
        },
        { status: 503 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please set up your Supabase credentials. See README for setup instructions.' },
        { status: 503 }
      )
    }

    const supabase = await createClient()

    // Create or get customer record
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerEmail)
      .single()

    let customerId = existingCustomer?.id

    if (!customerId) {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
        })
        .select('id')
        .single()

      if (customerError) {
        console.error('Error creating customer:', customerError)
        return NextResponse.json(
          { error: 'Failed to create customer record' },
          { status: 500 }
        )
      }

      customerId = newCustomer.id
    }

    // Create booking record with pending_payment status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        service_id: service.id,
        scheduled_at: scheduledAt,
        duration_minutes: service.duration,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_color: vehicleColor || null,
        service_address: serviceAddress,
        service_city: serviceCity,
        service_state: serviceState,
        service_zip: serviceZip,
        address_notes: addressNotes || null,
        customer_notes: customerNotes || null,
        amount_cents: formatPriceForStripe(service.price),
        status: 'pending_payment',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Create Stripe Checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:43123'
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.name,
              description: `${service.description} - ${new Date(scheduledAt).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short',
                timeZone: 'America/Los_Angeles',
              })}`,
            },
            unit_amount: formatPriceForStripe(service.price),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/book/details?service=${serviceId}&date=${scheduledAt}&duration=${duration}`,
      customer_email: customerEmail,
      metadata: {
        booking_id: booking.id,
        service_id: service.id,
        customer_name: customerName,
      },
    })

    // Update booking with checkout session ID
    await supabase
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', booking.id)

    return NextResponse.json({ url: session.url, bookingId: booking.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
}
