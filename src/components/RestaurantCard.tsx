'use client'

import React from 'react'
import Link from 'next/link'
import { Restaurant } from '../lib/types'
import { calculateDistance } from '../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

interface RestaurantCardProps {
  restaurant: Restaurant
  userLocation?: {
    latitude: number
    longitude: number
  }
}

export function RestaurantCard({ restaurant, userLocation }: RestaurantCardProps) {
  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurant.coordinates.latitude,
        restaurant.coordinates.longitude
      )
    : null

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">☆</span>
      )
    }

    return stars
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <img
          src={restaurant.images[0]}
          alt={`${restaurant.name} - Restaurant exterior view`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ece9e4a5-6905-4f78-bcfa-a28b19419870.png}+Restaurant`
          }}
        />
        {distance !== null && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-sm font-medium">
            {distance} km away
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{restaurant.name}</CardTitle>
            <CardDescription className="mt-1">
              {restaurant.cuisine} • {restaurant.priceRange} • {restaurant.address}
            </CardDescription>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex items-center">
            {renderStars(restaurant.rating)}
          </div>
          <span className="text-sm text-gray-600">
            ({restaurant.rating}/5)
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 text-sm mb-4">
          {restaurant.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
            >
              {amenity}
            </span>
          ))}
          {restaurant.amenities.length > 3 && (
            <span className="text-xs text-gray-500">
              +{restaurant.amenities.length - 3} more
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>📞 {restaurant.phone}</p>
            <p>📧 {restaurant.email}</p>
          </div>
          
          <Link href={`/restaurant/${restaurant.id}`}>
            <Button>Book Table</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}