"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { CreateCampaignModal } from "@/components/modals/create-campaign-modal"
import { AddContactModal } from "@/components/modals/add-contact-modal"
import {
  Users,
  DollarSign,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// API fetching functions
const fetchDashboardStats = async () => {
  const response = await fetch('/api/dashboard/stats')
  const data = await response.json()
  return data.data
}

const fetchRecentActivities = async () => {
  const response = await fetch('/api/dashboard/activities')
  const data = await response.json()
  return data.data
}

const fetchUpcomingTasks = async () => {
  const response = await fetch('/api/dashboard/tasks')
  const data = await response.json()
  return data.data
}

export default function DashboardPage() {
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: fetchRecentActivities,
  })

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["upcoming-tasks"],
    queryFn: fetchUpcomingTasks,
  })

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case "Schedule Call":
        // Navigate to appointments page with call type pre-selected
        router.push('/appointments?quickAction=call')
        toast({
          title: "Schedule Call",
          description: "Opening call scheduling interface...",
        })
        break
      case "Send Email":
        // Open email composer
        window.open('mailto:')
        toast({
          title: "Send Email",
          description: "Opening email composer...",
        })
        break
      case "View Analytics":
        // Navigate to analytics page
        router.push('/analytics')
        toast({
          title: "View Analytics",
          description: "Redirecting to analytics dashboard...",
        })
        break
      case "Book Meeting":
        // Navigate to appointments page with meeting type pre-selected
        router.push('/appointments?quickAction=meeting')
        toast({
          title: "Book Meeting",
          description: "Opening meeting booking interface...",
        })
        break
      default:
        toast({
          title: "Quick Action",
          description: `${action} feature will be available soon!`,
        })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your business today.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowAddContact(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
              <Button onClick={() => setShowCreateCampaign(true)}>
                <Zap className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.totalContacts?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stats?.contactsGrowth !== undefined ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />+{stats?.contactsGrowth}% from last month
                    </>
                  ) : (
                    "No data available"
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : `₦${stats?.totalRevenue?.toLocaleString() || "0"}`}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stats?.revenueGrowth !== undefined ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />+{stats?.revenueGrowth}% from last month
                    </>
                  ) : (
                    "No data available"
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.activeDeals || "0"}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stats?.dealsGrowth !== undefined ? (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      {stats?.dealsGrowth}% from last month
                    </>
                  ) : (
                    "No data available"
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.campaignsSent || "0"}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stats?.campaignsGrowth !== undefined ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />+{stats?.campaignsGrowth}% from last month
                    </>
                  ) : (
                    "No data available"
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Activities */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest business activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activitiesLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities && activities.length > 0 ? (
                    activities?.map((activity: any) => {
                      const Icon = activity.icon
                      return (
                        <div key={activity.id} className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No recent activities found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Tasks */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions & Tasks</CardTitle>
                <CardDescription>Manage your daily tasks and quick actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="actions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="actions">Quick Actions</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  </TabsList>

                  <TabsContent value="actions" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-20 flex-col bg-transparent"
                        onClick={() => handleQuickAction("Schedule Call")}
                      >
                        <Phone className="h-5 w-5 mb-2" />
                        <span className="text-xs">Schedule Call</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col bg-transparent"
                        onClick={() => handleQuickAction("Send Email")}
                      >
                        <Mail className="h-5 w-5 mb-2" />
                        <span className="text-xs">Send Email</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col bg-transparent"
                        onClick={() => handleQuickAction("View Analytics")}
                      >
                        <BarChart3 className="h-5 w-5 mb-2" />
                        <span className="text-xs">Analytics</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col bg-transparent"
                        onClick={() => handleQuickAction("Book Meeting")}
                      >
                        <Calendar className="h-5 w-5 mb-2" />
                        <span className="text-xs">Book Meeting</span>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="tasks" className="space-y-4 mt-4">
                    {tasksLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : tasks && tasks.length > 0 ? (
                      <div className="space-y-3">
                        {tasks?.slice(0, 3).map((task: any) => (
                          <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <div className="flex-shrink-0">
                              {task.status === "completed" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : task.priority === "high" ? (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                            </div>
                            <Badge
                              variant={
                                task.priority === "high"
                                  ? "destructive"
                                  : task.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No upcoming tasks found</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Overview */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Pipeline</CardTitle>
                <CardDescription>Current deals in your pipeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Prospecting</span>
                    <span>₦450,000</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Qualification</span>
                    <span>₦320,000</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Proposal</span>
                    <span>₦180,000</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Negotiation</span>
                    <span>₦95,000</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Your best campaigns this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>EM</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">Email Marketing Campaign</p>
                      <p className="text-sm text-muted-foreground">45% open rate • 12% click rate</p>
                    </div>
                    <div className="text-sm font-medium text-green-600">+₦85,000</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>WA</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">WhatsApp Broadcast</p>
                      <p className="text-sm text-muted-foreground">78% delivery rate • 23% response rate</p>
                    </div>
                    <div className="text-sm font-medium text-green-600">+₦62,000</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">SMS Campaign</p>
                      <p className="text-sm text-muted-foreground">92% delivery rate • 8% conversion</p>
                    </div>
                    <div className="text-sm font-medium text-green-600">+₦38,000</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateCampaignModal open={showCreateCampaign} onOpenChange={setShowCreateCampaign} />
      <AddContactModal open={showAddContact} onOpenChange={setShowAddContact} />
    </>
  )
}
