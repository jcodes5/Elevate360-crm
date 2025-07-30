"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Mail,
  MessageSquare,
  Phone,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
  GitBranch,
  CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  title: string
  href?: string
  icon: any
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "CRM",
    icon: Users,
    children: [
      { title: "Contacts", href: "/crm/contacts", icon: Users },
      { title: "Deals", href: "/crm/deals", icon: DollarSign },
      { title: "Pipelines", href: "/crm/pipelines", icon: GitBranch },
      { title: "Tasks", href: "/crm/tasks", icon: CheckSquare },
    ],
  },
  {
    title: "Marketing",
    icon: Target,
    children: [
      { title: "Campaigns", href: "/marketing/campaigns", icon: Mail },
      { title: "Email Marketing", href: "/marketing/email", icon: Mail },
      { title: "SMS Marketing", href: "/marketing/sms", icon: MessageSquare },
      { title: "WhatsApp", href: "/marketing/whatsapp", icon: Phone },
      { title: "Automation", href: "/marketing/automation", icon: Zap },
      { title: "Workflow Builder", href: "/marketing/automation/builder", icon: Zap },
    ],
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarItemProps {
  item: NavItem
  level?: number
}

function SidebarItem({ item, level = 0 }: SidebarItemProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(item.children?.some((child) => pathname.startsWith(child.href || "")) || false)

  const isActive = item.href ? pathname === item.href : false
  const hasActiveChild = item.children?.some((child) => pathname.startsWith(child.href || ""))

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start font-normal",
              level > 0 && "pl-8",
              (isActive || hasActiveChild) && "bg-accent text-accent-foreground",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
            {isOpen ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            {item.children.map((child) => (
              <SidebarItem key={child.title} item={child} level={level + 1} />
            ))}
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start font-normal",
        level > 0 && "pl-8",
        isActive && "bg-accent text-accent-foreground",
      )}
      asChild
    >
      <Link href={item.href || "#"}>
        <item.icon className="mr-2 h-4 w-4" />
        {item.title}
      </Link>
    </Button>
  )
}

export function Sidebar() {
  return (
    <motion.div initial={{ x: -250 }} animate={{ x: 0 }} className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-bold">Elevate360</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <SidebarItem key={item.title} item={item} />
        ))}
      </nav>
    </motion.div>
  )
}
