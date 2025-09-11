import { Location } from './types'

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export const defaultGeolocationOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000 // 5 minutes
}

export function getCurrentLocation(options: GeolocationOptions = defaultGeolocationOptions): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let message = 'Unknown error occurred'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable'
            break
          case error.TIMEOUT:
            message = 'Location request timed out'
            break
        }
        reject(new Error(message))
      },
      options
    )
  })
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  // In a real application, you would use a geocoding service like Google Maps API
  // For this demo, we'll return a placeholder address
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return a mock address based on coordinates
    const addresses = [
      'New York, NY, USA',
      'Los Angeles, CA, USA',
      'Chicago, IL, USA',
      'Houston, TX, USA',
      'Phoenix, AZ, USA',
      'Philadelphia, PA, USA',
      'San Antonio, TX, USA',
      'San Diego, CA, USA',
      'Dallas, TX, USA',
      'San Jose, CA, USA'
    ]
    
    // Use coordinates to deterministically select an address
    const index = Math.floor((Math.abs(latitude) + Math.abs(longitude)) * 100) % addresses.length
    return addresses[index]
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  }
}

export function watchLocation(
  callback: (location: Location) => void,
  errorCallback?: (error: GeolocationPositionError) => void,
  options: GeolocationOptions = defaultGeolocationOptions
): number | null {
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported by this browser')
    return null
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
    },
    errorCallback,
    options
  )
}

export function clearLocationWatch(watchId: number) {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId)
  }
}

// Custom hook for geolocation (to be used in React components)
export function useGeolocation(options?: GeolocationOptions) {
  const getLocation = () => getCurrentLocation(options)
  const reverseGeocodeLocation = (lat: number, lng: number) => reverseGeocode(lat, lng)
  
  return {
    getLocation,
    reverseGeocodeLocation,
    watchLocation,
    clearLocationWatch
  }
}