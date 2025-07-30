"use client"

import { useState } from "react"
import { Plus, Search, Filter, Calendar, Clock, User, Video, MapPin, MoreHorizontal, Edit, Trash2, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import type { Appointment } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Mock appointments data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    title: "Product Demo - Lagos State Government",
    description: "Demonstrate CRM features and discuss implementation timeline",
    startTime: new Date("2024-02-01T14:00:00"),
    endTime: new Date("2024-02-01T15:30:00"),
    contactId: "1",
    assignedTo: "agent-1",
    status: "scheduled",
    type: "demo",
    meetingLink: "https://meet.google.com/abc-def-ghi",
    organizationId: "org-1",
    reminders: [],
    attendees: ["agent-1", "contact-1", "manager-1"],
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "2",
    title: "Client Check-in Call",
    description: "Monthly check-in to review progress and address any concerns",
    startTime: new Date("2024-02-01T10:00:00"),
    endTime: new Date("2024-02-01T10:30:00"),
    contactId: "2",
    assignedTo: "agent-2",
    status: "confirmed",
    type: "call",
    organizationId: "org-1",
    reminders: [],
    attendees: ["agent-2", "contact-2"],
    createdAt: new Date("2024-01-28"),
    updatedAt: new Date("2024-01-29"),
  },
  {
    id: "3",
    title: "Contract Negotiation Meeting",
    description: "Final contract terms discussion and signing",
    startTime: new Date("2024-02-02T11:00:00"),
    endTime: new Date("2024-02-02T12:00:00"),
    contactId: "3",
    assignedTo: "agent-1",
    status: "scheduled",
    type: "meeting",
    location: "Elevate360 Office, Victoria Island, Lagos",
    organizationId: "org-1",
    reminders: [],
    attendees: ["agent-1", "contact-3", "legal-team"],
    createdAt: new Date("2024-01-29"),
    updatedAt: new Date("2024-01-29"),
  },
  {
    id: "4",
    title: "Technical Consultation",
    description: "Discuss technical requirements and integration possibilities",
    startTime: new Date("2024-02-03T15:00:00"),
    endTime: new Date("2024-02-03T16:00:00"),
    contactId: "1",
    assignedTo: "agent-3",
    status: "scheduled",
    type: "consultation",
    meetingLink: "https://zoom.us/j/123456789",
    organizationId: "org-1",
    reminders: [],
    attendees: ["agent-3", "contact-1", "tech-lead"],
    createdAt: new Date("2024-01-30"),
    updatedAt: new Date("2024-01-30"),
  },
  {
    id: "5",
    title: "Follow-up Call - Proposal Review",
    description: "Follow up on proposal submitted last week",
    startTime: new Date("2024-01-30T16:00:00"),
    endTime: new Date("2024-01-30T16:30:00"),
    contactId: "2",
    assignedTo: "agent-2",
    status: "completed",
    type: "follow_up",
    organizationId: "org-1",
    reminders: [],
    attendees: ["agent-2", "contact-2"],
    createdAt: new Date("2024-01-28"),
    updatedAt: new Date("2024-01-30"),
  }
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showCreateAppointment, setShowCreateAppointment] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const { toast } = useToast()

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus
    const matchesType = selectedType === "all" || appointment.type === selectedType
    const matchesTab = activeTab === "all" || 
                      (activeTab === "upcoming" && isUpcoming(appointment.startTime)) ||
                      (activeTab === "today" && isToday(appointment.startTime)) ||
                      (activeTab === "completed" && appointment.status === "completed")
    
    return matchesSearch && matchesStatus && matchesType && matchesTab
  })

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isUpcoming = (date: Date) => {
    const now = new Date()
    return date > now
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-orange-100 text-orange-800"
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return User
      case "call":
        return User
      case "demo":
        return Video
      case "consultation":
        return User
      case "follow_up":
        return User
      default:
        return Calendar
    }
  }

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const markAsCompleted = (appointmentId: string) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: "completed" as const, updatedAt: new Date() }
        : appointment
    ))
    toast({
      title: "Appointment Completed",
      description: "Appointment has been marked as completed."
    })
  }

  const appointmentStats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === "scheduled").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    today: appointments.filter(a => isToday(a.startTime)).length,
    upcoming: appointments.filter(a => isUpcoming(a.startTime)).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage client meetings and calls</p>
        </div>
        <Button onClick={() => setShowCreateAppointment(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{appointmentStats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{appointmentStats.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{appointmentStats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{appointmentStats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{appointmentStats.completed}</div>
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
                  placeholder="Search appointments..."
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
                  <DropdownMenuItem onClick={() => setSelectedStatus("scheduled")}>Scheduled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("confirmed")}>Confirmed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("cancelled")}>Cancelled</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Type: {selectedType === "all" ? "All" : selectedType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedType("all")}>All Types</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType("meeting")}>Meeting</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType("call")}>Call</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType("demo")}>Demo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType("consultation")}>Consultation</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType("follow_up")}>Follow Up</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "calendar")}>
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => {
                    const TypeIcon = getTypeIcon(appointment.type)
                    const { date, time } = formatDateTime(appointment.startTime)
                    const endTime = formatDateTime(appointment.endTime).time
                    return (
                      <Card key={appointment.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div className="space-y-2">
                              <div>
                                <h3 className="font-medium">{appointment.title}</h3>
                                <p className="text-sm text-muted-foreground">{appointment.description}</p>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status.replace("_", " ")}
                                </Badge>
                                <span className="capitalize">{appointment.type}</span>
                                <div className="flex items-center">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {date}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {time} - {endTime}
                                </div>
                                <div className="flex items-center">
                                  <User className="mr-1 h-3 w-3" />
                                  {appointment.assignedTo}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                {appointment.location && (
                                  <div className="flex items-center text-muted-foreground">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {appointment.location}
                                  </div>
                                )}
                                {appointment.meetingLink && (
                                  <div className="flex items-center text-muted-foreground">
                                    <Video className="mr-1 h-3 w-3" />
                                    Online Meeting
                                  </div>
                                )}
                                <div className="flex items-center text-muted-foreground">
                                  <User className="mr-1 h-3 w-3" />
                                  {appointment.attendees.length} attendees
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.status === "scheduled" && (
                              <Button size="sm" variant="outline">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                              </Button>
                            )}
                            {appointment.status === "confirmed" && (
                              <Button 
                                size="sm" 
                                onClick={() => markAsCompleted(appointment.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete
                              </Button>
                            )}
                            {appointment.meetingLink && (
                              <Button size="sm" variant="outline">
                                <Video className="mr-2 h-4 w-4" />
                                Join
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                  {filteredAppointments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No appointments found for the selected filters.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                  <p className="text-gray-600">Calendar view integration would be implemented here with a library like FullCalendar or similar.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Appointment Modal */}
      <Dialog open={showCreateAppointment} onOpenChange={setShowCreateAppointment}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment with a client or prospect.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-2">
              <Label htmlFor="appointmentTitle">Title</Label>
              <Input id="appointmentTitle" placeholder="Enter appointment title" />
            </div>
            <div className="grid items-center gap-2">
              <Label htmlFor="appointmentDescription">Description</Label>
              <Textarea id="appointmentDescription" placeholder="Enter appointment description..." />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="grid gap-2">
                <Label htmlFor="appointmentType">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointmentContact">Contact</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact-1">Adebayo Johnson</SelectItem>
                    <SelectItem value="contact-2">Fatima Abdullahi</SelectItem>
                    <SelectItem value="contact-3">Chinedu Okafor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="datetime-local" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="datetime-local" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location / Meeting Link</Label>
              <Input id="location" placeholder="Enter location or meeting link" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent-1">Agent 1</SelectItem>
                  <SelectItem value="agent-2">Agent 2</SelectItem>
                  <SelectItem value="agent-3">Agent 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAppointment(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Appointment Scheduled",
                description: "New appointment has been created successfully."
              })
              setShowCreateAppointment(false)
            }}>
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
