"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { ExportManager } from "@/components/analytics/export-manager"

interface SalesRep {
  id: string
  name: string
  email: string
  team: string
  hireDate: Date
  targets: {
    monthly: number
    quarterly: number
    annual: number
  }
  performance: {
    revenue: number
    deals: number
    activities: number
    winRate: number
    avgDealSize: number
    salesCycle: number
  }
  pipeline: {
    total: number
    weighted: number
    deals: number
  }
  achievement: {
    monthly: number
    quarterly: number
    annual: number
  }
}

interface Deal {
  id: string
  name: string
  value: number
  stage: string
  probability: number
  ownerId: string
  createdAt: Date
  expectedCloseDate: Date
  actualCloseDate?: Date
  source: string
  product: string
  daysInPipeline: number
}

interface SalesActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal'
  userId: string
  dealId?: string
  contactId: string
  date: Date
  outcome: 'positive' | 'neutral' | 'negative'
  duration?: number
  notes?: string
}

// Mock data
const salesReps: SalesRep[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    team: 'Enterprise',
    hireDate: new Date('2023-01-15'),
    targets: { monthly: 500000, quarterly: 1500000, annual: 6000000 },
    performance: { revenue: 2150000, deals: 12, activities: 89, winRate: 68, avgDealSize: 179167, salesCycle: 45 },
    pipeline: { total: 3200000, weighted: 1920000, deals: 8 },
    achievement: { monthly: 108, quarterly: 95, annual: 36 }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    team: 'Mid-Market',
    hireDate: new Date('2022-08-20'),
    targets: { monthly: 400000, quarterly: 1200000, annual: 4800000 },
    performance: { revenue: 1880000, deals: 18, activities: 124, winRate: 72, avgDealSize: 104444, salesCycle: 32 },
    pipeline: { total: 2400000, weighted: 1680000, deals: 12 },
    achievement: { monthly: 115, quarterly: 104, annual: 39 }
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    team: 'SMB',
    hireDate: new Date('2023-03-10'),
    targets: { monthly: 250000, quarterly: 750000, annual: 3000000 },
    performance: { revenue: 920000, deals: 24, activities: 156, winRate: 58, avgDealSize: 38333, salesCycle: 28 },
    pipeline: { total: 1100000, weighted: 770000, deals: 15 },
    achievement: { monthly: 92, quarterly: 82, annual: 31 }
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily.brown@company.com',
    team: 'Enterprise',
    hireDate: new Date('2021-11-05'),
    targets: { monthly: 550000, quarterly: 1650000, annual: 6600000 },
    performance: { revenue: 2890000, deals: 15, activities: 98, winRate: 75, avgDealSize: 192667, salesCycle: 42 },
    pipeline: { total: 4100000, weighted: 2870000, deals: 11 },
    achievement: { monthly: 131, quarterly: 116, annual: 44 }
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    team: 'Mid-Market',
    hireDate: new Date('2022-06-12'),
    targets: { monthly: 350000, quarterly: 1050000, annual: 4200000 },
    performance: { revenue: 1560000, deals: 21, activities: 142, winRate: 64, avgDealSize: 74286, salesCycle: 35 },
    pipeline: { total: 1950000, weighted: 1365000, deals: 14 },
    achievement: { monthly: 89, quarterly: 99, annual: 37 }
  }
]

const monthlyTrends = [
  { month: 'Jan', revenue: 1200000, deals: 28, target: 1500000, activities: 425 },
  { month: 'Feb', revenue: 1450000, deals: 32, target: 1500000, activities: 468 },
  { month: 'Mar', revenue: 1380000, deals: 29, target: 1500000, activities: 445 },
  { month: 'Apr', revenue: 1620000, deals: 35, target: 1500000, activities: 502 },
  { month: 'May', revenue: 1750000, deals: 38, target: 1500000, activities: 521 },
  { month: 'Jun', revenue: 1890000, deals: 42, target: 1500000, activities: 578 }
]

const pipelineStages = [
  { stage: 'Prospecting', count: 45, value: 2250000, avgDays: 12, color: '#8B5CF6' },
  { stage: 'Qualification', count: 28, value: 3360000, avgDays: 18, color: '#3B82F6' },
  { stage: 'Proposal', count: 15, value: 4500000, avgDays: 25, color: '#10B981' },
  { stage: 'Negotiation', count: 8, value: 3200000, avgDays: 35, color: '#F59E0B' },
  { stage: 'Closed Won', count: 12, value: 4800000, avgDays: 0, color: '#059669' }
]

const winLossAnalysis = [
  { reason: 'Price too high', won: 5, lost: 12, total: 17 },
  { reason: 'Feature mismatch', won: 8, lost: 8, total: 16 },
  { reason: 'Competitor chosen', won: 3, lost: 15, total: 18 },
  { reason: 'Budget constraints', won: 2, lost: 10, total: 12 },
  { reason: 'Timing issues', won: 4, lost: 6, total: 10 },
  { reason: 'No decision made', won: 6, lost: 9, total: 15 }
]

const activityMetrics = [
  { rep: 'John Smith', calls: 45, emails: 89, meetings: 23, demos: 8, proposals: 5 },
  { rep: 'Sarah Johnson', calls: 52, emails: 124, meetings: 31, demos: 12, proposals: 8 },
  { rep: 'Mike Davis', calls: 68, emails: 156, meetings: 28, demos: 15, proposals: 6 },
  { rep: 'Emily Brown', calls: 38, emails: 98, meetings: 25, demos: 9, proposals: 7 },
  { rep: 'David Wilson', calls: 58, emails: 142, meetings: 29, demos: 11, proposals: 9 }
]

function MetricCard({ 
  title, 
  value, 
  target, 
  change, 
  icon: Icon, 
  format = 'number',
  color = 'blue' 
}: {
  title: string
  value: number
  target?: number
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

  const progress = target ? (value / target) * 100 : undefined
  const isPositive = change ? change > 0 : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {target && (
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Target: {formatValue(target)}</span>
              <span>{progress?.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
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

function TeamPerformanceTable({ salesReps }: { salesReps: SalesRep[] }) {
  const sortedReps = [...salesReps].sort((a, b) => b.performance.revenue - a.performance.revenue)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance Leaderboard</CardTitle>
        <CardDescription>Individual rep performance and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Sales Rep</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Deals Won</TableHead>
              <TableHead>Win Rate</TableHead>
              <TableHead>Achievement</TableHead>
              <TableHead>Pipeline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReps.map((rep, index) => (
              <TableRow key={rep.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">#{index + 1}</span>
                    {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                    {index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{rep.name}</div>
                    <div className="text-sm text-muted-foreground">{rep.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{rep.team}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{formatCurrency(rep.performance.revenue)}</div>
                    <div className="text-sm text-muted-foreground">
                      Target: {formatCurrency(rep.targets.annual)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-medium">{rep.performance.deals}</div>
                    <div className="text-sm text-muted-foreground">
                      Avg: {formatCurrency(rep.performance.avgDealSize)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">{rep.performance.winRate}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${rep.performance.winRate}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={rep.achievement.annual >= 100 ? "default" : "secondary"}
                    className={rep.achievement.annual >= 100 ? "bg-green-500" : ""}
                  >
                    {rep.achievement.annual}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{formatCurrency(rep.pipeline.total)}</div>
                    <div className="text-sm text-muted-foreground">
                      {rep.pipeline.deals} deals
                    </div>
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

function SalesTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales Trends</CardTitle>
        <CardDescription>Revenue vs targets and deal volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'revenue' || name === 'target') {
                  return [formatCurrency(value as number), name === 'revenue' ? 'Revenue' : 'Target']
                }
                return [value, name === 'deals' ? 'Deals' : 'Activities']
              }}
            />
            <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="revenue" />
            <Line yAxisId="left" type="monotone" dataKey="target" stroke="#EF4444" strokeWidth={3} strokeDasharray="5 5" name="target" />
            <Line yAxisId="right" type="monotone" dataKey="deals" stroke="#10B981" strokeWidth={2} name="deals" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function PipelineAnalysisChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Analysis</CardTitle>
        <CardDescription>Distribution of deals across pipeline stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={pipelineStages}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ stage, value }) => `${stage}: ${formatCurrency(value)}`}
            >
              {pipelineStages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [formatCurrency(value as number), "Value"]} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function ActivityAnalysisChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Analysis</CardTitle>
        <CardDescription>Sales activities breakdown by rep</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={activityMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rep" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="calls" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
            <Area type="monotone" dataKey="emails" stackId="1" stroke="#10B981" fill="#10B981" />
            <Area type="monotone" dataKey="meetings" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
            <Area type="monotone" dataKey="demos" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
            <Area type="monotone" dataKey="proposals" stackId="1" stroke="#EF4444" fill="#EF4444" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function SalesPerformanceReports() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("currentMonth")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedRep, setSelectedRep] = useState("all")

  const filteredReps = useMemo(() => {
    return salesReps.filter(rep => {
      if (selectedTeam !== "all" && rep.team !== selectedTeam) return false
      if (selectedRep !== "all" && rep.id !== selectedRep) return false
      return true
    })
  }, [selectedTeam, selectedRep])

  const totalMetrics = useMemo(() => {
    return filteredReps.reduce((acc, rep) => ({
      revenue: acc.revenue + rep.performance.revenue,
      deals: acc.deals + rep.performance.deals,
      activities: acc.activities + rep.performance.activities,
      pipeline: acc.pipeline + rep.pipeline.total,
      target: acc.target + rep.targets.annual
    }), { revenue: 0, deals: 0, activities: 0, pipeline: 0, target: 0 })
  }, [filteredReps])

  const avgWinRate = useMemo(() => {
    return filteredReps.reduce((sum, rep) => sum + rep.performance.winRate, 0) / filteredReps.length
  }, [filteredReps])

  const avgSalesCycle = useMemo(() => {
    return filteredReps.reduce((sum, rep) => sum + rep.performance.salesCycle, 0) / filteredReps.length
  }, [filteredReps])

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Performance Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of sales team performance and pipeline health
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
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
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
        <MetricCard
          title="Total Revenue"
          value={totalMetrics.revenue}
          target={totalMetrics.target}
          change={15.2}
          icon={DollarSign}
          format="currency"
          color="green"
        />
        <MetricCard
          title="Deals Won"
          value={totalMetrics.deals}
          change={8.7}
          icon={Target}
          color="blue"
        />
        <MetricCard
          title="Win Rate"
          value={Math.round(avgWinRate)}
          change={3.4}
          icon={TrendingUp}
          format="percentage"
          color="purple"
        />
        <MetricCard
          title="Avg Deal Size"
          value={totalMetrics.revenue / totalMetrics.deals}
          change={12.1}
          icon={DollarSign}
          format="currency"
          color="orange"
        />
        <MetricCard
          title="Sales Cycle"
          value={Math.round(avgSalesCycle)}
          change={-5.2}
          icon={Clock}
          color="indigo"
        />
        <MetricCard
          title="Pipeline Value"
          value={totalMetrics.pipeline}
          change={22.8}
          icon={BarChart3}
          format="currency"
          color="emerald"
        />
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="winloss">Win/Loss Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SalesTrendsChart />
            <PipelineAnalysisChart />
          </div>
          <TeamPerformanceTable salesReps={filteredReps} />
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <TeamPerformanceTable salesReps={filteredReps} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Distribution</CardTitle>
                <CardDescription>How many reps are hitting their targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Above 120%</span>
                    <Badge className="bg-green-500">
                      {filteredReps.filter(r => r.achievement.annual >= 120).length} reps
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>100-119%</span>
                    <Badge className="bg-blue-500">
                      {filteredReps.filter(r => r.achievement.annual >= 100 && r.achievement.annual < 120).length} reps
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>80-99%</span>
                    <Badge variant="secondary">
                      {filteredReps.filter(r => r.achievement.annual >= 80 && r.achievement.annual < 100).length} reps
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Below 80%</span>
                    <Badge variant="destructive">
                      {filteredReps.filter(r => r.achievement.annual < 80).length} reps
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Leading reps by key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Highest Revenue</p>
                    <p className="text-lg font-bold text-green-600">
                      {[...filteredReps].sort((a, b) => b.performance.revenue - a.performance.revenue)[0]?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Best Win Rate</p>
                    <p className="text-lg font-bold text-blue-600">
                      {[...filteredReps].sort((a, b) => b.performance.winRate - a.performance.winRate)[0]?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Most Deals</p>
                    <p className="text-lg font-bold text-purple-600">
                      {[...filteredReps].sort((a, b) => b.performance.deals - a.performance.deals)[0]?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Largest Pipeline</p>
                    <p className="text-lg font-bold text-orange-600">
                      {[...filteredReps].sort((a, b) => b.pipeline.total - a.pipeline.total)[0]?.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PipelineAnalysisChart />
            <Card>
              <CardHeader>
                <CardTitle>Stage Conversion Rates</CardTitle>
                <CardDescription>How deals progress through the pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineStages.slice(0, -1).map((stage, index) => {
                    const nextStage = pipelineStages[index + 1]
                    const conversionRate = nextStage ? (nextStage.count / stage.count) * 100 : 0
                    return (
                      <div key={stage.stage} className="flex items-center justify-between">
                        <span className="text-sm">{stage.stage} → {nextStage?.stage}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${conversionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{conversionRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Health Metrics</CardTitle>
              <CardDescription>Key indicators of pipeline quality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{pipelineStages.reduce((sum, stage) => sum + stage.count, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Deals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatCurrency(pipelineStages.reduce((sum, stage) => sum + stage.value, 0))}</p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {(pipelineStages.reduce((sum, stage) => sum + (stage.avgDays * stage.count), 0) / 
                      pipelineStages.reduce((sum, stage) => sum + stage.count, 0)).toFixed(0)} days
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Time in Pipeline</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {((pipelineStages[pipelineStages.length - 1].count / pipelineStages[0].count) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Overall Conversion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <ActivityAnalysisChart />
          <Card>
            <CardHeader>
              <CardTitle>Activity Effectiveness</CardTitle>
              <CardDescription>Correlation between activities and results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Total Count</TableHead>
                    <TableHead>Avg per Rep</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Revenue Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Calls</TableCell>
                    <TableCell>261</TableCell>
                    <TableCell>52</TableCell>
                    <TableCell>23%</TableCell>
                    <TableCell>Low</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Emails</TableCell>
                    <TableCell>609</TableCell>
                    <TableCell>122</TableCell>
                    <TableCell>8%</TableCell>
                    <TableCell>Low</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Meetings</TableCell>
                    <TableCell>136</TableCell>
                    <TableCell>27</TableCell>
                    <TableCell>65%</TableCell>
                    <TableCell>High</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Demos</TableCell>
                    <TableCell>55</TableCell>
                    <TableCell>11</TableCell>
                    <TableCell>78%</TableCell>
                    <TableCell>Very High</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Proposals</TableCell>
                    <TableCell>35</TableCell>
                    <TableCell>7</TableCell>
                    <TableCell>85%</TableCell>
                    <TableCell>Very High</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winloss" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Win/Loss Analysis</CardTitle>
              <CardDescription>Understanding why deals are won or lost</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead>Won</TableHead>
                    <TableHead>Lost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winLossAnalysis.map((item) => {
                    const winRate = (item.won / item.total) * 100
                    return (
                      <TableRow key={item.reason}>
                        <TableCell className="font-medium">{item.reason}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500">
                            {item.won}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {item.lost}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.total}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${winRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{winRate.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {winRate > 50 ? (
                            <Badge className="bg-green-500">Positive</Badge>
                          ) : winRate > 30 ? (
                            <Badge variant="secondary">Neutral</Badge>
                          ) : (
                            <Badge variant="destructive">Negative</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
