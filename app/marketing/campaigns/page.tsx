"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Send, Pause, Play, Eye, BarChart3, Users, Mail, MessageSquare, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Campaign } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Mock campaigns data
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Welcome Email Series",
    type: "email",
    status: "sent",
    subject: "Welcome to Elevate360 CRM!",
    content: "Thank you for joining us. Here's how to get started...",
    targetAudience: ["new-signups", "prospects"],
    scheduledAt: new Date("2024-01-25T09:00:00"),
    sentAt: new Date("2024-01-25T09:05:00"),
    organizationId: "org-1",
    createdBy: "admin",
    metrics: {
      sent: 1250,
      delivered: 1235,
      opened: 556,
      clicked: 78,
      replied: 12,
      bounced: 15,
      unsubscribed: 3,
      conversions: 8
    },
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "2",
    name: "Product Feature Announcement",
    type: "email",
    status: "scheduled",
    subject: "New Features: Enhanced Analytics Dashboard",
    content: "We're excited to announce new features that will help you...",
    targetAudience: ["customers", "active-users"],
    scheduledAt: new Date("2024-02-01T14:00:00"),
    organizationId: "org-1",
    createdBy: "marketing-manager",
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      conversions: 0
    },
    createdAt: new Date("2024-01-28"),
    updatedAt: new Date("2024-01-28"),
  },
  {
    id: "3",
    name: "WhatsApp Promo Campaign",
    type: "whatsapp",
    status: "sent",
    content: "🎉 Special offer just for you! Get 20% off your next purchase. Use code SAVE20. Valid until end of month.",
    targetAudience: ["high-value-customers"],
    scheduledAt: new Date("2024-01-26T11:00:00"),
    sentAt: new Date("2024-01-26T11:02:00"),
    organizationId: "org-1",
    createdBy: "sales-manager",
    metrics: {
      sent: 450,
      delivered: 448,
      opened: 389,
      clicked: 45,
      replied: 23,
      bounced: 2,
      unsubscribed: 1,
      conversions: 12
    },
    createdAt: new Date("2024-01-24"),
    updatedAt: new Date("2024-01-26"),
  },
  {
    id: "4",
    name: "SMS Payment Reminder",
    type: "sms",
    status: "sending",
    content: "Hi! Your invoice #12345 is due tomorrow. Pay now: https://pay.elevate360.ng/12345",
    targetAudience: ["overdue-customers"],
    scheduledAt: new Date("2024-01-30T08:00:00"),
    organizationId: "org-1",
    createdBy: "admin",
    metrics: {
      sent: 89,
      delivered: 87,
      opened: 65,
      clicked: 23,
      replied: 5,
      bounced: 2,
      unsubscribed: 0,
      conversions: 18
    },
    createdAt: new Date("2024-01-29"),
    updatedAt: new Date("2024-01-30"),
  },
  {
    id: "5",
    name: "Monthly Newsletter",
    type: "email",
    status: "draft",
    subject: "February 2024 Newsletter - Industry Insights",
    content: "Dear subscriber, here are the latest updates from our industry...",
    targetAudience: ["newsletter-subscribers"],
    organizationId: "org-1",
    createdBy: "content-manager",
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      conversions: 0
    },
    createdAt: new Date("2024-01-29"),
    updatedAt: new Date("2024-01-30"),
  }
]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus
    const matchesType = selectedType === "all" || campaign.type === selectedType
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && ["sending", "scheduled"].includes(campaign.status)) ||
                      (activeTab === "sent" && campaign.status === "sent") ||
                      (activeTab === "draft" && campaign.status === "draft")
    
    return matchesSearch && matchesStatus && matchesType && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "sending":
        return "bg-blue-100 text-blue-800" 
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "paused":
        return "bg-orange-100 text-orange-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail
      case "sms":
        return MessageSquare
      case "whatsapp":
        return MessageSquare
      default:
        return Mail
    }
  }

  const getTotalMetrics = () => {
    return campaigns.reduce((totals, campaign) => ({
      sent: totals.sent + campaign.metrics.sent,
      delivered: totals.delivered + campaign.metrics.delivered,
      opened: totals.opened + campaign.metrics.opened,
      clicked: totals.clicked + campaign.metrics.clicked,
      conversions: totals.conversions + campaign.metrics.conversions
    }), { sent: 0, delivered: 0, opened: 0, clicked: 0, conversions: 0 })
  }

  const totalMetrics = getTotalMetrics()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const calculateOpenRate = (opened: number, delivered: number) => {
    return delivered > 0 ? Math.round((opened / delivered) * 100) : 0
  }

  const calculateClickRate = (clicked: number, delivered: number) => {
    return delivered > 0 ? Math.round((clicked / delivered) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your marketing campaigns</p>
        </div>
        <Button onClick={() => setShowCreateCampaign(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === "sent").length} sent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.sent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.delivered.toLocaleString()} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateOpenRate(totalMetrics.opened, totalMetrics.delivered)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.opened.toLocaleString()} opens
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateClickRate(totalMetrics.clicked, totalMetrics.delivered)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.clicked.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalMetrics.conversions}</div>
            <p className="text-xs text-muted-foreground">Total conversions</p>
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
                    Status: {selectedStatus === "all" ? "All" : selectedStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("draft")}>Draft</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("scheduled")}>Scheduled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("sending")}>Sending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("sent")}>Sent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("paused")}>Paused</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filteredCampaigns.map((campaign) => {
                const TypeIcon = getTypeIcon(campaign.type)
                return (
                  <Card key={campaign.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-medium">{campaign.name}</h3>
                            {campaign.subject && (
                              <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <span className="capitalize">{campaign.type}</span>
                            <div className="flex items-center">
                              <Users className="mr-1 h-3 w-3" />
                              {campaign.targetAudience.length} audience{campaign.targetAudience.length !== 1 ? 's' : ''}
                            </div>
                            {(campaign.scheduledAt || campaign.sentAt) && (
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {campaign.sentAt ? 
                                  `Sent: ${formatDate(campaign.sentAt)}` : 
                                  `Scheduled: ${formatDate(campaign.scheduledAt!)}`
                                }
                              </div>
                            )}
                          </div>
                          {campaign.metrics.sent > 0 && (
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-lg font-semibold">{campaign.metrics.sent.toLocaleString()}</div>
                                <div className="text-muted-foreground">Sent</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-blue-600">
                                  {calculateOpenRate(campaign.metrics.opened, campaign.metrics.delivered)}%
                                </div>
                                <div className="text-muted-foreground">Open Rate</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-green-600">
                                  {calculateClickRate(campaign.metrics.clicked, campaign.metrics.delivered)}%
                                </div>
                                <div className="text-muted-foreground">Click Rate</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-purple-600">
                                  {campaign.metrics.conversions}
                                </div>
                                <div className="text-muted-foreground">Conversions</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {campaign.status === "draft" && (
                          <Button size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Send
                          </Button>
                        )}
                        {campaign.status === "scheduled" && (
                          <Button size="sm" variant="outline">
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </Button>
                        )}
                        {campaign.metrics.sent > 0 && (
                          <Button size="sm" variant="outline">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analytics
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                )
              })}
              {filteredCampaigns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns found for the selected filters.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new marketing campaign to engage with your audience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="grid gap-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input id="campaignName" placeholder="Enter campaign name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaignType">Campaign Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject Line (Email only)</Label>
              <Input id="subject" placeholder="Enter email subject" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea 
                id="content" 
                placeholder="Enter your message content..." 
                className="min-h-[120px]" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-contacts">All Contacts</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="prospects">Prospects</SelectItem>
                  <SelectItem value="newsletter-subscribers">Newsletter Subscribers</SelectItem>
                  <SelectItem value="high-value-customers">High Value Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scheduleDate">Schedule Date (Optional)</Label>
                <Input id="scheduleDate" type="datetime-local" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select defaultValue="draft">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    <SelectItem value="sending">Send Immediately</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCampaign(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Campaign Created",
                description: "Your campaign has been created successfully."
              })
              setShowCreateCampaign(false)
            }}>
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
