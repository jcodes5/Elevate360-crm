"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { PermissionService } from "@/lib/permissions"
import type { Resource, Action } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredResource?: Resource
  requiredAction?: Action
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredResource,
  requiredAction = "read",
  fallbackPath = "/auth/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath)
        return
      }

      if (requiredResource && user) {
        const hasPermission = PermissionService.hasPermission(user.role, requiredResource, requiredAction)

        if (!hasPermission) {
          router.push("/dashboard") // Redirect to dashboard if no permission
          return
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requiredResource, requiredAction, router, fallbackPath])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredResource && user && !PermissionService.hasPermission(user.role, requiredResource, requiredAction)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this resource.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
