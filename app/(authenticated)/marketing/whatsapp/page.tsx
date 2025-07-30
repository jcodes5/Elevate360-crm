"use client"

import { useState } from "react"
import { Plus, Send, Phone, MessageSquare, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainLayout } from "@/components/layout/main-layout"

// Mock data
const mockTemplates = [
  {
    id: "1",
    name: "Welcome Message",
    content: "Hi {{name}}, welcome to Elevate360! We're excited to help you grow your business. 🚀",
    status: "approved",
    category: "greeting",
    language: "en",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "Appointment Reminder",
    content: "Hi {{name}}, this is a reminder about your appointment tomorrow at {{time}}. See you then! 📅",
    status: "approved",
    category: "reminder",
    language: "en",
    createdAt: new Date("2024-01-22"),
  },
  {
    id: "3",
    name: "Follow Up",
    content:
      "Hi {{name}}, thank you for your interest in our services. Would you like to schedule a call to discuss further? 📞",
    status: "pending",
    category: "follow-up",
    language: "en",
    createdAt: new Date("2024-01-25"),
  },
]

const mockConversations = [
  {
    id: "1",
    contact: "Adebayo Johnson",
    phone: "+2348012345678",
    lastMessage: "Thank you for the information. I'll review and get back to you.",
    timestamp: new Date("2024-01-28T14:30:00"),
    status: "read",
    unreadCount: 0,
  },
  {
    id: "2",
    contact: "Fatima Abdullahi",
    phone: "+2348087654321",
    lastMessage: "When can we schedule the demo?",
    timestamp: new Date("2024-01-28T13:45:00"),
    status: "unread",
    unreadCount: 2,
  },
  {
    id: "3",
    contact: "Chinedu Okafor",
    phone: "+2348098765432",
    lastMessage: "Sounds good! Let's proceed with the proposal.",
    timestamp: new Date("2024-01-28T12:20:00"),
    status: "delivered",
    unreadCount: 0,
  },
]

const mockCampaigns = [
  {
    id: "1",
    name: "New Product Launch",
    message: "🚀 Exciting news! Our new CRM features are now live. Get 20% off this month!",
    recipients: 250,
    sent: 250,
    delivered: 245,
    read: 180,
    replied: 25,
    status: "completed",
    sentAt: new Date("2024-01-25T10:00:00"),
  },
  {
    id: "2",
    name: "Follow-up Campaign",
    message: "Hi {{name}}, we noticed you haven't completed your setup. Need help? 🤝",
    recipients: 150,
    sent: 150,
    delivered: 148,
    read: 95,
    replied: 12,
    status: "completed",
    sentAt: new Date("2024-01-27T15:30:00"),
  },
]

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState("conversations")
  const [templates, setTemplates] = useState(mockTemplates)
  const [conversations, setConversations] = useState(mockConversations)
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    category: "",
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "read":
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "sent":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "unread":
        return <MessageSquare className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalMessages = campaigns.reduce((sum, campaign) => sum + campaign.sent, 0)
  const totalDelivered = campaigns.reduce((sum, campaign) => sum + campaign.delivered, 0)
  const totalRead = campaigns.reduce((sum, campaign) => sum + campaign.read, 0)
  const totalReplied = campaigns.reduce((sum, campaign) => sum + campaign.replied, 0)

  return (
    <MainLayout
      breadcrumbs={[{ label: "Marketing", href: "/marketing" }, { label: "WhatsApp" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Phone className="mr-2 h-4 w-4" />
            Connect WhatsApp
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WhatsApp Marketing</h1>
            <p className="text-muted-foreground">Engage with customers through WhatsApp Business</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalMessages > 0 ? ((totalDelivered / totalMessages) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.3%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRead > 0 ? ((totalReplied / totalRead) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+1.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Manage your WhatsApp conversations with customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{conversation.contact}</h3>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{conversation.phone}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{conversation.lastMessage}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {conversation.timestamp.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <div className="flex items-center justify-end mt-1">{getStatusIcon(conversation.status)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>Pre-approved templates for WhatsApp Business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div key={template.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{template.name}</h3>
                              <Badge className={getStatusColor(template.status)}>{template.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{template.content}</p>
                            <div className="flex items-center space-x-4 mt-3">
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {template.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create New Template</CardTitle>
                  <CardDescription>Submit a new template for WhatsApp approval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="e.g., Welcome Message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateCategory">Category</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greeting">Greeting</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="follow-up">Follow Up</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateContent">Message Content</Label>
                    <Textarea
                      id="templateContent"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      placeholder="Hi {{name}}, your message here..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {`{{name}}`}, {`{{company}}`}, {`{{time}}`} for personalization
                    </p>
                  </div>
                  <Button className="w-full">Submit for Approval</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Track your WhatsApp campaign results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{campaign.message}</p>
                          <div className="grid grid-cols-4 gap-4 mt-4">
                            <div className="text-center">
                              <div className="text-lg font-bold">{campaign.sent}</div>
                              <div className="text-xs text-muted-foreground">Sent</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{campaign.delivered}</div>
                              <div className="text-xs text-muted-foreground">Delivered</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{campaign.read}</div>
                              <div className="text-xs text-muted-foreground">Read</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{campaign.replied}</div>
                              <div className="text-xs text-muted-foreground">Replied</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{campaign.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-2">{campaign.sentAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Broadcast Message</CardTitle>
                <CardDescription>Send a message to multiple contacts at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates
                        .filter((t) => t.status === "approved")
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="prospects">Prospects</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-sm">
                      Hi John, welcome to Elevate360! We're excited to help you grow your business. 🚀
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Schedule Later
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
