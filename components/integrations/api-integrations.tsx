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
import { PlugIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, FilterIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon, SettingsIcon, RefreshCwIcon, ExternalLinkIcon, KeyIcon, CopyIcon, EyeIcon, EyeOffIcon, FacebookIcon, TwitterIcon, LinkedinIcon, GmailIcon, SlackIcon, ZapIcon, WebhookIcon, DatabaseIcon, CloudIcon } from "lucide-react"
import { format } from "date-fns"

interface Integration {
  id: string
  name: string
  description: string
  category: "productivity" | "social_media" | "communication" | "storage" | "analytics" | "crm" | "marketing"
  provider: string
  version: string
  status: "connected" | "disconnected" | "error" | "pending"
  isEnabled: boolean
  lastSync?: Date
  syncFrequency: "real_time" | "hourly" | "daily" | "weekly" | "manual"
  dataMapping: DataMapping[]
  credentials: {
    type: "oauth" | "api_key" | "token" | "webhook"
    apiKey?: string
    accessToken?: string
    refreshToken?: string
    webhookUrl?: string
    expiresAt?: Date
  }
  permissions: string[]
  usage: {
    apiCalls: number
    rateLimitRemaining: number
    quotaUsed: number
    quotaTotal: number
  }
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

interface DataMapping {
  id: string
  source: string
  target: string
  transformation?: string
  isActive: boolean
}

interface IntegrationTemplate {
  id: string
  name: string
  description: string
  category: string
  provider: string
  icon: string
  features: string[]
  authType: "oauth" | "api_key"
  documentation: string
  isPopular: boolean
  rating: number
  installations: number
}

// Mock integration templates
const integrationTemplates: IntegrationTemplate[] = [
  {
    id: "google-workspace",
    name: "Google Workspace",
    description: "Sync contacts, calendar events, and drive files with your CRM",
    category: "productivity",
    provider: "Google",
    icon: "🔗",
    features: ["Contact Sync", "Calendar Integration", "Drive Files", "Gmail Integration"],
    authType: "oauth",
    documentation: "https://developers.google.com/workspace",
    isPopular: true,
    rating: 4.8,
    installations: 15420
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    description: "Integrate with Outlook, Teams, and OneDrive for seamless productivity",
    category: "productivity",
    provider: "Microsoft",
    icon: "🏢",
    features: ["Outlook Calendar", "Teams Integration", "OneDrive Files", "Exchange Contacts"],
    authType: "oauth",
    documentation: "https://docs.microsoft.com/en-us/graph",
    isPopular: true,
    rating: 4.7,
    installations: 12350
  },
  {
    id: "facebook-ads",
    name: "Facebook Ads",
    description: "Track ad performance and sync leads from Facebook advertising campaigns",
    category: "social_media",
    provider: "Meta",
    icon: "📘",
    features: ["Lead Ads Sync", "Campaign Tracking", "Audience Insights", "Ad Performance"],
    authType: "oauth",
    documentation: "https://developers.facebook.com/docs/marketing-apis",
    isPopular: true,
    rating: 4.5,
    installations: 8920
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    description: "Import leads and track campaign performance from LinkedIn advertising",
    category: "social_media",
    provider: "LinkedIn",
    icon: "💼",
    features: ["Lead Gen Forms", "Campaign Analytics", "Company Data", "Member Insights"],
    authType: "oauth",
    documentation: "https://docs.microsoft.com/en-us/linkedin",
    isPopular: true,
    rating: 4.6,
    installations: 6750
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications and updates to Slack channels automatically",
    category: "communication",
    provider: "Slack",
    icon: "💬",
    features: ["Channel Notifications", "Deal Updates", "Task Alerts", "Bot Commands"],
    authType: "oauth",
    documentation: "https://api.slack.com/",
    isPopular: true,
    rating: 4.9,
    installations: 11200
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Bidirectional sync with Salesforce CRM for unified customer data",
    category: "crm",
    provider: "Salesforce",
    icon: "☁️",
    features: ["Contact Sync", "Opportunity Sync", "Account Data", "Custom Objects"],
    authType: "oauth",
    documentation: "https://developer.salesforce.com/",
    isPopular: false,
    rating: 4.4,
    installations: 3200
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Connect with HubSpot for marketing automation and lead management",
    category: "marketing",
    provider: "HubSpot",
    icon: "🧲",
    features: ["Contact Sync", "Email Campaigns", "Landing Pages", "Analytics"],
    authType: "api_key",
    documentation: "https://developers.hubspot.com/",
    isPopular: false,
    rating: 4.5,
    installations: 4100
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sync email lists and track campaign performance with Mailchimp",
    category: "marketing",
    provider: "Mailchimp",
    icon: "🐒",
    features: ["List Sync", "Campaign Tracking", "Automation", "Analytics"],
    authType: "oauth",
    documentation: "https://mailchimp.com/developer/",
    isPopular: false,
    rating: 4.3,
    installations: 7800
  }
]

// Mock active integrations
const mockIntegrations: Integration[] = [
  {
    id: "int-1",
    name: "Google Workspace",
    description: "Sync contacts, calendar events, and drive files",
    category: "productivity",
    provider: "Google",
    version: "v1.0",
    status: "connected",
    isEnabled: true,
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    syncFrequency: "hourly",
    dataMapping: [
      { id: "map-1", source: "contacts", target: "crm_contacts", isActive: true },
      { id: "map-2", source: "calendar", target: "crm_activities", isActive: true }
    ],
    credentials: {
      type: "oauth",
      accessToken: "ya29.a0Ae4lvC1...",
      refreshToken: "1//04...",
      expiresAt: new Date(Date.now() + 3600000)
    },
    permissions: ["contacts.read", "calendar.read", "drive.readonly"],
    usage: {
      apiCalls: 1250,
      rateLimitRemaining: 8750,
      quotaUsed: 12.5,
      quotaTotal: 100
    },
    settings: {
      syncDirection: "bidirectional",
      conflictResolution: "latest_wins",
      autoSync: true
    },
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date()
  },
  {
    id: "int-2",
    name: "Slack",
    description: "Send notifications to Slack channels",
    category: "communication",
    provider: "Slack",
    version: "v2.1",
    status: "connected",
    isEnabled: true,
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    syncFrequency: "real_time",
    dataMapping: [
      { id: "map-3", source: "deals", target: "sales_channel", isActive: true },
      { id: "map-4", source: "support_tickets", target: "support_channel", isActive: true }
    ],
    credentials: {
      type: "oauth",
      accessToken: "xoxb-1234567890",
      webhookUrl: "https://hooks.slack.com/services/..."
    },
    permissions: ["chat:write", "channels:read", "users:read"],
    usage: {
      apiCalls: 450,
      rateLimitRemaining: 9550,
      quotaUsed: 4.5,
      quotaTotal: 100
    },
    settings: {
      defaultChannel: "#sales",
      notificationTypes: ["deal_won", "deal_lost", "ticket_created"]
    },
    createdAt: new Date(2024, 0, 5),
    updatedAt: new Date()
  },
  {
    id: "int-3",
    name: "Facebook Ads",
    description: "Track ad performance and sync leads",
    category: "social_media",
    provider: "Meta",
    version: "v18.0",
    status: "error",
    isEnabled: false,
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    syncFrequency: "daily",
    dataMapping: [
      { id: "map-5", source: "lead_ads", target: "crm_leads", isActive: false }
    ],
    credentials: {
      type: "oauth",
      accessToken: "EAA...",
      expiresAt: new Date(Date.now() - 3600000) // Expired
    },
    permissions: ["ads_read", "leads_retrieval"],
    usage: {
      apiCalls: 0,
      rateLimitRemaining: 10000,
      quotaUsed: 0,
      quotaTotal: 100
    },
    settings: {
      adAccountId: "act_123456789",
      leadFormIds: ["123456", "789012"]
    },
    createdAt: new Date(2024, 0, 10),
    updatedAt: new Date()
  }
]

const statusColors = {
  connected: "bg-green-100 text-green-800",
  disconnected: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800"
}

const categoryIcons = {
  productivity: CloudIcon,
  social_media: FacebookIcon,
  communication: SlackIcon,
  storage: DatabaseIcon,
  analytics: SettingsIcon,
  crm: DatabaseIcon,
  marketing: ZapIcon
}

export function ApiIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null)
  const [activeTab, setActiveTab] = useState("integrations")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const filteredIntegrations = useMemo(() => {
    return integrations.filter(integration => {
      const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           integration.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !categoryFilter || integration.category === categoryFilter
      const matchesStatus = !statusFilter || integration.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [integrations, searchQuery, categoryFilter, statusFilter])

  const filteredTemplates = useMemo(() => {
    return integrationTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !categoryFilter || template.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, categoryFilter])

  const stats = useMemo(() => {
    const total = integrations.length
    const connected = integrations.filter(i => i.status === "connected").length
    const active = integrations.filter(i => i.isEnabled).length
    const totalApiCalls = integrations.reduce((sum, i) => sum + i.usage.apiCalls, 0)

    return { total, connected, active, totalApiCalls }
  }, [integrations])

  const handleConnectIntegration = (template: IntegrationTemplate) => {
    setSelectedTemplate(template)
    setIsConnectDialogOpen(true)
  }

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ))
  }

  const handleDisconnectIntegration = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: "disconnected", isEnabled: false }
        : integration
    ))
  }

  const handleSyncNow = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, lastSync: new Date() }
        : integration
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Integrations</h1>
          <p className="text-muted-foreground">Connect your CRM with external services and applications</p>
        </div>
        <Button onClick={() => setIsConnectDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApiCalls.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">My Integrations</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Integrations</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations..."
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
                      <SelectItem value="connected">Connected</SelectItem>
                      <SelectItem value="disconnected">Disconnected</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredIntegrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{integration.provider === "Google" ? "🔗" : integration.provider === "Slack" ? "💬" : "📘"}</div>
                        <div>
                          <h3 className="font-medium">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusColors[integration.status]}>
                              {integration.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {integration.category.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              v{integration.version}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          {integration.lastSync && (
                            <div>Last sync: {format(integration.lastSync, 'MMM dd, HH:mm')}</div>
                          )}
                          <div className="text-muted-foreground">
                            {integration.usage.apiCalls} API calls
                          </div>
                        </div>
                        <Switch
                          checked={integration.isEnabled}
                          onCheckedChange={() => handleToggleIntegration(integration.id)}
                          disabled={integration.status !== "connected"}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedIntegration(integration)}>
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSyncNow(integration.id)}>
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Logs</DropdownMenuItem>
                            <Separator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDisconnectIntegration(integration.id)}
                            >
                              Disconnect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {integration.status === "error" && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangleIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">Connection Error</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          Authentication token has expired. Please reconnect to restore functionality.
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {filteredIntegrations.length === 0 && (
                  <div className="text-center py-8">
                    <PlugIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No integrations found</h3>
                    <p className="text-muted-foreground">
                      Connect with external services to enhance your CRM capabilities.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Integration Marketplace</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="crm">CRM</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{template.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{template.provider}</p>
                          </div>
                        </div>
                        {template.isPopular && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.features.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{template.rating}</span>
                          <span>({template.installations.toLocaleString()})</span>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleConnectIntegration(template)}
                          disabled={integrations.some(i => i.name === template.name)}
                        >
                          {integrations.some(i => i.name === template.name) ? "Connected" : "Connect"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookManagement />
        </TabsContent>
      </Tabs>

      {/* Integration Configuration Dialog */}
      {selectedIntegration && (
        <IntegrationConfigDialog
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onUpdate={(updates) => {
            setIntegrations(integrations.map(i => 
              i.id === selectedIntegration.id ? { ...i, ...updates } : i
            ))
            setSelectedIntegration(null)
          }}
        />
      )}

      {/* Connect Integration Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect Integration</DialogTitle>
            <DialogDescription>
              Set up a new integration to connect your CRM with external services.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate ? (
            <ConnectIntegrationForm 
              template={selectedTemplate}
              onConnect={(integrationData) => {
                const newIntegration: Integration = {
                  id: `int-${integrations.length + 1}`,
                  name: selectedTemplate.name,
                  description: selectedTemplate.description,
                  category: selectedTemplate.category as any,
                  provider: selectedTemplate.provider,
                  version: "v1.0",
                  status: "pending",
                  isEnabled: true,
                  syncFrequency: "hourly",
                  dataMapping: [],
                  credentials: integrationData.credentials,
                  permissions: [],
                  usage: {
                    apiCalls: 0,
                    rateLimitRemaining: 10000,
                    quotaUsed: 0,
                    quotaTotal: 100
                  },
                  settings: integrationData.settings || {},
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
                setIntegrations([...integrations, newIntegration])
                setIsConnectDialogOpen(false)
                setSelectedTemplate(null)
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {integrationTemplates.filter(t => t.isPopular).map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTemplate(template)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xl">{template.icon}</div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IntegrationConfigDialog({
  integration,
  onClose,
  onUpdate
}: {
  integration: Integration
  onClose: () => void
  onUpdate: (updates: Partial<Integration>) => void
}) {
  const [settings, setSettings] = useState(integration.settings)
  const [syncFrequency, setSyncFrequency] = useState(integration.syncFrequency)

  const handleSave = () => {
    onUpdate({ settings, syncFrequency })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {integration.name}</DialogTitle>
          <DialogDescription>
            Manage settings and data mapping for this integration.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Sync Frequency</Label>
                <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_time">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {Object.entries(settings).map(([key, value]) => (
                <div key={key}>
                  <Label className="capitalize">{key.replace('_', ' ')}</Label>
                  <Input
                    value={value?.toString() || ""}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mapping" className="space-y-4">
            <div className="space-y-3">
              {integration.dataMapping.map((mapping) => (
                <div key={mapping.id} className="flex items-center gap-4 p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{mapping.source}</div>
                    <div className="text-sm text-muted-foreground">→ {mapping.target}</div>
                  </div>
                  <Switch checked={mapping.isActive} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">API Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integration.usage.apiCalls}</div>
                  <div className="text-sm text-muted-foreground">
                    {integration.usage.rateLimitRemaining} remaining
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quota Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integration.usage.quotaUsed}%</div>
                  <div className="text-sm text-muted-foreground">
                    of {integration.usage.quotaTotal}% limit
                  </div>
                </CardContent>
              </Card>
            </div>
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

function ConnectIntegrationForm({
  template,
  onConnect
}: {
  template: IntegrationTemplate
  onConnect: (data: { credentials: any; settings?: any }) => void
}) {
  const [apiKey, setApiKey] = useState("")
  const [settings, setSettings] = useState<Record<string, string>>({})

  const handleConnect = () => {
    if (template.authType === "api_key") {
      onConnect({
        credentials: { type: "api_key", apiKey },
        settings
      })
    } else {
      // For OAuth, this would redirect to the provider's auth page
      onConnect({
        credentials: { type: "oauth", accessToken: "mock_token" },
        settings
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <div className="text-2xl">{template.icon}</div>
        <div>
          <h3 className="font-medium">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
      </div>

      {template.authType === "api_key" ? (
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
          <p className="text-sm text-muted-foreground">
            You can find your API key in your {template.provider} account settings.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>OAuth Authentication</Label>
          <p className="text-sm text-muted-foreground">
            Click connect to authorize this integration with your {template.provider} account.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => window.open(template.documentation)}>
          <ExternalLinkIcon className="h-4 w-4 mr-2" />
          Documentation
        </Button>
        <Button onClick={handleConnect} disabled={template.authType === "api_key" && !apiKey}>
          Connect {template.name}
        </Button>
      </div>
    </div>
  )
}

function WebhookManagement() {
  const [webhooks, setWebhooks] = useState([
    {
      id: "webhook-1",
      name: "Deal Updates",
      url: "https://api.example.com/webhooks/deals",
      events: ["deal.created", "deal.updated", "deal.won"],
      status: "active",
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Webhook Endpoints</CardTitle>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>
        <CardDescription>
          Configure webhook endpoints to receive real-time notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{webhook.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                  <div className="flex gap-1 mt-2">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={webhook.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {webhook.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Test Webhook</DropdownMenuItem>
                      <DropdownMenuItem>View Logs</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <Separator />
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Last triggered: {format(webhook.lastTriggered, 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
