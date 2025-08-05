"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalendarIcon, ClockIcon, MessageSquareIcon, MoreHorizontalIcon, PhoneIcon, MailIcon, VideoIcon, UserIcon, TagIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, PlusIcon, SearchIcon, FilterIcon, DownloadIcon, RefreshCwIcon, ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from "lucide-react"
import { format } from "date-fns"

interface Ticket {
  id: string
  subject: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "pending" | "resolved" | "closed"
  category: "technical" | "billing" | "general" | "feature_request" | "bug_report"
  customer: {
    id: string
    name: string
    email: string
    avatar?: string
    plan: string
  }
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  slaStatus: "within_sla" | "approaching_sla" | "breached_sla"
  timeToResolve?: number
  responses: TicketResponse[]
}

interface TicketResponse {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    role: "customer" | "agent" | "system"
  }
  timestamp: Date
  isInternal: boolean
  attachments?: string[]
}

interface TicketFilters {
  status?: string
  priority?: string
  category?: string
  assignee?: string
  customer?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

// Mock data
const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    subject: "Unable to access dashboard",
    description: "I'm having trouble logging into my dashboard. The page keeps showing a loading spinner.",
    priority: "high",
    status: "open",
    category: "technical",
    customer: {
      id: "cust-1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      plan: "Enterprise"
    },
    assignee: {
      id: "agent-1",
      name: "John Smith"
    },
    tags: ["login", "dashboard", "urgent"],
    createdAt: new Date(2024, 0, 15, 9, 30),
    updatedAt: new Date(2024, 0, 15, 11, 45),
    slaStatus: "within_sla",
    responses: [
      {
        id: "resp-1",
        content: "I'm having trouble logging into my dashboard. The page keeps showing a loading spinner and I can't access any of my data.",
        author: {
          id: "cust-1",
          name: "Sarah Johnson",
          role: "customer"
        },
        timestamp: new Date(2024, 0, 15, 9, 30),
        isInternal: false
      },
      {
        id: "resp-2",
        content: "Hi Sarah, I'm looking into this issue. Can you please clear your browser cache and try again?",
        author: {
          id: "agent-1",
          name: "John Smith",
          role: "agent"
        },
        timestamp: new Date(2024, 0, 15, 10, 15),
        isInternal: false
      }
    ]
  },
  {
    id: "TKT-002",
    subject: "Billing discrepancy",
    description: "I was charged twice for the same month.",
    priority: "medium",
    status: "in_progress",
    category: "billing",
    customer: {
      id: "cust-2",
      name: "Mike Wilson",
      email: "mike@company.com",
      plan: "Professional"
    },
    tags: ["billing", "duplicate"],
    createdAt: new Date(2024, 0, 14, 14, 20),
    updatedAt: new Date(2024, 0, 15, 8, 30),
    slaStatus: "within_sla",
    responses: []
  },
  {
    id: "TKT-003",
    subject: "Feature request: Dark mode",
    description: "Would love to see dark mode support in the application.",
    priority: "low",
    status: "pending",
    category: "feature_request",
    customer: {
      id: "cust-3",
      name: "Emma Davis",
      email: "emma@startup.io",
      plan: "Basic"
    },
    assignee: {
      id: "agent-2",
      name: "Jane Doe"
    },
    tags: ["feature", "ui", "enhancement"],
    createdAt: new Date(2024, 0, 13, 16, 45),
    updatedAt: new Date(2024, 0, 14, 12, 15),
    slaStatus: "within_sla",
    responses: []
  }
]

const mockAgents = [
  { id: "agent-1", name: "John Smith", avatar: "" },
  { id: "agent-2", name: "Jane Doe", avatar: "" },
  { id: "agent-3", name: "Bob Johnson", avatar: "" }
]

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
}

const statusColors = {
  open: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  resolved: "bg-purple-100 text-purple-800",
  closed: "bg-gray-100 text-gray-800"
}

const categoryColors = {
  technical: "bg-blue-100 text-blue-800",
  billing: "bg-green-100 text-green-800",
  general: "bg-gray-100 text-gray-800",
  feature_request: "bg-purple-100 text-purple-800",
  bug_report: "bg-red-100 text-red-800"
}

export function TicketingSystem() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filters, setFilters] = useState<TicketFilters>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<keyof Ticket>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status)
    }
    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority)
    }
    if (filters.category) {
      filtered = filtered.filter(ticket => ticket.category === filters.category)
    }
    if (filters.assignee) {
      filtered = filtered.filter(ticket => ticket.assignee?.id === filters.assignee)
    }

    // Sort
    return filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [tickets, searchQuery, filters, sortBy, sortOrder])

  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter(t => t.status === "open").length
    const inProgress = tickets.filter(t => t.status === "in_progress").length
    const resolved = tickets.filter(t => t.status === "resolved").length
    const avgResponseTime = 2.5 // hours
    const slaBreached = tickets.filter(t => t.slaStatus === "breached_sla").length

    return {
      total,
      open,
      inProgress,
      resolved,
      avgResponseTime,
      slaBreached
    }
  }, [tickets])

  const handleCreateTicket = (ticketData: Partial<Ticket>) => {
    const newTicket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: ticketData.subject || "",
      description: ticketData.description || "",
      priority: ticketData.priority || "medium",
      status: "open",
      category: ticketData.category || "general",
      customer: ticketData.customer || {
        id: "cust-new",
        name: "New Customer",
        email: "customer@example.com",
        plan: "Basic"
      },
      tags: ticketData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      slaStatus: "within_sla",
      responses: []
    }

    setTickets([newTicket, ...tickets])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, ...updates, updatedAt: new Date() }
        : ticket
    ))
  }

  const handleAddResponse = (ticketId: string, content: string, isInternal: boolean = false) => {
    const newResponse: TicketResponse = {
      id: `resp-${Date.now()}`,
      content,
      author: {
        id: "agent-current",
        name: "Current Agent",
        role: "agent"
      },
      timestamp: new Date(),
      isInternal,
      attachments: []
    }

    setTickets(tickets.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            responses: [...ticket.responses, newResponse],
            updatedAt: new Date()
          }
        : ticket
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer support tickets and responses</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>
                Create a new support ticket for a customer inquiry.
              </DialogDescription>
            </DialogHeader>
            <CreateTicketForm onSubmit={handleCreateTicket} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SLA Breached</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.slaBreached}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tickets</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tickets Table */}
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedTickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="flex items-center gap-1">
                              {ticket.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={ticket.customer.avatar} />
                              <AvatarFallback className="text-xs">
                                {ticket.customer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{ticket.customer.name}</div>
                              <div className="text-xs text-muted-foreground">{ticket.customer.plan}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[ticket.status]}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(ticket.createdAt, 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedTicket(ticket)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateTicket(ticket.id, { status: 'in_progress' })}>
                                Assign to Me
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateTicket(ticket.id, { status: 'resolved' })}>
                                Mark Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="space-y-4">
          {selectedTicket ? (
            <TicketDetails
              ticket={selectedTicket}
              onUpdate={(updates) => handleUpdateTicket(selectedTicket.id, updates)}
              onAddResponse={(content, isInternal) => handleAddResponse(selectedTicket.id, content, isInternal)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Ticket</CardTitle>
                <CardDescription>
                  Click on a ticket from the list to view details and respond.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateTicketForm({ onSubmit }: { onSubmit: (data: Partial<Ticket>) => void }) {
  const [formData, setFormData] = useState<Partial<Ticket>>({
    subject: "",
    description: "",
    priority: "medium",
    category: "general",
    tags: []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Enter ticket subject"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the issue or request"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="bug_report">Bug Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Ticket</Button>
      </div>
    </form>
  )
}

function TicketDetails({
  ticket,
  onUpdate,
  onAddResponse
}: {
  ticket: Ticket
  onUpdate: (updates: Partial<Ticket>) => void
  onAddResponse: (content: string, isInternal?: boolean) => void
}) {
  const [responseContent, setResponseContent] = useState("")
  const [isInternal, setIsInternal] = useState(false)

  const handleSendResponse = () => {
    if (responseContent.trim()) {
      onAddResponse(responseContent, isInternal)
      setResponseContent("")
      setIsInternal(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
            <CardDescription className="font-mono text-sm">{ticket.id}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdate({ status: 'in_progress' })}>
                Set In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ status: 'pending' })}>
                Set Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ status: 'resolved' })}>
                Mark Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ status: 'closed' })}>
                Close Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ticket Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={priorityColors[ticket.priority]}>
              {ticket.priority}
            </Badge>
            <Badge className={statusColors[ticket.status]}>
              {ticket.status.replace('_', ' ')}
            </Badge>
            <Badge className={categoryColors[ticket.category]}>
              {ticket.category.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.customer.avatar} />
              <AvatarFallback>
                {ticket.customer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{ticket.customer.name}</div>
              <div className="text-sm text-muted-foreground">{ticket.customer.email}</div>
            </div>
          </div>

          {ticket.assignee && (
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Assigned to {ticket.assignee.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Created {format(ticket.createdAt, 'MMM dd, yyyy HH:mm')}</span>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{ticket.description}</p>
        </div>

        <Separator />

        {/* Responses */}
        <div>
          <h4 className="font-semibold mb-3">Conversation</h4>
          <ScrollArea className="h-64 space-y-3">
            {ticket.responses.map((response) => (
              <div key={response.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={response.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {response.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{response.author.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(response.timestamp, 'MMM dd, HH:mm')}
                  </span>
                  {response.isInternal && (
                    <Badge variant="secondary" className="text-xs">Internal</Badge>
                  )}
                </div>
                <div className="ml-8 text-sm bg-muted p-3 rounded-lg">
                  {response.content}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        <Separator />

        {/* Response Form */}
        <div className="space-y-3">
          <Label htmlFor="response">Add Response</Label>
          <Textarea
            id="response"
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="Type your response..."
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="internal"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              <Label htmlFor="internal" className="text-sm">Internal note</Label>
            </div>
            <Button onClick={handleSendResponse} disabled={!responseContent.trim()}>
              Send Response
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
