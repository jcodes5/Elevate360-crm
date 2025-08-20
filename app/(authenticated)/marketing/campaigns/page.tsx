"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  MessageSquare, 
  Edit, 
  Trash2, 
  Send, 
  Pause, 
  Play, 
  Eye, 
  BarChart3, 
  Users, 
  Calendar,
  Sliders,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import { CampaignService } from "@/services/campaign-service"
import { CampaignModel, CampaignSearchParams } from "@/lib/models"
import { CreateCampaignModal } from "@/components/modals/create-campaign-modal"
import { CampaignAdvancedFilters } from "@/components/campaigns/campaign-advanced-filters"
import { toast } from "@/hooks/use-toast"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Mock data for initial implementation
const mockCampaigns: CampaignModel[] = [
  {
    id: "1",
    name: "Welcome Email Series",
    description: "Automated welcome sequence for new subscribers",
    type: "email",
    category: "onboarding",
    channel: "email",
    objective: "awareness",
    subject: "Welcome to Elevate360 CRM!",
    content: "Thank you for joining us. Here's how to get started...",
    targetAudience: {
      totalSize: 1250,
      targetCriteria: {
        behavioral: {
          tags: ["new-signups", "prospects"]
        }
      },
      dynamicSegmentation: true,
      lastUpdated: new Date("2024-01-25")
    },
    segmentIds: [],
    listIds: [],
    status: "sent",
    timezone: "Africa/Lagos",
    isABTest: false,
    personalizationFields: [],
    trackingEnabled: true,
    metrics: {
      sent: 1250,
      delivered: 1235,
      bounced: 15,
      opened: 556,
      clicked: 78,
      replied: 12,
      forwarded: 5,
      unsubscribed: 3,
      spamReports: 1,
      conversions: 8,
      revenue: 25000,
      deliveryRate: 98.8,
      openRate: 45.0,
      clickRate: 6.3,
      clickToOpenRate: 14.0,
      conversionRate: 0.64,
      unsubscribeRate: 0.24,
      spamRate: 0.08,
      bounceRate: 1.2,
      totalEngagementTime: 125000,
      averageEngagementTime: 100,
      returnVisits: 45,
      socialShares: 12,
      totalRevenue: 25000,
      averageOrderValue: 3125,
      returnOnInvestment: 3.2,
      costPerAcquisition: 312.5,
      lifetimeValue: 15625
    },
    organizationId: "org-1",
    createdBy: "admin",
    complianceChecks: [],
    gdprCompliant: true,
    canSpamCompliant: true,
    customFields: {},
    tags: ["welcome", "onboarding"],
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25")
  },
  {
    id: "2",
    name: "Product Feature Announcement",
    description: "Announcing new features in our analytics dashboard",
    type: "email",
    category: "announcement",
    channel: "email",
    objective: "engagement",
    subject: "New Features: Enhanced Analytics Dashboard",
    content: "We're excited to announce new features that will help you...",
    targetAudience: {
      totalSize: 2500,
      targetCriteria: {
        behavioral: {
          tags: ["customers", "active-users"]
        }
      },
      dynamicSegmentation: true,
      lastUpdated: new Date("2024-01-28")
    },
    segmentIds: [],
    listIds: [],
    status: "scheduled",
    scheduledAt: new Date("2024-02-01T14:00:00"),
    timezone: "Africa/Lagos",
    isABTest: false,
    personalizationFields: [],
    trackingEnabled: true,
    metrics: {
      sent: 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      forwarded: 0,
      unsubscribed: 0,
      spamReports: 0,
      conversions: 0,
      revenue: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      clickToOpenRate: 0,
      conversionRate: 0,
      unsubscribeRate: 0,
      spamRate: 0,
      bounceRate: 0,
      totalEngagementTime: 0,
      averageEngagementTime: 0,
      returnVisits: 0,
      socialShares: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      returnOnInvestment: 0,
      costPerAcquisition: 0,
      lifetimeValue: 0
    },
    organizationId: "org-1",
    createdBy: "marketing-manager",
    complianceChecks: [],
    gdprCompliant: true,
    canSpamCompliant: true,
    customFields: {},
    tags: ["product-update", "feature"],
    createdAt: new Date("2024-01-28"),
    updatedAt: new Date("2024-01-28")
  },
  {
    id: "3",
    name: "WhatsApp Promo Campaign",
    description: "Special offer promotion via WhatsApp",
    type: "whatsapp",
    category: "promotional",
    channel: "whatsapp",
    objective: "conversion",
    content: "🎉 Special offer just for you! Get 20% off your next purchase. Use code SAVE20. Valid until end of month.",
    targetAudience: {
      totalSize: 450,
      targetCriteria: {
        behavioral: {
          tags: ["high-value-customers"]
        }
      },
      dynamicSegmentation: true,
      lastUpdated: new Date("2024-01-26")
    },
    segmentIds: [],
    listIds: [],
    status: "sent",
    sentAt: new Date("2024-01-26T11:02:00"),
    timezone: "Africa/Lagos",
    isABTest: false,
    personalizationFields: [],
    trackingEnabled: true,
    metrics: {
      sent: 450,
      delivered: 448,
      bounced: 2,
      opened: 389,
      clicked: 45,
      replied: 23,
      forwarded: 8,
      unsubscribed: 1,
      spamReports: 0,
      conversions: 12,
      revenue: 15000,
      deliveryRate: 99.6,
      openRate: 86.8,
      clickRate: 10.0,
      clickToOpenRate: 11.6,
      conversionRate: 2.7,
      unsubscribeRate: 0.22,
      spamRate: 0,
      bounceRate: 0.45,
      totalEngagementTime: 45000,
      averageEngagementTime: 115,
      returnVisits: 18,
      socialShares: 5,
      totalRevenue: 15000,
      averageOrderValue: 1250,
      returnOnInvestment: 4.5,
      costPerAcquisition: 1250,
      lifetimeValue: 7500
    },
    organizationId: "org-1",
    createdBy: "sales-manager",
    complianceChecks: [],
    gdprCompliant: true,
    canSpamCompliant: true,
    customFields: {},
    tags: ["promo", "whatsapp"],
    createdAt: new Date("2024-01-24"),
    updatedAt: new Date("2024-01-26")
  },
  {
    id: "4",
    name: "SMS Payment Reminder",
    description: "Automated payment reminder for overdue invoices",
    type: "sms",
    category: "retention",
    channel: "sms",
    objective: "conversion",
    content: "Hi! Your invoice #12345 is due tomorrow. Pay now: https://pay.elevate360.ng/12345",
    targetAudience: {
      totalSize: 89,
      targetCriteria: {
        behavioral: {
          tags: ["overdue-customers"]
        }
      },
      dynamicSegmentation: true,
      lastUpdated: new Date("2024-01-30")
    },
    segmentIds: [],
    listIds: [],
    status: "sending",
    scheduledAt: new Date("2024-01-30T08:00:00"),
    timezone: "Africa/Lagos",
    isABTest: false,
    personalizationFields: [],
    trackingEnabled: true,
    metrics: {
      sent: 89,
      delivered: 87,
      bounced: 2,
      opened: 65,
      clicked: 23,
      replied: 5,
      forwarded: 2,
      unsubscribed: 0,
      spamReports: 0,
      conversions: 18,
      revenue: 27000,
      deliveryRate: 97.8,
      openRate: 73.0,
      clickRate: 25.9,
      clickToOpenRate: 35.4,
      conversionRate: 20.2,
      unsubscribeRate: 0,
      spamRate: 0,
      bounceRate: 2.3,
      totalEngagementTime: 18000,
      averageEngagementTime: 277,
      returnVisits: 8,
      socialShares: 1,
      totalRevenue: 27000,
      averageOrderValue: 1500,
      returnOnInvestment: 5.4,
      costPerAcquisition: 1500,
      lifetimeValue: 9000
    },
    organizationId: "org-1",
    createdBy: "admin",
    complianceChecks: [],
    gdprCompliant: true,
    canSpamCompliant: true,
    customFields: {},
    tags: ["payment", "reminder"],
    createdAt: new Date("2024-01-29"),
    updatedAt: new Date("2024-01-30")
  },
  {
    id: "5",
    name: "Monthly Newsletter",
    description: "Monthly industry insights and company updates",
    type: "email",
    category: "newsletter",
    channel: "email",
    objective: "engagement",
    subject: "February 2024 Newsletter - Industry Insights",
    content: "Dear subscriber, here are the latest updates from our industry...",
    targetAudience: {
      totalSize: 3200,
      targetCriteria: {
        behavioral: {
          tags: ["newsletter-subscribers"]
        }
      },
      dynamicSegmentation: true,
      lastUpdated: new Date("2024-01-30")
    },
    segmentIds: [],
    listIds: [],
    status: "draft",
    timezone: "Africa/Lagos",
    isABTest: false,
    personalizationFields: [],
    trackingEnabled: true,
    metrics: {
      sent: 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      forwarded: 0,
      unsubscribed: 0,
      spamReports: 0,
      conversions: 0,
      revenue: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      clickToOpenRate: 0,
      conversionRate: 0,
      unsubscribeRate: 0,
      spamRate: 0,
      bounceRate: 0,
      totalEngagementTime: 0,
      averageEngagementTime: 0,
      returnVisits: 0,
      socialShares: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      returnOnInvestment: 0,
      costPerAcquisition: 0,
      lifetimeValue: 0
    },
    organizationId: "org-1",
    createdBy: "content-manager",
    complianceChecks: [],
    gdprCompliant: true,
    canSpamCompliant: true,
    customFields: {},
    tags: ["newsletter", "monthly"],
    createdAt: new Date("2024-01-29"),
    updatedAt: new Date("2024-01-30")
  }
]

// Mock campaign stats for dashboard
const mockCampaignStats = {
  total: 25,
  sent: 12,
  scheduled: 5,
  draft: 8,
  byType: {
    email: 15,
    sms: 5,
    whatsapp: 5
  },
  byStatus: {
    draft: 8,
    scheduled: 5,
    sending: 2,
    sent: 10,
    paused: 0,
    completed: 0,
    cancelled: 0,
    failed: 0
  },
  byChannel: {
    email: 15,
    sms: 5,
    whatsapp: 5,
    push_notification: 0,
    social_media: 0,
    direct_mail: 0,
    webinar: 0,
    survey: 0,
    drip_sequence: 0,
    trigger_based: 0,
    multi_channel: 0
  },
  totalSent: 2039,
  totalDelivered: 2007,
  totalOpened: 1079,
  totalClicked: 174,
  averageOpenRate: 53.0,
  averageClickRate: 8.6,
  totalRevenue: 67000
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignModel[]>(mockCampaigns)
  const [campaignStats, setCampaignStats] = useState(mockCampaignStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [channelFilter, setChannelFilter] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  
  // Add state for advanced filters
  const [filters, setFilters] = useState<any[]>([])
  
  // Fetch campaigns from database (mocked for now)
  useEffect(() => {
    let isMounted = true;
    
    const fetchCampaigns = async (retryCount = 3) => {
      for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
          if (!isMounted) return;
          
          console.log(`Fetching campaigns from database (attempt ${attempt})`);
          setLoading(true)
          setError(null)
          
          // In a real implementation, this would call CampaignService.getAllCampaigns()
          // const fetchedCampaigns = await CampaignService.getAllCampaigns()
          const fetchedCampaigns = mockCampaigns
          
          if (!isMounted) return;
          
          setCampaigns(fetchedCampaigns)
          console.log("Campaigns fetched successfully:", fetchedCampaigns);
          return fetchedCampaigns;
        } catch (error) {
          console.error(`Error fetching campaigns on attempt ${attempt}:`, error)
          
          if (attempt === retryCount) {
            if (!isMounted) return;
            setError("Failed to load campaigns. Please try again.")
            setLoading(false)
            return null;
          }
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    fetchCampaigns()
    
    return () => {
      isMounted = false;
    }
  }, [])
  
  // Filter campaigns based on search and filters
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = !searchQuery || 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(campaign.status)
      const matchesType = typeFilter.length === 0 || typeFilter.includes(campaign.type)
      const matchesChannel = channelFilter.length === 0 || channelFilter.includes(campaign.channel)
      
      // Apply filters from AdvancedFilters component
      const matchesFilters = filters.length === 0 || filters.every(filter => {
        // This is a simplified filter check - in a real app, you would implement proper filtering logic
        return true
      })
      
      // Tab filtering
      const matchesTab = activeTab === "all" || 
                        (activeTab === "active" && ["sending", "scheduled"].includes(campaign.status)) ||
                        (activeTab === "sent" && campaign.status === "sent") ||
                        (activeTab === "draft" && campaign.status === "draft")
      
      return matchesSearch && matchesStatus && matchesType && matchesChannel && matchesFilters && matchesTab
    })
  }, [searchQuery, statusFilter, typeFilter, channelFilter, filters, activeTab, campaigns])
  
  // Prepare data for charts
  const statusData = [
    { name: 'Draft', value: campaignStats.byStatus.draft },
    { name: 'Scheduled', value: campaignStats.byStatus.scheduled },
    { name: 'Sending', value: campaignStats.byStatus.sending },
    { name: 'Sent', value: campaignStats.byStatus.sent },
    { name: 'Paused', value: campaignStats.byStatus.paused },
    { name: 'Completed', value: campaignStats.byStatus.completed },
    { name: 'Cancelled', value: campaignStats.byStatus.cancelled },
    { name: 'Failed', value: campaignStats.byStatus.failed },
  ]
  
  const channelData = Object.entries(campaignStats.byChannel)
    .map(([channel, count]) => ({ name: channel, value: count }))
    .filter(item => item.value > 0)
  
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
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  
  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    )
  }
  
  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    )
  }
  
  const toggleChannelFilter = (channel: string) => {
    setChannelFilter(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel]
    )
  }
  
  // Function to refresh campaigns with retry logic
  const refreshCampaigns = async () => {
    let isMounted = true;
    
    try {
      console.log("Refreshing campaigns");
      setLoading(true)
      setError(null)
      
      // In a real implementation, this would call CampaignService.getAllCampaigns()
      // const fetchedCampaigns = await CampaignService.getAllCampaigns()
      const fetchedCampaigns = mockCampaigns
      
      if (isMounted) {
        setCampaigns(fetchedCampaigns)
        console.log("Campaigns refreshed successfully:", fetchedCampaigns);
      }
    } catch (error) {
      console.error("Error refreshing campaigns:", error)
      if (isMounted) {
        setError("Failed to refresh campaigns. Please try again.")
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
    
    return () => {
      isMounted = false;
    }
  }
  
  const handleCampaignAction = (action: string, campaignId: string) => {
    switch (action) {
      case "send":
        toast({
          title: "Campaign Sent",
          description: "Your campaign has been sent successfully."
        })
        break
      case "pause":
        toast({
          title: "Campaign Paused",
          description: "Your campaign has been paused."
        })
        break
      case "edit":
        toast({
          title: "Edit Campaign",
          description: "Opening campaign editor..."
        })
        break
      case "analytics":
        toast({
          title: "View Analytics",
          description: "Opening campaign analytics..."
        })
        break
      case "delete":
        toast({
          title: "Campaign Deleted",
          description: "Your campaign has been deleted."
        })
        break
      default:
        break
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your marketing campaigns</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {campaignStats.sent} sent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {campaignStats.totalDelivered.toLocaleString()} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.averageOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaignStats.totalOpened.toLocaleString()} opens
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{campaignStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {campaignStats.totalClicked} clicks
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="h-80">
          <CardHeader>
            <CardTitle>Campaign Distribution by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="h-80">
          <CardHeader>
            <CardTitle>Campaigns by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={channelData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaigns</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-8 md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-4">
                    <CampaignAdvancedFilters 
                      onFiltersChange={setFilters}
                      campaigns={campaigns}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-red-500 mb-2">Error: {error}</div>
              <Button onClick={refreshCampaigns}>Retry</Button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading campaigns...</div>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Metrics</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => {
                  const TypeIcon = getTypeIcon(campaign.type)
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {campaign.description || campaign.subject}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {campaign.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{campaign.targetAudience.totalSize.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.metrics.sent > 0 ? (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Open:</span>
                              <span className="ml-1 font-medium">{campaign.metrics.openRate}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Click:</span>
                              <span className="ml-1 font-medium">{campaign.metrics.clickRate}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Conv:</span>
                              <span className="ml-1 font-medium">{campaign.metrics.conversionRate}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rev:</span>
                              <span className="ml-1 font-medium">₦{campaign.metrics.revenue.toLocaleString()}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No data yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCampaignAction("edit", campaign.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {campaign.status === "draft" && (
                              <DropdownMenuItem onClick={() => handleCampaignAction("send", campaign.id)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send
                              </DropdownMenuItem>
                            )}
                            {campaign.status === "scheduled" && (
                              <DropdownMenuItem onClick={() => handleCampaignAction("pause", campaign.id)}>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleCampaignAction("analytics", campaign.id)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleCampaignAction("delete", campaign.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating a new campaign.</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <CreateCampaignModal 
        open={isAddModalOpen} 
        onOpenChange={(open) => {
          setIsAddModalOpen(open)
          if (!open) {
            // Refresh campaigns when modal is closed
            refreshCampaigns()
          }
        }} 
      />
    </div>
  )
}
