// Core User and Authentication Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  organizationId: string
  password?: string // Optional to avoid exposing in responses
  avatar?: string
  phone?: string
  isActive: boolean
  lastLogin?: Date
  isOnboardingCompleted?: boolean
  onboardingStep?: number
  createdAt: Date
  updatedAt: Date
}

export type UserRole = "ADMIN" | "MANAGER" | "AGENT"

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

// Contact Management
export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsappNumber?: string
  company?: string
  position?: string
  tags: string[]
  leadScore: number
  status: ContactStatus
  source: string
  assignedTo?: string
  organizationId: string
  customFields: Record<string, any>
  notes: ContactNote[]
  activities: ContactActivity[]
  createdAt: Date
  updatedAt: Date
}

export type ContactStatus = "LEAD" | "PROSPECT" | "customer" | "inactive" | "lost"

export interface ContactNote {
  id: string
  content: string
  createdBy: string
  createdAt: Date
}

export interface ContactActivity {
  id: string
  type: ActivityType
  description: string
  metadata?: Record<string, any>
  createdBy: string
  createdAt: Date
}

export type ActivityType =
  | "email_sent"
  | "call_made"
  | "meeting_scheduled"
  | "deal_created"
  | "tag_added"
  | "note_added"

// Deal and Pipeline Management
export interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
  organizationId: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  probability: number
  deals: Deal[]
}

export interface Deal {
  id: string
  title: string
  value: number
  currency: "NGN" | "USD"
  contactId: string
  stageId: string
  pipelineId: string
  assignedTo: string
  probability: number
  expectedCloseDate?: Date
  actualCloseDate?: Date
  notes: string
  organizationId: string
  activities: DealActivity[]
  createdAt: Date
  updatedAt: Date
}

export interface DealActivity {
  id: string
  type: DealActivityType
  description: string
  previousStage?: string
  newStage?: string
  createdBy: string
  createdAt: Date
}

export type DealActivityType =
  | "created"
  | "stage_changed"
  | "value_updated"
  | "note_added"
  | "closed_won"
  | "closed_lost"

// Task Management
export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  type: TaskType
  dueDate: Date
  assignedTo: string
  contactId?: string
  dealId?: string
  organizationId: string
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"
export type TaskType = "call" | "email" | "meeting" | "follow_up" | "demo" | "other"

// Campaign and Marketing
export interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  subject?: string
  content: string
  targetAudience: string[]
  scheduledAt?: Date
  sentAt?: Date
  organizationId: string
  createdBy: string
  metrics: CampaignMetrics
  workflowId?: string
  createdAt: Date
  updatedAt: Date
}

export type CampaignType = "email" | "sms" | "whatsapp" | "drip_sequence"
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "completed" | "cancelled"

export interface CampaignMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  unsubscribed: number
  conversions: number
}

// Workflow Builder
export interface Workflow {
  id: string
  name: string
  description?: string
  status: WorkflowStatus
  trigger: WorkflowTrigger
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  organizationId: string
  createdBy: string
  metrics: WorkflowMetrics
  createdAt: Date
  updatedAt: Date
}

export type WorkflowStatus = "draft" | "active" | "paused" | "archived"

export interface WorkflowTrigger {
  type: TriggerType
  conditions: Record<string, any>
}

export type TriggerType = "contact_created" | "tag_added" | "form_submitted" | "date_based" | "deal_stage_changed"

export interface WorkflowNode {
  id: string
  type: NodeType
  subType: string
  name: string
  position: { x: number; y: number }
  config: Record<string, any>
  template: any
}

export type NodeType = "trigger" | "action" | "condition" | "delay"

export interface WorkflowConnection {
  id: string
  sourceNodeId: string
  targetNodeId: string
  condition?: string
}

export interface WorkflowMetrics {
  totalEntered: number
  completed: number
  active: number
  dropped: number
}

// Appointment System
export interface Appointment {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  contactId?: string
  assignedTo: string
  status: AppointmentStatus
  type: AppointmentType
  meetingLink?: string
  location?: string
  organizationId: string
  reminders: AppointmentReminder[]
  attendees: string[]
  createdAt: Date
  updatedAt: Date
}

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show" | "rescheduled"
export type AppointmentType = "meeting" | "call" | "demo" | "consultation" | "follow_up"

export interface AppointmentReminder {
  id: string
  type: ReminderType
  minutesBefore: number
  sent: boolean
  sentAt?: Date
}

export type ReminderType = "email" | "sms" | "whatsapp" | "push"

// Organization and Settings
export interface Organization {
  id: string
  name: string
  domain?: string
  logo?: string
  settings: OrganizationSettings
  subscription: Subscription
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationSettings {
  timezone: string
  currency: "NGN" | "USD"
  language: "en" | "ha" | "yo" | "ig"
  businessHours: BusinessHours
  integrations: IntegrationSettings
  permissions: RolePermissions
}

export interface BusinessHours {
  [key: string]: { start: string; end: string; enabled: boolean }
}

export interface IntegrationSettings {
  whatsapp: WhatsAppIntegration
  email: EmailIntegration
  sms: SmsIntegration
  payment: PaymentIntegration
  calendar: CalendarIntegration
}

export interface WhatsAppIntegration {
  enabled: boolean
  businessAccountId?: string
  accessToken?: string
  webhookUrl?: string
}

export interface EmailIntegration {
  provider: "sendgrid" | "mailgun"
  apiKey?: string
  fromEmail?: string
  fromName?: string
}

export interface SmsIntegration {
  provider: "termii" | "bulk-sms"
  apiKey?: string
  senderId?: string
}

export interface PaymentIntegration {
  paystack: {
    enabled: boolean
    publicKey?: string
    secretKey?: string
  }
  flutterwave: {
    enabled: boolean
    publicKey?: string
    secretKey?: string
  }
}

export interface CalendarIntegration {
  google: {
    enabled: boolean
    clientId?: string
    clientSecret?: string
    refreshToken?: string
  }
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  billingHistory: BillingHistory[]
}

export type SubscriptionPlan = "starter" | "growth" | "agency_pro"
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing" | "incomplete"

export interface BillingHistory {
  id: string
  amount: number
  currency: string
  status: "paid" | "pending" | "failed"
  invoiceUrl?: string
  createdAt: Date
}

// Role-Based Access Control
export interface RolePermissions {
  admin: Permission[]
  manager: Permission[]
  agent: Permission[]
}

export interface Permission {
  resource: Resource
  actions: Action[]
}

export type Resource =
  | "contacts"
  | "deals"
  | "campaigns"
  | "appointments"
  | "tasks"
  | "workflows"
  | "analytics"
  | "settings"
  | "users"

export type Action = "create" | "read" | "update" | "delete" | "assign" | "export"

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  filters?: Record<string, any>
}

// Client History
export interface ClientHistory {
  id: string
  contactId: string
  type: HistoryType
  title: string
  description: string
  metadata?: Record<string, any>
  createdBy: string
  createdAt: Date
}

export type HistoryType =
  | "contact_created"
  | "contact_updated"
  | "deal_created"
  | "deal_updated"
  | "campaign_sent"
  | "appointment_scheduled"
  | "task_completed"
  | "note_added"
