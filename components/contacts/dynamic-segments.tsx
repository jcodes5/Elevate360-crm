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
import { UsersIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, FilterIcon, TrendingUpIcon, TrendingDownIcon, EqualIcon, NotEqualIcon, TargetIcon, CalendarIcon, ClockIcon, MailIcon, PhoneIcon, DollarSignIcon, TagIcon, MapPinIcon, BuildingIcon, UserIcon, ActivityIcon, ZapIcon, PlayIcon, PauseIcon, RefreshCwIcon, EyeIcon, DownloadIcon, Settings2Icon, XIcon } from "lucide-react"
import { format, subDays, subWeeks, subMonths } from "date-fns"

interface DynamicSegment {
  id: string
  name: string
  description: string
  conditions: SegmentCondition[]
  logicalOperator: "AND" | "OR"
  isActive: boolean
  isDynamic: boolean
  updateFrequency: "real_time" | "hourly" | "daily" | "weekly"
  contactCount: number
  lastUpdated: Date
  createdAt: Date
  tags: string[]
  campaigns?: string[]
  automations?: string[]
}

interface SegmentCondition {
  id: string
  type: "attribute" | "behavior" | "engagement" | "demographic" | "custom"
  field: string
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "between" | "in" | "not_in" | "exists" | "not_exists" | "date_range"
  value: any
  value2?: any // For between operations
  logicalOperator?: "AND" | "OR"
}

interface SegmentTemplate {
  id: string
  name: string
  description: string
  category: "behavioral" | "demographic" | "engagement" | "sales" | "support"
  conditions: Omit<SegmentCondition, 'id'>[]
  isPopular: boolean
  usage: number
}

// Segment field definitions
const segmentFields = {
  attribute: [
    { value: "email", label: "Email", type: "string" },
    { value: "first_name", label: "First Name", type: "string" },
    { value: "last_name", label: "Last Name", type: "string" },
    { value: "phone", label: "Phone", type: "string" },
    { value: "company", label: "Company", type: "string" },
    { value: "title", label: "Job Title", type: "string" },
    { value: "location", label: "Location", type: "string" },
    { value: "status", label: "Status", type: "select", options: ["active", "inactive", "lead", "customer"] },
    { value: "source", label: "Lead Source", type: "select", options: ["website", "referral", "social", "ad", "event"] },
    { value: "tags", label: "Tags", type: "multi_select" },
    { value: "created_at", label: "Created Date", type: "date" },
    { value: "updated_at", label: "Updated Date", type: "date" }
  ],
  behavior: [
    { value: "page_views", label: "Page Views", type: "number" },
    { value: "session_count", label: "Session Count", type: "number" },
    { value: "time_on_site", label: "Time on Site (minutes)", type: "number" },
    { value: "last_activity", label: "Last Activity", type: "date" },
    { value: "pages_visited", label: "Pages Visited", type: "multi_select" },
    { value: "downloads", label: "Downloads", type: "number" },
    { value: "form_submissions", label: "Form Submissions", type: "number" },
    { value: "chat_sessions", label: "Chat Sessions", type: "number" },
    { value: "support_tickets", label: "Support Tickets", type: "number" }
  ],
  engagement: [
    { value: "email_opens", label: "Email Opens", type: "number" },
    { value: "email_clicks", label: "Email Clicks", type: "number" },
    { value: "email_bounces", label: "Email Bounces", type: "number" },
    { value: "email_unsubscribes", label: "Email Unsubscribes", type: "number" },
    { value: "campaign_engagement", label: "Campaign Engagement Score", type: "number" },
    { value: "social_engagement", label: "Social Media Engagement", type: "number" },
    { value: "webinar_attendance", label: "Webinar Attendance", type: "number" },
    { value: "event_attendance", label: "Event Attendance", type: "number" }
  ],
  demographic: [
    { value: "age", label: "Age", type: "number" },
    { value: "gender", label: "Gender", type: "select", options: ["male", "female", "other", "prefer_not_to_say"] },
    { value: "country", label: "Country", type: "string" },
    { value: "state", label: "State/Province", type: "string" },
    { value: "city", label: "City", type: "string" },
    { value: "timezone", label: "Timezone", type: "string" },
    { value: "language", label: "Language", type: "select", options: ["en", "es", "fr", "de", "it", "pt"] },
    { value: "industry", label: "Industry", type: "string" },
    { value: "company_size", label: "Company Size", type: "select", options: ["1-10", "11-50", "51-200", "201-500", "500+"] }
  ],
  sales: [
    { value: "deal_value", label: "Total Deal Value", type: "number" },
    { value: "deal_count", label: "Number of Deals", type: "number" },
    { value: "avg_deal_size", label: "Average Deal Size", type: "number" },
    { value: "last_purchase", label: "Last Purchase Date", type: "date" },
    { value: "customer_lifetime_value", label: "Customer Lifetime Value", type: "number" },
    { value: "payment_method", label: "Payment Method", type: "select", options: ["credit_card", "bank_transfer", "invoice", "check"] },
    { value: "subscription_status", label: "Subscription Status", type: "select", options: ["active", "inactive", "trial", "cancelled"] }
  ]
}

// Operator definitions
const operators = {
  string: [
    { value: "equals", label: "Equals", icon: EqualIcon },
    { value: "not_equals", label: "Not Equals", icon: NotEqualIcon },
    { value: "contains", label: "Contains", icon: SearchIcon },
    { value: "not_contains", label: "Does Not Contain", icon: XIcon },
    { value: "exists", label: "Exists", icon: EyeIcon },
    { value: "not_exists", label: "Does Not Exist", icon: EyeIcon }
  ],
  number: [
    { value: "equals", label: "Equals", icon: EqualIcon },
    { value: "not_equals", label: "Not Equals", icon: NotEqualIcon },
    { value: "greater_than", label: "Greater Than", icon: TrendingUpIcon },
    { value: "less_than", label: "Less Than", icon: TrendingDownIcon },
    { value: "between", label: "Between", icon: FilterIcon }
  ],
  date: [
    { value: "equals", label: "Equals", icon: EqualIcon },
    { value: "greater_than", label: "After", icon: TrendingUpIcon },
    { value: "less_than", label: "Before", icon: TrendingDownIcon },
    { value: "between", label: "Between", icon: FilterIcon },
    { value: "date_range", label: "Date Range", icon: CalendarIcon }
  ],
  select: [
    { value: "equals", label: "Equals", icon: EqualIcon },
    { value: "not_equals", label: "Not Equals", icon: NotEqualIcon },
    { value: "in", label: "In", icon: FilterIcon },
    { value: "not_in", label: "Not In", icon: XIcon }
  ]
}

// Segment templates
const segmentTemplates: SegmentTemplate[] = [
  {
    id: "high-value-customers",
    name: "High-Value Customers",
    description: "Customers with lifetime value > $10,000",
    category: "sales",
    conditions: [
      {
        type: "sales",
        field: "customer_lifetime_value",
        operator: "greater_than",
        value: 10000
      }
    ],
    isPopular: true,
    usage: 245
  },
  {
    id: "engaged-email-subscribers",
    name: "Engaged Email Subscribers",
    description: "Contacts who opened emails in the last 30 days",
    category: "engagement",
    conditions: [
      {
        type: "engagement",
        field: "email_opens",
        operator: "greater_than",
        value: 0
      },
      {
        type: "behavior",
        field: "last_activity",
        operator: "greater_than",
        value: subDays(new Date(), 30)
      }
    ],
    isPopular: true,
    usage: 189
  },
  {
    id: "inactive-leads",
    name: "Inactive Leads",
    description: "Leads with no activity in the last 60 days",
    category: "behavioral",
    conditions: [
      {
        type: "attribute",
        field: "status",
        operator: "equals",
        value: "lead"
      },
      {
        type: "behavior",
        field: "last_activity",
        operator: "less_than",
        value: subDays(new Date(), 60)
      }
    ],
    isPopular: true,
    usage: 156
  },
  {
    id: "enterprise-prospects",
    name: "Enterprise Prospects",
    description: "Companies with 500+ employees",
    category: "demographic",
    conditions: [
      {
        type: "demographic",
        field: "company_size",
        operator: "equals",
        value: "500+"
      }
    ],
    isPopular: false,
    usage: 78
  },
  {
    id: "support-heavy-users",
    name: "Support Heavy Users",
    description: "Contacts with 5+ support tickets",
    category: "support",
    conditions: [
      {
        type: "behavior",
        field: "support_tickets",
        operator: "greater_than",
        value: 5
      }
    ],
    isPopular: false,
    usage: 92
  }
]

// Mock segments
const mockSegments: DynamicSegment[] = [
  {
    id: "seg-1",
    name: "High-Value Customers",
    description: "Customers with lifetime value greater than $10,000",
    conditions: [
      {
        id: "cond-1",
        type: "sales",
        field: "customer_lifetime_value",
        operator: "greater_than",
        value: 10000
      }
    ],
    logicalOperator: "AND",
    isActive: true,
    isDynamic: true,
    updateFrequency: "daily",
    contactCount: 156,
    lastUpdated: new Date(),
    createdAt: new Date(2024, 0, 1),
    tags: ["high-value", "customers"],
    campaigns: ["VIP Campaign", "Premium Offers"],
    automations: ["VIP Onboarding"]
  },
  {
    id: "seg-2",
    name: "Engaged Email Subscribers",
    description: "Active email subscribers with high engagement",
    conditions: [
      {
        id: "cond-2",
        type: "engagement",
        field: "email_opens",
        operator: "greater_than",
        value: 10
      },
      {
        id: "cond-3",
        type: "behavior",
        field: "last_activity",
        operator: "greater_than",
        value: subDays(new Date(), 30)
      }
    ],
    logicalOperator: "AND",
    isActive: true,
    isDynamic: true,
    updateFrequency: "hourly",
    contactCount: 892,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(2024, 0, 5),
    tags: ["engaged", "email"],
    campaigns: ["Newsletter", "Product Updates"]
  },
  {
    id: "seg-3",
    name: "Inactive Leads",
    description: "Leads with no recent activity",
    conditions: [
      {
        id: "cond-4",
        type: "attribute",
        field: "status",
        operator: "equals",
        value: "lead"
      },
      {
        id: "cond-5",
        type: "behavior",
        field: "last_activity",
        operator: "less_than",
        value: subDays(new Date(), 60)
      }
    ],
    logicalOperator: "AND",
    isActive: false,
    isDynamic: true,
    updateFrequency: "weekly",
    contactCount: 234,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(2024, 0, 10),
    tags: ["inactive", "re-engagement"],
    automations: ["Re-engagement Campaign"]
  }
]

export function DynamicSegments() {
  const [segments, setSegments] = useState<DynamicSegment[]>(mockSegments)
  const [selectedSegment, setSelectedSegment] = useState<DynamicSegment | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("segments")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const filteredSegments = useMemo(() => {
    return segments.filter(segment => {
      const matchesSearch = segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           segment.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || 
        (statusFilter === "active" && segment.isActive) ||
        (statusFilter === "inactive" && !segment.isActive)
      return matchesSearch && matchesStatus
    })
  }, [segments, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = segments.length
    const active = segments.filter(s => s.isActive).length
    const dynamic = segments.filter(s => s.isDynamic).length
    const totalContacts = segments.reduce((sum, s) => sum + s.contactCount, 0)

    return { total, active, dynamic, totalContacts }
  }, [segments])

  const handleCreateSegment = (segmentData: Partial<DynamicSegment>) => {
    const newSegment: DynamicSegment = {
      id: `seg-${segments.length + 1}`,
      name: segmentData.name || "",
      description: segmentData.description || "",
      conditions: segmentData.conditions || [],
      logicalOperator: segmentData.logicalOperator || "AND",
      isActive: true,
      isDynamic: segmentData.isDynamic ?? true,
      updateFrequency: segmentData.updateFrequency || "daily",
      contactCount: Math.floor(Math.random() * 1000), // Simulated count
      lastUpdated: new Date(),
      createdAt: new Date(),
      tags: segmentData.tags || []
    }

    setSegments([newSegment, ...segments])
    setIsCreateDialogOpen(false)
  }

  const handleToggleSegment = (segmentId: string) => {
    setSegments(segments.map(segment =>
      segment.id === segmentId
        ? { ...segment, isActive: !segment.isActive, lastUpdated: new Date() }
        : segment
    ))
  }

  const handleRefreshSegment = (segmentId: string) => {
    setSegments(segments.map(segment =>
      segment.id === segmentId
        ? { 
            ...segment, 
            lastUpdated: new Date(),
            contactCount: Math.floor(Math.random() * 1000) // Simulated refresh
          }
        : segment
    ))
  }

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(segments.filter(s => s.id !== segmentId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Segments</h1>
          <p className="text-muted-foreground">Create intelligent segments based on customer behavior and attributes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Dynamic Segment</DialogTitle>
              <DialogDescription>
                Build a segment using behavioral data, attributes, and engagement metrics.
              </DialogDescription>
            </DialogHeader>
            <CreateSegmentForm 
              onSubmit={handleCreateSegment}
              templates={segmentTemplates}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dynamic Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.dynamic}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="segments">My Segments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Segment List</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search segments..."
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
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSegments.map((segment) => (
                  <div key={segment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <TargetIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-medium">{segment.name}</h3>
                            <p className="text-sm text-muted-foreground">{segment.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={segment.isActive ? "default" : "secondary"}>
                              {segment.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {segment.isDynamic && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <ZapIcon className="h-3 w-3 mr-1" />
                                Dynamic
                              </Badge>
                            )}
                            <Badge variant="outline">
                              Updates {segment.updateFrequency.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {segment.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {segment.conditions.length} condition(s) • 
                            Last updated {format(segment.lastUpdated, 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {segment.contactCount.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">contacts</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={segment.isActive}
                            onCheckedChange={() => handleToggleSegment(segment.id)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedSegment(segment)}>
                                <Settings2Icon className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRefreshSegment(segment.id)}>
                                <RefreshCwIcon className="h-4 w-4 mr-2" />
                                Refresh Now
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Contacts
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DownloadIcon className="h-4 w-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                              <Separator />
                              <DropdownMenuItem>
                                <MailIcon className="h-4 w-4 mr-2" />
                                Create Campaign
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ZapIcon className="h-4 w-4 mr-2" />
                                Add to Automation
                              </DropdownMenuItem>
                              <Separator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteSegment(segment.id)}
                              >
                                <XIcon className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* Conditions Preview */}
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium mb-2">Conditions:</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {segment.conditions.map((condition, index) => (
                          <div key={condition.id} className="flex items-center gap-1">
                            {index > 0 && (
                              <Badge variant="outline" className="text-xs px-1">
                                {segment.logicalOperator}
                              </Badge>
                            )}
                            <div className="bg-background border rounded px-2 py-1 text-xs">
                              <span className="font-medium">{condition.field}</span>
                              <span className="text-muted-foreground mx-1">{condition.operator.replace('_', ' ')}</span>
                              <span className="font-medium">
                                {typeof condition.value === 'object' 
                                  ? JSON.stringify(condition.value)
                                  : condition.value?.toString()
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Usage */}
                    {(segment.campaigns || segment.automations) && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        {segment.campaigns && segment.campaigns.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MailIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Used in {segment.campaigns.length} campaign(s)
                            </span>
                          </div>
                        )}
                        {segment.automations && segment.automations.length > 0 && (
                          <div className="flex items-center gap-1">
                            <ZapIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Used in {segment.automations.length} automation(s)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {filteredSegments.length === 0 && (
                  <div className="text-center py-8">
                    <TargetIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No segments found</h3>
                    <p className="text-muted-foreground">
                      Create your first dynamic segment to start organizing your contacts.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <SegmentTemplates templates={segmentTemplates} onUseTemplate={handleCreateSegment} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <SegmentAnalytics segments={segments} />
        </TabsContent>
      </Tabs>

      {/* Segment Configuration Dialog */}
      {selectedSegment && (
        <SegmentConfigDialog
          segment={selectedSegment}
          onClose={() => setSelectedSegment(null)}
          onUpdate={(updates) => {
            setSegments(segments.map(s => 
              s.id === selectedSegment.id ? { ...s, ...updates, lastUpdated: new Date() } : s
            ))
            setSelectedSegment(null)
          }}
        />
      )}
    </div>
  )
}

function CreateSegmentForm({ 
  onSubmit, 
  templates 
}: { 
  onSubmit: (data: Partial<DynamicSegment>) => void
  templates: SegmentTemplate[]
}) {
  const [formData, setFormData] = useState<Partial<DynamicSegment>>({
    name: "",
    description: "",
    conditions: [],
    logicalOperator: "AND",
    isDynamic: true,
    updateFrequency: "daily",
    tags: []
  })

  const [activeStep, setActiveStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<SegmentTemplate | null>(null)
  const steps = ["Template", "Basic Info", "Conditions", "Settings"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleUseTemplate = (template: SegmentTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      conditions: template.conditions.map((cond, index) => ({
        ...cond,
        id: `cond-${index}`
      }))
    })
    setActiveStep(1)
  }

  const handleAddCondition = () => {
    const newCondition: SegmentCondition = {
      id: `cond-${formData.conditions?.length || 0}`,
      type: "attribute",
      field: "status",
      operator: "equals",
      value: ""
    }
    setFormData({
      ...formData,
      conditions: [...(formData.conditions || []), newCondition]
    })
  }

  const handleUpdateCondition = (conditionId: string, updates: Partial<SegmentCondition>) => {
    setFormData({
      ...formData,
      conditions: formData.conditions?.map(cond =>
        cond.id === conditionId ? { ...cond, ...updates } : cond
      )
    })
  }

  const handleRemoveCondition = (conditionId: string) => {
    setFormData({
      ...formData,
      conditions: formData.conditions?.filter(cond => cond.id !== conditionId)
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
          <div>
            <h3 className="text-lg font-medium mb-2">Choose a Template</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start with a pre-built template or create from scratch
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:bg-muted/50 border-2 border-dashed"
              onClick={() => setActiveStep(1)}
            >
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <PlusIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-medium">Start from Scratch</h4>
                  <p className="text-sm text-muted-foreground">Build a custom segment</p>
                </div>
              </CardContent>
            </Card>

            {templates.filter(t => t.isPopular).map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleUseTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.conditions.length} condition(s)</span>
                    <span>{template.usage} uses</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Segment Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., High-Value Customers"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this segment and its purpose"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              placeholder="e.g., high-value, customers, priority"
            />
            <p className="text-sm text-muted-foreground">Separate tags with commas</p>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Segment Conditions</h3>
              <p className="text-sm text-muted-foreground">
                Define the criteria for contacts to be included in this segment
              </p>
            </div>
            <Button type="button" variant="outline" onClick={handleAddCondition}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>

          {formData.conditions && formData.conditions.length > 1 && (
            <div className="space-y-2">
              <Label>Logical Operator</Label>
              <Select 
                value={formData.logicalOperator} 
                onValueChange={(value: "AND" | "OR") => setFormData({ ...formData, logicalOperator: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {formData.logicalOperator === "AND" 
                  ? "Contacts must match ALL conditions"
                  : "Contacts must match ANY condition"
                }
              </p>
            </div>
          )}

          <div className="space-y-3">
            {formData.conditions?.map((condition, index) => (
              <ConditionBuilder
                key={condition.id}
                condition={condition}
                index={index}
                logicalOperator={formData.logicalOperator!}
                onUpdate={(updates) => handleUpdateCondition(condition.id, updates)}
                onRemove={() => handleRemoveCondition(condition.id)}
              />
            ))}

            {(!formData.conditions || formData.conditions.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <FilterIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No conditions added yet</p>
                <Button type="button" variant="outline" className="mt-2" onClick={handleAddCondition}>
                  Add First Condition
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.isDynamic}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                isDynamic: checked as boolean 
              })}
            />
            <Label>Enable dynamic updates</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Dynamic segments automatically update as contact data changes
          </p>

          {formData.isDynamic && (
            <div className="space-y-2">
              <Label>Update Frequency</Label>
              <Select 
                value={formData.updateFrequency} 
                onValueChange={(value: any) => setFormData({ ...formData, updateFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real_time">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
              (activeStep === 1 && !formData.name) ||
              (activeStep === 2 && (!formData.conditions || formData.conditions.length === 0))
            }
          >
            Next
          </Button>
        ) : (
          <Button type="submit">Create Segment</Button>
        )}
      </div>
    </form>
  )
}

function ConditionBuilder({
  condition,
  index,
  logicalOperator,
  onUpdate,
  onRemove
}: {
  condition: SegmentCondition
  index: number
  logicalOperator: string
  onUpdate: (updates: Partial<SegmentCondition>) => void
  onRemove: () => void
}) {
  const availableFields = segmentFields[condition.type] || []
  const selectedField = availableFields.find(f => f.value === condition.field)
  const availableOperators = selectedField ? operators[selectedField.type] || [] : []

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {index > 0 && (
            <Badge variant="outline" className="text-xs">
              {logicalOperator}
            </Badge>
          )}
          <span className="text-sm font-medium">Condition {index + 1}</span>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select 
            value={condition.type} 
            onValueChange={(value: any) => onUpdate({ type: value, field: "", operator: "equals", value: "" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attribute">Attribute</SelectItem>
              <SelectItem value="behavior">Behavior</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="demographic">Demographic</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Field</Label>
          <Select 
            value={condition.field} 
            onValueChange={(value) => onUpdate({ field: value, operator: "equals", value: "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Operator</Label>
          <Select 
            value={condition.operator} 
            onValueChange={(value: any) => onUpdate({ operator: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {availableOperators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Value</Label>
          {selectedField?.type === "select" ? (
            <Select 
              value={condition.value} 
              onValueChange={(value) => onUpdate({ value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {selectedField.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : selectedField?.type === "date" ? (
            <Input
              type="date"
              value={condition.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
            />
          ) : selectedField?.type === "number" ? (
            <Input
              type="number"
              value={condition.value}
              onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
              placeholder="Enter number"
            />
          ) : (
            <Input
              value={condition.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder="Enter value"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SegmentConfigDialog({
  segment,
  onClose,
  onUpdate
}: {
  segment: DynamicSegment
  onClose: () => void
  onUpdate: (updates: Partial<DynamicSegment>) => void
}) {
  const [settings, setSettings] = useState(segment)

  const handleSave = () => {
    onUpdate(settings)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configure {segment.name}</DialogTitle>
          <DialogDescription>
            Manage segment settings, conditions, and automation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
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
                <Label htmlFor="updateFrequency">Update Frequency</Label>
                <Select 
                  value={settings.updateFrequency} 
                  onValueChange={(value: any) => setSettings({ ...settings, updateFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_time">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.isDynamic}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  isDynamic: checked as boolean
                })}
              />
              <Label>Enable dynamic updates</Label>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="space-y-3">
              {settings.conditions.map((condition) => (
                <div key={condition.id} className="p-3 border rounded">
                  <div className="font-medium">{condition.field}</div>
                  <div className="text-sm text-muted-foreground">
                    {condition.operator.replace('_', ' ')} {condition.value}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Current Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{settings.contactCount}</div>
                  <div className="text-sm text-muted-foreground">contacts</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {format(settings.lastUpdated, 'MMM dd, yyyy HH:mm')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {settings.campaigns && settings.campaigns.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Used in Campaigns</h4>
                <div className="space-y-1">
                  {settings.campaigns.map((campaign) => (
                    <div key={campaign} className="text-sm p-2 bg-muted rounded">
                      {campaign}
                    </div>
                  ))}
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

function SegmentTemplates({ 
  templates, 
  onUseTemplate 
}: { 
  templates: SegmentTemplate[]
  onUseTemplate: (template: Partial<DynamicSegment>) => void 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segment Templates</CardTitle>
        <CardDescription>Pre-built segments for common use cases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {template.conditions.length} condition(s)
                  </span>
                  <span className="text-muted-foreground">
                    {template.usage} uses
                  </span>
                </div>

                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => onUseTemplate({
                    name: template.name,
                    description: template.description,
                    conditions: template.conditions.map((cond, index) => ({
                      ...cond,
                      id: `cond-${index}`
                    }))
                  })}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SegmentAnalytics({ segments }: { segments: DynamicSegment[] }) {
  const activeSegments = segments.filter(s => s.isActive)
  const totalContacts = segments.reduce((sum, s) => sum + s.contactCount, 0)
  const avgSegmentSize = totalContacts / Math.max(segments.length, 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Segment Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgSegmentSize).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">contacts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Behavioral</div>
            <div className="text-sm text-muted-foreground">segment type</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Update Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Daily</div>
            <div className="text-sm text-muted-foreground">most common</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segment Performance</CardTitle>
          <CardDescription>Size and activity metrics for your segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSegments.map((segment) => (
              <div key={segment.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">{segment.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {segment.contactCount.toLocaleString()} contacts • 
                    Updated {format(segment.lastUpdated, 'MMM dd')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {((segment.contactCount / totalContacts) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">of total</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
