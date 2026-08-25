import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('PaymentIntent failed:', paymentIntent.id)
        // Could send notification to customer here
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)

  const bookingId = session.metadata?.booking_id
  if (!bookingId) {
    console.error('No booking_id in session metadata')
    return
  }

  // Use service role client to update booking status
  const supabase = createServiceClient()

  // Update booking status to confirmed
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('Error updating booking:', updateError)
    throw updateError
  }

  console.log('Booking confirmed:', bookingId)

  // Fetch the full booking to send confirmation email
  const { data: fullBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (fetchError || !fullBooking) {
    console.error('Error fetching booking for email:', fetchError)
    return
  }

  // Send confirmation email
  const { sendBookingConfirmationEmail } = await import('@/lib/email')
  const emailResult = await sendBookingConfirmationEmail(fullBooking)
  
  if (!emailResult.success) {
    console.log('Email not sent:', emailResult.reason || 'error')
  }
}
