import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/database'
import { getTokenFromHeaders, verifyToken } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const date = searchParams.get('date')
    const time = searchParams.get('time')

    if (!restaurantId) {
      return NextResponse.json(
        { message: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get tables for the restaurant
    const tables = await db.getTablesByRestaurant(restaurantId)

    // If date and time are provided, check for availability
    if (date && time) {
      const bookedTableIds = []
      
      for (const table of tables) {
        const bookings = await db.getBookingsByDateAndTable(date, table.id)
        const hasConflict = bookings.some(booking => {
          // Simple time conflict check
          const bookingStartTime = booking.time
          const bookingEndTime = booking.endTime
          
          // Check if requested time conflicts with existing booking
          return time >= bookingStartTime && time < bookingEndTime
        })
        
        if (hasConflict) {
          bookedTableIds.push(table.id)
        }
      }

      return NextResponse.json({
        tables,
        bookedTableIds,
        availableCount: tables.length - bookedTableIds.length
      }, { status: 200 })
    }

    return NextResponse.json({ tables }, { status: 200 })
  } catch (error) {
    console.error('Get tables error:', error)
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
    if (!payload || payload.role !== 'owner') {
      return NextResponse.json(
        { message: 'Owner access required' },
        { status: 403 }
      )
    }

    const tableData = await request.json()

    // Validate required fields
    const requiredFields = ['restaurantId', 'number', 'capacity', 'position', 'shape']
    for (const field of requiredFields) {
      if (!tableData[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Verify restaurant ownership
    const restaurant = await db.getRestaurantById(tableData.restaurantId)
    if (!restaurant || restaurant.ownerId !== payload.userId) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Create new table
    const newTable = await db.createTable({
      ...tableData,
      status: tableData.status || 'available'
    })

    return NextResponse.json({ table: newTable }, { status: 201 })
  } catch (error) {
    console.error('Create table error:', error)
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
    if (!payload || payload.role !== 'owner') {
      return NextResponse.json(
        { message: 'Owner access required' },
        { status: 403 }
      )
    }

    const { tableId, status } = await request.json()

    if (!tableId || !status) {
      return NextResponse.json(
        { message: 'Table ID and status are required' },
        { status: 400 }
      )
    }

    // Get the table and verify ownership
    const table = await db.getTableById(tableId)
    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      )
    }

    const restaurant = await db.getRestaurantById(table.restaurantId)
    if (!restaurant || restaurant.ownerId !== payload.userId) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Update table status
    const updatedTable = await db.updateTableStatus(tableId, status)

    return NextResponse.json({
      table: updatedTable,
      message: 'Table updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Update table error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}