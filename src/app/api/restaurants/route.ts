import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/database'
import { getTokenFromHeaders, verifyToken } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')

    let restaurants
    if (ownerId) {
      // Get restaurants for a specific owner (requires authentication)
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

      restaurants = await db.getRestaurantsByOwner(ownerId)
    } else {
      // Get all restaurants (public)
      restaurants = await db.getRestaurants()
    }

    return NextResponse.json({ restaurants }, { status: 200 })
  } catch (error) {
    console.error('Get restaurants error:', error)
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

    const restaurantData = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'description', 'address', 'coordinates', 'cuisine', 'phone', 'email', 'hours']
    for (const field of requiredFields) {
      if (!restaurantData[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Create restaurant with owner ID
    const newRestaurant = await db.createRestaurant({
      ...restaurantData,
      ownerId: payload.userId,
      rating: restaurantData.rating || 0,
      priceRange: restaurantData.priceRange || '$$',
      images: restaurantData.images || [],
      amenities: restaurantData.amenities || []
    })

    return NextResponse.json({ restaurant: newRestaurant }, { status: 201 })
  } catch (error) {
    console.error('Create restaurant error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}