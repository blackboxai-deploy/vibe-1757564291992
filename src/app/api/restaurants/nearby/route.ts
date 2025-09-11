import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/database'
import { calculateDistance } from '../../../../lib/utils'
import { RestaurantSearchFilters } from '../../../../lib/types'

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, radius = 10, filters = {} }: {
      latitude: number
      longitude: number
      radius?: number
      filters?: RestaurantSearchFilters
    } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { message: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Get all restaurants
    const allRestaurants = await db.getRestaurants()

    // Filter restaurants by distance
    const nearbyRestaurants = allRestaurants
      .map(restaurant => ({
        ...restaurant,
        distance: calculateDistance(
          latitude,
          longitude,
          restaurant.coordinates.latitude,
          restaurant.coordinates.longitude
        )
      }))
      .filter(restaurant => restaurant.distance <= radius)

    // Apply additional filters
    let filteredRestaurants = nearbyRestaurants

    if (filters.cuisine) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.cuisine.toLowerCase().includes(filters.cuisine!.toLowerCase())
      )
    }

    if (filters.priceRange && filters.priceRange.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        filters.priceRange!.includes(restaurant.priceRange)
      )
    }

    if (filters.rating) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.rating >= filters.rating!
      )
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        filters.amenities!.some(amenity =>
          restaurant.amenities.some(restaurantAmenity =>
            restaurantAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      )
    }

    // Sort by distance (closest first)
    filteredRestaurants.sort((a, b) => a.distance - b.distance)

    return NextResponse.json({
      restaurants: filteredRestaurants,
      count: filteredRestaurants.length,
      userLocation: { latitude, longitude },
      searchRadius: radius
    }, { status: 200 })
  } catch (error) {
    console.error('Nearby restaurants search error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}