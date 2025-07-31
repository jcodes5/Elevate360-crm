"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreHorizontal,
  Zap,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { WorkflowTemplates } from "@/components/automation/workflow-templates"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

interface Automation {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "draft"
  trigger: string
  actions: number
  contacts: number
  completionRate: number
  channels: string[]
  createdAt: Date
  lastRun?: Date
}

// Mock data
const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Welcome Email Series",
    description: "3-part onboarding sequence for new subscribers",
    status: "active",
    trigger: "Contact Created",
    actions: 4,
    contacts: 1250,
    completionRate: 87,
    channels: ["email"],
    createdAt: new Date("2024-01-15"),
    lastRun: new Date("2024-01-28T10:30:00"),
  },
  {
    id: "2",
    name: "Abandoned Cart Recovery",
    description: "Multi-channel campaign to recover abandoned carts",
    status: "active",
    trigger: "Cart Abandoned",
    actions: 6,
    contacts: 890,
    completionRate: 65,
    channels: ["email", "sms", "whatsapp"],
    createdAt: new Date("2024-01-10"),
    lastRun: new Date("2024-01-28T14:15:00"),
  },
  {
    id: "3",
    name: "Lead Nurturing Campaign",
    description: "Score-based nurturing for potential customers",
    status: "paused",
    trigger: "Lead Score Threshold",
    actions: 8,
    contacts: 456,
    completionRate: 92,
    channels: ["email", "sms"],
    createdAt: new Date("2024-01-05"),
    lastRun: new Date("2024-01-25T09:00:00"),
  },
  {
    id: "4",
    name: "Customer Onboarding",
    description: "Complete onboarding flow for new customers",
    status: "draft",
    trigger: "Purchase Completed",
    actions: 7,
    contacts: 0,
    completionRate: 0,
    channels: ["email", "sms"],
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "5",
    name: "Re-engagement Campaign",
    description: "Win back inactive customers with special offers",
    status: "active",
    trigger: "Inactive for 30 Days",
    actions: 5,
    contacts: 234,
    completionRate: 73,
    channels: ["email", "whatsapp"],
    createdAt: new Date("2024-01-12"),
    lastRun: new Date("2024-01-27T16:45:00"),
  },
]

export default function AutomationPage() {
  const [automations, setAutomations] = useState(mockAutomations)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("workflows")

  // React Query for fetching automations
  const { data: automationsData, isLoading } = useQuery({
    queryKey: ["automations"],
    queryFn: async () => {
      // This would be your API call
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay
      return mockAutomations
    },
    initialData: mockAutomations,
  })

  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || automation.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return Mail
      case "sms":
        return MessageSquare
      case "whatsapp":
        return Phone
      default:
        return Mail
    }
  }

  const toggleAutomationStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((automation) =>
        automation.id === id
          ? { ...automation, status: automation.status === "active" ? "paused" : ("active" as any) }
          : automation,
      ),
    )
  }

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((automation) => automation.id !== id))
  }

  const handleUseTemplate = (template: any) => {
    // This would create a new automation from the template
    console.log("Using template:", template)
    // Navigate to workflow builder with template
    window.location.href = `/marketing/automation/builder?template=${template.id}`
  }

  const activeAutomations = automations.filter((a) => a.status === "active").length
  const totalContacts = automations.reduce((sum, a) => sum + a.contacts, 0)
  const avgCompletionRate =
    automations.length > 0
      ? Math.round(automations.reduce((sum, a) => sum + a.completionRate, 0) / automations.length)
      : 0

  return (
    <MainLayout
      breadcrumbs={[{ label: "Marketing", href: "/marketing" }, { label: "Automation" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/marketing/automation/builder">
              <Zap className="mr-2 h-4 w-4" />
              Workflow Builder
            </Link>
          </Button>
          <Button asChild>
            <Link href="/marketing/automation/builder">
              <Plus className="mr-2 h-4 w-4" />
              Create Automation
            </Link>
          </Button>
        </div>
      }
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing Automation</h1>
            <p className="text-muted-foreground">Create and manage automated marketing workflows</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAutomations}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalContacts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgCompletionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5%</span> from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45.2K</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18%</span> from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search automations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-80 pl-10"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Filter className="mr-2 h-4 w-4" />
                          Status: {selectedStatus === "all" ? "All" : selectedStatus}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All Status</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("active")}>Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("paused")}>Paused</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("draft")}>Draft</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAutomations.map((automation, index) => (
                    <motion.div
                      key={automation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <Badge className={getStatusColor(automation.status)}>{automation.status}</Badge>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{automation.name}</h3>
                            <div className="flex space-x-1">
                              {automation.channels.map((channel) => {
                                const Icon = getChannelIcon(channel)
                                return (
                                  <div key={channel} className="p-1 bg-gray-100 rounded">
                                    <Icon className="h-3 w-3" />
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{automation.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Trigger: {automation.trigger}</span>
                            <span>•</span>
                            <span>{automation.actions} actions</span>
                            <span>•</span>
                            <span>{automation.contacts.toLocaleString()} contacts</span>
                            <span>•</span>
                            <span>{automation.completionRate}% completion</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toggleAutomationStatus(automation.id)}>
                          {automation.status === "active" ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/marketing/automation/builder?id=${automation.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Workflow
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteAutomation(automation.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <WorkflowTemplates onUseTemplate={handleUseTemplate} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  )
}
