'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { RegisterData } from '../../../lib/types'
import { getCurrentLocation } from '../../../lib/geolocation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'user'
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  
  const { register } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('') // Clear error when user types
  }

  const requestLocation = async () => {
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation()
      setFormData(prev => ({
        ...prev,
        location: {
          ...location,
          address: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        }
      }))
    } catch (error) {
      console.error('Failed to get location:', error)
      setError('Failed to get location. You can skip this step.')
    } finally {
      setLocationLoading(false)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      setError('All fields are required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      setError('Please enter a valid phone number')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const success = await register(formData)
      if (success) {
        router.push('/')
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (error) {
      setError('Registration failed. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Join TableBook</h1>
          <p className="text-gray-600 mt-2">Create your account to start booking tables</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Account Type Selection */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={formData.role === 'user'}
                      onChange={(e) => handleInputChange('role', e.target.value as 'user' | 'owner')}
                      disabled={loading}
                    />
                    <span className="text-sm">Customer</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="owner"
                      checked={formData.role === 'owner'}
                      onChange={(e) => handleInputChange('role', e.target.value as 'user' | 'owner')}
                      disabled={loading}
                    />
                    <span className="text-sm">Restaurant Owner</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password (min. 6 characters)"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Location Section (Optional for users) */}
              {formData.role === 'user' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Location (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={requestLocation}
                      disabled={loading || locationLoading}
                    >
                      {locationLoading ? (
                        <div className="flex items-center gap-1">
                          <LoadingSpinner size="sm" />
                          Getting...
                        </div>
                      ) : formData.location ? (
                        'Update Location'
                      ) : (
                        'Get My Location'
                      )}
                    </Button>
                  </div>
                  {formData.location && (
                    <p className="text-xs text-green-600">
                      ✓ Location saved for better restaurant recommendations
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Help us show you nearby restaurants (optional)
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}