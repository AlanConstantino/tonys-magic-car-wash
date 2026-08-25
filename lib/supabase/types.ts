export type BookingStatus = 'pending_payment' | 'confirmed' | 'completed' | 'canceled'

export interface Service {
  id: string
  name: string
  slug: string
  description: string
  duration_minutes: number
  price_cents: number
  is_addon: boolean
  is_active: boolean
  display_order: number
  features: string[]
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  email: string
  name: string
  phone: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  customer_id: string | null
  service_id: string
  scheduled_at: string
  duration_minutes: number
  customer_name: string
  customer_email: string
  customer_phone: string
  vehicle_make: string
  vehicle_model: string
  vehicle_color: string | null
  service_address: string
  service_city: string
  service_state: string
  service_zip: string
  address_notes: string | null
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  amount_cents: number
  status: BookingStatus
  customer_notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  canceled_at: string | null
}

export interface TimeOff {
  id: string
  start_at: string
  end_at: string
  reason: string | null
  created_by: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  is_active: boolean
  created_at: string
}
