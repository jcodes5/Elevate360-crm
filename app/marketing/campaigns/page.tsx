"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Mail, MessageSquare, Phone, Play, Pause, BarChart3 } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { MainLayout } from "@/components/layout/main-layout"
import type { Campaign } from "@/types"

// Mock data
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale 2024",
    type: "email",
    status: "active",
    subject: "Don't Miss Our Biggest Sale of the Year!",
    content: "Get up to 50% off on all our services...",
    targetAudience: ["customers", "prospects"],
    scheduledAt: new Date("2024-01-25T10:00:00"),
    sentAt: new Date("2024-01-25T10:00:00"),
    organizationId: "org-1",
    metrics: {
      sent: 1250,
      delivered: 1200,
      opened: 480,
      clicked: 96,
      replied: 12,
      bounced: 50,
      unsubscribed: 8,
    },
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "New Product Launch SMS",
    type: "sms",
    status: "completed",
    content: "🚀 Exciting news! Our new service is now live. Get 20% off with code NEW20. Reply STOP to opt out.",
    targetAudience: ["vip-customers"],
    scheduledAt: new Date("2024-01-22T14:00:00"),
    sentAt: new Date("2024-01-22T14:00:00"),
    organizationId: "org-1",
    metrics: {
      sent: 850,
      delivered: 820,
      opened: 0, // SMS doesn't track opens
      clicked: 45,
      replied: 23,
      bounced: 30,
      unsubscribed: 5,
    },
    createdAt: new Date("2024-01-18"),
  },
  {
    id: "3",
    name: "WhatsApp Follow-up Campaign",
    type: "whatsapp",
    status: "scheduled",
    content: "Hi {{first_name}}, thank you for your interest in our services. Would you like to schedule a call?",
    targetAudience: ["leads"],
    scheduledAt: new Date("2024-01-28T09:00:00"),
    organizationId: "org-1",
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
    },
    createdAt: new Date("2024-01-26"),
  },
]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || campaign.type === selectedType
    const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <MessageSquare className="h-4 w-4" />
      case "whatsapp":
        return <Phone className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "paused":
        return "bg-gray-100 text-gray-800"
      case "draft":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateOpenRate = (metrics: any) => {
    if (metrics.sent === 0) return 0
    return ((metrics.opened / metrics.sent) * 100).toFixed(1)
  }

  const calculateClickRate = (metrics: any) => {
    if (metrics.sent === 0) return 0
    return ((metrics.clicked / metrics.sent) * 100).toFixed(1)
  }

  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.metrics.sent, 0)
  const totalOpened = campaigns.reduce((sum, campaign) => sum + campaign.metrics.opened, 0)
  const totalClicked = campaigns.reduce((sum, campaign) => sum + campaign.metrics.clicked, 0)
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0"

  return (
    <MainLayout
      breadcrumbs={[{ label: "Marketing", href: "/marketing" }, { label: "Campaigns" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
            <p className="text-muted-foreground">Create and manage your marketing campaigns</p>
          </div>
        </div>

        {/* Rest of the campaigns content remains the same */}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgOpenRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicked}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80 pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Type: {selectedType === "all" ? "All" : selectedType}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedType("all")}>All Types</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedType("email")}>Email</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedType("sms")}>SMS</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedType("whatsapp")}>WhatsApp</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Status: {selectedStatus === "all" ? "All" : selectedStatus}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("active")}>Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>Completed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("scheduled")}>Scheduled</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("paused")}>Paused</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("draft")}>Draft</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-500">
                          {campaign.subject || campaign.content.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(campaign.type)}
                        <span className="capitalize">{campaign.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{campaign.metrics.sent.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{calculateOpenRate(campaign.metrics)}%</span>
                        <Progress value={Number.parseFloat(calculateOpenRate(campaign.metrics))} className="w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{calculateClickRate(campaign.metrics)}%</span>
                        <Progress value={Number.parseFloat(calculateClickRate(campaign.metrics))} className="w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {campaign.scheduledAt ? campaign.scheduledAt.toLocaleDateString() : "Not scheduled"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {campaign.status === "active" ? (
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete Campaign</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
