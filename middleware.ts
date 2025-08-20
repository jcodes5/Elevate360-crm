import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { EnhancedAuthService } from '@/lib/auth-enhanced'

// Define which paths are public (don't require authentication)
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/landing',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/test',
]

// Define which paths are API routes
const apiPaths = [
  '/api/',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  )
  
  // Check if it's an API route
  const isApiRoute = apiPaths.some(path => pathname.startsWith(path))
  
  // If it's a public path, allow the request
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Get tokens from cookies
  const { accessToken, refreshToken } = EnhancedAuthService.getTokensFromCookies(request)
  
  // If no access token, redirect to login (for non-API routes)
  if (!accessToken) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: 'No access token provided' },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  try {
    // Verify the access token
    const payload = EnhancedAuthService.verifyAccessToken(accessToken)
    console.log('Token verified for user:', payload.userId)
    
    // For API routes, continue with the request
    if (isApiRoute) {
      return NextResponse.next()
    }
    
    // For page routes, continue with the request
    return NextResponse.next()
  } catch (error) {
    console.log('Token verification failed:', error)
    
    // If we have a refresh token, try to refresh
    if (refreshToken) {
      try {
        const newTokens = await EnhancedAuthService.refreshAccessToken(refreshToken)
        
        // Create a new response
        const response = NextResponse.next()
        
        // Set the new access token in cookies
        response.cookies.set('accessToken', newTokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60, // 15 minutes
          path: '/'
        })
        
        return response
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError)
      }
    }
    
    // If it's an API route, return 401
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // For page routes, redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    
    // Clear invalid cookies
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    
    return response
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}