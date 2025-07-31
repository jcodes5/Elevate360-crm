"use client"

import type * as React from "react"
import { LayoutDashboard, Users, DollarSign, Calendar, BarChart3, Settings, Target, Building2 } from "lucide-react"

import { NavMain } from "../nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarProvider } from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Admin User",
    email: "admin@elevate360.ng",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  teams: [
    {
      name: "Elevate360 CRM",
      logo: Building2,
      plan: "Enterprise",
    },
    {
      name: "Marketing Team",
      logo: Target,
      plan: "Pro",
    },
    {
      name: "Sales Team",
      logo: DollarSign,
      plan: "Pro",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "CRM",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Contacts",
          url: "/crm/contacts",
        },
        {
          title: "Deals",
          url: "/crm/deals",
        },
        {
          title: "Pipelines",
          url: "/crm/pipelines",
        },
        {
          title: "Tasks",
          url: "/crm/tasks",
        },
      ],
    },
    {
      title: "Marketing",
      url: "#",
      icon: Target,
      items: [
        {
          title: "Campaigns",
          url: "/marketing/campaigns",
        },
        {
          title: "Email Marketing",
          url: "/marketing/email",
        },
        {
          title: "SMS Marketing",
          url: "/marketing/sms",
        },
        {
          title: "WhatsApp",
          url: "/marketing/whatsapp",
        },
        {
          title: "Automation",
          url: "/marketing/automation",
        },
        {
          title: "Workflow Builder",
          url: "/marketing/automation/builder",
        },
      ],
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: Calendar,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  projects: [
    {
      name: "Lead Generation Campaign",
      url: "#",
      icon: Target,
    },
    {
      name: "Customer Onboarding",
      url: "#",
      icon: Users,
    },
    {
      name: "Sales Pipeline Review",
      url: "#",
      icon: DollarSign,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
