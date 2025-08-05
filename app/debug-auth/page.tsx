"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"

export default function DebugAuthPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    console.log("Auth Debug Info:", { user, token, isAuthenticated, isLoading })
  }, [user, token, isAuthenticated, isLoading])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user) : "null"}</p>
        <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : "null"}</p>
        <p><strong>LocalStorage authToken:</strong> {typeof window !== "undefined" ? localStorage.getItem("authToken") : "Not available"}</p>
        <p><strong>LocalStorage authUser:</strong> {typeof window !== "undefined" ? localStorage.getItem("authUser") : "Not available"}</p>
      </div>
    </div>
  )
}