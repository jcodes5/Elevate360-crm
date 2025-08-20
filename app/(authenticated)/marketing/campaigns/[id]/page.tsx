"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Target,
  MapPin,
  User,
  Tag,
  FileText,
  Share2,
  Download,
  MoreHorizontal,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts"
import { CampaignService } from "@/services/campaign-service"
import { CampaignModel } from "@/lib/models"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Mock data for campaign details
const mockCampaign: CampaignModel = {
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
}

// Mock data for charts
const performanceData = [
  { time: "9:00", sent: 100, delivered: 98, opened: 45, clicked: 8 },
  { time: "10:00", sent: 150, delivered: 148, opened: 67, clicked: 12 },
  { time: "11:00", sent: 200, delivered: 198, opened: 89, clicked: 18 },
  { time: "12:00", sent: 180, delivered: 178, opened: 80, clicked: 15 },
  { time: "13:00", sent: 160, delivered: 158, opened: 72, clicked: 14 },
  { time: "14:00", sent: 140, delivered: 138, opened: 63, clicked: 11 },
  { time: "15:00", sent: 120, delivered: 118, opened: 54, clicked: 9 },
  { time: "16:00", sent: 100, delivered: 98, opened: 45, clicked: 7 },
  { time: "17:00", sent: 80, delivered: 78, opened: 36, clicked: 5 },
  { time: "18:00", sent: 60, delivered: 58, opened: 27, clicked: 3 },
]

const geographicData = [
  { name: "Lagos", value: 400 },
  { name: "Abuja", value: 300 },
  { name: "Port Harcourt", value: 200 },
  { name: "Kano", value: 150 },
  { name: "Ibadan", value: 100 },
]

const deviceData = [
  { name: "Desktop", value: 350 },
  { name: "Mobile", value: 750 },
  { name: "Tablet", value: 150 },
]

const conversionFunnel = [
  { stage: "Sent", count: 1250, rate: 100 },
  { stage: "Delivered", count: 1235, rate: 98.8 },
  { stage: "Opened", count: 556, rate: 44.5 },
  { stage: "Clicked", count: 78, rate: 6.2 },
  { stage: "Converted", count: 8, rate: 0.64 },
]

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<CampaignModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        // In a real implementation, this would call CampaignService.getCampaignById(params.id)
        // const campaignData = await CampaignService.getCampaignById(params.id)
        const campaignData = mockCampaign
        setCampaign(campaignData)
      } catch (err) {
        setError("Failed to load campaign details")
        toast({
          title: "Error",
          description: "Failed to load campaign details. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading campaign details...</div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">Error: {error || "Campaign not found"}</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <FileText className="h-4 w-4" />
      case "sms":
        return <MessageSquare className="h-4 w-4" />
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Campaign Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.metrics.delivered} of {campaign.metrics.sent} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.openRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.metrics.opened} opens
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.metrics.clicked} clicks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.metrics.conversions} conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="h-80">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>
              Campaign performance metrics throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sent" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="delivered" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="opened" stackId="1" stroke="#ffc658" fill="#ffc658" />
                <Area type="monotone" dataKey="clicked" stackId="1" stroke="#ff7300" fill="#ff7300" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
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
                data={conversionFunnel}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {conversionFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Geographic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={geographicData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {geographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-medium">₦{campaign.metrics.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROI</span>
              <span className="font-medium">{campaign.metrics.returnOnInvestment}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPA</span>
              <span className="font-medium">₦{campaign.metrics.costPerAcquisition.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unsubscribe Rate</span>
              <span className="font-medium">{campaign.metrics.unsubscribeRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bounce Rate</span>
              <span className="font-medium">{campaign.metrics.bounceRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Type:</span>
              <span className="ml-2 capitalize">{campaign.type}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Category:</span>
              <span className="ml-2 capitalize">{campaign.category}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Scheduled:</span>
              <span className="ml-2">
                {campaign.scheduledAt ? campaign.scheduledAt.toLocaleString() : "Not scheduled"}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Sent:</span>
              <span className="ml-2">
                {campaign.sentAt ? campaign.sentAt.toLocaleString() : "Not sent"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Audience:</span>
              <span className="ml-2">{campaign.targetAudience.totalSize} contacts</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Timezone:</span>
              <span className="ml-2">{campaign.timezone}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Created By:</span>
              <span className="ml-2">{campaign.createdBy}</span>
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Tags:</span>
              <div className="ml-2 flex flex-wrap gap-1">
                {campaign.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}