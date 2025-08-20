import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "../globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "../providers"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Elevate360 CRM - Authentication",
  description: "Login to your Elevate360 CRM account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          <QueryProvider>
            <AuthProvider>
              <ThemeProvider 
                attribute="class" 
                defaultTheme="system" 
                enableSystem 
                disableTransitionOnChange
              >
                <div className="min-h-screen flex items-center justify-center">
                  {children}
                </div>
                <Toaster />
              </ThemeProvider>
            </AuthProvider>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  )
}