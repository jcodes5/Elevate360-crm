"use client"

import type React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Header } from "@/components/layout/header"

interface MainLayoutProps {
  children: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

export function MainLayout({ children, breadcrumbs, actions }: MainLayoutProps) {
  return (
    <SidebarProvider>
    <SidebarInset>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
    </SidebarInset>
    </SidebarProvider>
  )
}
