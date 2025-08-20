"use client"

import { useAuth } from "@/hooks/use-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProtectedRoute>{children}</ProtectedRoute>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}