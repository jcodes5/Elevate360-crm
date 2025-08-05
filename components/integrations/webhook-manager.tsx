"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { WebhookIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, FilterIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon, CopyIcon, PlayIcon, PauseIcon, RefreshCwIcon, EyeIcon, CodeIcon, ClockIcon, TrendingUpIcon, ZapIcon, DatabaseIcon, KeyIcon } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface Webhook {
  id: string
  name: string
  description: string
  url: string
  method: "POST" | "PUT" | "PATCH"
  status: "active" | "paused" | "failed"
  events: WebhookEvent[]
  headers: Record<string, string>
  authentication?: {
    type: "none" | "bearer" | "basic" | "api_key"
    token?: string
    username?: string
    password?: string
    apiKey?: string
    headerName?: string
  }
  retryPolicy: {
    maxRetries: number
    retryDelay: number
    backoffMultiplier: number
  }
  timeout: number
  filters?: WebhookFilter[]
  secretKey?: string
  isVerificationEnabled: boolean
  createdAt: Date
  updatedAt: Date
  lastTriggered?: Date
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
}

interface WebhookEvent {
  type: string
  enabled: boolean
  description?: string
}

interface WebhookFilter {
  id: string
  field: string
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than"
  value: any
  logicalOperator?: "AND" | "OR"
}

interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  status: "pending" | "success" | "failed" | "retrying"
  statusCode?: number
  payload: any
  response?: string
  error?: string
  attempt: number
  maxAttempts: number
  createdAt: Date
  deliveredAt?: Date
  nextRetryAt?: Date
  duration?: number
}

interface WebhookLog {
  id: string
  webhookId: string
  level: "info" | "warning" | "error"
  message: string
  timestamp: Date
  metadata?: any
}

// Available webhook events
const availableEvents: WebhookEvent[] = [
  { type: "contact.created", enabled: false, description: "When a new contact is created" },
  { type: "contact.updated", enabled: false, description: "When a contact is updated" },
  { type: "contact.deleted", enabled: false, description: "When a contact is deleted" },
  { type: "deal.created", enabled: false, description: "When a new deal is created" },
  { type: "deal.updated", enabled: false, description: "When a deal is updated" },
  { type: "deal.won", enabled: false, description: "When a deal is won" },
  { type: "deal.lost", enabled: false, description: "When a deal is lost" },
  { type: "task.created", enabled: false, description: "When a new task is created" },
  { type: "task.completed", enabled: false, description: "When a task is completed" },
  { type: "email.sent", enabled: false, description: "When an email is sent" },
  { type: "email.opened", enabled: false, description: "When an email is opened" },
  { type: "email.clicked", enabled: false, description: "When an email link is clicked" },
  { type: "campaign.started", enabled: false, description: "When a campaign is started" },
  { type: "campaign.completed", enabled: false, description: "When a campaign is completed" },
  { type: "user.created", enabled: false, description: "When a new user is created" },
  { type: "user.login", enabled: false, description: "When a user logs in" }
]

// Mock data
const mockWebhooks: Webhook[] = [
  {
    id: "webhook-1",
    name: "Slack Notifications",
    description: "Send deal updates to Slack channel",
    url: "https://hooks.slack.com/services/T1234567890/B1234567890/XXXXXXXXXXXXXXXXXXXXXXXX",
    method: "POST",
    status: "active",
    events: [
      { type: "deal.created", enabled: true },
      { type: "deal.won", enabled: true },
      { type: "deal.lost", enabled: true }
    ],
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "CRM-Webhook/1.0"
    },
    authentication: {
      type: "none"
    },
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 5000,
      backoffMultiplier: 2
    },
    timeout: 30000,
    secretKey: "sk_live_51234567890abcdef",
    isVerificationEnabled: true,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(),
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalDeliveries: 156,
    successfulDeliveries: 152,
    failedDeliveries: 4
  },
  {
    id: "webhook-2",
    name: "CRM Sync",
    description: "Sync data with external CRM system",
    url: "https://api.external-crm.com/webhooks/data-sync",
    method: "POST",
    status: "active",
    events: [
      { type: "contact.created", enabled: true },
      { type: "contact.updated", enabled: true }
    ],
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    authentication: {
      type: "bearer",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    retryPolicy: {
      maxRetries: 5,
      retryDelay: 10000,
      backoffMultiplier: 1.5
    },
    timeout: 45000,
    filters: [
      {
        id: "filter-1",
        field: "contact.status",
        operator: "equals",
        value: "active"
      }
    ],
    isVerificationEnabled: false,
    createdAt: new Date(2024, 0, 5),
    updatedAt: new Date(),
    lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
    totalDeliveries: 89,
    successfulDeliveries: 87,
    failedDeliveries: 2
  },
  {
    id: "webhook-3",
    name: "Analytics Tracker",
    description: "Send events to analytics platform",
    url: "https://analytics.example.com/webhook/events",
    method: "POST",
    status: "failed",
    events: [
      { type: "email.sent", enabled: true },
      { type: "email.opened", enabled: true },
      { type: "email.clicked", enabled: true }
    ],
    headers: {
      "Content-Type": "application/json"
    },
    authentication: {
      type: "api_key",
      apiKey: "ak_live_1234567890abcdef",
      headerName: "X-API-Key"
    },
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 5000,
      backoffMultiplier: 2
    },
    timeout: 20000,
    isVerificationEnabled: false,
    createdAt: new Date(2024, 0, 10),
    updatedAt: new Date(),
    lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000),
    totalDeliveries: 45,
    successfulDeliveries: 31,
    failedDeliveries: 14
  }
]

const mockDeliveries: WebhookDelivery[] = [
  {
    id: "delivery-1",
    webhookId: "webhook-1",
    event: "deal.won",
    status: "success",
    statusCode: 200,
    payload: {
      event: "deal.won",
      data: {
        id: "deal-123",
        name: "Enterprise Deal",
        value: 50000,
        stage: "won"
      }
    },
    response: "ok",
    attempt: 1,
    maxAttempts: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 1250
  },
  {
    id: "delivery-2",
    webhookId: "webhook-3",
    event: "email.sent",
    status: "failed",
    statusCode: 500,
    payload: {
      event: "email.sent",
      data: {
        id: "email-456",
        subject: "Weekly Newsletter",
        recipient: "user@example.com"
      }
    },
    error: "Internal Server Error",
    attempt: 3,
    maxAttempts: 3,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    duration: 30000
  }
]

const statusColors = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800"
}

const deliveryStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  retrying: "bg-blue-100 text-blue-800"
}

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks)
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(mockDeliveries)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("webhooks")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const filteredWebhooks = useMemo(() => {
    return webhooks.filter(webhook => {
      const matchesSearch = webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           webhook.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || webhook.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [webhooks, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = webhooks.length
    const active = webhooks.filter(w => w.status === "active").length
    const totalDeliveries = webhooks.reduce((sum, w) => sum + w.totalDeliveries, 0)
    const successRate = totalDeliveries > 0 
      ? (webhooks.reduce((sum, w) => sum + w.successfulDeliveries, 0) / totalDeliveries * 100)
      : 0

    return { total, active, totalDeliveries, successRate }
  }, [webhooks])

  const handleCreateWebhook = (webhookData: Partial<Webhook>) => {
    const newWebhook: Webhook = {
      id: `webhook-${webhooks.length + 1}`,
      name: webhookData.name || "",
      description: webhookData.description || "",
      url: webhookData.url || "",
      method: webhookData.method || "POST",
      status: "active",
      events: webhookData.events || [],
      headers: webhookData.headers || { "Content-Type": "application/json" },
      authentication: webhookData.authentication,
      retryPolicy: webhookData.retryPolicy || {
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2
      },
      timeout: webhookData.timeout || 30000,
      filters: webhookData.filters,
      secretKey: webhookData.secretKey,
      isVerificationEnabled: webhookData.isVerificationEnabled || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0
    }

    setWebhooks([newWebhook, ...webhooks])
    setIsCreateDialogOpen(false)
  }

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks(webhooks.map(webhook =>
      webhook.id === webhookId
        ? { 
            ...webhook, 
            status: webhook.status === "active" ? "paused" : "active",
            updatedAt: new Date()
          }
        : webhook
    ))
  }

  const handleTestWebhook = (webhookId: string) => {
    const webhook = webhooks.find(w => w.id === webhookId)
    if (webhook) {
      const testDelivery: WebhookDelivery = {
        id: `delivery-test-${Date.now()}`,
        webhookId,
        event: "test.event",
        status: "success",
        statusCode: 200,
        payload: {
          event: "test.event",
          data: { message: "This is a test webhook" },
          timestamp: new Date().toISOString()
        },
        response: "Test webhook received successfully",
        attempt: 1,
        maxAttempts: 1,
        createdAt: new Date(),
        deliveredAt: new Date(),
        duration: 500
      }

      setDeliveries([testDelivery, ...deliveries])
      setWebhooks(webhooks.map(w =>
        w.id === webhookId
          ? {
              ...w,
              lastTriggered: new Date(),
              totalDeliveries: w.totalDeliveries + 1,
              successfulDeliveries: w.successfulDeliveries + 1
            }
          : w
      ))
    }
  }

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter(w => w.id !== webhookId))
    setDeliveries(deliveries.filter(d => d.webhookId !== webhookId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Management</h1>
          <p className="text-muted-foreground">Configure and monitor webhook endpoints for real-time integrations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Set up a new webhook endpoint to receive real-time notifications from your CRM.
              </DialogDescription>
            </DialogHeader>
            <CreateWebhookForm onSubmit={handleCreateWebhook} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery Logs</TabsTrigger>
          <TabsTrigger value="events">Event Types</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Webhook Endpoints</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search webhooks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWebhooks.map((webhook) => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <WebhookIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium">{webhook.name}</h3>
                          <p className="text-sm text-muted-foreground">{webhook.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              {webhook.method}
                            </code>
                            <span className="text-muted-foreground font-mono truncate max-w-md">
                              {webhook.url}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[webhook.status]}>
                              {webhook.status}
                            </Badge>
                            <div className="flex gap-1">
                              {webhook.events.filter(e => e.enabled).slice(0, 3).map((event) => (
                                <Badge key={event.type} variant="outline" className="text-xs">
                                  {event.type}
                                </Badge>
                              ))}
                              {webhook.events.filter(e => e.enabled).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{webhook.events.filter(e => e.enabled).length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {webhook.successfulDeliveries}/{webhook.totalDeliveries}
                          </div>
                          <div className="text-muted-foreground">
                            {webhook.totalDeliveries > 0 
                              ? `${((webhook.successfulDeliveries / webhook.totalDeliveries) * 100).toFixed(1)}% success`
                              : "No deliveries"
                            }
                          </div>
                          {webhook.lastTriggered && (
                            <div className="text-xs text-muted-foreground">
                              Last: {formatDistanceToNow(webhook.lastTriggered, { addSuffix: true })}
                            </div>
                          )}
                        </div>
                        <Switch
                          checked={webhook.status === "active"}
                          onCheckedChange={() => handleToggleWebhook(webhook.id)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedWebhook(webhook)}>
                              <SettingsIcon className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTestWebhook(webhook.id)}>
                              <PlayIcon className="h-4 w-4 mr-2" />
                              Test Webhook
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(webhook.url)}>
                              <CopyIcon className="h-4 w-4 mr-2" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Logs
                            </DropdownMenuItem>
                            <Separator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredWebhooks.length === 0 && (
                  <div className="text-center py-8">
                    <WebhookIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No webhooks found</h3>
                    <p className="text-muted-foreground">
                      Create your first webhook to start receiving real-time notifications.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <DeliveryLogs deliveries={deliveries} webhooks={webhooks} />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <EventTypesManager events={availableEvents} />
        </TabsContent>
      </Tabs>

      {/* Webhook Configuration Dialog */}
      {selectedWebhook && (
        <WebhookConfigDialog
          webhook={selectedWebhook}
          onClose={() => setSelectedWebhook(null)}
          onUpdate={(updates) => {
            setWebhooks(webhooks.map(w => 
              w.id === selectedWebhook.id ? { ...w, ...updates, updatedAt: new Date() } : w
            ))
            setSelectedWebhook(null)
          }}
        />
      )}
    </div>
  )
}

function CreateWebhookForm({ onSubmit }: { onSubmit: (data: Partial<Webhook>) => void }) {
  const [formData, setFormData] = useState<Partial<Webhook>>({
    name: "",
    description: "",
    url: "",
    method: "POST",
    events: availableEvents.map(e => ({ ...e, enabled: false })),
    headers: { "Content-Type": "application/json" },
    authentication: { type: "none" },
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 5000,
      backoffMultiplier: 2
    },
    timeout: 30000,
    isVerificationEnabled: false
  })

  const [activeStep, setActiveStep] = useState(0)
  const steps = ["Basic Info", "Events", "Authentication", "Advanced"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleEventToggle = (eventType: string, enabled: boolean) => {
    setFormData({
      ...formData,
      events: formData.events?.map(event =>
        event.type === eventType ? { ...event, enabled } : event
      )
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
              index <= activeStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {index + 1}
            </div>
            <span className={`text-sm ${index <= activeStep ? "text-foreground" : "text-muted-foreground"}`}>
              {step}
            </span>
            {index < steps.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {activeStep === 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Webhook Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Slack Notifications"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this webhook does"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Endpoint URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/webhook"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select 
              value={formData.method} 
              onValueChange={(value: any) => setFormData({ ...formData, method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Select Events to Subscribe</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which events should trigger this webhook
            </p>
          </div>

          <ScrollArea className="h-64 border rounded p-4">
            <div className="space-y-3">
              {formData.events?.map((event) => (
                <div key={event.type} className="flex items-center space-x-3">
                  <Checkbox
                    checked={event.enabled}
                    onCheckedChange={(checked) => handleEventToggle(event.type, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.type}</div>
                    {event.description && (
                      <div className="text-xs text-muted-foreground">{event.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Authentication Type</Label>
            <Select 
              value={formData.authentication?.type} 
              onValueChange={(value: any) => setFormData({ 
                ...formData, 
                authentication: { type: value } 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.authentication?.type === "bearer" && (
            <div className="space-y-2">
              <Label htmlFor="token">Bearer Token</Label>
              <Input
                id="token"
                type="password"
                value={formData.authentication.token || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  authentication: { ...formData.authentication, token: e.target.value }
                })}
                placeholder="Enter bearer token"
              />
            </div>
          )}

          {formData.authentication?.type === "api_key" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.authentication.apiKey || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    authentication: { ...formData.authentication, apiKey: e.target.value }
                  })}
                  placeholder="Enter API key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headerName">Header Name</Label>
                <Input
                  id="headerName"
                  value={formData.authentication.headerName || "X-API-Key"}
                  onChange={(e) => setFormData({
                    ...formData,
                    authentication: { ...formData.authentication, headerName: e.target.value }
                  })}
                  placeholder="X-API-Key"
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.isVerificationEnabled}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                isVerificationEnabled: checked as boolean 
              })}
            />
            <Label className="text-sm">Enable signature verification</Label>
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                min="1000"
                max="120000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRetries">Max Retries</Label>
              <Input
                id="maxRetries"
                type="number"
                value={formData.retryPolicy?.maxRetries}
                onChange={(e) => setFormData({
                  ...formData,
                  retryPolicy: { ...formData.retryPolicy!, maxRetries: parseInt(e.target.value) }
                })}
                min="0"
                max="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
            <Input
              id="retryDelay"
              type="number"
              value={formData.retryPolicy?.retryDelay}
              onChange={(e) => setFormData({
                ...formData,
                retryPolicy: { ...formData.retryPolicy!, retryDelay: parseInt(e.target.value) }
              })}
              min="1000"
              max="300000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backoffMultiplier">Backoff Multiplier</Label>
            <Input
              id="backoffMultiplier"
              type="number"
              step="0.1"
              value={formData.retryPolicy?.backoffMultiplier}
              onChange={(e) => setFormData({
                ...formData,
                retryPolicy: { ...formData.retryPolicy!, backoffMultiplier: parseFloat(e.target.value) }
              })}
              min="1"
              max="5"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          Previous
        </Button>
        
        {activeStep < steps.length - 1 ? (
          <Button 
            type="button" 
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={
              (activeStep === 0 && (!formData.name || !formData.url)) ||
              (activeStep === 1 && !formData.events?.some(e => e.enabled))
            }
          >
            Next
          </Button>
        ) : (
          <Button type="submit">Create Webhook</Button>
        )}
      </div>
    </form>
  )
}

function WebhookConfigDialog({
  webhook,
  onClose,
  onUpdate
}: {
  webhook: Webhook
  onClose: () => void
  onUpdate: (updates: Partial<Webhook>) => void
}) {
  const [settings, setSettings] = useState(webhook)

  const handleSave = () => {
    onUpdate(settings)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configure {webhook.name}</DialogTitle>
          <DialogDescription>
            Manage webhook settings, events, and authentication.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <Select 
                  value={settings.method} 
                  onValueChange={(value: any) => setSettings({ ...settings, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={settings.url}
                onChange={(e) => setSettings({ ...settings, url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={settings.timeout}
                  onChange={(e) => setSettings({ ...settings, timeout: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  value={settings.retryPolicy.maxRetries}
                  onChange={(e) => setSettings({
                    ...settings,
                    retryPolicy: { ...settings.retryPolicy, maxRetries: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                <Input
                  id="retryDelay"
                  type="number"
                  value={settings.retryPolicy.retryDelay}
                  onChange={(e) => setSettings({
                    ...settings,
                    retryPolicy: { ...settings.retryPolicy, retryDelay: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="space-y-3">
              {settings.events.map((event) => (
                <div key={event.type} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{event.type}</div>
                    {event.description && (
                      <div className="text-sm text-muted-foreground">{event.description}</div>
                    )}
                  </div>
                  <Switch
                    checked={event.enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      events: settings.events.map(e =>
                        e.type === event.type ? { ...e, enabled: checked } : e
                      )
                    })}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="headers" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(settings.headers).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-2">
                  <Input value={key} readOnly />
                  <Input
                    value={value}
                    onChange={(e) => setSettings({
                      ...settings,
                      headers: { ...settings.headers, [key]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.isVerificationEnabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  isVerificationEnabled: checked as boolean
                })}
              />
              <Label>Enable signature verification</Label>
            </div>

            {settings.secretKey && (
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex gap-2">
                  <Input type="password" value={settings.secretKey} readOnly />
                  <Button variant="outline" size="sm">
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DeliveryLogs({
  deliveries,
  webhooks
}: {
  deliveries: WebhookDelivery[]
  webhooks: Webhook[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Logs</CardTitle>
        <CardDescription>Recent webhook delivery attempts and their results</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {deliveries.map((delivery) => {
              const webhook = webhooks.find(w => w.id === delivery.webhookId)
              return (
                <div key={delivery.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{webhook?.name || "Unknown Webhook"}</h4>
                      <Badge variant="outline">{delivery.event}</Badge>
                      <Badge className={deliveryStatusColors[delivery.status]}>
                        {delivery.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(delivery.createdAt, 'MMM dd, HH:mm:ss')}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Status Code</Label>
                      <p className={delivery.statusCode && delivery.statusCode >= 200 && delivery.statusCode < 300 
                        ? "text-green-600" : "text-red-600"}>
                        {delivery.statusCode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Attempt</Label>
                      <p>{delivery.attempt}/{delivery.maxAttempts}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Duration</Label>
                      <p>{delivery.duration ? `${delivery.duration}ms` : "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Response</Label>
                      <p className="truncate">{delivery.response || delivery.error || "N/A"}</p>
                    </div>
                  </div>

                  {delivery.error && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">{delivery.error}</p>
                    </div>
                  )}
                </div>
              )
            })}

            {deliveries.length === 0 && (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No delivery logs</h3>
                <p className="text-muted-foreground">
                  Webhook delivery logs will appear here once events are triggered.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function EventTypesManager({ events }: { events: WebhookEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Event Types</CardTitle>
        <CardDescription>
          Events that can trigger webhook notifications in your CRM system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event.type} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ZapIcon className="h-4 w-4 text-primary" />
                <h4 className="font-medium">{event.type}</h4>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Available
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
