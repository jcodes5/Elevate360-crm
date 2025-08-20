"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  )
}