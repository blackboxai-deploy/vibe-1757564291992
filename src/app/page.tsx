'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Restaurant, Location } from '../lib/types'
import { getCurrentLocation } from '../lib/geolocation'
import { RestaurantCard } from '../components/RestaurantCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function HomePage() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchRadius, setSearchRadius] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState('')
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  useEffect(() => {
    // Load all restaurants initially
    loadAllRestaurants()
  }, [])

  const loadAllRestaurants = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/restaurants')
      const data = await response.json()
      setRestaurants(data.restaurants)
    } catch (error) {
      console.error('Failed to load restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestLocationAndSearch = async () => {
    setLoading(true)
    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      setLocationPermission('granted')
      
      const response = await fetch('/api/restaurants/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: searchRadius,
          filters: {
            cuisine: cuisineFilter || undefined
          }
        })
      })

      const data = await response.json()
      setRestaurants(data.restaurants)
    } catch (error) {
      console.error('Failed to get location or search nearby restaurants:', error)
      setLocationPermission('denied')
      // Fallback to all restaurants
      loadAllRestaurants()
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = !searchTerm || 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCuisine = !cuisineFilter || 
      restaurant.cuisine.toLowerCase().includes(cuisineFilter.toLowerCase())
    
    return matchesSearch && matchesCuisine
  })

  const availableCuisines = Array.from(new Set(restaurants.map(r => r.cuisine))).sort()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Find & Book Your Perfect Table
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing restaurants nearby and book tables instantly with real-time availability
        </p>
      </div>

      {/* Location & Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Find Restaurants Near You</CardTitle>
          <CardDescription>
            Allow location access to find restaurants near you, or browse all available restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locationPermission === 'denied' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Location access was denied. Showing all restaurants. You can still search by name or cuisine.
                </p>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search restaurants, cuisine, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={cuisineFilter}
                  onChange={(e) => setCuisineFilter(e.target.value)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Cuisines</option>
                  {availableCuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>

                {!userLocation && locationPermission !== 'denied' && (
                  <Button onClick={requestLocationAndSearch} disabled={loading}>
                    {loading ? 'Finding...' : 'Find Nearby'}
                  </Button>
                )}
              </div>
            </div>

            {userLocation && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>📍 Location detected</span>
                <div className="flex items-center gap-2">
                  <label htmlFor="radius">Search radius:</label>
                  <select
                    id="radius"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="border rounded px-2 py-1"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                  </select>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={requestLocationAndSearch}
                    disabled={loading}
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message for Authenticated Users */}
      {user && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Welcome back, {user.name}!</h3>
                <p className="text-sm text-gray-600">
                  {user.role === 'owner' 
                    ? 'Manage your restaurants and bookings from your dashboard.' 
                    : 'Find your next dining experience and manage your reservations.'
                  }
                </p>
              </div>
              <Button variant="outline">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">
            {userLocation ? 'Nearby Restaurants' : 'All Restaurants'} 
            {filteredRestaurants.length > 0 && (
              <span className="text-lg text-gray-500 ml-2">
                ({filteredRestaurants.length} found)
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading restaurants..." />
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  {searchTerm || cuisineFilter 
                    ? 'No restaurants match your search criteria.' 
                    : 'No restaurants found.'
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setCuisineFilter('')
                    loadAllRestaurants()
                  }}
                >
                  Show All Restaurants
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                userLocation={userLocation ? { 
                  latitude: userLocation.latitude, 
                  longitude: userLocation.longitude 
                } : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}