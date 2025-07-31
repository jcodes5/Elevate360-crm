"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/components/layout/header"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, needsOnboarding } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else if (needsOnboarding) {
      router.push('/onboarding')
    }
  }, [isAuthenticated, needsOnboarding, router])

  if (!isAuthenticated) {
    return null // or a loading spinner
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
