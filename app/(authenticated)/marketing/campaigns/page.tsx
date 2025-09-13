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

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignModel[]>([])
  const [campaignStats, setCampaignStats] = useState<any>({
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0,
    byType: {},
    byStatus: {},
    byChannel: {},
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [channelFilter, setChannelFilter] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const [filters, setFilters] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const list = await CampaignService.getAllCampaigns({ limit: 100 })
        const resStats = await fetch('/api/campaigns/stats')
        const statsJson = await resStats.json()

        if (!isMounted) return
        setCampaigns(list.data)
        if (statsJson.success) setCampaignStats(statsJson.data)
      } catch (e) {
        if (!isMounted) return
        setError('Failed to load campaigns. Please try again.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [])
  
  // Filter campaigns based on search and filters
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = !searchQuery ||
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject?.toLowerCase().includes(searchQuery.toLowerCase())

      const statusLower = (campaign.status as any)?.toString().toLowerCase()
      const typeLower = (campaign.type as any)?.toString().toLowerCase()
      const channelLower = (campaign.channel as any)?.toString().toLowerCase()

      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(statusLower)
      const matchesType = typeFilter.length === 0 || typeFilter.includes(typeLower)
      const matchesChannel = channelFilter.length === 0 || channelFilter.includes(channelLower)

      const matchesFilters = filters.length === 0 || filters.every(() => true)

      const matchesTab = activeTab === "all" ||
                        (activeTab === "active" && ["sending", "scheduled"].includes(statusLower)) ||
                        (activeTab === "sent" && statusLower === "sent") ||
                        (activeTab === "draft" && statusLower === "draft")

      return matchesSearch && matchesStatus && matchesType && matchesChannel && matchesFilters && matchesTab
    })
  }, [searchQuery, statusFilter, typeFilter, channelFilter, filters, activeTab, campaigns])

  const statusData = [
    { name: 'Draft', value: campaignStats.byStatus.DRAFT || 0 },
    { name: 'Scheduled', value: campaignStats.byStatus.SCHEDULED || 0 },
    { name: 'Sending', value: campaignStats.byStatus.SENDING || 0 },
    { name: 'Sent', value: campaignStats.byStatus.SENT || 0 },
    { name: 'Paused', value: campaignStats.byStatus.PAUSED || 0 },
    { name: 'Completed', value: campaignStats.byStatus.COMPLETED || 0 },
    { name: 'Cancelled', value: campaignStats.byStatus.CANCELLED || 0 },
    { name: 'Failed', value: campaignStats.byStatus.FAILED || 0 },
  ]
  
  const channelData = Object.entries(campaignStats.byChannel)
    .map(([channel, count]) => ({ name: channel.toString().toLowerCase(), value: count as number }))
    .filter(item => item.value > 0)

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
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
    const s = status.toLowerCase()
    setStatusFilter(prev =>
      prev.includes(s)
        ? prev.filter(x => x !== s)
        : [...prev, s]
    )
  }

  const toggleTypeFilter = (type: string) => {
    const t = type.toLowerCase()
    setTypeFilter(prev =>
      prev.includes(t)
        ? prev.filter(x => x !== t)
        : [...prev, t]
    )
  }

  const toggleChannelFilter = (channel: string) => {
    const c = channel.toLowerCase()
    setChannelFilter(prev =>
      prev.includes(c)
        ? prev.filter(x => x !== c)
        : [...prev, c]
    )
  }

  const refreshCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await CampaignService.getAllCampaigns({ limit: 100 })
      const resStats = await fetch('/api/campaigns/stats')
      const statsJson = await resStats.json()
      setCampaigns(list.data)
      if (statsJson.success) setCampaignStats(statsJson.data)
    } catch (error) {
      setError("Failed to refresh campaigns. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignAction = async (action: string, campaignId: string) => {
    try {
      if (action === "send") {
        await CampaignService.sendCampaign(campaignId)
        toast({ title: "Campaign Sent", description: "Sending started." })
      } else if (action === "pause") {
        await CampaignService.pauseCampaign(campaignId)
        toast({ title: "Campaign Paused", description: "Campaign paused." })
      } else if (action === "delete") {
        await CampaignService.deleteCampaign(campaignId)
        toast({ title: "Campaign Deleted", description: "Campaign removed." })
      } else if (action === "analytics") {
        toast({ title: "Analytics", description: "Opening analytics..." })
      }
      await refreshCampaigns()
    } catch (e: any) {
      toast({ title: "Action failed", description: e?.message || "Please try again.", })
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
