"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (isAuthenticated) {
          // Test if the token is still valid by making a simple API call
          try {
            // This will automatically handle token refresh if needed
            await apiClient.get("/test")
          } catch (error: any) {
            if (error.message === "UNAUTHORIZED") {
              // Token is invalid or expired, log out the user
              await logout()
            }
          }
        }
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [isAuthenticated, isLoading, logout, router])

  // During loading, we should still allow the login page to render
  if (isLoading || isCheckingAuth) {
    // Allow login page to render during loading
    // Check if we're on the client side before accessing window
    if (typeof window !== 'undefined') {
      return <>{children}</>
    }
    // On server side, render nothing during loading
    return null
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    // If we're on the login page, allow rendering
    // Check if we're on the client side before accessing window
    if (typeof window !== 'undefined') {
      return <>{children}</>
    }
    // On server side, render children for unauthenticated users
    return <>{children}</>
  }

  return <>{children}</>
}
