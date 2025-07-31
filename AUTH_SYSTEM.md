# Enhanced Authentication System

This document describes the comprehensive authentication and authorization system implemented for Elevate360 CRM.

## Overview

The authentication system provides:
- **Secure password hashing** with bcrypt (12 salt rounds)
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (RBAC)
- **Rate limiting** for login attempts
- **Secure HTTP-only cookies**
- **Token refresh mechanism**
- **Route-level protection**
- **API endpoint security**

## Components

### 1. Enhanced Auth Service (`lib/auth-enhanced.ts`)

Core authentication service providing:

#### Password Security
- Strong bcrypt hashing (12 salt rounds)
- Password strength validation
- Secure comparison methods

#### Token Management
- **Access Tokens**: Short-lived (15 minutes), used for API requests
- **Refresh Tokens**: Long-lived (7 days), used to refresh access tokens
- JWT with proper issuer/audience verification
- Token payload includes: userId, email, role, organizationId

#### Security Features
- Rate limiting for authentication attempts
- HTTP-only secure cookies
- Token expiry and refresh handling

### 2. Middleware (`middleware.ts`)

Route-level authentication and authorization:

#### Features
- Automatic token verification
- Role-based route protection
- Token refresh handling
- Redirect management for unauthorized access

#### Protected Routes
```typescript
const PROTECTED_ROUTES = {
  '/dashboard': { requireAuth: true, roles: ['admin', 'manager', 'agent'] },
  '/analytics': { requireAuth: true, roles: ['admin', 'manager'] },
  '/settings': { requireAuth: true, roles: ['admin'] },
  // ... more routes
}
```

### 3. API Routes

#### Authentication Endpoints

**Enhanced Login** (`/api/auth/login-enhanced`)
```typescript
POST /api/auth/login-enhanced
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "rememberMe": true
}
```

**Enhanced Register** (`/api/auth/register-enhanced`)
```typescript
POST /api/auth/register-enhanced
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "agent",
  "organizationName": "My Company"
}
```

**Token Refresh** (`/api/auth/refresh`)
```typescript
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Logout** (`/api/auth/logout`)
```typescript
POST /api/auth/logout
```

**User Verification** (`/api/auth/verify`)
```typescript
GET /api/auth/verify
Authorization: Bearer <access_token>
```

#### Protected API Example

**Admin Users Management** (`/api/admin/users`)
```typescript
GET /api/admin/users?page=1&limit=10&role=agent
Authorization: Bearer <access_token>
```

## Role-Based Access Control (RBAC)

### Role Hierarchy
```typescript
const ROLE_HIERARCHY = {
  admin: 3,    // Highest privileges
  manager: 2,  // Medium privileges  
  agent: 1,    // Basic privileges
}
```

### Permission System
```typescript
const permissions = {
  users: {
    create: ['admin'],
    read: ['admin', 'manager'],
    update: ['admin'],
    delete: ['admin']
  },
  contacts: {
    create: ['admin', 'manager', 'agent'],
    read: ['admin', 'manager', 'agent'],
    update: ['admin', 'manager', 'agent'],
    delete: ['admin', 'manager']
  },
  // ... more resources
}
```

## Security Features

### 1. Password Security
- **Minimum Requirements**: 8+ characters, uppercase, lowercase, number, special character
- **Bcrypt Hashing**: 12 salt rounds for strong security
- **No plain text storage**: Passwords always hashed before storage

### 2. JWT Security
- **Short-lived access tokens**: 15 minutes to minimize exposure
- **Refresh token rotation**: New tokens on each refresh
- **Proper verification**: Issuer and audience validation
- **Secure storage**: HTTP-only cookies for web clients

### 3. Rate Limiting
- **Login attempts**: Max 5 attempts per 15 minutes per IP
- **Registration**: Separate rate limiting for registrations
- **Automatic reset**: Rate limits reset on successful authentication

### 4. Cookie Security
```typescript
{
  httpOnly: true,              // Prevent XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',          // CSRF protection
  maxAge: 15 * 60,            // 15 minutes for access token
  path: '/'
}
```

## Usage Examples

### Frontend Authentication

#### Login
```typescript
const response = await fetch('/api/auth/login-enhanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    rememberMe: true
  })
})

const data = await response.json()
if (data.success) {
  // Store tokens in localStorage or let cookies handle it
  localStorage.setItem('accessToken', data.data.accessToken)
}
```

#### API Requests with Authentication
```typescript
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```

#### Token Refresh
```typescript
async function refreshToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Include cookies
  })
  
  if (response.ok) {
    const data = await response.json()
    localStorage.setItem('accessToken', data.data.accessToken)
    return data.data.accessToken
  }
  
  // Redirect to login if refresh fails
  window.location.href = '/auth/login'
}
```

### Backend Route Protection

```typescript
// In API route
import { EnhancedAuthService } from '@/lib/auth-enhanced'

export async function GET(request: NextRequest) {
  try {
    // Get and verify token
    const token = EnhancedAuthService.getTokenFromRequest(request)
    const payload = EnhancedAuthService.verifyAccessToken(token)
    
    // Check permissions
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }
    
    // Process request...
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

## Error Handling

### Common Error Responses

**Invalid Credentials**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Token Expired**
```json
{
  "success": false,
  "message": "Access token expired",
  "code": "TOKEN_EXPIRED"
}
```

**Rate Limited**
```json
{
  "success": false,
  "message": "Too many login attempts. Try again in 900 seconds.",
  "retryAfter": 900
}
```

**Insufficient Permissions**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

## Testing

### Test Accounts
The system creates test accounts for development:

```
Admin: test@example.com / password123
Manager: manager@example.com / password123  
Agent: agent@example.com / password123
```

### Testing Authentication Flow

1. **Login Test**
```bash
curl -X POST http://localhost:3000/api/auth/login-enhanced \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **Protected Route Test**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/auth/verify
```

3. **Admin Route Test**
```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/admin/users
```

## Best Practices

### Frontend
1. **Store tokens securely**: Use httpOnly cookies when possible
2. **Handle token expiry**: Implement automatic refresh
3. **Clear tokens on logout**: Remove from storage and clear cookies
4. **Validate on client**: Check user roles before showing UI elements

### Backend
1. **Always verify tokens**: Never trust client-side role checks
2. **Use HTTPS in production**: Protect token transmission
3. **Implement proper CORS**: Restrict cross-origin requests
4. **Log security events**: Monitor authentication failures

### Security
1. **Rotate secrets regularly**: Update JWT secrets periodically
2. **Monitor failed attempts**: Alert on suspicious activity
3. **Use strong passwords**: Enforce password policies
4. **Keep dependencies updated**: Regularly update security packages

## Deployment Considerations

### Environment Variables
```env
JWT_SECRET=your-very-secure-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-very-secure-refresh-key-min-32-chars
NODE_ENV=production
```

### Production Security
- Enable HTTPS
- Set secure cookie flags
- Configure proper CORS
- Use environment variables for secrets
- Set up monitoring and alerting
- Regular security audits

## Migration from Basic Auth

If migrating from the basic auth system:

1. Update frontend to use enhanced endpoints
2. Handle new token structure
3. Implement token refresh logic
4. Update role checking logic
5. Test all protected routes

The enhanced system is backward compatible with proper migration steps.
