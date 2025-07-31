import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware for development that doesn't interfere with HMR
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Always allow in development to prevent HMR issues
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }
  
  // In production, you can add your authentication logic here
  // For now, just pass through
  return NextResponse.next()
}

// Only run on specific paths to avoid interference
export const config = {
  matcher: [
    /*
     * Match specific paths that need authentication
     * Exclude all Next.js internal paths
     */
    '/dashboard/:path*',
    '/settings/:path*',
    '/analytics/:path*',
    '/crm/:path*',
    '/marketing/:path*',
    '/appointments/:path*'
  ],
}
