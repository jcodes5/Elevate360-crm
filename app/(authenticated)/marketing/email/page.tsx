"use client"

import { useState } from "react"
import { Plus, Mail, Send, Eye, Edit, Trash2, BarChart3, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const mockCampaigns = [
  {
    id: "1",
    name: "Summer Sale 2024",
    subject: "Don't Miss Our Biggest Sale of the Year!",
    status: "sent",
    recipients: 1250,
    delivered: 1200,
    opened: 480,
    clicked: 96,
    unsubscribed: 8,
    bounced: 50,
    sentAt: new Date("2024-01-25T10:00:00"),
    template: "promotional",
  },
  {
    id: "2",
    name: "Welcome Series - Part 1",
    subject: "Welcome to Elevate360! Let's get started",
    status: "scheduled",
    recipients: 150,
    delivered: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0,
    bounced: 0,
    scheduledAt: new Date("2024-01-30T09:00:00"),
    template: "welcome",
  },
  {
    id: "3",
    name: "Monthly Newsletter",
    subject: "Your January Business Growth Report",
    status: "draft",
    recipients: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0,
    bounced: 0,
    template: "newsletter",
  },
]

const mockTemplates = [
  {
    id: "1",
    name: "Promotional Email",
    category: "promotional",
    thumbnail: "/placeholder.svg?height=200&width=300",
    description: "Perfect for sales and special offers",
    lastModified: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "Welcome Email",
    category: "welcome",
    thumbnail: "/placeholder.svg?height=200&width=300",
    description: "Onboard new subscribers",
    lastModified: new Date("2024-01-22"),
  },
  {
    id: "3",
    name: "Newsletter Template",
    category: "newsletter",
    thumbnail: "/placeholder.svg?height=200&width=300",
    description: "Regular updates and news",
    lastModified: new Date("2024-01-18"),
  },
]

const mockLists = [
  {
    id: "1",
    name: "All Subscribers",
    subscribers: 2450,
    growth: "+12%",
    lastUpdated: new Date("2024-01-28"),
  },
  {
    id: "2",
    name: "VIP Customers",
    subscribers: 180,
    growth: "+8%",
    lastUpdated: new Date("2024-01-27"),
  },
  {
    id: "3",
    name: "Newsletter Subscribers",
    subscribers: 1850,
    growth: "+15%",
    lastUpdated: new Date("2024-01-28"),
  },
  {
    id: "4",
    name: "Trial Users",
    subscribers: 420,
    growth: "+25%",
    lastUpdated: new Date("2024-01-26"),
  },
]

export default function EmailMarketingPage() {
  const [activeTab, setActiveTab] = useState("campaigns")
  const [campaigns, setCampaigns] = useState(mockCampaigns)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateRate = (numerator: number, denominator: number) => {
    return denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0"
  }

  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.delivered, 0)
  const totalOpened = campaigns.reduce((sum, campaign) => sum + campaign.opened, 0)
  const totalClicked = campaigns.reduce((sum, campaign) => sum + campaign.clicked, 0)
  const totalSubscribers = mockLists.reduce((sum, list) => sum + list.subscribers, 0)

  return (
    <MainLayout
      breadcrumbs={[{ label: "Marketing", href: "/marketing" }, { label: "Email Marketing" }]}
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
            <h1 className="text-3xl font-bold tracking-tight">Email Marketing</h1>
            <p className="text-muted-foreground">Create, send, and track email campaigns</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateRate(totalOpened, totalSent)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateRate(totalClicked, totalOpened)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+1.5%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="lists">Subscriber Lists</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>Manage your email marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{campaign.subject}</p>

                          {campaign.status === "sent" && (
                            <div className="grid grid-cols-5 gap-4 mt-4">
                              <div className="text-center">
                                <div className="text-lg font-bold">{campaign.delivered}</div>
                                <div className="text-xs text-muted-foreground">Delivered</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{campaign.opened}</div>
                                <div className="text-xs text-muted-foreground">Opened</div>
                                <div className="text-xs text-blue-600">
                                  {calculateRate(campaign.opened, campaign.delivered)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{campaign.clicked}</div>
                                <div className="text-xs text-muted-foreground">Clicked</div>
                                <div className="text-xs text-green-600">
                                  {calculateRate(campaign.clicked, campaign.opened)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-red-600">{campaign.bounced}</div>
                                <div className="text-xs text-muted-foreground">Bounced</div>
                                <div className="text-xs text-red-600">
                                  {calculateRate(campaign.bounced, campaign.recipients)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-yellow-600">{campaign.unsubscribed}</div>
                                <div className="text-xs text-muted-foreground">Unsubscribed</div>
                                <div className="text-xs text-yellow-600">
                                  {calculateRate(campaign.unsubscribed, campaign.delivered)}%
                                </div>
                              </div>
                            </div>
                          )}

                          {campaign.status === "scheduled" && (
                            <div className="mt-3">
                              <p className="text-sm text-blue-600">
                                Scheduled for {campaign.scheduledAt?.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Report
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Campaign
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Duplicate
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Pre-designed templates for your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {mockTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Mail className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="outline">{template.category}</Badge>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lists" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Lists</CardTitle>
                <CardDescription>Manage your email subscriber segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockLists.map((list) => (
                    <div key={list.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{list.name}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{list.subscribers.toLocaleString()}</span>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              {list.growth}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Updated {list.lastUpdated.toLocaleDateString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Subscribers
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit List
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Import Contacts
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Automation</CardTitle>
                <CardDescription>Set up automated email sequences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Email Automation Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up drip campaigns, welcome sequences, and automated follow-ups
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Automation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
