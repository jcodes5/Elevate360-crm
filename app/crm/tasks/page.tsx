"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, CheckCircle, Clock, AlertCircle, Calendar, User, Tag, Phone, Mail, Video, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Task } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Follow up with Adebayo Industries",
    description: "Call to discuss the contract details and answer their questions about the proposal",
    priority: "high",
    status: "pending",
    type: "call",
    dueDate: new Date("2024-02-01T15:00:00"),
    assignedTo: "agent-1",
    contactId: "1",
    dealId: "1", 
    organizationId: "org-1",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "2",
    title: "Send proposal to Lagos State Gov",
    description: "Prepare and send the final proposal document with pricing details",
    priority: "high",
    status: "in_progress",
    type: "email",
    dueDate: new Date("2024-02-02T10:00:00"),
    assignedTo: "agent-2",
    contactId: "2",
    dealId: "1",
    organizationId: "org-1",
    createdAt: new Date("2024-01-24"),
    updatedAt: new Date("2024-01-26"),
  },
  {
    id: "3",
    title: "Product demo for Fintech startup",
    description: "Schedule and conduct a product demonstration for the mobile banking app",
    priority: "medium",
    status: "pending",
    type: "demo",
    dueDate: new Date("2024-02-05T14:00:00"),
    assignedTo: "agent-1",
    contactId: "3",
    dealId: "2",
    organizationId: "org-1",
    createdAt: new Date("2024-01-26"),
    updatedAt: new Date("2024-01-26"),
  },
  {
    id: "4",
    title: "Review contract amendments", 
    description: "Review the legal amendments requested by the client",
    priority: "medium",
    status: "pending",
    type: "other",
    dueDate: new Date("2024-02-03T12:00:00"),
    assignedTo: "agent-3",
    organizationId: "org-1",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "5",
    title: "Client onboarding meeting",
    description: "Welcome meeting for the new client to explain our processes",
    priority: "low",
    status: "completed",
    type: "meeting",
    dueDate: new Date("2024-01-28T16:00:00"),
    assignedTo: "agent-2",
    contactId: "1",
    organizationId: "org-1",
    completedAt: new Date("2024-01-28T16:30:00"),
    createdAt: new Date("2024-01-22"),
    updatedAt: new Date("2024-01-28"),
  },
  {
    id: "6",
    title: "Follow-up email campaign",
    description: "Send follow-up emails to prospects who attended the webinar",
    priority: "medium",
    status: "pending",
    type: "follow_up",
    dueDate: new Date("2024-02-04T09:00:00"),
    assignedTo: "agent-1",
    organizationId: "org-1",
    createdAt: new Date("2024-01-27"),
    updatedAt: new Date("2024-01-27"),
  }
]

export default function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority
    const matchesType = selectedType === "all" || task.type === selectedType
    const matchesTab = activeTab === "all" || 
                      (activeTab === "today" && isToday(task.dueDate)) ||
                      (activeTab === "overdue" && isOverdue(task.dueDate) && task.status !== "completed") ||
                      (activeTab === "completed" && task.status === "completed")
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesTab
  })

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isOverdue = (date: Date) => {
    const today = new Date()
    return date < today
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return Phone
      case "email":
        return Mail
      case "meeting":
        return Video
      case "demo":
        return Video
      case "follow_up":
        return Mail
      case "other":
        return FileText
      default:
        return FileText
    }
  }

  const markAsCompleted = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: "completed" as const, completedAt: new Date(), updatedAt: new Date() }
        : task
    ))
    toast({
      title: "Task Completed",
      description: "Task has been marked as completed."
    })
  }

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => isOverdue(t.dueDate) && t.status !== "completed").length,
    today: tasks.filter(t => isToday(t.dueDate)).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your daily tasks and activities</p>
        </div>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{taskStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{taskStats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
                    Status: {selectedStatus === "all" ? "All" : selectedStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("in_progress")}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("cancelled")}>Cancelled</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Priority: {selectedPriority === "all" ? "All" : selectedPriority}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedPriority("all")}>All Priorities</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPriority("urgent")}>Urgent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPriority("high")}>High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>Medium</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPriority("low")}>Low</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="today">Due Today</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filteredTasks.map((task) => {
                const TypeIcon = getTypeIcon(task.type)
                return (
                  <Card key={task.id} className={`p-4 ${task.status === "completed" ? "opacity-60" : ""}`}>
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => task.status !== "completed" && markAsCompleted(task.id)}
                        className="mt-1"
                      />
                      <div className={`p-2 rounded-lg bg-blue-100 text-blue-600`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>
                              {task.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>
                              {task.dueDate.toLocaleDateString()} at {task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOverdue(task.dueDate) && task.status !== "completed" && (
                              <Badge className="ml-2 bg-red-100 text-red-800">Overdue</Badge>
                            )}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <User className="mr-1 h-3 w-3" />
                            <span>{task.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found for the selected filters.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input id="taskTitle" placeholder="Enter task title" />
            </div>
            <div className="grid items-center gap-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea id="taskDescription" placeholder="Enter task description..." className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="grid gap-2">
                <Label htmlFor="taskType">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskPriority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="datetime-local" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent-1">Agent 1</SelectItem>
                    <SelectItem value="agent-2">Agent 2</SelectItem>
                    <SelectItem value="agent-3">Agent 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Task Created",
                description: "New task has been created and assigned."
              })
              setShowCreateTask(false)
            }}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
