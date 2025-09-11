# Authentication Persistence Fix

## Issue
Inconsistent authentication services causing token verification failures:
- Login API uses EnhancedAuthService (no sessionId)
- Verify API uses ProductionAuthService (expects sessionId)
- Middleware uses EnhancedAuthService

## Tasks
- [x] Update login API to use ProductionAuthService
- [x] Update middleware to use ProductionAuthService
- [x] Update refresh API to use ProductionAuthService
- [x] Test authentication flow
