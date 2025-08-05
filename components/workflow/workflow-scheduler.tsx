"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalendarIcon, ClockIcon, PlayIcon, PauseIcon, StopIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, FilterIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, TrendingUpIcon, SettingsIcon, TimerIcon, RepeatIcon, ZapIcon, BellIcon, MailIcon, UserIcon, TagIcon, DatabaseIcon } from "lucide-react"
import { format, addDays, addHours, addMinutes } from "date-fns"

interface WorkflowSchedule {
  id: string
  workflowId: string
  workflowName: string
  name: string
  description: string
  type: "immediate" | "delayed" | "recurring" | "conditional"
  status: "active" | "paused" | "completed" | "failed"
  trigger: WorkflowTrigger
  schedule?: ScheduleConfig
  conditions?: TriggerCondition[]
  lastRun?: Date
  nextRun?: Date
  executionCount: number
  successCount: number
  failureCount: number
  createdAt: Date
  updatedAt: Date
}

interface WorkflowTrigger {
  type: "manual" | "time_based" | "event_based" | "condition_based" | "webhook" | "api_call"
  config: {
    event?: string
    conditions?: any[]
    webhookUrl?: string
    apiEndpoint?: string
    timeZone?: string
    delay?: {
      amount: number
      unit: "minutes" | "hours" | "days" | "weeks"
    }
  }
}

interface ScheduleConfig {
  frequency: "once" | "daily" | "weekly" | "monthly" | "custom"
  startDate: Date
  endDate?: Date
  timeOfDay?: string
  daysOfWeek?: number[]
  dayOfMonth?: number
  customCron?: string
  maxExecutions?: number
}

interface TriggerCondition {
  id: string
  field: string
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty"
  value: any
  logicalOperator?: "AND" | "OR"
}

interface WorkflowExecution {
  id: string
  scheduleId: string
  workflowId: string
  status: "running" | "completed" | "failed" | "cancelled"
  startedAt: Date
  completedAt?: Date
  duration?: number
  triggeredBy: string
  steps: ExecutionStep[]
  logs: string[]
  error?: string
}

interface ExecutionStep {
  id: string
  stepName: string
  status: "pending" | "running" | "completed" | "failed" | "skipped"
  startedAt?: Date
  completedAt?: Date
  duration?: number
  output?: any
  error?: string
}

// Mock data
const mockSchedules: WorkflowSchedule[] = [
  {
    id: "sched-1",
    workflowId: "wf-1",
    workflowName: "Welcome Email Sequence",
    name: "Daily Welcome Emails",
    description: "Send welcome emails to new subscribers every day at 9 AM",
    type: "recurring",
    status: "active",
    trigger: {
      type: "time_based",
      config: {
        timeZone: "UTC"
      }
    },
    schedule: {
      frequency: "daily",
      startDate: new Date(2024, 0, 1),
      timeOfDay: "09:00"
    },
    lastRun: new Date(2024, 0, 15, 9, 0),
    nextRun: new Date(2024, 0, 16, 9, 0),
    executionCount: 15,
    successCount: 14,
    failureCount: 1,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 15)
  },
  {
    id: "sched-2",
    workflowId: "wf-2",
    workflowName: "Lead Nurturing Campaign",
    name: "Weekly Lead Follow-up",
    description: "Follow up with leads who haven't responded in 7 days",
    type: "conditional",
    status: "active",
    trigger: {
      type: "condition_based",
      config: {
        conditions: [
          { field: "last_activity", operator: "less_than", value: "7 days ago" },
          { field: "status", operator: "equals", value: "lead" }
        ]
      }
    },
    schedule: {
      frequency: "weekly",
      startDate: new Date(2024, 0, 1),
      daysOfWeek: [1] // Monday
    },
    lastRun: new Date(2024, 0, 8, 10, 0),
    nextRun: new Date(2024, 0, 15, 10, 0),
    executionCount: 3,
    successCount: 3,
    failureCount: 0,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 8)
  },
  {
    id: "sched-3",
    workflowId: "wf-3",
    workflowName: "Abandoned Cart Recovery",
    name: "Cart Abandonment Trigger",
    description: "Send recovery emails when carts are abandoned for 1 hour",
    type: "delayed",
    status: "active",
    trigger: {
      type: "event_based",
      config: {
        event: "cart_abandoned",
        delay: {
          amount: 1,
          unit: "hours"
        }
      }
    },
    executionCount: 45,
    successCount: 42,
    failureCount: 3,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 15)
  }
]

const mockExecutions: WorkflowExecution[] = [
  {
    id: "exec-1",
    scheduleId: "sched-1",
    workflowId: "wf-1",
    status: "completed",
    startedAt: new Date(2024, 0, 15, 9, 0),
    completedAt: new Date(2024, 0, 15, 9, 5),
    duration: 300000,
    triggeredBy: "scheduled",
    steps: [
      {
        id: "step-1",
        stepName: "Filter New Subscribers",
        status: "completed",
        startedAt: new Date(2024, 0, 15, 9, 0),
        completedAt: new Date(2024, 0, 15, 9, 1),
        duration: 60000
      },
      {
        id: "step-2",
        stepName: "Send Welcome Email",
        status: "completed",
        startedAt: new Date(2024, 0, 15, 9, 1),
        completedAt: new Date(2024, 0, 15, 9, 5),
        duration: 240000
      }
    ],
    logs: [
      "Workflow started at 2024-01-15 09:00:00",
      "Found 12 new subscribers",
      "Sending welcome emails...",
      "Successfully sent 12 emails",
      "Workflow completed successfully"
    ]
  }
]

const triggerTypes = [
  { value: "manual", label: "Manual Trigger", icon: PlayIcon },
  { value: "time_based", label: "Time-based", icon: ClockIcon },
  { value: "event_based", label: "Event-based", icon: ZapIcon },
  { value: "condition_based", label: "Condition-based", icon: FilterIcon },
  { value: "webhook", label: "Webhook", icon: DatabaseIcon },
  { value: "api_call", label: "API Call", icon: SettingsIcon }
]

const statusColors = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800"
}

export function WorkflowScheduler() {
  const [schedules, setSchedules] = useState<WorkflowSchedule[]>(mockSchedules)
  const [executions, setExecutions] = useState<WorkflowExecution[]>(mockExecutions)
  const [selectedSchedule, setSelectedSchedule] = useState<WorkflowSchedule | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("schedules")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const matchesSearch = schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           schedule.workflowName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || schedule.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [schedules, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = schedules.length
    const active = schedules.filter(s => s.status === "active").length
    const paused = schedules.filter(s => s.status === "paused").length
    const totalExecutions = schedules.reduce((sum, s) => sum + s.executionCount, 0)
    const successRate = schedules.reduce((sum, s) => sum + s.successCount, 0) / Math.max(totalExecutions, 1) * 100

    return { total, active, paused, totalExecutions, successRate }
  }, [schedules])

  const handleCreateSchedule = (scheduleData: Partial<WorkflowSchedule>) => {
    const newSchedule: WorkflowSchedule = {
      id: `sched-${schedules.length + 1}`,
      workflowId: scheduleData.workflowId || "",
      workflowName: scheduleData.workflowName || "",
      name: scheduleData.name || "",
      description: scheduleData.description || "",
      type: scheduleData.type || "immediate",
      status: "active",
      trigger: scheduleData.trigger || { type: "manual", config: {} },
      schedule: scheduleData.schedule,
      conditions: scheduleData.conditions,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSchedules([newSchedule, ...schedules])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateSchedule = (scheduleId: string, updates: Partial<WorkflowSchedule>) => {
    setSchedules(schedules.map(schedule =>
      schedule.id === scheduleId
        ? { ...schedule, ...updates, updatedAt: new Date() }
        : schedule
    ))
  }

  const handleToggleSchedule = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId)
    if (schedule) {
      const newStatus = schedule.status === "active" ? "paused" : "active"
      handleUpdateSchedule(scheduleId, { status: newStatus })
    }
  }

  const handleExecuteNow = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId)
    if (schedule) {
      const newExecution: WorkflowExecution = {
        id: `exec-${executions.length + 1}`,
        scheduleId,
        workflowId: schedule.workflowId,
        status: "running",
        startedAt: new Date(),
        triggeredBy: "manual",
        steps: [],
        logs: [`Workflow ${schedule.name} started manually`]
      }

      setExecutions([newExecution, ...executions])
      
      // Simulate execution completion
      setTimeout(() => {
        setExecutions(prev => prev.map(exec =>
          exec.id === newExecution.id
            ? {
                ...exec,
                status: "completed",
                completedAt: new Date(),
                duration: 5000,
                logs: [...exec.logs, "Workflow completed successfully"]
              }
            : exec
        ))
        
        handleUpdateSchedule(scheduleId, {
          lastRun: new Date(),
          executionCount: schedule.executionCount + 1,
          successCount: schedule.successCount + 1
        })
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Scheduler</h1>
          <p className="text-muted-foreground">Manage workflow schedules, triggers, and executions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Workflow Schedule</DialogTitle>
              <DialogDescription>
                Set up scheduling and triggers for your workflow automation.
              </DialogDescription>
            </DialogHeader>
            <CreateScheduleForm onSubmit={handleCreateSchedule} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="triggers">Trigger Management</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Schedules</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search schedules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Schedule Name</TableHead>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{schedule.name}</div>
                            <div className="text-sm text-muted-foreground">{schedule.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{schedule.workflowName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {schedule.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[schedule.status]}>
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {schedule.nextRun ? (
                            <div className="text-sm">
                              {format(schedule.nextRun, 'MMM dd, HH:mm')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {schedule.executionCount > 0 ? (
                              <>
                                {((schedule.successCount / schedule.executionCount) * 100).toFixed(1)}%
                                <div className="text-xs text-muted-foreground">
                                  {schedule.successCount}/{schedule.executionCount}
                                </div>
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleSchedule(schedule.id)}
                            >
                              {schedule.status === "active" ? (
                                <PauseIcon className="h-4 w-4" />
                              ) : (
                                <PlayIcon className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExecuteNow(schedule.id)}
                              disabled={schedule.status !== "active"}
                            >
                              <PlayIcon className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedSchedule(schedule)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <ExecutionHistory executions={executions} schedules={schedules} />
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <TriggerManagement schedules={schedules} onUpdateSchedule={handleUpdateSchedule} />
        </TabsContent>
      </Tabs>

      {selectedSchedule && (
        <ScheduleDetails
          schedule={selectedSchedule}
          executions={executions.filter(e => e.scheduleId === selectedSchedule.id)}
          onClose={() => setSelectedSchedule(null)}
        />
      )}
    </div>
  )
}

function CreateScheduleForm({ onSubmit }: { onSubmit: (data: Partial<WorkflowSchedule>) => void }) {
  const [formData, setFormData] = useState<Partial<WorkflowSchedule>>({
    name: "",
    description: "",
    type: "immediate",
    trigger: { type: "manual", config: {} },
    schedule: {
      frequency: "once",
      startDate: new Date()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Schedule Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter schedule name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workflow">Workflow</Label>
          <Select
            value={formData.workflowId}
            onValueChange={(value) => setFormData({
              ...formData,
              workflowId: value,
              workflowName: value === "wf-1" ? "Welcome Email Sequence" : "Lead Nurturing Campaign"
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wf-1">Welcome Email Sequence</SelectItem>
              <SelectItem value="wf-2">Lead Nurturing Campaign</SelectItem>
              <SelectItem value="wf-3">Abandoned Cart Recovery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this schedule"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <Label>Schedule Type</Label>
        <div className="grid grid-cols-2 gap-4">
          {["immediate", "delayed", "recurring", "conditional"].map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value={type}
                checked={formData.type === type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              />
              <span className="capitalize">{type.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Trigger Configuration</Label>
        <Select
          value={formData.trigger?.type}
          onValueChange={(value) => setFormData({
            ...formData,
            trigger: { type: value as any, config: {} }
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            {triggerTypes.map((trigger) => (
              <SelectItem key={trigger.value} value={trigger.value}>
                {trigger.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.type === "recurring" && (
        <div className="space-y-4">
          <Label>Frequency</Label>
          <Select
            value={formData.schedule?.frequency}
            onValueChange={(value) => setFormData({
              ...formData,
              schedule: { ...formData.schedule!, frequency: value as any }
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Schedule</Button>
      </div>
    </form>
  )
}

function ExecutionHistory({
  executions,
  schedules
}: {
  executions: WorkflowExecution[]
  schedules: WorkflowSchedule[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
        <CardDescription>Recent workflow executions and their results</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {executions.map((execution) => {
              const schedule = schedules.find(s => s.id === execution.scheduleId)
              return (
                <div key={execution.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{schedule?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Triggered {execution.triggeredBy} • {format(execution.startedAt, 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <Badge className={execution.status === "completed" ? "bg-green-100 text-green-800" : execution.status === "failed" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                      {execution.status}
                    </Badge>
                  </div>
                  
                  {execution.duration && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Duration: {(execution.duration / 1000).toFixed(1)}s
                    </p>
                  )}

                  <div className="text-sm">
                    <p className="font-medium mb-1">Logs:</p>
                    <div className="bg-muted p-2 rounded text-xs">
                      {execution.logs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function TriggerManagement({
  schedules,
  onUpdateSchedule
}: {
  schedules: WorkflowSchedule[]
  onUpdateSchedule: (id: string, updates: Partial<WorkflowSchedule>) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trigger Types</CardTitle>
          <CardDescription>Available trigger types for workflow automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {triggerTypes.map((trigger) => (
              <Card key={trigger.value}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <trigger.icon className="h-5 w-5" />
                    <CardTitle className="text-sm">{trigger.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {trigger.value === "manual" && "Execute workflows manually when needed"}
                    {trigger.value === "time_based" && "Schedule workflows to run at specific times"}
                    {trigger.value === "event_based" && "Trigger workflows based on system events"}
                    {trigger.value === "condition_based" && "Run workflows when conditions are met"}
                    {trigger.value === "webhook" && "Trigger workflows via external webhooks"}
                    {trigger.value === "api_call" && "Execute workflows through API calls"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Triggers</CardTitle>
          <CardDescription>Currently configured triggers across all schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedules.filter(s => s.status === "active").map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {(() => {
                    const TriggerIcon = triggerTypes.find(t => t.value === schedule.trigger.type)?.icon || ZapIcon
                    return <TriggerIcon className="h-4 w-4" />
                  })()}
                  <div>
                    <p className="font-medium">{schedule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.trigger.type.replace('_', ' ')} trigger
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[schedule.status]}>
                    {schedule.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScheduleDetails({
  schedule,
  executions,
  onClose
}: {
  schedule: WorkflowSchedule
  executions: WorkflowExecution[]
  onClose: () => void
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{schedule.name}</DialogTitle>
          <DialogDescription>{schedule.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Workflow</Label>
              <p className="text-sm">{schedule.workflowName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm capitalize">{schedule.type.replace('_', ' ')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={statusColors[schedule.status]}>
                {schedule.status}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Success Rate</Label>
              <p className="text-sm">
                {schedule.executionCount > 0 ? 
                  `${((schedule.successCount / schedule.executionCount) * 100).toFixed(1)}%` : 
                  'No executions yet'
                }
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Recent Executions</h4>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {executions.length > 0 ? executions.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {format(execution.startedAt, 'MMM dd, yyyy HH:mm')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Triggered by {execution.triggeredBy}
                      </p>
                    </div>
                    <Badge className={execution.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {execution.status}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No executions yet</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
