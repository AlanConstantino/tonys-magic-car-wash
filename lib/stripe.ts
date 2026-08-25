import Stripe from 'stripe'

// Check if Stripe is configured
export const isStripeConfigured = () => {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  )
}

// Create Stripe client (server-side only)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-07-29.dahlia',
      typescript: true,
    })
  : null

// Format price for Stripe (dollars to cents)
export const formatPriceForStripe = (priceInDollars: number): number => {
  return Math.round(priceInDollars * 100)
}

// Format price for display (cents to dollars)
export const formatPriceForDisplay = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2)
}
