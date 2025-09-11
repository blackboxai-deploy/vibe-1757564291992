'use client'

import React, { useState } from 'react'
import { BookingFormData } from '../lib/types'
import { generateTimeSlots } from '../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>
  loading?: boolean
  restaurantName: string
  tableNumber?: number
  availableTimeSlots?: string[]
}

export function BookingForm({ 
  onSubmit, 
  loading = false, 
  restaurantName,
  tableNumber,
  availableTimeSlots = generateTimeSlots()
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
    email: '',
    specialRequests: ''
  })

  const [errors, setErrors] = useState<Partial<BookingFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {}

    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.time) newErrors.time = 'Time is required'
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.guests < 1) (newErrors as any).guests = 'At least 1 guest is required'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Date validation (must be today or future)
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      newErrors.date = 'Please select today or a future date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Booking submission error:', error)
    }
  }

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Generate date options (today + next 30 days)
  const getDateOptions = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Reservation</CardTitle>
        <CardDescription>
          Book your table at {restaurantName}
          {tableNumber && ` - Table ${tableNumber}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <select
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a date</option>
                {getDateOptions().map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <select
                id="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a time</option>
                {availableTimeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && (
                <p className="text-sm text-red-600">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max="12"
              value={formData.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value) || 1)}
            />
            {errors.guests && (
              <p className="text-sm text-red-600">{errors.guests}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <textarea
              id="specialRequests"
              value={formData.specialRequests || ''}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              placeholder="Any special requests or dietary requirements..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full"
          >
            {loading ? 'Processing...' : 'Confirm Reservation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}