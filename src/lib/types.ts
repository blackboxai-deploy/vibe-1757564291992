export interface User {
  id: string
  email: string
  password: string
  name: string
  phone: string
  role: 'user' | 'owner'
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  createdAt: Date
}

export interface Restaurant {
  id: string
  ownerId: string
  name: string
  description: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
  cuisine: string
  rating: number
  priceRange: '$' | '$$' | '$$$' | '$$$$'
  phone: string
  email: string
  hours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  images: string[]
  amenities: string[]
  createdAt: Date
}

export interface Table {
  id: string
  restaurantId: string
  number: number
  capacity: number
  status: 'available' | 'reserved' | 'occupied' | 'maintenance'
  position: {
    x: number
    y: number
  }
  shape: 'round' | 'square' | 'rectangle'
}

export interface Booking {
  id: string
  userId: string
  restaurantId: string
  tableId: string
  date: string
  time: string
  endTime: string
  guests: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  specialRequests?: string
  contactInfo: {
    name: string
    phone: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface BookingFormData {
  date: string
  time: string
  guests: number
  name: string
  phone: string
  email: string
  specialRequests?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  loading: boolean
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
  role: 'user' | 'owner'
  location?: {
    latitude: number
    longitude: number
    address: string
  }
}

export interface WebSocketMessage {
  type: 'booking_update' | 'table_status' | 'new_booking' | 'booking_cancelled'
  data: any
  restaurantId?: string
  userId?: string
  timestamp: Date
}

export interface RestaurantSearchFilters {
  cuisine?: string
  priceRange?: string[]
  rating?: number
  distance?: number
  amenities?: string[]
}

export interface Location {
  latitude: number
  longitude: number
  address?: string
}