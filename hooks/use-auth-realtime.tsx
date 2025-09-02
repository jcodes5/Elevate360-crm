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

// Real-time session monitoring
class SessionMonitor {
  private checkInterval: NodeJS.Timeout | null = null
  private activityListeners: Set<() => void> = new Set()
  private lastActivity = Date.now()

  start(onSessionExpired: () => void, onActivity: () => void) {
    // Monitor session every 30 seconds
    this.checkInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          credentials: "include",
        })
        
        if (!response.ok) {
          onSessionExpired()
        }
      } catch (error) {
        console.warn("Session check failed:", error)
      }
    }, 30000)

    // Monitor user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      const now = Date.now()
      if (now - this.lastActivity > 60000) { // Only update every minute
        this.lastActivity = now
        onActivity()
      }
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    this.cleanup = () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }

  private cleanup?: () => void

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    if (this.cleanup) {
      this.cleanup()
    }
  }

  getLastActivity() {
    return this.lastActivity
  }
}

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
  const [sessionMonitor] = useState(() => new SessionMonitor())
  const router = useRouter()

  // Initialize session on mount
  useEffect(() => {
    setMounted(true)
    initializeSession()
  }, [])

  // Start session monitoring when authenticated
  useEffect(() => {
    if (session.isAuthenticated && mounted) {
      sessionMonitor.start(handleSessionExpired, handleActivity)
    } else {
      sessionMonitor.stop()
    }

    return () => sessionMonitor.stop()
  }, [session.isAuthenticated, mounted])

  const initializeSession = async () => {
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
            needsOnboarding: !data.data.user.isOnboardingCompleted,
            activeSessions: data.data.activeSessions || 1,
            isLoading: false,
          }))
        } else {
          setSession(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        setSession(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error("Session initialization failed:", error)
      setSession(prev => ({ ...prev, isLoading: false }))
    }
  }

  const login = useCallback((user: User, tokens: any, sessionInfo: any) => {
    setSession(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      sessionId: tokens.sessionId,
      needsOnboarding: !user.isOnboardingCompleted,
      lastActivity: Date.now(),
      activeSessions: 1,
      isLoading: false,
    }))

    // Store user data in sessionStorage for persistence across tabs
    sessionStorage.setItem("authUser", JSON.stringify(user))
    sessionStorage.setItem("sessionId", tokens.sessionId)
  }, [])

  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.warn("Logout request failed, clearing local session anyway")
      }
    } catch (error) {
      console.error("Logout error:", error)
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
      
      sessionStorage.removeItem("authUser")
      sessionStorage.removeItem("sessionId")
      sessionMonitor.stop()
      
      router.push("/auth/login")
    }
  }, [router])

  const logoutAllSessions = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout-all", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        await logout()
      }
    } catch (error) {
      console.error("Logout all sessions error:", error)
      await logout()
    }
  }, [logout])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSession(prev => ({
            ...prev,
            lastActivity: Date.now(),
          }))
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error("Token refresh failed:", error)
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
      console.error("Session check failed:", error)
      return false
    }
  }, [])

  const handleSessionExpired = useCallback(() => {
    console.warn("Session expired, redirecting to login")
    logout()
  }, [logout])

  const handleActivity = useCallback(() => {
    updateActivity()
  }, [updateActivity])

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
    isOnline: navigator.onLine,
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
