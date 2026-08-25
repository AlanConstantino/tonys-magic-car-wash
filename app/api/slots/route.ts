import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTimeSlots } from '@/lib/slots'
import { parseISO, startOfDay, endOfDay } from 'date-fns'
import type { Booking, TimeOff } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateStr = searchParams.get('date')
    const durationStr = searchParams.get('duration')

    if (!dateStr || !durationStr) {
      return NextResponse.json(
        { error: 'Missing date or duration parameter' },
        { status: 400 }
      )
    }

    const date = parseISO(dateStr)
    const duration = parseInt(durationStr, 10)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Return slots without booking data (all available)
      const slots = generateTimeSlots({
        date,
        serviceDurationMinutes: duration,
        existingBookings: [],
        timeOff: [],
      })

      return NextResponse.json({ 
        slots,
        warning: 'Supabase not configured - showing all slots as available'
      })
    }

    const supabase = await createClient()

    // Fetch existing bookings for this date (confirmed or pending_payment)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .gte('scheduled_at', dayStart.toISOString())
      .lte('scheduled_at', dayEnd.toISOString())
      .in('status', ['confirmed', 'pending_payment'])

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      // Return slots without booking data
      const slots = generateTimeSlots({
        date,
        serviceDurationMinutes: duration,
        existingBookings: [],
        timeOff: [],
      })
      return NextResponse.json({ slots })
    }

    // Fetch time off blocks that overlap with this date
    const { data: timeOff, error: timeOffError } = await supabase
      .from('time_off')
      .select('*')
      .lte('start_at', dayEnd.toISOString())
      .gte('end_at', dayStart.toISOString())

    if (timeOffError) {
      console.error('Error fetching time off:', timeOffError)
    }

    // Generate slots
    const slots = generateTimeSlots({
      date,
      serviceDurationMinutes: duration,
      existingBookings: (bookings || []) as Booking[],
      timeOff: (timeOff || []) as TimeOff[],
    })

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error in slots API:', error)
    return NextResponse.json(
      { error: 'Failed to generate slots' },
      { status: 500 }
    )
  }
}
