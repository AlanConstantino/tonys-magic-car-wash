"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { services } from "@/config/brand"
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react"
import { format, startOfDay, addDays } from "date-fns"
import { getAvailableDates, formatTimeSlot, formatDate, generateTimeSlots, type TimeSlot } from "@/lib/slots"

function SlotsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("service")

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const service = services.find((s) => s.id === serviceId)
  const availableDates = getAvailableDates(14)

  useEffect(() => {
    if (!service) {
      router.push("/book")
      return
    }

    // Auto-select first available date
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0])
    }
  }, [service, router, availableDates, selectedDate])

  useEffect(() => {
    if (selectedDate && service) {
      loadSlotsForDate(selectedDate)
    }
  }, [selectedDate, service])

  const loadSlotsForDate = async (date: Date) => {
    setIsLoadingSlots(true)
    try {
      // Fetch existing bookings and time off for this date
      const dateStr = format(date, "yyyy-MM-dd")
      const response = await fetch(`/api/slots?date=${dateStr}&duration=${service!.duration}`)
      
      if (!response.ok) {
        throw new Error("Failed to load slots")
      }

      const data = await response.json()
      setAvailableSlots(data.slots.map((slot: any) => ({
        start: new Date(slot.start),
        end: new Date(slot.end),
        available: slot.available
      })))
    } catch (error) {
      console.error("Error loading slots:", error)
      // Generate slots client-side as fallback (without booking data)
      const slots = generateTimeSlots({
        date,
        serviceDurationMinutes: service!.duration,
        existingBookings: [],
        timeOff: [],
      })
      setAvailableSlots(slots)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleContinue = () => {
    if (selectedSlot && selectedDate && service) {
      const params = new URLSearchParams({
        service: service.id,
        date: selectedSlot.start.toISOString(),
        duration: service.duration.toString(),
      })
      router.push(`/book/details?${params.toString()}`)
    }
  }

  if (!service) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/book">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Book a Service</h1>
            <p className="text-sm text-gray-500">Step 2 of 3: Choose date & time</p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected service: <span className="font-semibold">{service.name}</span> ({service.duration} min, ${service.price})
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Date Selection */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select a Date
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {availableDates.slice(0, 10).map((date) => {
                const isSelected = selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                
                return (
                  <Card
                    key={date.toISOString()}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-blue-600 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => {
                      setSelectedDate(date)
                      setSelectedSlot(null)
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        {format(date, "EEE")}
                      </div>
                      <div className="text-2xl font-bold">
                        {format(date, "d")}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(date, "MMM")}
                      </div>
                      {isToday && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          Today
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select a Time
            </h2>
            
            {selectedDate && (
              <div className="mb-3 text-sm text-gray-600">
                {formatDate(selectedDate)}
              </div>
            )}

            {isLoadingSlots ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
                {availableSlots.filter(slot => slot.available).length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No available slots for this date. Please select another date.
                  </div>
                ) : (
                  availableSlots.map((slot, index) => {
                    if (!slot.available) return null
                    
                    const isSelected = selectedSlot && 
                      slot.start.getTime() === selectedSlot.start.getTime()
                    
                    return (
                      <Button
                        key={index}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto py-3 ${isSelected ? "" : "hover:bg-gray-100"}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {formatTimeSlot(slot.start)}
                      </Button>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm mt-8">
          <div>
            {selectedDate && selectedSlot && (
              <div className="text-sm">
                <p className="text-gray-600">
                  {formatDate(selectedDate)} at {formatTimeSlot(selectedSlot.start)}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Service duration: {service.duration} minutes
                </p>
              </div>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedSlot}
          >
            Continue to Details
          </Button>
        </div>
      </main>
    </div>
  )
}

export default function SlotsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>}>
      <SlotsPageContent />
    </Suspense>
  )
}
