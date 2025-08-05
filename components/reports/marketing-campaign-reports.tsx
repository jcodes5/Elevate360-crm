"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Users, 
  Target,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  UserPlus,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Globe,
  Share2,
  Download
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { ExportManager } from "@/components/analytics/export-manager"

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'whatsapp' | 'social' | 'paid_ads' | 'content'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
  channel: string
  budget: number
  spent: number
  startDate: Date
  endDate?: Date
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    unsubscribed: number
    bounced: number
    revenue: number
    cost: number
    impressions?: number
    reach?: number
  }
  audience: {
    targeted: number
    reached: number
    segments: string[]
  }
  createdBy: string
  tags: string[]
}

interface ChannelPerformance {
  channel: string
  campaigns: number
  totalSpent: number
  totalRevenue: number
  roi: number
  avgClickRate: number
  avgConversionRate: number
  avgCost: number
  color: string
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Product Launch Email Series',
    type: 'email',
    status: 'completed',
    channel: 'Email Marketing',
    budget: 50000,
    spent: 45000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    metrics: {
      sent: 15000,
      delivered: 14700,
      opened: 4410,
      clicked: 882,
      converted: 176,
      unsubscribed: 45,
      bounced: 300,
      revenue: 2640000,
      cost: 45000
    },
    audience: {
      targeted: 15000,
      reached: 14700,
      segments: ['Enterprise', 'Mid-Market']
    },
    createdBy: 'sarah.johnson@company.com',
    tags: ['product-launch', 'email', 'nurture']
  },
  {
    id: '2',
    name: 'LinkedIn Lead Generation',
    type: 'paid_ads',
    status: 'active',
    channel: 'LinkedIn Ads',
    budget: 75000,
    spent: 52000,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 2150,
      converted: 89,
      unsubscribed: 0,
      bounced: 0,
      revenue: 1335000,
      cost: 52000,
      impressions: 125000,
      reach: 45000
    },
    audience: {
      targeted: 50000,
      reached: 45000,
      segments: ['C-Level', 'Decision Makers']
    },
    createdBy: 'mike.davis@company.com',
    tags: ['lead-gen', 'linkedin', 'b2b']
  },
  {
    id: '3',
    name: 'Customer Retention SMS Campaign',
    type: 'sms',
    status: 'completed',
    channel: 'SMS Marketing',
    budget: 25000,
    spent: 18500,
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-25'),
    metrics: {
      sent: 8500,
      delivered: 8200,
      opened: 7380,
      clicked: 615,
      converted: 123,
      unsubscribed: 25,
      bounced: 300,
      revenue: 984000,
      cost: 18500
    },
    audience: {
      targeted: 8500,
      reached: 8200,
      segments: ['Existing Customers', 'High Value']
    },
    createdBy: 'emily.brown@company.com',
    tags: ['retention', 'sms', 'customer']
  },
  {
    id: '4',
    name: 'WhatsApp Business Updates',
    type: 'whatsapp',
    status: 'active',
    channel: 'WhatsApp Business',
    budget: 30000,
    spent: 12000,
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-20'),
    metrics: {
      sent: 5200,
      delivered: 5100,
      opened: 4590,
      clicked: 367,
      converted: 73,
      unsubscribed: 8,
      bounced: 100,
      revenue: 876000,
      cost: 12000
    },
    audience: {
      targeted: 5200,
      reached: 5100,
      segments: ['Mobile Users', 'International']
    },
    createdBy: 'david.wilson@company.com',
    tags: ['whatsapp', 'mobile', 'international']
  },
  {
    id: '5',
    name: 'Content Marketing Blog Series',
    type: 'content',
    status: 'active',
    channel: 'Content Marketing',
    budget: 40000,
    spent: 28000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-01'),
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 1850,
      converted: 95,
      unsubscribed: 0,
      bounced: 0,
      revenue: 1425000,
      cost: 28000,
      impressions: 89000,
      reach: 32000
    },
    audience: {
      targeted: 50000,
      reached: 32000,
      segments: ['Prospects', 'Industry Leaders']
    },
    createdBy: 'sarah.johnson@company.com',
    tags: ['content', 'blog', 'seo']
  }
]

const channelPerformance: ChannelPerformance[] = [
  {
    channel: 'Email Marketing',
    campaigns: 8,
    totalSpent: 125000,
    totalRevenue: 4200000,
    roi: 3360,
    avgClickRate: 5.8,
    avgConversionRate: 19.9,
    avgCost: 15625,
    color: '#3B82F6'
  },
  {
    channel: 'LinkedIn Ads',
    campaigns: 4,
    totalSpent: 89000,
    totalRevenue: 2100000,
    roi: 2360,
    avgClickRate: 3.2,
    avgConversionRate: 4.1,
    avgCost: 22250,
    color: '#0077B5'
  },
  {
    channel: 'SMS Marketing',
    campaigns: 6,
    totalSpent: 45000,
    totalRevenue: 1850000,
    roi: 4111,
    avgClickRate: 7.5,
    avgConversionRate: 15.0,
    avgCost: 7500,
    color: '#10B981'
  },
  {
    channel: 'WhatsApp Business',
    campaigns: 3,
    totalSpent: 28000,
    totalRevenue: 1200000,
    roi: 4286,
    avgClickRate: 7.2,
    avgConversionRate: 14.2,
    avgCost: 9333,
    color: '#25D366'
  },
  {
    channel: 'Content Marketing',
    campaigns: 5,
    totalSpent: 78000,
    totalRevenue: 2850000,
    roi: 3654,
    avgClickRate: 2.1,
    avgConversionRate: 5.1,
    avgCost: 15600,
    color: '#F59E0B'
  }
]

const campaignTrends = [
  { month: 'Jan', emailCampaigns: 3, smsCampaigns: 2, whatsappCampaigns: 1, revenue: 1200000, leads: 450 },
  { month: 'Feb', emailCampaigns: 4, smsCampaigns: 3, whatsappCampaigns: 2, revenue: 1580000, leads: 620 },
  { month: 'Mar', emailCampaigns: 2, smsCampaigns: 2, whatsappCampaigns: 1, revenue: 980000, leads: 380 },
  { month: 'Apr', emailCampaigns: 5, smsCampaigns: 4, whatsappCampaigns: 2, revenue: 2100000, leads: 780 },
  { month: 'May', emailCampaigns: 3, smsCampaigns: 3, whatsappCampaigns: 3, revenue: 1750000, leads: 650 },
  { month: 'Jun', emailCampaigns: 4, smsCampaigns: 2, whatsappCampaigns: 2, revenue: 1890000, leads: 720 }
]

const audienceSegments = [
  { segment: 'Enterprise', campaigns: 12, revenue: 5400000, avgConversion: 22.5, color: '#3B82F6' },
  { segment: 'Mid-Market', campaigns: 8, revenue: 3200000, avgConversion: 18.7, color: '#10B981' },
  { segment: 'SMB', campaigns: 6, revenue: 1800000, avgConversion: 15.2, color: '#F59E0B' },
  { segment: 'Existing Customers', campaigns: 10, revenue: 2900000, avgConversion: 35.8, color: '#8B5CF6' },
  { segment: 'Prospects', campaigns: 15, revenue: 2100000, avgConversion: 8.9, color: '#EF4444' }
]

function CampaignMetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = 'number',
  color = 'blue' 
}: {
  title: string
  value: number
  change?: number
  icon: any
  format?: 'currency' | 'number' | 'percentage'
  color?: string
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency': return formatCurrency(val)
      case 'percentage': return `${val}%`
      default: return val.toLocaleString()
    }
  }

  const isPositive = change ? change > 0 : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {isPositive ? "+" : ""}{change}%
            </span>
            {" "}from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function CampaignOverviewTable({ campaigns }: { campaigns: Campaign[] }) {
  const sortedCampaigns = [...campaigns].sort((a, b) => b.metrics.revenue - a.metrics.revenue)

  const getCampaignIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'email': return Mail
      case 'sms': return MessageSquare
      case 'whatsapp': return Phone
      case 'social': return Share2
      case 'paid_ads': return Target
      case 'content': return Globe
      default: return Activity
    }
  }

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance Overview</CardTitle>
        <CardDescription>Detailed metrics for all marketing campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.map((campaign) => {
              const Icon = getCampaignIcon(campaign.type)
              const roi = ((campaign.metrics.revenue - campaign.metrics.cost) / campaign.metrics.cost) * 100
              const conversionRate = campaign.metrics.sent > 0 
                ? (campaign.metrics.converted / campaign.metrics.sent) * 100
                : campaign.metrics.clicked > 0 
                ? (campaign.metrics.converted / campaign.metrics.clicked) * 100 
                : 0

              return (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">{campaign.channel}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.audience.reached.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        of {campaign.audience.targeted.toLocaleString()} targeted
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Conversion:</span>
                        <span className="font-medium">{conversionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={conversionRate} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {campaign.metrics.converted} conversions
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatCurrency(campaign.metrics.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        Cost: {formatCurrency(campaign.metrics.cost)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={roi > 300 ? "default" : roi > 100 ? "secondary" : "destructive"}
                      className={roi > 300 ? "bg-green-500" : ""}
                    >
                      {roi.toFixed(0)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ChannelPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance Comparison</CardTitle>
        <CardDescription>ROI and spend across different marketing channels</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={channelPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis yAxisId="left" tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'totalSpent' || name === 'totalRevenue') {
                  return [formatCurrency(value as number), name === 'totalSpent' ? 'Spent' : 'Revenue']
                }
                return [`${value}%`, 'ROI']
              }}
            />
            <Bar yAxisId="left" dataKey="totalSpent" fill="#EF4444" name="totalSpent" />
            <Bar yAxisId="left" dataKey="totalRevenue" fill="#10B981" name="totalRevenue" />
            <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#3B82F6" strokeWidth={3} name="roi" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CampaignTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Activity Trends</CardTitle>
        <CardDescription>Number of campaigns and revenue over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={campaignTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="emailCampaigns" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
            <Area type="monotone" dataKey="smsCampaigns" stackId="1" stroke="#10B981" fill="#10B981" />
            <Area type="monotone" dataKey="whatsappCampaigns" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function AudienceSegmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Segment Performance</CardTitle>
        <CardDescription>Revenue distribution across target segments</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={audienceSegments}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="revenue"
              label={({ segment, revenue }) => `${segment}: ${formatCurrency(revenue)}`}
            >
              {audienceSegments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function MarketingCampaignReports() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("currentMonth")
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter(campaign => {
      if (selectedChannel !== "all" && campaign.channel !== selectedChannel) return false
      if (selectedStatus !== "all" && campaign.status !== selectedStatus) return false
      return true
    })
  }, [selectedChannel, selectedStatus])

  const totalMetrics = useMemo(() => {
    return filteredCampaigns.reduce((acc, campaign) => ({
      spent: acc.spent + campaign.metrics.cost,
      revenue: acc.revenue + campaign.metrics.revenue,
      sent: acc.sent + campaign.metrics.sent,
      converted: acc.converted + campaign.metrics.converted,
      clicked: acc.clicked + campaign.metrics.clicked,
      opened: acc.opened + campaign.metrics.opened
    }), { spent: 0, revenue: 0, sent: 0, converted: 0, clicked: 0, opened: 0 })
  }, [filteredCampaigns])

  const avgMetrics = useMemo(() => {
    const totalSent = totalMetrics.sent + totalMetrics.clicked // Include campaigns without sent (like paid ads)
    return {
      roi: totalMetrics.spent > 0 ? ((totalMetrics.revenue - totalMetrics.spent) / totalMetrics.spent) * 100 : 0,
      conversionRate: totalSent > 0 ? (totalMetrics.converted / totalSent) * 100 : 0,
      clickRate: totalMetrics.sent > 0 ? (totalMetrics.clicked / totalMetrics.sent) * 100 : 0,
      openRate: totalMetrics.sent > 0 ? (totalMetrics.opened / totalMetrics.sent) * 100 : 0
    }
  }, [totalMetrics])

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marketing Campaign Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of campaign performance across all channels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currentMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="currentQuarter">This Quarter</SelectItem>
              <SelectItem value="lastQuarter">Last Quarter</SelectItem>
              <SelectItem value="currentYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="Email Marketing">Email Marketing</SelectItem>
              <SelectItem value="LinkedIn Ads">LinkedIn Ads</SelectItem>
              <SelectItem value="SMS Marketing">SMS Marketing</SelectItem>
              <SelectItem value="WhatsApp Business">WhatsApp Business</SelectItem>
              <SelectItem value="Content Marketing">Content Marketing</SelectItem>
            </SelectContent>
          </Select>
          <ExportManager />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-6">
        <CampaignMetricCard
          title="Total Spend"
          value={totalMetrics.spent}
          change={-8.2}
          icon={DollarSign}
          format="currency"
          color="red"
        />
        <CampaignMetricCard
          title="Revenue Generated"
          value={totalMetrics.revenue}
          change={24.5}
          icon={TrendingUp}
          format="currency"
          color="green"
        />
        <CampaignMetricCard
          title="ROI"
          value={Math.round(avgMetrics.roi)}
          change={15.8}
          icon={Target}
          format="percentage"
          color="purple"
        />
        <CampaignMetricCard
          title="Conversions"
          value={totalMetrics.converted}
          change={12.3}
          icon={UserPlus}
          color="blue"
        />
        <CampaignMetricCard
          title="Conversion Rate"
          value={Math.round(avgMetrics.conversionRate * 10) / 10}
          change={3.7}
          icon={Activity}
          format="percentage"
          color="indigo"
        />
        <CampaignMetricCard
          title="Active Campaigns"
          value={filteredCampaigns.filter(c => c.status === 'active').length}
          change={0}
          icon={Zap}
          color="orange"
        />
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
          <TabsTrigger value="channels">Channel Analysis</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CampaignOverviewTable campaigns={filteredCampaigns} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Status Distribution</CardTitle>
                <CardDescription>Current state of all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['active', 'completed', 'scheduled', 'paused', 'draft'].map(status => {
                    const count = filteredCampaigns.filter(c => c.status === status).length
                    const percentage = (count / filteredCampaigns.length) * 100
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Highest ROI campaigns this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...filteredCampaigns]
                    .sort((a, b) => {
                      const roiA = ((a.metrics.revenue - a.metrics.cost) / a.metrics.cost) * 100
                      const roiB = ((b.metrics.revenue - b.metrics.cost) / b.metrics.cost) * 100
                      return roiB - roiA
                    })
                    .slice(0, 3)
                    .map((campaign, index) => {
                      const roi = ((campaign.metrics.revenue - campaign.metrics.cost) / campaign.metrics.cost) * 100
                      return (
                        <div key={campaign.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">#{index + 1}</span>
                            <span className="text-sm font-medium">{campaign.name}</span>
                          </div>
                          <Badge className="bg-green-500">{roi.toFixed(0)}% ROI</Badge>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <ChannelPerformanceChart />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Channel ROI Comparison</CardTitle>
                <CardDescription>Return on investment by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...channelPerformance]
                    .sort((a, b) => b.roi - a.roi)
                    .map((channel) => (
                      <div key={channel.channel} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: channel.color }}
                          />
                          <span className="font-medium">{channel.channel}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{channel.roi}%</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(channel.totalRevenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Channel Efficiency Metrics</CardTitle>
                <CardDescription>Cost and conversion metrics by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead>Avg Cost</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Conversion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channelPerformance.map((channel) => (
                      <TableRow key={channel.channel}>
                        <TableCell className="font-medium">{channel.channel}</TableCell>
                        <TableCell>{formatCurrency(channel.avgCost)}</TableCell>
                        <TableCell>{channel.avgClickRate}%</TableCell>
                        <TableCell>{channel.avgConversionRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AudienceSegmentChart />
            <Card>
              <CardHeader>
                <CardTitle>Segment Performance Analysis</CardTitle>
                <CardDescription>Conversion rates by audience segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audienceSegments
                    .sort((a, b) => b.avgConversion - a.avgConversion)
                    .map((segment) => (
                      <div key={segment.segment} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{segment.segment}</span>
                          <span className="text-sm font-bold">{segment.avgConversion}%</span>
                        </div>
                        <Progress value={segment.avgConversion} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{segment.campaigns} campaigns</span>
                          <span>{formatCurrency(segment.revenue)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Audience Engagement Metrics</CardTitle>
              <CardDescription>How different segments interact with campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Campaigns</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Avg Conversion</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audienceSegments.map((segment) => (
                    <TableRow key={segment.segment}>
                      <TableCell className="font-medium">{segment.segment}</TableCell>
                      <TableCell>{segment.campaigns}</TableCell>
                      <TableCell>{formatCurrency(segment.revenue)}</TableCell>
                      <TableCell>{segment.avgConversion}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant={segment.avgConversion > 20 ? "default" : segment.avgConversion > 10 ? "secondary" : "destructive"}
                          className={segment.avgConversion > 20 ? "bg-green-500" : ""}
                        >
                          {segment.avgConversion > 20 ? 'Excellent' : segment.avgConversion > 10 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgMetrics.openRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.3%</span> from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgMetrics.clickRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+1.8%</span> from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cost per Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalMetrics.converted > 0 ? totalMetrics.spent / totalMetrics.converted : 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">+5.2%</span> from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue per Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(filteredCampaigns.length > 0 ? totalMetrics.revenue / filteredCampaigns.length : 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18.7%</span> from last period
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <CampaignTrendsChart />
          <Card>
            <CardHeader>
              <CardTitle>Performance Forecasting</CardTitle>
              <CardDescription>Predicted campaign performance for next quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">+28%</p>
                  <p className="text-sm text-muted-foreground">Projected Revenue Growth</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-sm text-muted-foreground">Planned Campaigns</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(350000)}</p>
                  <p className="text-sm text-muted-foreground">Estimated Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
