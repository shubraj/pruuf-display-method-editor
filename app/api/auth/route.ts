import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Simple username/password-based auth for admin
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!ADMIN_PASSWORD_HASH) {
      // If no password hash is set, allow access (for development)
      // In production, always require a password
      return NextResponse.json({
        success: true,
        message: 'Auth bypassed (no password configured)',
      });
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check username
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check password
    // If ADMIN_PASSWORD_HASH doesn't look like a bcrypt hash, treat it as plain password for development
    const isBcryptHash = ADMIN_PASSWORD_HASH.startsWith('$2a$') || ADMIN_PASSWORD_HASH.startsWith('$2b$') || ADMIN_PASSWORD_HASH.startsWith('$2y$');
    
    let isValid = false;
    if (isBcryptHash) {
      isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } else {
      // For development: allow plain password comparison if hash is not bcrypt format
      isValid = password === ADMIN_PASSWORD_HASH;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create a simple session token
    const sessionToken = Buffer.from(`${Date.now()}-${Math.random()}-${username}`).toString('base64');

    const response = NextResponse.json({
      success: true,
      token: sessionToken,
    });

    // Set session cookie with httpOnly for security
    response.cookies.set('auth_token', sessionToken, {
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 500 }
    );
  }
}

// Verify session token
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // In a production app, you would verify the token against a database
    // For now, we'll just check if the cookie exists
    return NextResponse.json({
      authenticated: true,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
