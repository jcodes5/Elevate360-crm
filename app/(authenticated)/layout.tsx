"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/components/layout/header"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { needsOnboarding } = useAuth()
  const router = useRouter()

  // Redirect to onboarding if needed
  useEffect(() => {
    if (needsOnboarding) {
      router.push('/onboarding')
    }
  }, [needsOnboarding, router])

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}