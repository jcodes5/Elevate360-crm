// Enhanced Task & Activity Management Models
export interface TaskModel {
  id: string
  title: string
  description?: string
  
  // Task Classification
  type: TaskType
  category: TaskCategory
  priority: TaskPriority
  urgency: TaskUrgency
  importance: TaskImportance
  
  // Task Status & Progress
  status: TaskStatus
  progress: number // 0-100
  stage: TaskStage
  
  // Assignment & Ownership
  assignedTo: string
  assignedBy: string
  assignedTeam?: string
  watchers: string[] // User IDs who watch this task
  
  // Relationships
  contactId?: string
  dealId?: string
  organizationId: string
  projectId?: string
  parentTaskId?: string
  childTasks?: TaskModel[]
  
  // Scheduling & Timing
  dueDate: Date
  startDate?: Date
  scheduledDate?: Date
  completedAt?: Date
  estimatedDuration?: number // in minutes
  actualDuration?: number // in minutes
  timeZone: string
  
  // Recurrence
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  
  // Dependencies & Blocking
  dependencies: TaskDependency[]
  blockedBy: string[] // Task IDs
  blocking: string[] // Task IDs
  
  // Location & Context
  location?: string
  isRemote: boolean
  meetingLink?: string
  
  // Task Content & Assets
  notes: TaskNote[]
  attachments: TaskAttachment[]
  checklist: TaskChecklistItem[]
  
  // Automation & Integration
  automationRules: TaskAutomationRule[]
  integrations: TaskIntegration[]
  
  // Tracking & Analytics
  timeEntries: TimeEntry[]
  activityLog: TaskActivity[]
  metrics: TaskMetrics
  
  // Custom Fields
  customFields: Record<string, any>
  tags: string[]
  
  // Reminders & Notifications
  reminders: TaskReminder[]
  notifications: TaskNotification[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type TaskType = 
  | 'call'
  | 'email'
  | 'meeting'
  | 'follow_up'
  | 'demo'
  | 'presentation'
  | 'proposal'
  | 'contract'
  | 'research'
  | 'documentation'
  | 'training'
  | 'review'
  | 'approval'
  | 'administrative'
  | 'travel'
  | 'event'
  | 'project'
  | 'personal'
  | 'other'

export type TaskCategory = 
  | 'sales'
  | 'marketing'
  | 'customer_service'
  | 'operations'
  | 'finance'
  | 'hr'
  | 'legal'
  | 'it'
  | 'management'
  | 'personal'
  | 'project'
  | 'maintenance'

export type TaskPriority = 
  | 'lowest'
  | 'low'
  | 'medium'
  | 'high'
  | 'highest'
  | 'critical'

export type TaskUrgency = 
  | 'not_urgent'
  | 'low_urgency'
  | 'medium_urgency'
  | 'high_urgency'
  | 'critical_urgency'

export type TaskImportance = 
  | 'not_important'
  | 'low_importance'
  | 'medium_importance'
  | 'high_importance'
  | 'critical_importance'

export type TaskStatus = 
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'waiting'
  | 'blocked'
  | 'under_review'
  | 'completed'
  | 'cancelled'
  | 'deferred'

export type TaskStage = 
  | 'planning'
  | 'preparation'
  | 'execution'
  | 'review'
  | 'completion'
  | 'follow_up'

// Recurrence Pattern
export interface RecurrencePattern {
  type: RecurrenceType
  interval: number
  daysOfWeek?: DayOfWeek[]
  dayOfMonth?: number
  monthOfYear?: number
  endDate?: Date
  occurrences?: number
  exceptions: Date[] // Dates to skip
}

export type RecurrenceType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom'

export type DayOfWeek = 
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

// Task Dependencies
export interface TaskDependency {
  id: string
  dependentTaskId: string
  type: DependencyType
  lag?: number // in days
  description?: string
}

export type DependencyType = 
  | 'finish_to_start'
  | 'start_to_start'
  | 'finish_to_finish'
  | 'start_to_finish'

// Task Notes
export interface TaskNote {
  id: string
  taskId: string
  content: string
  type: 'general' | 'progress_update' | 'issue' | 'solution' | 'decision'
  isPrivate: boolean
  mentions: string[] // User IDs mentioned in note
  attachments?: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Task Attachments
export interface TaskAttachment {
  id: string
  taskId: string
  name: string
  type: 'document' | 'image' | 'video' | 'audio' | 'link' | 'other'
  url: string
  size?: number
  mimeType?: string
  description?: string
  uploadedBy: string
  uploadedAt: Date
}

// Task Checklist
export interface TaskChecklistItem {
  id: string
  taskId: string
  title: string
  description?: string
  isCompleted: boolean
  order: number
  assignedTo?: string
  dueDate?: Date
  completedAt?: Date
  completedBy?: string
  createdAt: Date
  updatedAt: Date
}

// Task Automation
export interface TaskAutomationRule {
  id: string
  taskId: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  isActive: boolean
  executionCount: number
  lastExecuted?: Date
}

export interface AutomationTrigger {
  type: 'status_change' | 'due_date' | 'assignment' | 'completion' | 'time_based'
  config: Record<string, any>
}

export interface AutomationCondition {
  field: string
  operator: string
  value: any
}

export interface AutomationAction {
  type: 'send_notification' | 'update_field' | 'create_task' | 'assign_user' | 'send_email'
  config: Record<string, any>
}

// Task Integrations
export interface TaskIntegration {
  id: string
  taskId: string
  platform: string // 'calendar', 'email', 'slack', 'teams', etc.
  externalId: string
  syncStatus: 'synced' | 'pending' | 'failed'
  lastSyncAt?: Date
  syncErrors?: string[]
  config: Record<string, any>
}

// Time Tracking
export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  description?: string
  billable: boolean
  hourlyRate?: number
  isBreak: boolean
  category?: string
  project?: string
  createdAt: Date
  updatedAt: Date
}

// Task Activity Log
export interface TaskActivity {
  id: string
  taskId: string
  userId: string
  action: TaskAction
  details: string
  oldValue?: any
  newValue?: any
  metadata?: Record<string, any>
  timestamp: Date
}

export type TaskAction = 
  | 'created'
  | 'updated'
  | 'assigned'
  | 'status_changed'
  | 'priority_changed'
  | 'due_date_changed'
  | 'note_added'
  | 'attachment_added'
  | 'checklist_updated'
  | 'time_logged'
  | 'completed'
  | 'reopened'
  | 'deleted'

// Task Metrics
export interface TaskMetrics {
  totalTimeSpent: number
  averageCompletionTime: number
  overdueCount: number
  reopenCount: number
  commentCount: number
  attachmentCount: number
  collaboratorCount: number
  viewCount: number
  updateCount: number
  efficiencyScore: number
}

// Task Reminders
export interface TaskReminder {
  id: string
  taskId: string
  type: ReminderType
  timing: ReminderTiming
  recipients: string[] // User IDs
  message?: string
  isActive: boolean
  lastSent?: Date
  sendCount: number
}

export type ReminderType = 
  | 'due_date'
  | 'start_date'
  | 'overdue'
  | 'progress'
  | 'custom'

export interface ReminderTiming {
  when: 'before' | 'at' | 'after'
  amount: number
  unit: 'minutes' | 'hours' | 'days' | 'weeks'
}

// Task Notifications
export interface TaskNotification {
  id: string
  taskId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  sentAt: Date
  readAt?: Date
}

export type NotificationType = 
  | 'assignment'
  | 'due_soon'
  | 'overdue'
  | 'completed'
  | 'updated'
  | 'commented'
  | 'status_changed'
  | 'dependency_resolved'
  | 'blocked'

// Task Templates
export interface TaskTemplate {
  id: string
  name: string
  description?: string
  category: TaskCategory
  type: TaskType
  priority: TaskPriority
  estimatedDuration?: number
  checklist: TaskTemplateChecklist[]
  customFields: Record<string, any>
  tags: string[]
  isPublic: boolean
  usageCount: number
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TaskTemplateChecklist {
  title: string
  description?: string
  order: number
  isRequired: boolean
}

// Task Search & Filtering
export interface TaskSearchCriteria {
  query?: string
  status?: TaskStatus[]
  priority?: TaskPriority[]
  type?: TaskType[]
  category?: TaskCategory[]
  assignedTo?: string[]
  createdBy?: string[]
  dueBefore?: Date
  dueAfter?: Date
  completedBefore?: Date
  completedAfter?: Date
  hasContact?: boolean
  hasDeal?: boolean
  tags?: string[]
  isOverdue?: boolean
  isCompleted?: boolean
  customFields?: Record<string, any>
}

export interface TaskListOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  groupBy?: 'status' | 'priority' | 'assignee' | 'due_date' | 'category'
  includeCompleted?: boolean
  includeSubtasks?: boolean
}

// Task Analytics
export interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  inProgressTasks: number
  averageCompletionTime: number
  onTimeCompletionRate: number
  tasksByStatus: Record<TaskStatus, number>
  tasksByPriority: Record<TaskPriority, number>
  tasksByAssignee: Record<string, number>
  tasksByCategory: Record<TaskCategory, number>
  productivityTrends: ProductivityTrend[]
  burndownChart: BurndownData[]
  timeDistribution: TimeDistribution
}

export interface ProductivityTrend {
  date: Date
  tasksCreated: number
  tasksCompleted: number
  averageTimeToComplete: number
  productivityScore: number
}

export interface BurndownData {
  date: Date
  remainingTasks: number
  idealBurndown: number
  actualBurndown: number
}

export interface TimeDistribution {
  planning: number
  execution: number
  communication: number
  administration: number
  meetings: number
  travel: number
  other: number
}

// Task Board & Kanban
export interface TaskBoard {
  id: string
  name: string
  description?: string
  type: 'kanban' | 'scrum' | 'calendar' | 'list'
  columns: TaskBoardColumn[]
  filters: TaskSearchCriteria
  settings: TaskBoardSettings
  members: string[] // User IDs
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TaskBoardColumn {
  id: string
  name: string
  status: TaskStatus[]
  color: string
  limit?: number // WIP limit
  order: number
  isCollapsed: boolean
}

export interface TaskBoardSettings {
  swimlanes: 'none' | 'assignee' | 'priority' | 'category'
  cardFields: string[]
  showAvatars: boolean
  showDueDates: boolean
  showPriority: boolean
  showTags: boolean
  autoRefresh: boolean
  refreshInterval: number
}

// Task Reports
export interface TaskReport {
  id: string
  name: string
  description?: string
  type: TaskReportType
  criteria: TaskSearchCriteria
  metrics: string[]
  groupBy: string[]
  period: ReportPeriod
  format: 'table' | 'chart' | 'dashboard'
  schedule?: ReportSchedule
  recipients: string[]
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type TaskReportType = 
  | 'productivity'
  | 'performance'
  | 'workload'
  | 'time_tracking'
  | 'completion_rate'
  | 'overdue_analysis'
  | 'custom'

export interface ReportPeriod {
  startDate: Date
  endDate: Date
  timezone: string
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: DayOfWeek
  dayOfMonth?: number
  time: string // HH:mm format
  isActive: boolean
}

// Task Comments & Collaboration
export interface TaskComment {
  id: string
  taskId: string
  content: string
  parentCommentId?: string // For threaded comments
  mentions: string[] // User IDs mentioned
  reactions: TaskReaction[]
  attachments?: string[]
  isEdited: boolean
  isPrivate: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TaskReaction {
  userId: string
  emoji: string
  createdAt: Date
}

// Task Collaboration
export interface TaskCollaboration {
  taskId: string
  participants: TaskParticipant[]
  permissions: TaskPermission[]
  shareSettings: TaskShareSettings
  collaborationLog: CollaborationEvent[]
}

export interface TaskParticipant {
  userId: string
  role: ParticipantRole
  permissions: string[]
  joinedAt: Date
  lastActiveAt?: Date
}

export type ParticipantRole = 
  | 'owner'
  | 'assignee'
  | 'collaborator'
  | 'observer'
  | 'reviewer'

export interface TaskPermission {
  userId: string
  action: string
  allowed: boolean
  grantedBy: string
  grantedAt: Date
}

export interface TaskShareSettings {
  isPublic: boolean
  allowComments: boolean
  allowEditing: boolean
  allowViewing: boolean
  expiresAt?: Date
  password?: string
}

export interface CollaborationEvent {
  id: string
  userId: string
  action: string
  details: string
  timestamp: Date
}

// Task Search Parameters
export interface TaskSearchParams {
  query?: string
  status?: TaskStatus[]
  priority?: TaskPriority[]
  type?: TaskType[]
  category?: TaskCategory[]
  assignedTo?: string[]
  createdBy?: string[]
  dueBefore?: Date
  dueAfter?: Date
  completedBefore?: Date
  completedAfter?: Date
  hasContact?: boolean
  hasDeal?: boolean
  tags?: string[]
  isOverdue?: boolean
  isCompleted?: boolean
  customFields?: Record<string, any>
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Task Statistics
export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  byPriority: Record<TaskPriority, number>
  byStatus: Record<TaskStatus, number>
  byAssignee: Record<string, number>
  byCategory: Record<TaskCategory, number>
  completionRate: number
  averageCompletionTime: number
  productivityScore: number
}
