"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@/types"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  needsOnboarding: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check for existing auth token on mount
    // For now, we'll rely on the API client to handle token management
    // In a real implementation, we would check for HTTP-only cookies on the server
    const storedUser = localStorage.getItem("authUser")

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        // Token is managed by HTTP-only cookies, so we don't need to store it in localStorage
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("authUser")
      }
    }

    setIsLoading(false)
  }, [mounted])

  const login = (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem("authUser", JSON.stringify(userData))
    // Token is managed by HTTP-only cookies, so we don't need to store it in localStorage
    apiClient.setToken(authToken) // Still set it in the API client for client-side requests
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("authUser")
      apiClient.clearToken()
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    isLoading: isLoading || !mounted,
    isAuthenticated: mounted ? !!user : false,
    needsOnboarding: mounted ? !!user && !user.isOnboardingCompleted : false,
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
