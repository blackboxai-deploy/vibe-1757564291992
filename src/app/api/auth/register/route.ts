import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/database'
import { hashPassword, createAuthResponse } from '../../../../lib/auth'
import { RegisterData } from '../../../../lib/types'

export async function POST(request: NextRequest) {
  try {
    const userData: RegisterData = await request.json()

    // Validate required fields
    if (!userData.email || !userData.password || !userData.name || !userData.phone || !userData.role) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['user', 'owner'].includes(userData.role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be either "user" or "owner"' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.findUserByEmail(userData.email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create new user
    const newUser = await db.createUser({
      ...userData,
      password: hashedPassword
    })

    // Create response with user data and token
    const authResponse = createAuthResponse(newUser)

    return NextResponse.json(authResponse, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}