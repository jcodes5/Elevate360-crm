"use client"

import type React from "react"

interface MainLayoutProps {
  children: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

export function MainLayout({ children, breadcrumbs, actions }: MainLayoutProps) {
  return (
    <>{children}</>
  )
}