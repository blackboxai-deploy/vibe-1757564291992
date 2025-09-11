'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { Restaurant, Table, BookingFormData } from '../../../lib/types'
import { generateTimeSlots } from '../../../lib/utils'
import { TableSelector } from '../../../components/TableSelector'
import { BookingForm } from '../../../components/BookingForm'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'

export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const restaurantId = params.id as string

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [guests, setGuests] = useState(2)
  const [bookedTableIds, setBookedTableIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (restaurantId) {
      loadRestaurantDetails()
      loadTables()
    }
  }, [restaurantId])

  useEffect(() => {
    if (selectedDate && selectedTime) {
      checkTableAvailability()
    }
  }, [selectedDate, selectedTime])

  const loadRestaurantDetails = async () => {
    try {
      // Get restaurant details from our restaurants API
      const response = await fetch('/api/restaurants')
      const data = await response.json()
      
      const restaurantDetails = data.restaurants.find((r: Restaurant) => r.id === restaurantId)
      if (restaurantDetails) {
        setRestaurant(restaurantDetails)
      } else {
        setError('Restaurant not found')
      }
    } catch (error) {
      console.error('Failed to load restaurant:', error)
      setError('Failed to load restaurant details')
    }
  }

  const loadTables = async () => {
    try {
      const response = await fetch(`/api/tables?restaurantId=${restaurantId}`)
      const data = await response.json()
      setTables(data.tables)
    } catch (error) {
      console.error('Failed to load tables:', error)
      setError('Failed to load table information')
    } finally {
      setLoading(false)
    }
  }

  const checkTableAvailability = async () => {
    if (!selectedDate || !selectedTime) return

    try {
      const response = await fetch(
        `/api/tables?restaurantId=${restaurantId}&date=${selectedDate}&time=${selectedTime}`
      )
      const data = await response.json()
      setBookedTableIds(data.bookedTableIds || [])
    } catch (error) {
      console.error('Failed to check availability:', error)
    }
  }

  const handleBooking = async (bookingData: BookingFormData) => {
    if (!selectedTable || !user) {
      setError('Please select a table and ensure you are logged in')
      return
    }

    setBookingLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId,
          tableId: selectedTable.id,
          bookingData
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to booking confirmation
        router.push(`/booking/${result.booking.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking failed:', error)
      setError('Failed to create booking. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table)
    setError('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading restaurant details..." />
      </div>
    )
  }

  if (error && !restaurant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.push('/')}>
          Back to Restaurants
        </Button>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
        <p className="text-gray-600 mb-6">The restaurant you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/')}>
          Back to Restaurants
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Restaurant Header */}
      <div className="relative">
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <img
            src={restaurant.images[0]}
            alt={`${restaurant.name} - Main view`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/13307c60-e7b9-4341-99f8-48fd66dd929d.png}+Restaurant+Interior`
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-xl opacity-90">{restaurant.cuisine} • {restaurant.priceRange}</p>
            <p className="opacity-80">{restaurant.address}</p>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact</h4>
                  <p className="text-sm text-gray-600">📞 {restaurant.phone}</p>
                  <p className="text-sm text-gray-600">📧 {restaurant.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rating</h4>
                  <div className="flex items-center">
                    <span className="text-yellow-400">{'★'.repeat(Math.floor(restaurant.rating))}</span>
                    <span className="text-gray-300">{'☆'.repeat(5 - Math.floor(restaurant.rating))}</span>
                    <span className="ml-2 text-sm text-gray-600">({restaurant.rating}/5)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {restaurant.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Selection */}
          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>Book a Table</CardTitle>
                <CardDescription>
                  Select your preferred date, time, and table
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select time</option>
                      {generateTimeSlots().map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Guests</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {selectedDate && selectedTime && (
                  <TableSelector
                    tables={tables}
                    selectedTable={selectedTable}
                    onTableSelect={handleTableSelect}
                    bookedTables={bookedTableIds}
                    guests={guests}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Sign in to Book a Table</h3>
                  <p className="text-gray-600 mb-4">
                    You need to be logged in to make a reservation
                  </p>
                  <div className="space-x-2">
                    <Button onClick={() => router.push('/auth/login')}>
                      Sign In
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/auth/register')}>
                      Sign Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Form Sidebar */}
        <div className="space-y-6">
          {user && selectedTable && selectedDate && selectedTime && (
            <BookingForm
              onSubmit={handleBooking}
              loading={bookingLoading}
              restaurantName={restaurant.name}
              tableNumber={selectedTable.number}
              availableTimeSlots={generateTimeSlots()}
            />
          )}

          {/* Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restaurant.images.slice(1, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${restaurant.name} - View ${index + 2}`}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9fc0dda9-67cf-4391-9f0f-8a8941f17717.png}+Gallery+${index + 2}`
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}