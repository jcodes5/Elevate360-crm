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
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  Heart,
  Star,
  Eye,
  MousePointer,
  ShoppingCart,
  CreditCard,
  UserCheck,
  UserX,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  MessageSquare
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
  PolarRadiusAxis,
  Sankey
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { ExportManager } from "@/components/analytics/export-manager"

interface CustomerBehavior {
  customerId: string
  segment: string
  acquisitionDate: Date
  lastActivity: Date
  totalValue: number
  purchaseFrequency: number
  avgOrderValue: number
  lifetimeValue: number
  engagementScore: number
  satisfactionScore: number
  churnRisk: 'low' | 'medium' | 'high'
  preferredChannel: string
  deviceType: string
  location: string
  interactions: {
    emailOpens: number
    emailClicks: number
    websiteVisits: number
    supportTickets: number
    purchases: number
    referrals: number
  }
  journey: {
    touchpoints: string[]
    conversionTime: number
    firstInteraction: string
    lastInteraction: string
  }
}

interface CohortData {
  cohort: string
  size: number
  retention: {
    month1: number
    month3: number
    month6: number
    month12: number
  }
  revenue: {
    month1: number
    month3: number
    month6: number
    month12: number
  }
}

const mockCustomerBehavior: CustomerBehavior[] = [
  {
    customerId: 'C001',
    segment: 'Enterprise',
    acquisitionDate: new Date('2023-01-15'),
    lastActivity: new Date('2024-01-20'),
    totalValue: 2500000,
    purchaseFrequency: 4,
    avgOrderValue: 625000,
    lifetimeValue: 3200000,
    engagementScore: 85,
    satisfactionScore: 92,
    churnRisk: 'low',
    preferredChannel: 'Email',
    deviceType: 'Desktop',
    location: 'Lagos',
    interactions: {
      emailOpens: 45,
      emailClicks: 12,
      websiteVisits: 89,
      supportTickets: 3,
      purchases: 4,
      referrals: 2
    },
    journey: {
      touchpoints: ['Website', 'Email', 'Sales Call', 'Demo', 'Purchase'],
      conversionTime: 45,
      firstInteraction: 'Website',
      lastInteraction: 'Email'
    }
  },
  {
    customerId: 'C002',
    segment: 'Mid-Market',
    acquisitionDate: new Date('2023-03-20'),
    lastActivity: new Date('2024-01-18'),
    totalValue: 980000,
    purchaseFrequency: 6,
    avgOrderValue: 163333,
    lifetimeValue: 1450000,
    engagementScore: 72,
    satisfactionScore: 88,
    churnRisk: 'low',
    preferredChannel: 'WhatsApp',
    deviceType: 'Mobile',
    location: 'Abuja',
    interactions: {
      emailOpens: 28,
      emailClicks: 8,
      websiteVisits: 56,
      supportTickets: 2,
      purchases: 6,
      referrals: 1
    },
    journey: {
      touchpoints: ['Social Media', 'Website', 'WhatsApp', 'Purchase'],
      conversionTime: 28,
      firstInteraction: 'Social Media',
      lastInteraction: 'WhatsApp'
    }
  },
  {
    customerId: 'C003',
    segment: 'SMB',
    acquisitionDate: new Date('2023-06-10'),
    lastActivity: new Date('2023-12-15'),
    totalValue: 450000,
    purchaseFrequency: 3,
    avgOrderValue: 150000,
    lifetimeValue: 680000,
    engagementScore: 45,
    satisfactionScore: 76,
    churnRisk: 'high',
    preferredChannel: 'SMS',
    deviceType: 'Mobile',
    location: 'Port Harcourt',
    interactions: {
      emailOpens: 12,
      emailClicks: 2,
      websiteVisits: 23,
      supportTickets: 5,
      purchases: 3,
      referrals: 0
    },
    journey: {
      touchpoints: ['Referral', 'Website', 'SMS', 'Purchase'],
      conversionTime: 62,
      firstInteraction: 'Referral',
      lastInteraction: 'SMS'
    }
  },
  {
    customerId: 'C004',
    segment: 'Enterprise',
    acquisitionDate: new Date('2022-11-05'),
    lastActivity: new Date('2024-01-22'),
    totalValue: 4200000,
    purchaseFrequency: 8,
    avgOrderValue: 525000,
    lifetimeValue: 5800000,
    engagementScore: 95,
    satisfactionScore: 96,
    churnRisk: 'low',
    preferredChannel: 'Email',
    deviceType: 'Desktop',
    location: 'Lagos',
    interactions: {
      emailOpens: 78,
      emailClicks: 23,
      websiteVisits: 145,
      supportTickets: 1,
      purchases: 8,
      referrals: 4
    },
    journey: {
      touchpoints: ['Website', 'Email', 'Sales Call', 'Demo', 'Trial', 'Purchase'],
      conversionTime: 89,
      firstInteraction: 'Website',
      lastInteraction: 'Email'
    }
  },
  {
    customerId: 'C005',
    segment: 'Mid-Market',
    acquisitionDate: new Date('2023-08-12'),
    lastActivity: new Date('2024-01-19'),
    totalValue: 1200000,
    purchaseFrequency: 5,
    avgOrderValue: 240000,
    lifetimeValue: 1850000,
    engagementScore: 68,
    satisfactionScore: 84,
    churnRisk: 'medium',
    preferredChannel: 'Phone',
    deviceType: 'Desktop',
    location: 'Kano',
    interactions: {
      emailOpens: 34,
      emailClicks: 9,
      websiteVisits: 67,
      supportTickets: 4,
      purchases: 5,
      referrals: 1
    },
    journey: {
      touchpoints: ['Email', 'Website', 'Phone Call', 'Purchase'],
      conversionTime: 34,
      firstInteraction: 'Email',
      lastInteraction: 'Phone Call'
    }
  }
]

const cohortData: CohortData[] = [
  {
    cohort: 'Jan 2023',
    size: 125,
    retention: { month1: 78, month3: 65, month6: 52, month12: 41 },
    revenue: { month1: 1250000, month3: 2800000, month6: 4200000, month12: 6800000 }
  },
  {
    cohort: 'Feb 2023',
    size: 142,
    retention: { month1: 82, month3: 68, month6: 55, month12: 44 },
    revenue: { month1: 1420000, month3: 3200000, month6: 4850000, month12: 7600000 }
  },
  {
    cohort: 'Mar 2023',
    size: 158,
    retention: { month1: 85, month3: 71, month6: 58, month12: 47 },
    revenue: { month1: 1580000, month3: 3650000, month6: 5420000, month12: 8500000 }
  },
  {
    cohort: 'Apr 2023',
    size: 134,
    retention: { month1: 79, month3: 64, month6: 51, month12: 0 },
    revenue: { month1: 1340000, month3: 2980000, month6: 4450000, month12: 0 }
  },
  {
    cohort: 'May 2023',
    size: 167,
    retention: { month1: 88, month3: 74, month6: 61, month12: 0 },
    revenue: { month1: 1670000, month3: 3850000, month6: 5680000, month12: 0 }
  }
]

const engagementTrends = [
  { month: 'Jan', emailOpens: 1250, websiteVisits: 3450, appUsage: 2100, socialInteraction: 890 },
  { month: 'Feb', emailOpens: 1380, websiteVisits: 3720, appUsage: 2340, socialInteraction: 920 },
  { month: 'Mar', emailOpens: 1520, websiteVisits: 4100, appUsage: 2580, socialInteraction: 1050 },
  { month: 'Apr', emailOpens: 1420, websiteVisits: 3890, appUsage: 2420, socialInteraction: 980 },
  { month: 'May', emailOpens: 1680, websiteVisits: 4350, appUsage: 2750, socialInteraction: 1180 },
  { month: 'Jun', emailOpens: 1850, websiteVisits: 4680, appUsage: 2950, socialInteraction: 1280 }
]

const customerJourneyStages = [
  { stage: 'Awareness', count: 1000, conversion: 100 },
  { stage: 'Interest', count: 650, conversion: 65 },
  { stage: 'Consideration', count: 420, conversion: 42 },
  { stage: 'Intent', count: 280, conversion: 28 },
  { stage: 'Purchase', count: 180, conversion: 18 },
  { stage: 'Loyalty', count: 120, conversion: 12 }
]

const channelPreferences = [
  { channel: 'Email', percentage: 35, satisfaction: 8.2, color: '#3B82F6' },
  { channel: 'WhatsApp', percentage: 28, satisfaction: 8.8, color: '#25D366' },
  { channel: 'Phone', percentage: 18, satisfaction: 7.9, color: '#10B981' },
  { channel: 'SMS', percentage: 12, satisfaction: 7.5, color: '#F59E0B' },
  { channel: 'Website', percentage: 7, satisfaction: 8.1, color: '#8B5CF6' }
]

const deviceUsage = [
  { device: 'Desktop', users: 45, revenue: 15600000, avgSession: 12.5 },
  { device: 'Mobile', users: 38, revenue: 8900000, avgSession: 8.2 },
  { device: 'Tablet', users: 17, revenue: 3800000, avgSession: 9.8 }
]

function BehaviorMetricCard({ 
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
  format?: 'currency' | 'number' | 'percentage' | 'days'
  color?: string
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency': return formatCurrency(val)
      case 'percentage': return `${val}%`
      case 'days': return `${val} days`
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

function CustomerSegmentAnalysis({ customers }: { customers: CustomerBehavior[] }) {
  const segmentMetrics = useMemo(() => {
    const segments = customers.reduce((acc, customer) => {
      if (!acc[customer.segment]) {
        acc[customer.segment] = {
          count: 0,
          totalValue: 0,
          avgEngagement: 0,
          avgSatisfaction: 0,
          churnRisk: { low: 0, medium: 0, high: 0 }
        }
      }
      
      acc[customer.segment].count++
      acc[customer.segment].totalValue += customer.totalValue
      acc[customer.segment].avgEngagement += customer.engagementScore
      acc[customer.segment].avgSatisfaction += customer.satisfactionScore
      acc[customer.segment].churnRisk[customer.churnRisk]++
      
      return acc
    }, {} as any)

    // Calculate averages
    Object.keys(segments).forEach(segment => {
      segments[segment].avgEngagement = Math.round(segments[segment].avgEngagement / segments[segment].count)
      segments[segment].avgSatisfaction = Math.round(segments[segment].avgSatisfaction / segments[segment].count)
    })

    return segments
  }, [customers])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Segment Analysis</CardTitle>
        <CardDescription>Behavior patterns across different customer segments</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Segment</TableHead>
              <TableHead>Customers</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Avg Engagement</TableHead>
              <TableHead>Satisfaction</TableHead>
              <TableHead>Churn Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(segmentMetrics).map(([segment, metrics]: [string, any]) => (
              <TableRow key={segment}>
                <TableCell className="font-medium">{segment}</TableCell>
                <TableCell>{metrics.count}</TableCell>
                <TableCell>{formatCurrency(metrics.totalValue)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${metrics.avgEngagement}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{metrics.avgEngagement}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{(metrics.avgSatisfaction / 10).toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Badge className="bg-green-500 text-xs">{metrics.churnRisk.low}</Badge>
                    <Badge variant="secondary" className="text-xs">{metrics.churnRisk.medium}</Badge>
                    <Badge variant="destructive" className="text-xs">{metrics.churnRisk.high}</Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function CohortAnalysisChart() {
  const retentionData = cohortData.map(cohort => ({
    cohort: cohort.cohort,
    'Month 1': cohort.retention.month1,
    'Month 3': cohort.retention.month3,
    'Month 6': cohort.retention.month6,
    'Month 12': cohort.retention.month12 || 0
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort Retention Analysis</CardTitle>
        <CardDescription>Customer retention rates by acquisition cohort</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={retentionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cohort" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${value}%`, 'Retention Rate']} />
            <Line type="monotone" dataKey="Month 1" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="Month 3" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="Month 6" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="Month 12" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function EngagementTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Engagement Trends</CardTitle>
        <CardDescription>How customers interact across different channels over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={engagementTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="emailOpens" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
            <Area type="monotone" dataKey="websiteVisits" stackId="1" stroke="#10B981" fill="#10B981" />
            <Area type="monotone" dataKey="appUsage" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
            <Area type="monotone" dataKey="socialInteraction" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CustomerJourneyFunnel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Journey Funnel</CardTitle>
        <CardDescription>How customers progress through the journey stages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customerJourneyStages.map((stage, index) => (
            <div key={stage.stage} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium">{stage.stage}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage.count.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{stage.conversion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${stage.conversion}%` }}
                  />
                </div>
              </div>
              {index < customerJourneyStages.length - 1 && (
                <div className="text-sm text-red-600 font-medium">
                  -{((customerJourneyStages[index].count - customerJourneyStages[index + 1].count) / customerJourneyStages[index].count * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ChannelPreferencesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Preferences</CardTitle>
        <CardDescription>Customer preferences and satisfaction by communication channel</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={channelPreferences}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="percentage"
              label={({ channel, percentage }) => `${channel}: ${percentage}%`}
            >
              {channelPreferences.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, "Preference"]} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CustomerBehaviorReports() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("currentMonth")
  const [selectedSegment, setSelectedSegment] = useState("all")
  const [selectedChurnRisk, setSelectedChurnRisk] = useState("all")

  const filteredCustomers = useMemo(() => {
    return mockCustomerBehavior.filter(customer => {
      if (selectedSegment !== "all" && customer.segment !== selectedSegment) return false
      if (selectedChurnRisk !== "all" && customer.churnRisk !== selectedChurnRisk) return false
      return true
    })
  }, [selectedSegment, selectedChurnRisk])

  const behaviorMetrics = useMemo(() => {
    const totalCustomers = filteredCustomers.length
    const avgLifetimeValue = filteredCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0) / totalCustomers
    const avgEngagement = filteredCustomers.reduce((sum, c) => sum + c.engagementScore, 0) / totalCustomers
    const avgSatisfaction = filteredCustomers.reduce((sum, c) => sum + c.satisfactionScore, 0) / totalCustomers
    const churnRiskHigh = filteredCustomers.filter(c => c.churnRisk === 'high').length
    const avgConversionTime = filteredCustomers.reduce((sum, c) => sum + c.journey.conversionTime, 0) / totalCustomers
    
    return {
      totalCustomers,
      avgLifetimeValue,
      avgEngagement,
      avgSatisfaction,
      churnRiskHigh,
      avgConversionTime
    }
  }, [filteredCustomers])

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Behavior Analytics</h2>
          <p className="text-muted-foreground">
            Deep insights into customer interactions, preferences, and journey patterns
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
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Mid-Market">Mid-Market</SelectItem>
              <SelectItem value="SMB">SMB</SelectItem>
            </SelectContent>
          </Select>
          <ExportManager />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-6">
        <BehaviorMetricCard
          title="Total Customers"
          value={behaviorMetrics.totalCustomers}
          change={8.5}
          icon={Users}
          color="blue"
        />
        <BehaviorMetricCard
          title="Avg Lifetime Value"
          value={Math.round(behaviorMetrics.avgLifetimeValue)}
          change={15.2}
          icon={CreditCard}
          format="currency"
          color="green"
        />
        <BehaviorMetricCard
          title="Engagement Score"
          value={Math.round(behaviorMetrics.avgEngagement)}
          change={3.7}
          icon={Activity}
          format="percentage"
          color="purple"
        />
        <BehaviorMetricCard
          title="Satisfaction Score"
          value={Math.round(behaviorMetrics.avgSatisfaction)}
          change={2.1}
          icon={Heart}
          color="pink"
        />
        <BehaviorMetricCard
          title="High Churn Risk"
          value={behaviorMetrics.churnRiskHigh}
          change={-12.3}
          icon={UserX}
          color="red"
        />
        <BehaviorMetricCard
          title="Avg Conversion Time"
          value={Math.round(behaviorMetrics.avgConversionTime)}
          change={-8.9}
          icon={Clock}
          format="days"
          color="orange"
        />
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Behavior Overview</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="journey">Customer Journey</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="retention">Retention & Churn</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChannelPreferencesChart />
            <Card>
              <CardHeader>
                <CardTitle>Device Usage Patterns</CardTitle>
                <CardDescription>How customers access your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceUsage.map((device) => (
                    <div key={device.device} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{device.device}</span>
                        <span className="text-sm font-bold">{device.users}%</span>
                      </div>
                      <Progress value={device.users} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(device.revenue)}</span>
                        <span>{device.avgSession} min avg session</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <CustomerSegmentAnalysis customers={filteredCustomers} />
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-6">
          <CustomerSegmentAnalysis customers={filteredCustomers} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Value Distribution</CardTitle>
                <CardDescription>Customer lifetime value by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={['Enterprise', 'Mid-Market', 'SMB'].map(segment => {
                    const customers = filteredCustomers.filter(c => c.segment === segment)
                    const avgValue = customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length
                    return { segment, value: avgValue || 0, count: customers.length }
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), "Avg LTV"]} />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Segment</CardTitle>
                <CardDescription>Average engagement scores across segments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={['Enterprise', 'Mid-Market', 'SMB'].map(segment => {
                    const customers = filteredCustomers.filter(c => c.segment === segment)
                    const avgEngagement = customers.reduce((sum, c) => sum + c.engagementScore, 0) / customers.length
                    const avgSatisfaction = customers.reduce((sum, c) => sum + c.satisfactionScore, 0) / customers.length
                    const avgFrequency = customers.reduce((sum, c) => sum + c.purchaseFrequency, 0) / customers.length
                    
                    return {
                      segment,
                      engagement: avgEngagement || 0,
                      satisfaction: avgSatisfaction || 0,
                      frequency: (avgFrequency || 0) * 10 // Scale for radar chart
                    }
                  })}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="segment" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar dataKey="engagement" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Radar dataKey="satisfaction" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    <Radar dataKey="frequency" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-6">
          <CohortAnalysisChart />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Revenue Growth</CardTitle>
                <CardDescription>Revenue progression by acquisition cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cohortData.map(cohort => ({
                    cohort: cohort.cohort,
                    month1: cohort.revenue.month1,
                    month6: cohort.revenue.month6,
                    month12: cohort.revenue.month12 || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
                    <Line type="monotone" dataKey="month1" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="month6" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="month12" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cohort Metrics Summary</CardTitle>
                <CardDescription>Key performance indicators by cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cohort</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>12M Retention</TableHead>
                      <TableHead>12M Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cohortData.map((cohort) => (
                      <TableRow key={cohort.cohort}>
                        <TableCell className="font-medium">{cohort.cohort}</TableCell>
                        <TableCell>{cohort.size}</TableCell>
                        <TableCell>
                          {cohort.retention.month12 ? (
                            <Badge className="bg-green-500">{cohort.retention.month12}%</Badge>
                          ) : (
                            <Badge variant="secondary">TBD</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {cohort.revenue.month12 ? 
                            formatCurrency(cohort.revenue.month12) : 
                            <span className="text-muted-foreground">TBD</span>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <CustomerJourneyFunnel />
            <Card>
              <CardHeader>
                <CardTitle>Touchpoint Analysis</CardTitle>
                <CardDescription>Most effective touchpoints in customer journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Website</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500">High Impact</Badge>
                      <span className="text-sm">85% effectiveness</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-500">Medium Impact</Badge>
                      <span className="text-sm">72% effectiveness</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Demo</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500">High Impact</Badge>
                      <span className="text-sm">91% effectiveness</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Social Media</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Low Impact</Badge>
                      <span className="text-sm">45% effectiveness</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementTrendsChart />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
                <CardDescription>Customer engagement score distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>High Engagement (80-100%)</span>
                    <Badge className="bg-green-500">
                      {filteredCustomers.filter(c => c.engagementScore >= 80).length} customers
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium Engagement (50-79%)</span>
                    <Badge className="bg-blue-500">
                      {filteredCustomers.filter(c => c.engagementScore >= 50 && c.engagementScore < 80).length} customers
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low Engagement (0-49%)</span>
                    <Badge variant="destructive">
                      {filteredCustomers.filter(c => c.engagementScore < 50).length} customers
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Channel Satisfaction Scores</CardTitle>
                <CardDescription>Customer satisfaction by communication channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelPreferences.map((channel) => (
                    <div key={channel.channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{channel.channel}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold">{channel.satisfaction}</span>
                        </div>
                      </div>
                      <Progress value={channel.satisfaction * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73.2%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5.1%</span> from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">26.8%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">-5.1%</span> from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Customer Lifespan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5 months</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.3</span> months
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(2400000)}</div>
                <p className="text-xs text-muted-foreground">
                  From high churn risk customers
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Churn Risk Analysis</CardTitle>
              <CardDescription>Customers at risk of churning</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Value at Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers
                    .filter(c => c.churnRisk === 'high' || c.churnRisk === 'medium')
                    .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
                    .map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell className="font-medium">{customer.customerId}</TableCell>
                        <TableCell>{customer.segment}</TableCell>
                        <TableCell>{customer.lastActivity.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${customer.engagementScore}%` }}
                              />
                            </div>
                            <span className="text-sm">{customer.engagementScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={customer.churnRisk === 'high' ? "destructive" : "secondary"}
                          >
                            {customer.churnRisk}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(customer.lifetimeValue)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
