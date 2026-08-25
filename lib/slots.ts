import { addMinutes, format, startOfDay, parseISO, isBefore, isAfter, areIntervalsOverlapping } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import { brand } from '@/config/brand'
import type { Booking, TimeOff } from './supabase/types'

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
}

interface GenerateSlotsOptions {
  date: Date // Date in PT timezone
  serviceDurationMinutes: number
  existingBookings: Booking[]
  timeOff: TimeOff[]
}

/**
 * Generate available time slots for a given date
 * Takes into account:
 * - Business hours from brand config
 * - Service duration
 * - Buffer time between appointments (60 min)
 * - Existing confirmed/pending bookings
 * - Blocked time (time_off)
 */
export function generateTimeSlots({
  date,
  serviceDurationMinutes,
  existingBookings,
  timeOff,
}: GenerateSlotsOptions): TimeSlot[] {
  const slots: TimeSlot[] = []
  const dayOfWeek = format(date, 'EEEE').toLowerCase() as keyof typeof brand.workingHours
  const hours = brand.workingHours[dayOfWeek]

  // If business is closed this day, return empty slots
  if (!hours) {
    return slots
  }

  // Parse working hours in PT timezone
  const [startHour, startMinute] = hours.start.split(':').map(Number)
  const [endHour, endMinute] = hours.end.split(':').map(Number)

  // Create start and end times in PT timezone
  const startOfDayPT = startOfDay(date)
  let currentSlotStart = new Date(startOfDayPT)
  currentSlotStart.setHours(startHour, startMinute, 0, 0)

  const endOfDay = new Date(startOfDayPT)
  endOfDay.setHours(endHour, endMinute, 0, 0)

  // Generate slots at 30-minute intervals
  const slotInterval = 30 // minutes

  while (currentSlotStart < endOfDay) {
    const slotEnd = addMinutes(currentSlotStart, serviceDurationMinutes)

    // Check if slot end is within working hours
    if (slotEnd <= endOfDay) {
      // Check if slot is available
      const isAvailable = isSlotAvailable({
        slotStart: currentSlotStart,
        slotEnd,
        serviceDurationMinutes,
        existingBookings,
        timeOff,
      })

      slots.push({
        start: new Date(currentSlotStart),
        end: new Date(slotEnd),
        available: isAvailable,
      })
    }

    currentSlotStart = addMinutes(currentSlotStart, slotInterval)
  }

  return slots
}

interface IsSlotAvailableOptions {
  slotStart: Date
  slotEnd: Date
  serviceDurationMinutes: number
  existingBookings: Booking[]
  timeOff: TimeOff[]
}

function isSlotAvailable({
  slotStart,
  slotEnd,
  serviceDurationMinutes,
  existingBookings,
  timeOff,
}: IsSlotAvailableOptions): boolean {
  // Don't allow booking in the past
  const now = new Date()
  if (isBefore(slotStart, now)) {
    return false
  }

  // Add buffer time around the slot (60 min before and after)
  const bufferMinutes = brand.bufferMinutes
  const slotStartWithBuffer = addMinutes(slotStart, -bufferMinutes)
  const slotEndWithBuffer = addMinutes(slotEnd, bufferMinutes)

  // Check against existing bookings (confirmed or pending_payment)
  for (const booking of existingBookings) {
    if (booking.status === 'canceled' || booking.status === 'completed') {
      continue
    }

    const bookingStart = parseISO(booking.scheduled_at)
    const bookingEnd = addMinutes(bookingStart, booking.duration_minutes)
    const bookingEndWithBuffer = addMinutes(bookingEnd, bufferMinutes)

    // Check for overlap (including buffer)
    if (
      areIntervalsOverlapping(
        { start: slotStartWithBuffer, end: slotEndWithBuffer },
        { start: bookingStart, end: bookingEndWithBuffer }
      )
    ) {
      return false
    }
  }

  // Check against time off blocks
  for (const block of timeOff) {
    const blockStart = parseISO(block.start_at)
    const blockEnd = parseISO(block.end_at)

    if (
      areIntervalsOverlapping(
        { start: slotStart, end: slotEnd },
        { start: blockStart, end: blockEnd }
      )
    ) {
      return false
    }
  }

  return true
}

/**
 * Format a time slot for display
 */
export function formatTimeSlot(date: Date): string {
  return format(date, 'h:mm a')
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy')
}

/**
 * Get the next N available dates (skip days when business is closed)
 */
export function getAvailableDates(count: number = 14): Date[] {
  const dates: Date[] = []
  let currentDate = startOfDay(new Date())
  
  while (dates.length < count) {
    const dayOfWeek = format(currentDate, 'EEEE').toLowerCase() as keyof typeof brand.workingHours
    const hours = brand.workingHours[dayOfWeek]
    
    // Only include days when business is open
    if (hours) {
      dates.push(new Date(currentDate))
    }
    
    currentDate = addMinutes(currentDate, 24 * 60) // Add one day
  }
  
  return dates
}
