import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Car, Phone, Mail } from 'lucide-react'
import { format, startOfDay, endOfDay, addDays } from 'date-fns'
import Link from 'next/link'
import type { Booking } from '@/lib/supabase/types'
import { brand } from '@/config/brand'

async function getAdminUser() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return null
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()

  if (adminError || !adminUser) {
    return null
  }

  return adminUser
}

async function getTodaysBookings() {
  const supabase = await createClient()
  const today = new Date()
  const dayStart = startOfDay(today)
  const dayEnd = endOfDay(today)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('scheduled_at', dayStart.toISOString())
    .lte('scheduled_at', dayEnd.toISOString())
    .in('status', ['confirmed', 'pending_payment'])
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }

  return bookings as Booking[]
}

async function getUpcomingBookings() {
  const supabase = await createClient()
  const tomorrow = addDays(new Date(), 1)
  const dayStart = startOfDay(tomorrow)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('scheduled_at', dayStart.toISOString())
    .in('status', ['confirmed', 'pending_payment'])
    .order('scheduled_at', { ascending: true })
    .limit(10)

  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }

  return bookings as Booking[]
}

function BookingCard({ booking }: { booking: Booking }) {
  const scheduledDate = new Date(booking.scheduled_at)
  const isPending = booking.status === 'pending_payment'

  return (
    <Card className={isPending ? "border-yellow-300 bg-yellow-50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.customer_name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {format(scheduledDate, "h:mm a")} ({booking.duration_minutes} min)
            </CardDescription>
          </div>
          {isPending && (
            <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded font-medium">
              Pending Payment
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">{booking.service_address}</p>
            <p className="text-gray-600">
              {booking.service_city}, {booking.service_state} {booking.service_zip}
            </p>
            {booking.address_notes && (
              <p className="text-xs text-gray-500 mt-1">Note: {booking.address_notes}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Car className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
          <p className="text-gray-600">
            {booking.vehicle_make} {booking.vehicle_model}
            {booking.vehicle_color && ` - ${booking.vehicle_color}`}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <Phone className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
          <a href={`tel:${booking.customer_phone}`} className="text-blue-600 hover:underline">
            {booking.customer_phone}
          </a>
        </div>

        <div className="flex items-start gap-2">
          <Mail className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
          <a href={`mailto:${booking.customer_email}`} className="text-blue-600 hover:underline">
            {booking.customer_email}
          </a>
        </div>

        {booking.customer_notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">Customer Notes:</p>
            <p className="text-gray-600">{booking.customer_notes}</p>
          </div>
        )}

        <div className="pt-3 flex gap-2">
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href={`/admin/bookings/${booking.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboardPage() {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    redirect('/admin/login')
  }

  const todaysBookings = await getTodaysBookings()
  const upcomingBookings = await getUpcomingBookings()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{brand.name} Admin</h1>
            <p className="text-sm text-gray-500">{adminUser.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/calendar">Calendar</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/time-off">Block Time</Link>
            </Button>
            <form action="/api/auth/signout" method="post">
              <Button type="submit" variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Today&apos;s Jobs</h2>
          <p className="text-gray-600">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>

        {todaysBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bookings scheduled for today</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 mb-12">
            {todaysBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Upcoming Bookings</h2>
          <p className="text-gray-600">Next 10 upcoming appointments</p>
        </div>

        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming bookings</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingBookings.map((booking) => (
              <div key={booking.id}>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {format(new Date(booking.scheduled_at), "EEEE, MMMM d, yyyy")}
                </p>
                <BookingCard booking={booking} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
