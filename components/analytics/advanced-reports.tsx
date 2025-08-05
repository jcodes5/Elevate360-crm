"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Search,
  Filter,
  Calendar,
  ArrowUpIcon,
  ArrowDownIcon,
  Eye,
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
  ComposedChart,
  Area,
  AreaChart,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { ExportManager } from "./export-manager"

// Enhanced mock data for detailed reports
const salesReport = [
  { 
    id: 1,
    date: "2024-01-15",
    salesperson: "John Smith",
    contact: "Tech Corp",
    dealValue: 125000,
    stage: "Closed Won",
    source: "Website",
    product: "Enterprise Plan",
    probability: 100,
    daysInPipeline: 45
  },
  {
    id: 2,
    date: "2024-01-18",
    salesperson: "Sarah Johnson", 
    contact: "Innovation Labs",
    dealValue: 85000,
    stage: "Proposal",
    source: "Referral",
    product: "Professional Plan",
    probability: 75,
    daysInPipeline: 23
  },
  {
    id: 3,
    date: "2024-01-20",
    salesperson: "Mike Davis",
    contact: "StartupXYZ",
    dealValue: 45000,
    stage: "Negotiation",
    source: "Social Media",
    product: "Starter Plan",
    probability: 60,
    daysInPipeline: 18
  },
  {
    id: 4,
    date: "2024-01-22",
    salesperson: "Emily Brown",
    contact: "Global Enterprises",
    dealValue: 250000,
    stage: "Closed Won",
    source: "Email Campaign",
    product: "Enterprise Plan",
    probability: 100,
    daysInPipeline: 67
  },
  {
    id: 5,
    date: "2024-01-25",
    salesperson: "David Wilson",
    contact: "Future Tech",
    dealValue: 95000,
    stage: "Qualified",
    source: "Website",
    product: "Professional Plan", 
    probability: 40,
    daysInPipeline: 12
  }
]

const marketingReport = [
  {
    id: 1,
    campaignName: "Q1 Product Launch",
    channel: "Email",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    budget: 15000,
    spent: 12500,
    impressions: 245000,
    clicks: 8500,
    conversions: 125,
    revenue: 187500,
    ctr: 3.47,
    cpc: 1.47,
    roas: 15.0
  },
  {
    id: 2,
    campaignName: "Winter Sale",
    channel: "Social Media",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    budget: 8000,
    spent: 7200,
    impressions: 180000,
    clicks: 5400,
    conversions: 78,
    revenue: 94500,
    ctr: 3.0,
    cpc: 1.33,
    roas: 13.13
  },
  {
    id: 3,
    campaignName: "LinkedIn Ads",
    channel: "LinkedIn",
    startDate: "2024-01-10",
    endDate: "2024-02-10",
    budget: 12000,
    spent: 11800,
    impressions: 95000,
    clicks: 2850,
    conversions: 89,
    revenue: 156750,
    ctr: 3.0,
    cpc: 4.14,
    roas: 13.29
  }
]

const customerReport = [
  {
    id: 1,
    name: "Tech Corp",
    email: "contact@techcorp.com",
    company: "Tech Corp",
    status: "Active",
    totalValue: 450000,
    dealCount: 3,
    lastActivity: "2024-01-20",
    source: "Website",
    segment: "Enterprise",
    engagementScore: 95
  },
  {
    id: 2,
    name: "Innovation Labs",
    email: "info@innovlabs.com", 
    company: "Innovation Labs",
    status: "Prospect",
    totalValue: 85000,
    dealCount: 1,
    lastActivity: "2024-01-18",
    source: "Referral",
    segment: "Mid-Market",
    engagementScore: 78
  },
  {
    id: 3,
    name: "Global Enterprises",
    email: "sales@globalent.com",
    company: "Global Enterprises", 
    status: "Active",
    totalValue: 750000,
    dealCount: 5,
    lastActivity: "2024-01-22",
    source: "Email Campaign",
    segment: "Enterprise",
    engagementScore: 92
  }
]

const performanceReport = [
  {
    salesperson: "John Smith",
    dealsWon: 15,
    dealsLost: 8,
    totalRevenue: 1250000,
    avgDealSize: 83333,
    winRate: 65.2,
    avgSalesCycle: 42,
    activitiesLogged: 245,
    target: 1500000,
    achievement: 83.3
  },
  {
    salesperson: "Sarah Johnson",
    dealsWon: 18,
    dealsLost: 6,
    totalRevenue: 1450000,
    avgDealSize: 80556,
    winRate: 75.0,
    avgSalesCycle: 38,
    activitiesLogged: 298,
    target: 1400000,
    achievement: 103.6
  },
  {
    salesperson: "Mike Davis",
    dealsWon: 12,
    dealsLost: 10,
    totalRevenue: 980000,
    avgDealSize: 81667,
    winRate: 54.5,
    avgSalesCycle: 45,
    activitiesLogged: 189,
    target: 1200000,
    achievement: 81.7
  },
  {
    salesperson: "Emily Brown",
    dealsWon: 22,
    dealsLost: 5,
    totalRevenue: 1750000,
    avgDealSize: 79545,
    winRate: 81.5,
    avgSalesCycle: 35,
    activitiesLogged: 356,
    target: 1600000,
    achievement: 109.4
  }
]

interface ReportTableProps {
  data: any[]
  columns: { key: string; label: string; type?: string }[]
  searchable?: boolean
  filterable?: boolean
}

function ReportTable({ data, columns, searchable = true, filterable = false }: ReportTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const filteredData = useMemo(() => {
    let filtered = data

    if (searchTerm) {
      filtered = filtered.filter(item =>
        columns.some(col => {
          const value = item[col.key]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        
        const aString = aValue?.toString() || ''
        const bString = bValue?.toString() || ''
        
        if (sortConfig.direction === 'asc') {
          return aString.localeCompare(bString)
        } else {
          return bString.localeCompare(aString)
        }
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig, columns])

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const formatValue = (value: any, type?: string) => {
    if (value === null || value === undefined) return '-'
    
    switch (type) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return `${value}%`
      case 'date':
        return new Date(value).toLocaleDateString()
      default:
        return value
    }
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-3 w-3" /> : 
                        <ArrowDownIcon className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {formatValue(row[column.key], column.type)}
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredData.length} of {data.length} records</span>
        <div className="flex items-center space-x-2">
          <ExportManager />
        </div>
      </div>
    </div>
  )
}

export function AdvancedReports() {
  const [activeTab, setActiveTab] = useState("sales")

  const salesColumns = [
    { key: "date", label: "Date", type: "date" },
    { key: "salesperson", label: "Salesperson" },
    { key: "contact", label: "Contact" },
    { key: "dealValue", label: "Deal Value", type: "currency" },
    { key: "stage", label: "Stage" },
    { key: "source", label: "Source" },
    { key: "probability", label: "Probability", type: "percentage" },
    { key: "daysInPipeline", label: "Days in Pipeline" }
  ]

  const marketingColumns = [
    { key: "campaignName", label: "Campaign" },
    { key: "channel", label: "Channel" },
    { key: "spent", label: "Spent", type: "currency" },
    { key: "impressions", label: "Impressions" },
    { key: "clicks", label: "Clicks" },
    { key: "conversions", label: "Conversions" },
    { key: "revenue", label: "Revenue", type: "currency" },
    { key: "roas", label: "ROAS" }
  ]

  const customerColumns = [
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "totalValue", label: "Total Value", type: "currency" },
    { key: "dealCount", label: "Deals" },
    { key: "lastActivity", label: "Last Activity", type: "date" },
    { key: "source", label: "Source" },
    { key: "engagementScore", label: "Engagement" }
  ]

  const performanceColumns = [
    { key: "salesperson", label: "Salesperson" },
    { key: "dealsWon", label: "Deals Won" },
    { key: "totalRevenue", label: "Revenue", type: "currency" },
    { key: "avgDealSize", label: "Avg Deal Size", type: "currency" },
    { key: "winRate", label: "Win Rate", type: "percentage" },
    { key: "avgSalesCycle", label: "Avg Cycle (days)" },
    { key: "achievement", label: "Target Achievement", type: "percentage" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Reports</h2>
          <p className="text-muted-foreground">
            Detailed analytics and data exports for comprehensive business insights
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Report</TabsTrigger>
          <TabsTrigger value="customers">Customer Report</TabsTrigger>
          <TabsTrigger value="performance">Performance Report</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance Report</CardTitle>
              <CardDescription>
                Detailed breakdown of all sales activities, deals, and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable 
                data={salesReport} 
                columns={salesColumns}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaign Report</CardTitle>
              <CardDescription>
                Analysis of campaign performance, ROI, and channel effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable 
                data={marketingReport} 
                columns={marketingColumns}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics Report</CardTitle>
              <CardDescription>
                Customer behavior, engagement, and value analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable 
                data={customerReport} 
                columns={customerColumns}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Report</CardTitle>
              <CardDescription>
                Individual and team sales performance metrics and KPIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable 
                data={performanceReport} 
                columns={performanceColumns}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
