// CRM Models - Master Export File
// Comprehensive collection of all CRM module models

// Contact Management Models
export * from './contact-models'

// Deal Management Models
export * from './deal-models'

// Campaign & Marketing Models
export * from './campaign-models'

// Task & Activity Management Models
export * from './task-models'

// Workflow Models
export * from './workflow-models'

// Analytics & Reporting Models
export * from './analytics-models'

// Common Types and Utilities
export interface BaseModel {
  id: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface AuditLog {
  id: string
  entityType: string
  entityId: string
  action: AuditAction
  changes: Record<string, { old: any; new: any }>
  userId: string
  userEmail: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  organizationId: string
}

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'merge'
  | 'import'
  | 'export'
  | 'bulk_update'
  | 'bulk_delete'

// Pagination and Search
export interface PaginationOptions {
  page: number
  limit: number
  offset?: number
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface SearchOptions {
  query?: string
  filters?: Record<string, any>
  sort?: SortOptions[]
  pagination?: PaginationOptions
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: {
    query?: string
    filters?: Record<string, any>
    sort?: SortOptions[]
    executionTime?: number
  }
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: ApiError[]
  meta?: ResponseMeta
}

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

export interface ResponseMeta {
  timestamp: Date
  requestId: string
  version: string
  executionTime?: number
  rateLimitRemaining?: number
  rateLimitReset?: Date
}

// File Upload Types
export interface FileUpload {
  id: string
  originalName: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnail?: string
  metadata?: FileMetadata
  uploadedBy: string
  uploadedAt: Date
  organizationId: string
}

export interface FileMetadata {
  width?: number
  height?: number
  duration?: number
  pages?: number
  encoding?: string
  checksum?: string
  virusScanStatus?: 'clean' | 'infected' | 'pending'
}

// Integration Types
export interface Integration {
  id: string
  name: string
  type: IntegrationType
  status: IntegrationStatus
  config: IntegrationConfig
  lastSyncAt?: Date
  syncFrequency?: number // in minutes
  errorCount: number
  lastError?: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export type IntegrationType = 
  | 'email'
  | 'calendar'
  | 'sms'
  | 'whatsapp'
  | 'social_media'
  | 'payment'
  | 'accounting'
  | 'marketing'
  | 'customer_support'
  | 'analytics'
  | 'webhook'
  | 'api'

export type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'pending'
  | 'syncing'

export interface IntegrationConfig {
  apiKey?: string
  secretKey?: string
  accessToken?: string
  refreshToken?: string
  webhookUrl?: string
  syncSettings?: SyncSettings
  fieldMappings?: FieldMapping[]
  customSettings?: Record<string, any>
}

export interface SyncSettings {
  enabled: boolean
  frequency: number // in minutes
  batchSize: number
  retryAttempts: number
  syncDirection: 'bidirectional' | 'inbound' | 'outbound'
}

export interface FieldMapping {
  sourceField: string
  targetField: string
  transformation?: string
  defaultValue?: any
}

// Custom Field Types
export interface CustomField {
  id: string
  name: string
  label: string
  type: CustomFieldType
  entityType: string // 'contact', 'deal', 'campaign', etc.
  isRequired: boolean
  isVisible: boolean
  isSearchable: boolean
  order: number
  options?: CustomFieldOption[]
  validation?: CustomFieldValidation
  defaultValue?: any
  helpText?: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export type CustomFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone'
  | 'file'
  | 'user'
  | 'formula'

export interface CustomFieldOption {
  value: string
  label: string
  color?: string
  order: number
  isActive: boolean
}

export interface CustomFieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  required?: boolean
  unique?: boolean
  customValidator?: string
}

// Tag System
export interface Tag {
  id: string
  name: string
  color: string
  description?: string
  entityTypes: string[] // Which entities can use this tag
  usageCount: number
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TagAssignment {
  tagId: string
  entityType: string
  entityId: string
  assignedBy: string
  assignedAt: Date
}

// Notification System
export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  channel: NotificationChannel
  subject?: string
  content: string
  variables: NotificationVariable[]
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export type NotificationType = 
  | 'welcome'
  | 'reminder'
  | 'alert'
  | 'update'
  | 'completion'
  | 'approval'
  | 'assignment'
  | 'deadline'
  | 'milestone'
  | 'error'

export type NotificationChannel = 
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app'
  | 'webhook'
  | 'slack'
  | 'teams'

export interface NotificationVariable {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean'
  description?: string
  example?: string
}

// Workflow System
export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  isActive: boolean
  executionCount: number
  lastExecuted?: Date
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType
  entityType: string
  conditions: WorkflowCondition[]
  schedule?: WorkflowSchedule
}

export type WorkflowTriggerType = 
  | 'entity_created'
  | 'entity_updated'
  | 'entity_deleted'
  | 'field_changed'
  | 'date_reached'
  | 'time_based'
  | 'manual'
  | 'api_call'
  | 'webhook'

export interface WorkflowCondition {
  field: string
  operator: WorkflowOperator
  value: any
  logicOperator?: 'AND' | 'OR'
}

export type WorkflowOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty'

export interface WorkflowAction {
  type: WorkflowActionType
  config: Record<string, any>
  delay?: WorkflowDelay
  condition?: WorkflowCondition[]
}

export type WorkflowActionType = 
  | 'update_field'
  | 'create_record'
  | 'send_email'
  | 'send_sms'
  | 'create_task'
  | 'assign_user'
  | 'add_tag'
  | 'remove_tag'
  | 'webhook'
  | 'api_call'
  | 'wait'
  | 'branch'

export interface WorkflowDelay {
  amount: number
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
}

export interface WorkflowSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  time?: string
  dayOfWeek?: number
  dayOfMonth?: number
  timezone: string
}

// Import/Export System
export interface ImportJob {
  id: string
  name: string
  entityType: string
  status: ImportStatus
  totalRows: number
  processedRows: number
  successfulRows: number
  failedRows: number
  duplicateRows: number
  skippedRows: number
  errors: ImportError[]
  mapping: ImportMapping
  options: ImportOptions
  fileUrl: string
  resultUrl?: string
  startedAt?: Date
  completedAt?: Date
  organizationId: string
  createdBy: string
  createdAt: Date
}

export type ImportStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface ImportError {
  row: number
  field: string
  value: any
  error: string
  severity: 'error' | 'warning'
}

export interface ImportMapping {
  sourceFields: string[]
  fieldMappings: Record<string, string>
  defaultValues: Record<string, any>
  transformations: Record<string, string>
}

export interface ImportOptions {
  skipHeader: boolean
  delimiter: string
  encoding: string
  duplicateHandling: 'skip' | 'update' | 'create_new'
  batchSize: number
  validateOnly: boolean
}

export interface ExportJob {
  id: string
  name: string
  entityType: string
  status: ExportStatus
  format: ExportFormat
  totalRows: number
  filters?: Record<string, any>
  fields: string[]
  fileUrl?: string
  startedAt?: Date
  completedAt?: Date
  organizationId: string
  createdBy: string
  createdAt: Date
}

export type ExportStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type ExportFormat = 
  | 'csv'
  | 'excel'
  | 'json'
  | 'pdf'

// System Configuration
export interface SystemConfiguration {
  organizationId: string
  settings: OrganizationSettings
  features: FeatureFlags
  limits: SystemLimits
  branding: BrandingSettings
  security: SecuritySettings
  updatedAt: Date
}

export interface OrganizationSettings {
  name: string
  domain?: string
  timezone: string
  dateFormat: string
  timeFormat: string
  currency: string
  language: string
  fiscalYearStart: number // Month (1-12)
}

export interface FeatureFlags {
  advancedAnalytics: boolean
  multiCurrency: boolean
  customFields: boolean
  workflows: boolean
  integrations: boolean
  apiAccess: boolean
  webhooks: boolean
  ssoLogin: boolean
  auditLog: boolean
  dataExport: boolean
}

export interface SystemLimits {
  maxUsers: number
  maxContacts: number
  maxDeals: number
  maxCampaigns: number
  maxApiCalls: number
  storageLimit: number // in MB
  fileUploadLimit: number // in MB
}

export interface BrandingSettings {
  logo?: string
  favicon?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  customCss?: string
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy
  sessionTimeout: number // in minutes
  mfaRequired: boolean
  ipWhitelist: string[]
  allowDataExport: boolean
  auditLogRetention: number // in days
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number // in days
  preventReuse: number // number of previous passwords
}

// Real-time Updates
export interface RealtimeEvent {
  id: string
  type: RealtimeEventType
  entityType: string
  entityId: string
  action: string
  data: any
  userId: string
  organizationId: string
  timestamp: Date
}

export type RealtimeEventType = 
  | 'entity_created'
  | 'entity_updated'
  | 'entity_deleted'
  | 'user_action'
  | 'system_event'
  | 'notification'
  | 'sync_update'

// Error Handling
export interface SystemError {
  code: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: ErrorCategory
  details?: Record<string, any>
  stackTrace?: string
  userId?: string
  organizationId?: string
  timestamp: Date
}

export type ErrorCategory = 
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'network'
  | 'database'
  | 'integration'
  | 'system'
  | 'user_input'
  | 'configuration'
