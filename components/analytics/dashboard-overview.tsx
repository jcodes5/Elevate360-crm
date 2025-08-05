"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Mail, 
  Target, 
  Clock,
  ArrowUpIcon,
  ArrowDownIcon,
  Download,
  Filter,
  RefreshCw
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
  PieChart,
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
  FunnelChart,
  Funnel,
  LabelList
} from "recharts"
import { formatCurrency } from "@/lib/utils"

// Enhanced mock data with more comprehensive metrics
const salesMetrics = {
  totalRevenue: 45750000,
  totalDeals: 342,
  averageDealSize: 133772,
  winRate: 68.5,
  salesCycleLength: 28,
  pipelineValue: 125000000,
  forecastedRevenue: 52000000,
  growthRate: 23.5,
  revenuePerUser: 1200000,
  conversionRate: 12.8
}

const revenueData = [
  { month: "Jan", revenue: 7200000, deals: 45, forecast: 7500000, previousYear: 6100000 },
  { month: "Feb", revenue: 8100000, deals: 52, forecast: 8300000, previousYear: 6800000 },
  { month: "Mar", revenue: 7850000, deals: 48, forecast: 8000000, previousYear: 7200000 },
  { month: "Apr", revenue: 9200000, deals: 58, forecast: 9500000, previousYear: 7900000 },
  { month: "May", revenue: 8750000, deals: 55, forecast: 9000000, previousYear: 8100000 },
  { month: "Jun", revenue: 10200000, deals: 62, forecast: 10500000, previousYear: 8850000 },
]

const salesFunnelData = [
  { stage: "Leads", value: 2500, conversion: 100 },
  { stage: "Qualified", value: 1750, conversion: 70 },
  { stage: "Proposal", value: 875, conversion: 35 },
  { stage: "Negotiation", value: 525, conversion: 21 },
  { stage: "Closed Won", value: 315, conversion: 12.6 }
]

const channelPerformanceData = [
  { channel: "Website", leads: 850, revenue: 12500000, cost: 125000, roi: 9900 },
  { channel: "Email", leads: 650, revenue: 9800000, cost: 45000, roi: 21677 },
  { channel: "Social Media", leads: 520, revenue: 7200000, cost: 85000, roi: 8370 },
  { channel: "Referrals", leads: 420, revenue: 11200000, cost: 15000, roi: 74567 },
  { channel: "Paid Ads", leads: 380, revenue: 5800000, cost: 145000, roi: 3900 }
]

const customerSegmentData = [
  { segment: "Enterprise", value: 45, color: "#3B82F6", revenue: 25000000 },
  { segment: "Mid-Market", value: 35, color: "#10B981", revenue: 15000000 },
  { segment: "Small Business", value: 20, color: "#F59E0B", revenue: 5750000 }
]

const teamPerformanceData = [
  { name: "John Smith", deals: 28, revenue: 8500000, target: 10000000, achievement: 85 },
  { name: "Sarah Johnson", deals: 32, revenue: 9200000, target: 9000000, achievement: 102 },
  { name: "Mike Davis", deals: 24, revenue: 7100000, target: 8500000, achievement: 84 },
  { name: "Emily Brown", deals: 35, revenue: 11200000, target: 10500000, achievement: 107 },
  { name: "David Wilson", deals: 29, revenue: 8800000, target: 9500000, achievement: 93 }
]

const marketingCampaignData = [
  { campaign: "Q2 Product Launch", sent: 15000, opened: 4200, clicked: 840, converted: 126, roi: 245 },
  { campaign: "Summer Sale", sent: 12500, opened: 3750, clicked: 625, converted: 94, roi: 189 },
  { campaign: "Newsletter May", sent: 8500, opened: 2890, clicked: 425, converted: 68, roi: 156 },
  { campaign: "Webinar Series", sent: 5200, opened: 1872, clicked: 374, converted: 87, roi: 312 }
]

const geographicData = [
  { region: "North America", revenue: 18500000, deals: 145, growth: 15.2 },
  { region: "Europe", revenue: 14200000, deals: 112, growth: 22.8 },
  { region: "Asia Pacific", revenue: 8900000, deals: 68, growth: 35.6 },
  { region: "Latin America", revenue: 3100000, deals: 23, growth: 28.4 },
  { region: "Africa", revenue: 1050000, deals: 8, growth: 45.2 }
]

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<any>
  color?: string
  target?: number
  suffix?: string
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, color = "blue", target, suffix }: MetricCardProps) {
  const isPositive = change ? change > 0 : null
  const progress = target ? (typeof value === 'number' ? (value / target) * 100 : 0) : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? formatCurrency(value) : value}
          {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
        </div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {isPositive ? (
              <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {Math.abs(change)}%
            </span>
            <span className="ml-1">{changeLabel || "from last period"}</span>
          </div>
        )}
        {progress !== null && (
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Progress to target</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TeamPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>Individual achievement rates vs targets</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={teamPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value as number) : value,
                name === 'revenue' ? 'Revenue' : name
              ]}
            />
            <Bar yAxisId="left" dataKey="deals" fill="#3B82F6" name="Deals" />
            <Line yAxisId="right" type="monotone" dataKey="achievement" stroke="#10B981" strokeWidth={3} name="Achievement %" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function RevenueAnalysisChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analysis</CardTitle>
        <CardDescription>Actual vs forecast vs previous year comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [formatCurrency(value as number), "Amount"]} />
            <Area 
              type="monotone" 
              dataKey="previousYear" 
              fill="#E5E7EB" 
              stroke="#9CA3AF" 
              name="Previous Year"
              fillOpacity={0.3}
            />
            <Bar dataKey="revenue" fill="#3B82F6" name="Actual Revenue" />
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#10B981" 
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Forecast"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function SalesFunnelChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Funnel Analysis</CardTitle>
        <CardDescription>Conversion rates through each stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {salesFunnelData.map((stage, index) => (
            <div key={stage.stage} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium">{stage.stage}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage.value.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{stage.conversion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${stage.conversion}%` }}
                  />
                </div>
              </div>
              {index < salesFunnelData.length - 1 && (
                <div className="text-sm text-red-600 font-medium">
                  -{((salesFunnelData[index].value - salesFunnelData[index + 1].value) / salesFunnelData[index].value * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ChannelPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance</CardTitle>
        <CardDescription>ROI and lead generation by channel</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={channelPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="leads" name="Leads" />
            <YAxis dataKey="roi" name="ROI" tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [
                name === 'roi' ? `${value}%` : value,
                name === 'roi' ? 'ROI' : 'Leads'
              ]}
              labelFormatter={(label) => `Channel: ${channelPerformanceData.find(d => d.leads === label)?.channel}`}
            />
            <Scatter dataKey="roi" fill="#3B82F6">
              {channelPerformanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.roi > 10000 ? "#10B981" : "#3B82F6"} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CustomerSegmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Segments</CardTitle>
        <CardDescription>Revenue distribution by customer type</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={customerSegmentData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ segment, value, revenue }) => `${segment}: ${value}% (${formatCurrency(revenue)})`}
            >
              {customerSegmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function GeographicPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Performance</CardTitle>
        <CardDescription>Revenue and growth by region</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={geographicData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`} />
            <YAxis type="category" dataKey="region" width={100} />
            <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
            <Bar dataKey="revenue" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface DashboardOverviewProps {
  timeRange: string
  onExport?: (format: string) => void
}

export function DashboardOverview({ timeRange, onExport }: DashboardOverviewProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive view of your business performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={salesMetrics.totalRevenue}
          change={salesMetrics.growthRate}
          icon={DollarSign}
          color="green"
          target={52000000}
        />
        <MetricCard
          title="Deals Closed"
          value={salesMetrics.totalDeals}
          change={15.2}
          icon={Target}
          color="blue"
          suffix=" deals"
        />
        <MetricCard
          title="Win Rate"
          value={salesMetrics.winRate}
          change={5.3}
          icon={TrendingUp}
          color="purple"
          suffix="%"
        />
        <MetricCard
          title="Avg Deal Size"
          value={salesMetrics.averageDealSize}
          change={8.7}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueAnalysisChart />
        <SalesFunnelChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TeamPerformanceChart />
        <ChannelPerformanceChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CustomerSegmentChart />
        <GeographicPerformanceChart />
      </div>

      {/* Marketing Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Marketing Campaigns</CardTitle>
          <CardDescription>Performance metrics for recent campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-left p-2">Sent</th>
                  <th className="text-left p-2">Opened</th>
                  <th className="text-left p-2">Clicked</th>
                  <th className="text-left p-2">Converted</th>
                  <th className="text-left p-2">ROI</th>
                </tr>
              </thead>
              <tbody>
                {marketingCampaignData.map((campaign, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{campaign.campaign}</td>
                    <td className="p-2">{campaign.sent.toLocaleString()}</td>
                    <td className="p-2">
                      {campaign.opened.toLocaleString()} 
                      <span className="text-muted-foreground ml-1">
                        ({((campaign.opened / campaign.sent) * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-2">
                      {campaign.clicked.toLocaleString()}
                      <span className="text-muted-foreground ml-1">
                        ({((campaign.clicked / campaign.opened) * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-2">{campaign.converted}</td>
                    <td className="p-2">
                      <Badge variant={campaign.roi > 200 ? "default" : "secondary"}>
                        {campaign.roi}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
