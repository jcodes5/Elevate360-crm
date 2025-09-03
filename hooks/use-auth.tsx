"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { User } from "@/types"
import { useRouter } from "next/navigation"

interface AuthSession {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionId: string | null
  lastActivity: number
  needsOnboarding: boolean
  activeSessions: number
}

interface AuthContextType extends AuthSession {
  login: (user: User, tokens: any, sessionInfo: any) => void
  logout: () => Promise<void>
  logoutAllSessions: () => Promise<void>
  refreshToken: () => Promise<boolean>
  updateActivity: () => void
  checkSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionId: null,
    lastActivity: Date.now(),
    needsOnboarding: false,
    activeSessions: 0,
  })
  
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Initialize session on mount
  useEffect(() => {
    setMounted(true)
    initializeSession()
  }, [])

  const initializeSession = async () => {
    try {
      console.log("🔄 Initializing session...")
      
      // Try to verify session with server
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Session verification successful:", data)
        
        if (data.success && data.data.user) {
          setSession(prev => ({
            ...prev,
            user: data.data.user,
            isAuthenticated: true,
            sessionId: data.data.sessionId,
            needsOnboarding: !data.data.user.isOnboardingCompleted,
            activeSessions: data.data.activeSessions || 1,
            isLoading: false,
          }))
        } else {
          console.log("❌ Session verification failed:", data)
          setSession(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        console.log("❌ Session verification request failed:", response.status)
        // Even if verification fails, we're done loading
        setSession(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error("❌ Session initialization failed:", error)
      // Even if initialization fails, we're done loading
      setSession(prev => ({ ...prev, isLoading: false }))
    }
  }

  const login = useCallback((user: User, tokens: any, sessionInfo: any) => {
    console.log("✅ Auth context - login called with user:", user.id)
    
    setSession(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      sessionId: tokens.sessionId || 'session_' + Date.now(),
      needsOnboarding: !user.isOnboardingCompleted,
      lastActivity: Date.now(),
      activeSessions: 1,
      isLoading: false,
    }))

    // Store user data in sessionStorage for persistence across tabs
    try {
      sessionStorage.setItem("authUser", JSON.stringify(user))
      console.log("✅ User data stored in sessionStorage")
    } catch (error) {
      console.warn("⚠️ Failed to store user in sessionStorage:", error)
    }
  }, [])

  const logout = useCallback(async () => {
    console.log("🚪 Auth context - logout called")
    
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.warn("⚠️ Logout request failed, clearing local session anyway")
      } else {
        console.log("✅ Logout request successful")
      }
    } catch (error) {
      console.error("❌ Logout error:", error)
    } finally {
      // Always clear local session
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionId: null,
        lastActivity: Date.now(),
        needsOnboarding: false,
        activeSessions: 0,
      })
      
      // Clear storage
      try {
        sessionStorage.removeItem("authUser")
        localStorage.removeItem("authUser")
      } catch (error) {
        console.warn("⚠️ Failed to clear storage:", error)
      }
      
      // Redirect to login
      router.push("/auth/login")
    }
  }, [router])

  const logoutAllSessions = useCallback(async () => {
    console.log("🚪 Auth context - logout all sessions called")
    
    try {
      const response = await fetch("/api/auth/logout-all", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        console.log("✅ Logout all sessions successful")
        await logout()
      }
    } catch (error) {
      console.error("❌ Logout all sessions error:", error)
      await logout()
    }
  }, [logout])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔄 Refreshing token...")
      
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Token refresh successful")
        
        if (data.success) {
          setSession(prev => ({
            ...prev,
            lastActivity: Date.now(),
          }))
          return true
        }
      } else {
        console.log("❌ Token refresh failed:", response.status)
      }
      
      return false
    } catch (error) {
      console.error("❌ Token refresh error:", error)
      return false
    }
  }, [])

  const updateActivity = useCallback(async () => {
    setSession(prev => ({
      ...prev,
      lastActivity: Date.now(),
    }))

    // Optionally notify server of activity
    try {
      await fetch("/api/auth/activity", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      // Silent fail for activity updates
    }
  }, [])

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.user) {
          setSession(prev => ({
            ...prev,
            user: data.data.user,
            isAuthenticated: true,
            sessionId: data.data.sessionId,
            activeSessions: data.data.activeSessions || prev.activeSessions,
            lastActivity: Date.now(),
          }))
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error("❌ Session check failed:", error)
      return false
    }
  }, [])

  // Handle tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session.isAuthenticated) {
        checkSession()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [session.isAuthenticated, checkSession])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      if (session.isAuthenticated) {
        checkSession()
      }
    }

    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [session.isAuthenticated, checkSession])

  const value: AuthContextType = {
    ...session,
    login,
    logout,
    logoutAllSessions,
    refreshToken,
    updateActivity,
    checkSession,
  }

  // Don't render children until we've checked for existing session
  if (!mounted) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook for session information
export function useSession() {
  const { user, isAuthenticated, isLoading, sessionId, lastActivity, activeSessions } = useAuth()
  
  return {
    user,
    isAuthenticated,
    isLoading,
    sessionId,
    lastActivity: new Date(lastActivity),
    activeSessions,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  }
}

// Hook for real-time user activity monitoring
export function useActivityMonitor() {
  const { updateActivity, lastActivity } = useAuth()
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const checkActivity = () => {
      const now = Date.now()
      const inactive = now - lastActivity > 5 * 60 * 1000 // 5 minutes
      setIsActive(!inactive)
    }

    const interval = setInterval(checkActivity, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [lastActivity])

  return {
    isActive,
    lastActivity: new Date(lastActivity),
    updateActivity,
  }
}
