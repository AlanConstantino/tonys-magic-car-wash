"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Calendar, Clock, MapPin, Car, Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { Booking } from "@/lib/supabase/types"

function ConfirmationPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      fetchBookingDetails(sessionId)
    }
  }, [sessionId])

  const fetchBookingDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/booking?session_id=${sessionId}`)
      
      if (!response.ok) {
        throw new Error("Failed to load booking details")
      }

      const data = await response.json()
      setBooking(data.booking)
    } catch (err) {
      console.error("Error fetching booking:", err)
      setError("Unable to load booking details. Please check your email for confirmation.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Received</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Booking not found</p>
      </div>
    )
  }

  const scheduledDate = new Date(booking.scheduled_at)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container py-12 max-w-3xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">
                Your detailing service has been booked. We&apos;ll see you soon!
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-gray-600">
                    {format(scheduledDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-gray-600">
                    {format(scheduledDate, "h:mm a")} ({booking.duration_minutes} minutes)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Service Location</p>
                  <p className="text-gray-600">
                    {booking.service_address}
                  </p>
                  <p className="text-gray-600">
                    {booking.service_city}, {booking.service_state} {booking.service_zip}
                  </p>
                  {booking.address_notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      Note: {booking.address_notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Vehicle</p>
                  <p className="text-gray-600">
                    {booking.vehicle_make} {booking.vehicle_model}
                    {booking.vehicle_color && ` - ${booking.vehicle_color}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Paid</span>
                <span className="text-2xl font-bold">
                  ${(booking.amount_cents / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Booking ID: {booking.id.slice(0, 8)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold shrink-0">
                1
              </div>
              <p className="text-sm text-gray-600">
                Check your email ({booking.customer_email}) for your booking confirmation
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold shrink-0">
                2
              </div>
              <p className="text-sm text-gray-600">
                We&apos;ll arrive at your location at the scheduled time
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold shrink-0">
                3
              </div>
              <p className="text-sm text-gray-600">
                Sit back and relax while we make your vehicle look amazing!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8 gap-4">
          <Button variant="outline" asChild>
            <Link href="/book">Book Another Service</Link>
          </Button>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  )
}
