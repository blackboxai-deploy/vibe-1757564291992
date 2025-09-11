import { User, Restaurant, Table, Booking } from './types'
import { generateId } from './utils'

// Mock database - In production, this would be replaced with a real database
class MockDatabase {
  private users: User[] = [
    {
      id: 'user_1',
      email: 'john@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'John Doe',
      phone: '+1234567890',
      role: 'user',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY'
      },
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'owner_1',
      email: 'owner@restaurant.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Restaurant Owner',
      phone: '+1234567891',
      role: 'owner',
      createdAt: new Date('2024-01-10')
    }
  ]

  private restaurants: Restaurant[] = [
    {
      id: 'restaurant_1',
      ownerId: 'owner_1',
      name: 'The Garden Bistro',
      description: 'A cozy restaurant with fresh, seasonal ingredients and a beautiful garden setting.',
      address: '123 Main St, New York, NY 10001',
      coordinates: {
        latitude: 40.7589,
        longitude: -73.9851
      },
      cuisine: 'American',
      rating: 4.5,
      priceRange: '$$',
      phone: '+1234567892',
      email: 'contact@gardenbistro.com',
      hours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
      },
      images: [
        'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/04f6ffa8-fa5c-490c-a5ce-98270ae3acff.png',
        'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/76c66992-4623-4e10-962d-5b36db8c6a58.png',
        'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c8fdc673-49e0-4ea1-b13c-c8cb3a0c9885.png'
      ],
      amenities: ['Outdoor Seating', 'WiFi', 'Parking', 'Wheelchair Accessible'],
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'restaurant_2',
      ownerId: 'owner_1',
      name: 'Spice Route',
      description: 'Authentic Indian cuisine with traditional spices and modern presentation.',
      address: '456 Oak Ave, New York, NY 10002',
      coordinates: {
        latitude: 40.7505,
        longitude: -73.9934
      },
      cuisine: 'Indian',
      rating: 4.3,
      priceRange: '$$',
      phone: '+1234567893',
      email: 'contact@spiceroute.com',
      hours: {
        monday: { open: '17:00', close: '23:00', closed: false },
        tuesday: { open: '17:00', close: '23:00', closed: false },
        wednesday: { open: '17:00', close: '23:00', closed: false },
        thursday: { open: '17:00', close: '23:00', closed: false },
        friday: { open: '17:00', close: '24:00', closed: false },
        saturday: { open: '17:00', close: '24:00', closed: false },
        sunday: { open: '17:00', close: '22:00', closed: false }
      },
      images: [
        'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c1586290-59f7-46d7-9e4e-8e15545f02d9.png',
        'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/0bcd9a6c-b92b-4872-85e1-3ff678d82163.png',
        'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/78c65b20-3300-4f4a-a1b8-366bf771aa7d.png'
      ],
      amenities: ['Takeout', 'Delivery', 'Vegetarian Options', 'Spicy Food'],
      createdAt: new Date('2024-01-12')
    }
  ]

  private tables: Table[] = [
    // Tables for The Garden Bistro
    { id: 'table_1', restaurantId: 'restaurant_1', number: 1, capacity: 2, status: 'available', position: { x: 1, y: 1 }, shape: 'round' },
    { id: 'table_2', restaurantId: 'restaurant_1', number: 2, capacity: 4, status: 'available', position: { x: 3, y: 1 }, shape: 'square' },
    { id: 'table_3', restaurantId: 'restaurant_1', number: 3, capacity: 2, status: 'available', position: { x: 5, y: 1 }, shape: 'round' },
    { id: 'table_4', restaurantId: 'restaurant_1', number: 4, capacity: 6, status: 'available', position: { x: 1, y: 3 }, shape: 'rectangle' },
    { id: 'table_5', restaurantId: 'restaurant_1', number: 5, capacity: 4, status: 'available', position: { x: 4, y: 3 }, shape: 'square' },
    // Tables for Spice Route
    { id: 'table_6', restaurantId: 'restaurant_2', number: 1, capacity: 2, status: 'available', position: { x: 1, y: 1 }, shape: 'round' },
    { id: 'table_7', restaurantId: 'restaurant_2', number: 2, capacity: 4, status: 'available', position: { x: 3, y: 1 }, shape: 'square' },
    { id: 'table_8', restaurantId: 'restaurant_2', number: 3, capacity: 6, status: 'available', position: { x: 1, y: 3 }, shape: 'rectangle' },
  ]

  private bookings: Booking[] = []

  // User operations
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date()
    }
    this.users.push(newUser)
    return newUser
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null
  }

  // Restaurant operations
  async createRestaurant(restaurantData: Omit<Restaurant, 'id' | 'createdAt'>): Promise<Restaurant> {
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: generateId(),
      createdAt: new Date()
    }
    this.restaurants.push(newRestaurant)
    return newRestaurant
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return [...this.restaurants]
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    return this.restaurants.find(restaurant => restaurant.id === id) || null
  }

  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    return this.restaurants.filter(restaurant => restaurant.ownerId === ownerId)
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    const index = this.restaurants.findIndex(restaurant => restaurant.id === id)
    if (index === -1) return null
    
    this.restaurants[index] = { ...this.restaurants[index], ...updates }
    return this.restaurants[index]
  }

  // Table operations
  async getTablesByRestaurant(restaurantId: string): Promise<Table[]> {
    return this.tables.filter(table => table.restaurantId === restaurantId)
  }

  async getTableById(id: string): Promise<Table | null> {
    return this.tables.find(table => table.id === id) || null
  }

  async updateTableStatus(id: string, status: Table['status']): Promise<Table | null> {
    const index = this.tables.findIndex(table => table.id === id)
    if (index === -1) return null
    
    this.tables[index].status = status
    return this.tables[index]
  }

  async createTable(tableData: Omit<Table, 'id'>): Promise<Table> {
    const newTable: Table = {
      ...tableData,
      id: generateId()
    }
    this.tables.push(newTable)
    return newTable
  }

  // Booking operations
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const newBooking: Booking = {
      ...bookingData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.bookings.push(newBooking)
    return newBooking
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return this.bookings.filter(booking => booking.userId === userId)
  }

  async getBookingsByRestaurant(restaurantId: string): Promise<Booking[]> {
    return this.bookings.filter(booking => booking.restaurantId === restaurantId)
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.bookings.find(booking => booking.id === id) || null
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | null> {
    const index = this.bookings.findIndex(booking => booking.id === id)
    if (index === -1) return null
    
    this.bookings[index].status = status
    this.bookings[index].updatedAt = new Date()
    return this.bookings[index]
  }

  async getBookingsByDateAndTable(date: string, tableId: string): Promise<Booking[]> {
    return this.bookings.filter(booking => 
      booking.date === date && 
      booking.tableId === tableId && 
      booking.status !== 'cancelled'
    )
  }
}

export const db = new MockDatabase()