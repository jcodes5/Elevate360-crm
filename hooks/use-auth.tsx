"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@/types"
import { apiClient } from "@/lib/api-client"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  needsOnboarding: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth token on mount
    const storedToken = localStorage.getItem("authToken")
    const storedUser = localStorage.getItem("authUser")

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        apiClient.setToken(storedToken)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("authToken")
        localStorage.removeItem("authUser")
      }
    }

    setIsLoading(false)
  }, [])

  const login = (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem("authToken", authToken)
    localStorage.setItem("authUser", JSON.stringify(userData))
    apiClient.setToken(authToken)
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("authToken")
      localStorage.removeItem("authUser")
      apiClient.clearToken()
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
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
