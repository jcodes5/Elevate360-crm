"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Share2,
  MoreHorizontal,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, Scatter
} from "recharts"
import { CampaignService } from "@/services/campaign-service"
import { CampaignModel, CampaignAnalytics } from "@/lib/models"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Mock data for analytics
const mockAnalytics: CampaignAnalytics = {
  performance: {
    totalCampaigns: 25,
    activeCampaigns: 5,
    completedCampaigns: 20,
    averageOpenRate: 42.5,
    averageClickRate: 8.2,
    averageConversionRate: 2.1,
    totalRevenue: 125000,
    averageROI: 3.8,
    bestPerformingCampaign: {
      id: "1",
      name: "Welcome Email Series",
      metric: "openRate",
      value: 65.2
    }
  },
  audience: {
    totalAudience: 15000,
    activeSubscribers: 12500,
    unsubscribed: 1500,
    bounced: 1000,
    demographics: {
      age: {
        "18-24": 1500,
        "25-34": 4500,
        "35-44": 3750,
        "45-54": 2250,
        "55+": 1500
      },
      gender: {
        male: 6750,
        female: 6750,
        other: 1500
      },
      industry: {
        technology: 3000,
        healthcare: 2250,
        finance: 1875,
        education: 1500,
        retail: 1125,
        manufacturing: 900,
        other: 4500
      },
      company_size: {
        "1-10": 1500,
        "11-50": 2250,
        "51-200": 3000,
        "201-1000": 3750,
        "1000+": 4500
      }
    },
    geographic: {
      countries: {
        nigeria: 8000,
        ghana: 2500,
        kenya: 1500,
        south_africa: 1250,
        uganda: 750,
        other: 1000
      },
      regions: {
        lagos: 3000,
        abuja: 1500,
        port_harcourt: 1000,
        accra: 800,
        nairobi: 600,
        cape_town: 500,
        kampala: 300,
        other: 6300
      },
      cities: {
        "Lagos Island": 1200,
        "Lagos Mainland": 800,
        "Victoria Island": 600,
        "Ikoyi": 400,
        "Ajah": 300,
        other: 10700
      }
    },
    segmentPerformance: {
      "High Value": 65.2,
      "Engaged": 52.8,
      "New Subscribers": 48.1,
      "Inactive": 12.3,
      "VIP": 78.9
    }
  },
  engagement: {
    emailOpens: 5250,
    linkClicks: 825,
    socialShares: 150,
    forwardRate: 3.2,
    timeToOpen: 120,
    timeToClick: 180,
    engagementByTime: {
      opensByHour: {
        "9": 250,
        "10": 350,
        "11": 450,
        "12": 500,
        "13": 400,
        "14": 350,
        "15": 300,
        "16": 250,
        "17": 200,
        "18": 150
      },
      clicksByHour: {
        "9": 25,
        "10": 50,
        "11": 75,
        "12": 100,
        "13": 80,
        "14": 75,
        "15": 60,
        "16": 50,
        "17": 40,
        "18": 30
      },
      opensByDay: {
        "Monday": 750,
        "Tuesday": 800,
        "Wednesday": 850,
        "Thursday": 900,
        "Friday": 750,
        "Saturday": 600,
        "Sunday": 600
      },
      clicksByDay: {
        "Monday": 120,
        "Tuesday": 130,
        "Wednesday": 140,
        "Thursday": 150,
        "Friday": 120,
        "Saturday": 90,
        "Sunday": 75
      },
      bestTimeToSend: {
        hour: 12,
        day: "Thursday"
      }
    },
    topPerformingContent: [
      {
        content: "Special offer for our loyal customers",
        metric: "clickRate",
        value: 15.2
      },
      {
        content: "New features now available",
        metric: "openRate",
        value: 72.5
      },
      {
        content: "Exclusive webinar invitation",
        metric: "conversionRate",
        value: 8.7
      }
    ]
  },
  conversion: {
    totalConversions: 250,
    conversionRate: 2.1,
    conversionValue: 125000,
    averageOrderValue: 500,
    topConvertingCampaigns: [
      {
        id: "1",
        name: "Welcome Email Series",
        conversions: 75,
        value: 37500
      },
      {
        id: "2",
        name: "Product Feature Announcement",
        conversions: 60,
        value: 30000
      },
      {
        id: "3",
        name: "WhatsApp Promo Campaign",
        conversions: 45,
        value: 22500
      }
    ],
    conversionFunnel: [
      {
        stage: "Sent",
        count: 12000,
        rate: 100
      },
      {
        stage: "Delivered",
        count: 11800,
        rate: 98.3
      },
      {
        stage: "Opened",
        count: 5100,
        rate: 42.5
      },
      {
        stage: "Clicked",
        count: 840,
        rate: 7.0
      },
      {
        stage: "Converted",
        count: 250,
        rate: 2.1
      }
    ]
  },
  trends: {
    openRateTrend: [
      { date: new Date("2024-01-01"), value: 38.2, change: 2.1, changePercent: 5.8 },
      { date: new Date("2024-01-08"), value: 40.1, change: 1.9, changePercent: 4.9 },
      { date: new Date("2024-01-15"), value: 42.5, change: 2.4, changePercent: 6.0 },
      { date: new Date("2024-01-22"), value: 41.8, change: -0.7, changePercent: -1.6 },
      { date: new Date("2024-01-29"), value: 43.2, change: 1.4, changePercent: 3.3 }
    ],
    clickRateTrend: [
      { date: new Date("2024-01-01"), value: 7.5, change: 0.8, changePercent: 11.9 },
      { date: new Date("2024-01-08"), value: 8.1, change: 0.6, changePercent: 8.0 },
      { date: new Date("2024-01-15"), value: 8.5, change: 0.4, changePercent: 4.9 },
      { date: new Date("2024-01-22"), value: 8.0, change: -0.5, changePercent: -5.9 },
      { date: new Date("2024-01-29"), value: 8.2, change: 0.2, changePercent: 2.5 }
    ],
    conversionTrend: [
      { date: new Date("2024-01-01"), value: 1.8, change: 0.2, changePercent: 12.5 },
      { date: new Date("2024-01-08"), value: 1.9, change: 0.1, changePercent: 5.6 },
      { date: new Date("2024-01-15"), value: 2.2, change: 0.3, changePercent: 15.8 },
      { date: new Date("2024-01-22"), value: 2.0, change: -0.2, changePercent: -9.1 },
      { date: new Date("2024-01-29"), value: 2.1, change: 0.1, changePercent: 5.0 }
    ],
    revenueTrend: [
      { date: new Date("2024-01-01"), value: 22500, change: 2500, changePercent: 12.5 },
      { date: new Date("2024-01-08"), value: 24000, change: 1500, changePercent: 6.7 },
      { date: new Date("2024-01-15"), value: 27500, change: 3500, changePercent: 14.6 },
      { date: new Date("2024-01-22"), value: 25000, change: -2500, changePercent: -9.1 },
      { date: new Date("2024-01-29"), value: 25000, change: 0, changePercent: 0 }
    ],
    audienceGrowth: [
      { date: new Date("2024-01-01"), value: 12000, change: 500, changePercent: 4.3 },
      { date: new Date("2024-01-08"), value: 12250, change: 250, changePercent: 2.1 },
      { date: new Date("2024-01-15"), value: 12750, change: 500, changePercent: 4.1 },
      { date: new Date("2024-01-22"), value: 13000, change: 250, changePercent: 1.9 },
      { date: new Date("2024-01-29"), value: 13250, change: 250, changePercent: 1.9 }
    ]
  },
  benchmarks: {
    industryBenchmarks: {
      openRate: 22.5,
      clickRate: 3.2,
      conversionRate: 1.1,
      unsubscribeRate: 0.3
    },
    competitorComparison: {
      openRate: 38.7,
      clickRate: 6.8,
      conversionRate: 1.8,
      unsubscribeRate: 0.5
    },
    historicalComparison: {
      openRate: 39.2,
      clickRate: 7.1,
      conversionRate: 1.9,
      unsubscribeRate: 0.4
    },
    performanceGrades: {
      openRate: "A",
      clickRate: "B",
      conversionRate: "A",
      unsubscribeRate: "A"
    }
  }
}

// Format data for charts
const formatTrendData = (data: any[]) => {
  return data.map(item => ({
    ...item,
    date: format(item.date, "MMM dd")
  }))
}

const formatDemographicData = (data: Record<string, number>) => {
  return Object.entries(data).map(([name, value]) => ({ name, value }))
}

export default function CampaignAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState("last_30_days")
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        // In a real implementation, this would call CampaignService.getAnalytics()
        // const analyticsData = await CampaignService.getAnalytics()
        const analyticsData = mockAnalytics
        setAnalytics(analyticsData)
      } catch (err) {
        setError("Failed to load analytics data")
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange, selectedCampaign])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">Error: {error || "Failed to load analytics"}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your campaign performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.averageOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry avg: {analytics.benchmarks.industryBenchmarks.openRate}%
            </p>
            <Badge variant={analytics.benchmarks.performanceGrades.openRate === "A" ? "default" : "secondary"} className="mt-1">
              Grade: {analytics.benchmarks.performanceGrades.openRate}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.averageClickRate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry avg: {analytics.benchmarks.industryBenchmarks.clickRate}%
            </p>
            <Badge variant={analytics.benchmarks.performanceGrades.clickRate === "A" ? "default" : "secondary"} className="mt-1">
              Grade: {analytics.benchmarks.performanceGrades.clickRate}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.averageConversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry avg: {analytics.benchmarks.industryBenchmarks.conversionRate}%
            </p>
            <Badge variant={analytics.benchmarks.performanceGrades.conversionRate === "A" ? "default" : "secondary"} className="mt-1">
              Grade: {analytics.benchmarks.performanceGrades.conversionRate}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{analytics.performance.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {analytics.conversion.totalConversions} conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="h-80">
          <CardHeader>
            <CardTitle>Open Rate Trend</CardTitle>
            <CardDescription>
              How your open rates have changed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatTrendData(analytics.trends.openRateTrend)}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="h-80">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Revenue generated by your campaigns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formatTrendData(analytics.trends.revenueTrend)}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Audience Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="h-80">
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
            <CardDescription>
              Breakdown of your audience by age group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatDemographicData(analytics.audience.demographics.age)}
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
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="h-80">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>
              Where your audience is located
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatDemographicData(analytics.audience.geographic.countries)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {formatDemographicData(analytics.audience.geographic.countries).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="h-80">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            Journey from sent to conversion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics.conversion.conversionFunnel}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 100,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {analytics.conversion.conversionFunnel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
          <CardDescription>
            Campaigns with the highest conversion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.conversion.topConvertingCampaigns.map((campaign, index) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {campaign.conversions} conversions • ₦{campaign.value.toLocaleString()} revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {((campaign.value / campaign.conversions)).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg. order value</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}