import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { EnhancedAuthService, canAccessResource } from './lib/auth-enhanced'

// Define protected routes and their required permissions
const PROTECTED_ROUTES = {
  '/dashboard': { requireAuth: true, roles: ['admin', 'manager', 'agent'] },
  '/analytics': { requireAuth: true, roles: ['admin', 'manager'] },
  '/settings': { requireAuth: true, roles: ['admin'] },
  '/crm': { requireAuth: true, roles: ['admin', 'manager', 'agent'] },
  '/marketing': { requireAuth: true, roles: ['admin', 'manager'] },
  '/appointments': { requireAuth: true, roles: ['admin', 'manager', 'agent'] },
  '/api/users': { requireAuth: true, roles: ['admin'] },
  '/api/campaigns': { requireAuth: true, roles: ['admin', 'manager'] },
  '/api/analytics': { requireAuth: true, roles: ['admin', 'manager'] },
} as const

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
] as const

// Special routes for different auth states
const ONBOARDING_ROUTE = '/onboarding'
const LOGIN_ROUTE = '/auth/login'
const DASHBOARD_ROUTE = '/dashboard'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Temporarily disable middleware in development mode to avoid HMR issues
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware disabled in development mode')
    return NextResponse.next()
  }

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/__nextjs') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') ||
    pathname.includes('__webpack_hmr') ||
    request.headers.get('purpose') === 'prefetch'
  ) {
    return NextResponse.next()
  }

  // Skip middleware for webpack HMR and RSC requests
  if (
    request.headers.get('rsc') === '1' ||
    request.headers.get('next-router-prefetch') ||
    request.url.includes('_rsc')
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token from request
  const token = EnhancedAuthService.getTokenFromRequest(request)

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  try {
    const payload = EnhancedAuthService.verifyAccessToken(token)
    
    // Check if user needs onboarding
    if (pathname !== ONBOARDING_ROUTE) {
      // We'd need to check user's onboarding status from database here
      // For now, we'll assume it's handled by the pages themselves
    }

    // Check route permissions
    const routeConfig = findRouteConfig(pathname)
    if (routeConfig && routeConfig.roles) {
      const hasAccess = routeConfig.roles.includes(payload.role)
      
      if (!hasAccess) {
        // Redirect to unauthorized page or dashboard
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-role', payload.role)
    response.headers.set('x-user-org', payload.organizationId)
    
    return response

  } catch (error) {
    // Token is invalid or expired
    console.error('Token verification failed:', error)
    
    // Try to refresh token if it's an access token expiry
    if (error instanceof Error && error.message === 'Access token expired') {
      return handleTokenRefresh(request)
    }
    
    // Clear invalid cookies and redirect to login
    const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url))
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    return response
  }
}

// Find route configuration
function findRouteConfig(pathname: string) {
  // Exact match first
  if (pathname in PROTECTED_ROUTES) {
    return PROTECTED_ROUTES[pathname as keyof typeof PROTECTED_ROUTES]
  }
  
  // Pattern match for nested routes
  for (const [route, config] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route + '/')) {
      return config
    }
  }
  
  return null
}

// Handle token refresh
function handleTokenRefresh(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value
  
  if (!refreshToken) {
    // No refresh token, redirect to login
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url))
  }

  try {
    // Verify refresh token
    EnhancedAuthService.verifyRefreshToken(refreshToken)
    
    // Redirect to refresh endpoint
    const refreshUrl = new URL('/api/auth/refresh', request.url)
    refreshUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(refreshUrl)
    
  } catch (error) {
    // Refresh token is also invalid, redirect to login
    const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url))
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    return response
  }
}

// Configure which paths to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (hot module reloading)
     * - favicon.ico (favicon file)
     * - public folder
     * - files with extensions
     */
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|public|.*\\.).*)',
  ],
}
