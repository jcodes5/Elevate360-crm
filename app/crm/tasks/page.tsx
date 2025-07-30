"use client"

import { useState } from "react"
import { Plus, Search, Filter, Calendar, Clock, User, CheckCircle, Circle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"

// Mock data
const mockTasks = [
  {
    id: "1",
    title: "Follow up with ABC Corp",
    description: "Send proposal follow-up email and schedule demo call",
    priority: "high",
    status: "pending",
    dueDate: new Date("2024-01-29"),
    assignedTo: "John Doe",
    contactId: "1",
    dealId: "1",
    type: "follow-up",
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "2",
    title: "Prepare presentation for XYZ Ltd",
    description: "Create custom presentation slides for product demo",
    priority: "medium",
    status: "in-progress",
    dueDate: new Date("2024-01-30"),
    assignedTo: "Sarah Wilson",
    contactId: "2",
    dealId: "2",
    type: "preparation",
    createdAt: new Date("2024-01-26"),
  },
  {
    id: "3",
    title: "Contract review and approval",
    description: "Review legal terms and get client approval on contract",
    priority: "high",
    status: "pending",
    dueDate: new Date("2024-01-28"),
    assignedTo: "Mike Johnson",
    contactId: "3",
    dealId: "3",
    type: "legal",
    createdAt: new Date("2024-01-24"),
  },
  {
    id: "4",
    title: "Send welcome package",
    description: "Send onboarding materials to new client",
    priority: "low",
    status: "completed",
    dueDate: new Date("2024-01-27"),
    assignedTo: "Lisa Brown",
    contactId: "4",
    dealId: "4",
    type: "onboarding",
    createdAt: new Date("2024-01-23"),
  },
  {
    id: "5",
    title: "Schedule quarterly review",
    description: "Set up Q1 business review meeting with key stakeholders",
    priority: "medium",
    status: "pending",
    dueDate: new Date("2024-02-01"),
    assignedTo: "David Brown",
    type: "meeting",
    createdAt: new Date("2024-01-27"),
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus

    let matchesTab = true
    if (activeTab === "my-tasks") {
      matchesTab = task.assignedTo === "John Doe" // Current user
    } else if (activeTab === "overdue") {
      matchesTab = new Date(task.dueDate) < new Date() && task.status !== "completed"
    } else if (activeTab === "today") {
      const today = new Date()
      const taskDate = new Date(task.dueDate)
      matchesTab = taskDate.toDateString() === today.toDateString()
    }

    return matchesSearch && matchesPriority && matchesStatus && matchesTab
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "pending":
        return <Circle className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const isOverdue = (dueDate: Date, status: string) => {
    return new Date(dueDate) < new Date() && status !== "completed"
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: task.status === "completed" ? "pending" : "completed" } : task,
      ),
    )
  }

  const getTaskCounts = () => {
    const total = tasks.length
    const myTasks = tasks.filter((task) => task.assignedTo === "John Doe").length
    const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.status)).length
    const today = tasks.filter((task) => {
      const today = new Date()
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === today.toDateString()
    }).length

    return { total, myTasks, overdue, today }
  }

  const taskCounts = getTaskCounts()

  return (
    <MainLayout
      breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Tasks" }]}
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage and track your team's tasks and activities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskCounts.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskCounts.myTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{taskCounts.today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{taskCounts.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Tasks ({taskCounts.total})</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks ({taskCounts.myTasks})</TabsTrigger>
            <TabsTrigger value="today">Due Today ({taskCounts.today})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({taskCounts.overdue})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-80 pl-10"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Filter className="mr-2 h-4 w-4" />
                          Priority: {selectedPriority === "all" ? "All" : selectedPriority}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedPriority("all")}>All Priorities</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("high")}>High Priority</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>
                          Medium Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("low")}>Low Priority</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Status: {selectedStatus === "all" ? "All" : selectedStatus}</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All Status</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("pending")}>Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("in-progress")}>
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>Completed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tasks found matching your criteria</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start space-x-4 p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                          isOverdue(task.dueDate, task.status) ? "border-red-200 bg-red-50/50" : ""
                        }`}
                      >
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={() => toggleTaskStatus(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3
                                className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                              >
                                {task.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              <div className="flex items-center space-x-4 mt-3">
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span
                                    className={isOverdue(task.dueDate, task.status) ? "text-red-600 font-medium" : ""}
                                  >
                                    {task.dueDate.toLocaleDateString()}
                                  </span>
                                  {isOverdue(task.dueDate, task.status) && (
                                    <Badge variant="destructive" className="ml-2">
                                      Overdue
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <User className="h-4 w-4" />
                                  <span>{task.assignedTo}</span>
                                </div>
                                {task.contactId && (
                                  <Badge variant="outline" className="text-xs">
                                    Contact Linked
                                  </Badge>
                                )}
                                {task.dealId && (
                                  <Badge variant="outline" className="text-xs">
                                    Deal Linked
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {getStatusIcon(task.status)}
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
