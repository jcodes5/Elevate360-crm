"use client"

import { useState } from "react"
import { TrendingUp, Users, DollarSign, Mail, MessageSquare, Phone, Target, BarChart3, FileText, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"
import { formatCurrency } from "@/lib/utils"
import { DashboardOverview } from "@/components/analytics/dashboard-overview"
import { AdvancedReports } from "@/components/analytics/advanced-reports"
import { ExportManager } from "@/components/analytics/export-manager"
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
} from "recharts"

// Mock data
const revenueData = [
  { month: "Jan", revenue: 1200000, deals: 15, contacts: 120 },
  { month: "Feb", revenue: 1800000, deals: 22, contacts: 180 },
  { month: "Mar", revenue: 1500000, deals: 18, contacts: 150 },
  { month: "Apr", revenue: 2200000, deals: 28, contacts: 220 },
  { month: "May", revenue: 1900000, deals: 24, contacts: 190 },
  { month: "Jun", revenue: 2450000, deals: 32, contacts: 245 },
]

const campaignData = [
  { month: "Jan", email: 2500, sms: 1200, whatsapp: 800 },
  { month: "Feb", email: 3200, sms: 1800, whatsapp: 1200 },
  { month: "Mar", email: 2800, sms: 1500, whatsapp: 1000 },
  { month: "Apr", email: 3800, sms: 2200, whatsapp: 1500 },
  { month: "May", email: 3400, sms: 1900, whatsapp: 1300 },
  { month: "Jun", email: 4200, sms: 2500, whatsapp: 1800 },
]

const leadSourceData = [
  { name: "Website", value: 35, color: "#3B82F6" },
  { name: "Social Media", value: 28, color: "#10B981" },
  { name: "Referrals", value: 20, color: "#F59E0B" },
  { name: "Email", value: 12, color: "#EF4444" },
  { name: "Direct", value: 5, color: "#8B5CF6" },
]

const conversionFunnelData = [
  { stage: "Visitors", count: 10000, percentage: 100 },
  { stage: "Leads", count: 2500, percentage: 25 },
  { stage: "Qualified", count: 1000, percentage: 10 },
  { stage: "Proposals", count: 400, percentage: 4 },
  { stage: "Customers", count: 120, percentage: 1.2 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <MainLayout
      breadcrumbs={[{ label: "Analytics" }]}
      actions={
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
            <p className="text-muted-foreground">Track your business performance and growth</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(12065000)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+23%</span> from last period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12%</span> from last period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deals Closed</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">139</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+18%</span> from last period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23.5%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+2.1%</span> from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Where your leads are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(2850000)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8%</span> from last period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sales Cycle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28 days</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600">+3 days</span> from last period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">67%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+5%</span> from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Deals and contacts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="deals" stroke="#3B82F6" name="Deals" />
                    <Line yAxisId="right" type="monotone" dataKey="contacts" stroke="#10B981" name="Contacts" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">21,400</div>
                  <p className="text-xs text-muted-foreground">Messages sent this period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SMS Campaigns</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,100</div>
                  <p className="text-xs text-muted-foreground">Messages sent this period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">WhatsApp Messages</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,600</div>
                  <p className="text-xs text-muted-foreground">Messages sent this period</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Messages sent by channel over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={campaignData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="email" fill="#3B82F6" name="Email" />
                    <Bar dataKey="sms" fill="#10B981" name="SMS" />
                    <Bar dataKey="whatsapp" fill="#F59E0B" name="WhatsApp" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Track how visitors convert to customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnelData.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center space-x-4">
                      <div className="w-24 text-sm font-medium">{stage.stage}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{stage.count.toLocaleString()}</span>
                          <span className="text-sm text-gray-600">{stage.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stage.percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Converting Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Website</span>
                      <span className="font-medium">12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Social Media</span>
                      <span className="font-medium">8.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email Marketing</span>
                      <span className="font-medium">15.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Referrals</span>
                      <span className="font-medium">22.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Lead to Qualified</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Qualified to Proposal</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Proposal to Customer</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Overall Conversion</span>
                      <span className="font-medium text-green-600">4.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
