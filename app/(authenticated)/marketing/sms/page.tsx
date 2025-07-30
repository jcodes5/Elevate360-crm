"use client"

import { useState } from "react"
import { Plus, Send, Users, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { MainLayout } from "@/components/layout/main-layout"

// Mock data
const mockCampaigns = [
  {
    id: "1",
    name: "Flash Sale Alert",
    message: "🔥 FLASH SALE: 50% off all services today only! Use code FLASH50. Limited time offer!",
    recipients: 850,
    sent: 850,
    delivered: 820,
    clicked: 45,
    replied: 12,
    failed: 30,
    status: "completed",
    sentAt: new Date("2024-01-27T14:00:00"),
    credits: 850,
  },
  {
    id: "2",
    name: "Appointment Reminder",
    message: "Hi {{name}}, reminder: Your appointment is tomorrow at {{time}}. Reply CONFIRM or CANCEL.",
    recipients: 120,
    sent: 120,
    delivered: 118,
    clicked: 8,
    replied: 85,
    failed: 2,
    status: "completed",
    sentAt: new Date("2024-01-26T16:30:00"),
    credits: 120,
  },
  {
    id: "3",
    name: "Welcome SMS Series",
    message:
      "Welcome to Elevate360! We're excited to help grow your business. Check out our getting started guide: {{link}}",
    recipients: 200,
    sent: 0,
    delivered: 0,
    clicked: 0,
    replied: 0,
    failed: 0,
    status: "scheduled",
    scheduledAt: new Date("2024-01-30T10:00:00"),
    credits: 200,
  },
]

const mockTemplates = [
  {
    id: "1",
    name: "Appointment Reminder",
    message: "Hi {{name}}, reminder: Your appointment is {{date}} at {{time}}. Reply CONFIRM or CANCEL.",
    category: "reminder",
    variables: ["name", "date", "time"],
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "Promotional Offer",
    message: "🎉 Special offer for {{name}}! Get {{discount}}% off. Use code {{code}}. Valid until {{expiry}}.",
    category: "promotional",
    variables: ["name", "discount", "code", "expiry"],
    createdAt: new Date("2024-01-22"),
  },
  {
    id: "3",
    name: "Payment Reminder",
    message: "Hi {{name}}, your payment of {{amount}} is due on {{date}}. Pay now: {{link}}",
    category: "transactional",
    variables: ["name", "amount", "date", "link"],
    createdAt: new Date("2024-01-18"),
  },
]

export default function SMSMarketingPage() {
  const [activeTab, setActiveTab] = useState("campaigns")
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [newMessage, setNewMessage] = useState("")
  const [selectedAudience, setSelectedAudience] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "sending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateRate = (numerator: number, denominator: number) => {
    return denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0"
  }

  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sent, 0)
  const totalDelivered = campaigns.reduce((sum, campaign) => sum + campaign.delivered, 0)
  const totalClicked = campaigns.reduce((sum, campaign) => sum + campaign.clicked, 0)
  const totalReplied = campaigns.reduce((sum, campaign) => sum + campaign.replied, 0)
  const totalCredits = campaigns.reduce((sum, campaign) => sum + campaign.credits, 0)

  const characterCount = newMessage.length
  const smsCount = Math.ceil(characterCount / 160)
  const remainingChars = 160 - (characterCount % 160)

  return (
    <MainLayout
      breadcrumbs={[{ label: "Marketing", href: "/marketing" }, { label: "SMS Marketing" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Manage Contacts
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Send SMS
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SMS Marketing</h1>
            <p className="text-muted-foreground">Send targeted SMS campaigns to your customers</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateRate(totalDelivered, totalSent)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+1.2%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateRate(totalClicked, totalDelivered)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.8%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateRate(totalReplied, totalDelivered)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">5,000 remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SMS Campaigns</CardTitle>
                <CardDescription>Track your SMS marketing performance</CardDescription>
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
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{campaign.message}</p>

                          {campaign.status === "completed" && (
                            <div className="grid grid-cols-5 gap-4 mt-4">
                              <div className="text-center">
                                <div className="text-lg font-bold">{campaign.sent}</div>
                                <div className="text-xs text-muted-foreground">Sent</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{campaign.delivered}</div>
                                <div className="text-xs text-muted-foreground">Delivered</div>
                                <div className="text-xs text-green-600">
                                  {calculateRate(campaign.delivered, campaign.sent)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{campaign.clicked}</div>
                                <div className="text-xs text-muted-foreground">Clicked</div>
                                <div className="text-xs text-blue-600">
                                  {calculateRate(campaign.clicked, campaign.delivered)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{campaign.replied}</div>
                                <div className="text-xs text-muted-foreground">Replied</div>
                                <div className="text-xs text-purple-600">
                                  {calculateRate(campaign.replied, campaign.delivered)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-red-600">{campaign.failed}</div>
                                <div className="text-xs text-muted-foreground">Failed</div>
                                <div className="text-xs text-red-600">
                                  {calculateRate(campaign.failed, campaign.sent)}%
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
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {campaign.sentAt ? campaign.sentAt.toLocaleDateString() : "Not sent"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{campaign.credits} credits</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Compose SMS</CardTitle>
                  <CardDescription>Create and send SMS messages to your contacts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Audience</Label>
                    <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Contacts (2,450)</SelectItem>
                        <SelectItem value="customers">Customers (1,200)</SelectItem>
                        <SelectItem value="prospects">Prospects (800)</SelectItem>
                        <SelectItem value="leads">Leads (450)</SelectItem>
                        <SelectItem value="vip">VIP Customers (180)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your SMS message here..."
                      rows={4}
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{characterCount}/1000 characters</span>
                      <span>
                        {smsCount} SMS • {remainingChars} chars remaining
                      </span>
                    </div>
                    <Progress value={(characterCount / 160) * 100} className="h-1" />
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Message Preview</h4>
                    <div className="bg-white p-3 rounded border text-sm">
                      {newMessage || "Your message will appear here..."}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1" disabled={!newMessage || !selectedAudience}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Now
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={!newMessage || !selectedAudience}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SMS Guidelines</CardTitle>
                  <CardDescription>Best practices for SMS marketing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Keep it concise</p>
                        <p className="text-xs text-muted-foreground">SMS messages should be clear and to the point</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Include clear CTA</p>
                        <p className="text-xs text-muted-foreground">
                          Tell recipients exactly what you want them to do
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Personalize messages</p>
                        <p className="text-xs text-muted-foreground">
                          Use variables like {`{{name}}`} for personalization
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Respect opt-outs</p>
                        <p className="text-xs text-muted-foreground">Always honor unsubscribe requests immediately</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Time your messages</p>
                        <p className="text-xs text-muted-foreground">Send during business hours (9 AM - 6 PM)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SMS Templates</CardTitle>
                <CardDescription>Pre-built templates for common SMS campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTemplates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{template.message}</p>
                          <div className="flex items-center space-x-2 mt-3">
                            <span className="text-xs text-muted-foreground">Variables:</span>
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setNewMessage(template.message)}>
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SMS Contacts</CardTitle>
                <CardDescription>Manage contacts who have opted in for SMS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Contact Management</h3>
                  <p className="text-muted-foreground mb-4">Import, segment, and manage your SMS subscriber list</p>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline">Import Contacts</Button>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
