import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, MapPin, Car, Phone, Mail, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import type { Booking } from '@/lib/supabase/types'
import { brand } from '@/config/brand'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()

  return adminUser
}

async function getBooking(id: string) {
  const supabase = await createClient()
  
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return booking as Booking
}

async function updateBookingStatus(bookingId: string, status: string) {
  'use server'
  
  const supabase = await createClient()
  
  const updates: any = { status }
  
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  } else if (status === 'canceled') {
    updates.canceled_at = new Date().toISOString()
  }

  await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)

  redirect('/admin')
}

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  const adminUser = await getAdminUser()
  
  if (!adminUser) {
    redirect('/admin/login')
  }

  const booking = await getBooking(params.id)

  if (!booking) {
    notFound()
  }

  const scheduledDate = new Date(booking.scheduled_at)

  const handleComplete = async () => {
    'use server'
    await updateBookingStatus(booking.id, 'completed')
  }

  const handleCancel = async () => {
    'use server'
    await updateBookingStatus(booking.id, 'canceled')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Booking Details</h1>
            <p className="text-sm text-gray-500">ID: {booking.id.slice(0, 8)}</p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="mb-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            booking.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {booking.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-gray-600">
                    {format(scheduledDate, "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-gray-600">
                    {format(scheduledDate, "h:mm a")} ({booking.duration_minutes} minutes)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Amount</p>
                  <p className="text-gray-600">
                    ${(booking.amount_cents / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-1">{booking.customer_name}</p>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <a href={`tel:${booking.customer_phone}`} className="text-blue-600 hover:underline">
                  {booking.customer_phone}
                </a>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <a href={`mailto:${booking.customer_email}`} className="text-blue-600 hover:underline">
                  {booking.customer_email}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p>{booking.service_address}</p>
                  <p>{booking.service_city}, {booking.service_state} {booking.service_zip}</p>
                  {booking.address_notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Notes:</strong> {booking.address_notes}
                    </p>
                  )}
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${booking.service_address}, ${booking.service_city}, ${booking.service_state} ${booking.service_zip}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {booking.vehicle_make} {booking.vehicle_model}
                  </p>
                  {booking.vehicle_color && (
                    <p className="text-gray-600">Color: {booking.vehicle_color}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {booking.customer_notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customer Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{booking.customer_notes}</p>
            </CardContent>
          </Card>
        )}

        {(booking.status === 'confirmed' || booking.status === 'pending_payment') && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <form action={handleComplete}>
                <Button type="submit">Mark as Completed</Button>
              </form>
              <form action={handleCancel}>
                <Button type="submit" variant="destructive">Cancel Booking</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
