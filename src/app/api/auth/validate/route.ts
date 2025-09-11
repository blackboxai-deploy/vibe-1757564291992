import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromHeaders, verifyToken } from '../../../../lib/auth'
import { db } from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request)
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await db.findUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data without password
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      location: user.location,
      createdAt: user.createdAt
    }

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}