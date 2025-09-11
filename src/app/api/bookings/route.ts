import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/database'
import { getTokenFromHeaders, verifyToken } from '../../../lib/auth'
import { BookingFormData } from '../../../lib/types'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request)
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    let bookings
    if (payload.role === 'owner' && restaurantId) {
      // Restaurant owner viewing bookings for their restaurant
      const restaurant = await db.getRestaurantById(restaurantId)
      if (!restaurant || restaurant.ownerId !== payload.userId) {
        return NextResponse.json(
          { message: 'Access denied' },
          { status: 403 }
        )
      }
      bookings = await db.getBookingsByRestaurant(restaurantId)
    } else if (payload.role === 'user') {
      // User viewing their own bookings
      bookings = await db.getBookingsByUser(payload.userId)
    } else {
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      )
    }

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request)
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const bookingRequest: {
      restaurantId: string
      tableId: string
      bookingData: BookingFormData
    } = await request.json()

    const { restaurantId, tableId, bookingData } = bookingRequest

    // Validate required fields
    if (!restaurantId || !tableId || !bookingData.date || !bookingData.time) {
      return NextResponse.json(
        { message: 'Missing required booking information' },
        { status: 400 }
      )
    }

    // Check if restaurant exists
    const restaurant = await db.getRestaurantById(restaurantId)
    if (!restaurant) {
      return NextResponse.json(
        { message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Check if table exists and is available
    const table = await db.getTableById(tableId)
    if (!table || table.restaurantId !== restaurantId) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      )
    }

    if (table.status !== 'available') {
      return NextResponse.json(
        { message: 'Table is not available' },
        { status: 409 }
      )
    }

    // Check for existing bookings at the same time
    const existingBookings = await db.getBookingsByDateAndTable(bookingData.date, tableId)
    const conflictingBooking = existingBookings.find(booking => {
      const bookingTime = booking.time
      const requestedTime = bookingData.time
      // Simple time conflict check (in reality, you'd consider duration)
      return bookingTime === requestedTime
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { message: 'Time slot is already booked' },
        { status: 409 }
      )
    }

    // Calculate end time (assume 2-hour booking)
    const [hours, minutes] = bookingData.time.split(':').map(Number)
    const endTime = `${(hours + 2).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    // Create booking
    const newBooking = await db.createBooking({
      userId: payload.userId,
      restaurantId,
      tableId,
      date: bookingData.date,
      time: bookingData.time,
      endTime,
      guests: bookingData.guests,
      status: 'confirmed',
      specialRequests: bookingData.specialRequests,
      contactInfo: {
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email
      }
    })

    // Update table status to reserved
    await db.updateTableStatus(tableId, 'reserved')

    return NextResponse.json({
      booking: newBooking,
      message: 'Booking confirmed successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request)
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const { bookingId, status } = await request.json()

    if (!bookingId || !status) {
      return NextResponse.json(
        { message: 'Booking ID and status are required' },
        { status: 400 }
      )
    }

    // Get the booking
    const booking = await db.getBookingById(bookingId)
    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (payload.role === 'user' && booking.userId !== payload.userId) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    if (payload.role === 'owner') {
      const restaurant = await db.getRestaurantById(booking.restaurantId)
      if (!restaurant || restaurant.ownerId !== payload.userId) {
        return NextResponse.json(
          { message: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Update booking status
    const updatedBooking = await db.updateBookingStatus(bookingId, status)

    // Update table status if booking is cancelled or completed
    if (status === 'cancelled' || status === 'completed') {
      await db.updateTableStatus(booking.tableId, 'available')
    }

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Booking updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}