"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSquareIcon, SendIcon, PhoneIcon, VideoIcon, MoreHorizontalIcon, UserIcon, ClockIcon, MapPinIcon, GlobeIcon, SmileIcon, PaperclipIcon, ImageIcon, FileIcon, MicIcon, SearchIcon, FilterIcon, CircleIcon, MinusIcon, XIcon, MessageCircleIcon, UsersIcon, TrendingUpIcon, StarIcon } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface ChatSession {
  id: string
  customer: {
    id: string
    name: string
    email: string
    avatar?: string
    location?: string
    timezone?: string
    lastSeen?: Date
    isOnline: boolean
  }
  agent?: {
    id: string
    name: string
    avatar?: string
    status: "online" | "away" | "busy"
  }
  status: "waiting" | "active" | "transferred" | "ended"
  priority: "low" | "medium" | "high" | "urgent"
  department: "general" | "sales" | "support" | "billing"
  startedAt: Date
  endedAt?: Date
  messages: ChatMessage[]
  tags: string[]
  satisfaction?: number
  transferHistory?: string[]
  metadata?: {
    page?: string
    referrer?: string
    userAgent?: string
    previousChats?: number
  }
}

interface ChatMessage {
  id: string
  content: string
  type: "text" | "image" | "file" | "system" | "typing"
  author: {
    id: string
    name: string
    role: "customer" | "agent" | "system"
    avatar?: string
  }
  timestamp: Date
  isRead?: boolean
  attachments?: Attachment[]
}

interface Attachment {
  id: string
  name: string
  type: "image" | "file" | "document"
  url: string
  size: number
}

interface Agent {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "away" | "busy" | "offline"
  activeSessions: number
  maxSessions: number
  rating: number
  departments: string[]
}

// Mock data
const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Sarah Wilson",
    email: "sarah@company.com",
    status: "online",
    activeSessions: 2,
    maxSessions: 5,
    rating: 4.8,
    departments: ["support", "general"]
  },
  {
    id: "agent-2",
    name: "Mike Johnson",
    email: "mike@company.com",
    status: "busy",
    activeSessions: 5,
    maxSessions: 5,
    rating: 4.6,
    departments: ["sales", "general"]
  },
  {
    id: "agent-3",
    name: "Emma Davis",
    email: "emma@company.com",
    status: "away",
    activeSessions: 1,
    maxSessions: 4,
    rating: 4.9,
    departments: ["billing", "support"]
  }
]

const mockSessions: ChatSession[] = [
  {
    id: "chat-1",
    customer: {
      id: "cust-1",
      name: "John Smith",
      email: "john@example.com",
      location: "New York, US",
      timezone: "EST",
      isOnline: true,
      lastSeen: new Date()
    },
    agent: {
      id: "agent-1",
      name: "Sarah Wilson",
      status: "online"
    },
    status: "active",
    priority: "medium",
    department: "support",
    startedAt: new Date(Date.now() - 15 * 60 * 1000),
    messages: [
      {
        id: "msg-1",
        content: "Hi, I'm having trouble with my dashboard loading. It's been stuck on the loading screen for the past 10 minutes.",
        type: "text",
        author: {
          id: "cust-1",
          name: "John Smith",
          role: "customer"
        },
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: true
      },
      {
        id: "msg-2",
        content: "Hello John! I'm sorry to hear you're experiencing issues. Let me help you with that. Can you please tell me which browser you're using?",
        type: "text",
        author: {
          id: "agent-1",
          name: "Sarah Wilson",
          role: "agent"
        },
        timestamp: new Date(Date.now() - 14 * 60 * 1000),
        isRead: true
      },
      {
        id: "msg-3",
        content: "I'm using Chrome version 120. This started happening after the latest update to your platform.",
        type: "text",
        author: {
          id: "cust-1",
          name: "John Smith",
          role: "customer"
        },
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        isRead: true
      }
    ],
    tags: ["technical", "dashboard", "loading"],
    metadata: {
      page: "/dashboard",
      referrer: "https://google.com",
      userAgent: "Chrome/120.0.0.0",
      previousChats: 2
    }
  },
  {
    id: "chat-2",
    customer: {
      id: "cust-2",
      name: "Lisa Chen",
      email: "lisa@startup.io",
      location: "San Francisco, US",
      timezone: "PST",
      isOnline: true,
      lastSeen: new Date()
    },
    status: "waiting",
    priority: "high",
    department: "sales",
    startedAt: new Date(Date.now() - 5 * 60 * 1000),
    messages: [
      {
        id: "msg-4",
        content: "Hi, I'm interested in upgrading to the Enterprise plan. Can someone help me understand the pricing?",
        type: "text",
        author: {
          id: "cust-2",
          name: "Lisa Chen",
          role: "customer"
        },
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false
      }
    ],
    tags: ["pricing", "enterprise", "upgrade"],
    metadata: {
      page: "/pricing",
      referrer: "https://linkedin.com",
      previousChats: 0
    }
  }
]

const statusColors = {
  waiting: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  transferred: "bg-blue-100 text-blue-800",
  ended: "bg-gray-100 text-gray-800"
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
}

export function LiveChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(mockSessions)
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(mockSessions[0])
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || session.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalSessions: sessions.length,
    waitingSessions: sessions.filter(s => s.status === "waiting").length,
    activeSessions: sessions.filter(s => s.status === "active").length,
    onlineAgents: agents.filter(a => a.status === "online").length,
    avgResponseTime: 2.3,
    satisfaction: 4.5
  }

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedSession?.messages])

  const handleSendMessage = () => {
    if (!message.trim() || !selectedSession) return

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      type: "text",
      author: {
        id: "current-agent",
        name: "Current Agent",
        role: "agent"
      },
      timestamp: new Date(),
      isRead: false
    }

    setSessions(sessions.map(session =>
      session.id === selectedSession.id
        ? {
            ...session,
            messages: [...session.messages, newMessage]
          }
        : session
    ))

    setMessage("")

    // Simulate customer response
    setTimeout(() => {
      const customerResponse: ChatMessage = {
        id: `msg-${Date.now()}-customer`,
        content: "Thank you for the help! That resolved my issue.",
        type: "text",
        author: {
          id: selectedSession.customer.id,
          name: selectedSession.customer.name,
          role: "customer"
        },
        timestamp: new Date(),
        isRead: false
      }

      setSessions(prev => prev.map(session =>
        session.id === selectedSession.id
          ? {
              ...session,
              messages: [...session.messages, customerResponse]
            }
          : session
      ))
    }, 3000)
  }

  const handleAssignAgent = (sessionId: string, agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (agent) {
      setSessions(sessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              agent: {
                id: agent.id,
                name: agent.name,
                avatar: agent.avatar,
                status: agent.status
              },
              status: "active"
            }
          : session
      ))
    }
  }

  const handleEndSession = (sessionId: string) => {
    setSessions(sessions.map(session =>
      session.id === sessionId
        ? {
            ...session,
            status: "ended",
            endedAt: new Date()
          }
        : session
    ))
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-background flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Live Chat</h2>
            <Button variant="outline" size="sm">
              <UsersIcon className="h-4 w-4 mr-2" />
              Agents
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted p-2 rounded">
              <div className="font-medium">{stats.waitingSessions}</div>
              <div className="text-muted-foreground">Waiting</div>
            </div>
            <div className="bg-muted p-2 rounded">
              <div className="font-medium">{stats.activeSessions}</div>
              <div className="text-muted-foreground">Active</div>
            </div>
            <div className="bg-muted p-2 rounded">
              <div className="font-medium">{stats.onlineAgents}</div>
              <div className="text-muted-foreground">Agents</div>
            </div>
            <div className="bg-muted p-2 rounded">
              <div className="font-medium">{stats.avgResponseTime}m</div>
              <div className="text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b space-y-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chat Sessions List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSession?.id === session.id 
                    ? "bg-primary/10 border-primary" 
                    : "hover:bg-muted border-transparent"
                } border`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.customer.avatar} />
                      <AvatarFallback>
                        {session.customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {session.customer.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">{session.customer.name}</h4>
                      <div className="flex items-center gap-1">
                        <Badge className={priorityColors[session.priority]} variant="secondary">
                          {session.priority}
                        </Badge>
                        <Badge className={statusColors[session.status]} variant="secondary">
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-1">
                      {session.department} • {formatDistanceToNow(session.startedAt, { addSuffix: true })}
                    </div>
                    
                    {session.messages.length > 0 && (
                      <p className="text-sm text-muted-foreground truncate">
                        {session.messages[session.messages.length - 1].content}
                      </p>
                    )}
                    
                    {session.messages.some(m => !m.isRead && m.author.role === "customer") && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-xs font-medium text-primary">New message</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedSession.customer.avatar} />
                    <AvatarFallback>
                      {selectedSession.customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedSession.customer.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedSession.customer.email}</span>
                      {selectedSession.customer.location && (
                        <>
                          <span>•</span>
                          <span>{selectedSession.customer.location}</span>
                        </>
                      )}
                      {selectedSession.customer.isOnline ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Online
                        </Badge>
                      ) : (
                        <span>Last seen {formatDistanceToNow(selectedSession.customer.lastSeen!, { addSuffix: true })}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <PhoneIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <VideoIcon className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Customer Profile</DropdownMenuItem>
                      <DropdownMenuItem>Transfer Chat</DropdownMenuItem>
                      <DropdownMenuItem>Add to CRM</DropdownMenuItem>
                      <Separator />
                      <DropdownMenuItem onClick={() => handleEndSession(selectedSession.id)}>
                        End Session
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Session Info */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>Session started {format(selectedSession.startedAt, 'MMM dd, HH:mm')}</span>
                {selectedSession.agent && (
                  <span>Assigned to {selectedSession.agent.name}</span>
                )}
                <span>Department: {selectedSession.department}</span>
                {selectedSession.metadata?.previousChats && (
                  <span>{selectedSession.metadata.previousChats} previous chats</span>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.author.role === "agent" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.author.role === "customer" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {message.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md ${
                      message.author.role === "agent" ? "order-first" : ""
                    }`}>
                      <div className={`rounded-lg px-3 py-2 ${
                        message.author.role === "agent"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(message.timestamp, 'HH:mm')}
                        </span>
                        {message.author.role === "agent" && (
                          <span className="text-xs text-muted-foreground">
                            {message.isRead ? "Read" : "Delivered"}
                          </span>
                        )}
                      </div>
                    </div>

                    {message.author.role === "agent" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {message.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {selectedSession.customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <SmileIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <PaperclipIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="template">
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="template">Templates</SelectItem>
                          <SelectItem value="greeting">Greeting</SelectItem>
                          <SelectItem value="closing">Closing</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleSendMessage} disabled={!message.trim()}>
                        <SendIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No chat selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Customer Info */}
      {selectedSession && (
        <div className="w-80 border-l bg-background">
          <CustomerInfo session={selectedSession} agents={agents} onAssignAgent={handleAssignAgent} />
        </div>
      )}
    </div>
  )
}

function CustomerInfo({
  session,
  agents,
  onAssignAgent
}: {
  session: ChatSession
  agents: Agent[]
  onAssignAgent: (sessionId: string, agentId: string) => void
}) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-medium mb-3">Customer Information</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{session.customer.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{session.customer.email}</span>
          </div>
          {session.customer.location && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{session.customer.location}</span>
            </div>
          )}
          {session.customer.timezone && (
            <div className="flex items-center gap-2">
              <GlobeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{session.customer.timezone}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-3">Session Details</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">Status</Label>
            <Badge className={statusColors[session.status]}>
              {session.status}
            </Badge>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Priority</Label>
            <Badge className={priorityColors[session.priority]}>
              {session.priority}
            </Badge>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Department</Label>
            <p className="text-sm capitalize">{session.department}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Duration</Label>
            <p className="text-sm">
              {formatDistanceToNow(session.startedAt)}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-3">Assignment</h3>
        {session.agent ? (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.agent.avatar} />
              <AvatarFallback className="text-xs">
                {session.agent.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{session.agent.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{session.agent.status}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">No agent assigned</p>
            <Select onValueChange={(agentId) => onAssignAgent(session.id, agentId)}>
              <SelectTrigger>
                <SelectValue placeholder="Assign agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.filter(a => a.status === "online" && a.activeSessions < a.maxSessions).map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({agent.activeSessions}/{agent.maxSessions})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-3">Tags</h3>
        <div className="flex flex-wrap gap-1">
          {session.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {session.metadata && (
        <>
          <Separator />
          <div>
            <h3 className="font-medium mb-3">Context</h3>
            <div className="space-y-2 text-sm">
              {session.metadata.page && (
                <div>
                  <Label className="text-muted-foreground">Current Page</Label>
                  <p>{session.metadata.page}</p>
                </div>
              )}
              {session.metadata.referrer && (
                <div>
                  <Label className="text-muted-foreground">Referrer</Label>
                  <p>{session.metadata.referrer}</p>
                </div>
              )}
              {session.metadata.previousChats !== undefined && (
                <div>
                  <Label className="text-muted-foreground">Previous Chats</Label>
                  <p>{session.metadata.previousChats}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
