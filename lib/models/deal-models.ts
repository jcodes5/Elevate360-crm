// Enhanced Deal Management Models
export interface DealModel {
  id: string
  title: string
  description?: string
  
  // Financial Information
  value: number
  currency: string
  probability: number
  expectedCloseDate?: Date
  actualCloseDate?: Date
  
  // Deal Classification
  type: DealType
  priority: DealPriority
  source: string
  category?: string
  
  // Pipeline & Stage
  pipelineId: string
  stageId: string
  stagePosition: number
  timeInCurrentStage: number // days
  
  // Assignment & Ownership
  assignedTo: string
  assignedTeam?: string
  territory?: string
  
  // Relationships
  primaryContactId: string
  organizationId: string
  accountId?: string
  parentDealId?: string // For deal hierarchies
  childDeals?: DealModel[]
  
  // Products & Services
  products: DealProduct[]
  services: DealService[]
  
  // Deal Progress & Metrics
  score: number // Deal health score
  momentum: DealMomentum
  riskLevel: DealRiskLevel
  competitorInfo?: CompetitorInfo[]
  
  // Financial Tracking
  totalValue: number
  recurringValue?: number
  oneTimeValue?: number
  margin?: number
  costOfSale?: number
  
  // Deal Timeline
  firstContactDate?: Date
  qualificationDate?: Date
  proposalDate?: Date
  negotiationDate?: Date
  decisionDate?: Date
  
  // Custom Fields & Metadata
  customFields: Record<string, any>
  metadata?: DealMetadata
  
  // Deal Status & Outcome
  status: DealStatus
  outcome?: DealOutcome
  lossReason?: string
  winReason?: string
  
  // Relations
  contacts: DealContact[]
  activities: DealActivity[]
  documents: DealDocument[]
  tasks: DealTask[]
  notes: DealNote[]
  quotes: DealQuote[]
  proposals: DealProposal[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type DealType = 
  | 'new_business'
  | 'existing_business'
  | 'renewal'
  | 'upsell'
  | 'cross_sell'
  | 'downgrade'
  | 'expansion'
  | 'partnership'

export type DealPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type DealStatus = 
  | 'open'
  | 'won'
  | 'lost'
  | 'abandoned'
  | 'on_hold'
  | 'pending_approval'

export type DealOutcome = 
  | 'closed_won'
  | 'closed_lost'
  | 'closed_no_decision'
  | 'closed_cancelled'
  | 'closed_competitor'
  | 'closed_budget'
  | 'closed_timing'

export type DealMomentum = 
  | 'accelerating'
  | 'steady'
  | 'slowing'
  | 'stalled'
  | 'declining'

export type DealRiskLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

// Deal Metadata
export interface DealMetadata {
  originalSource?: string
  campaignId?: string
  referralSource?: string
  marketingAttribution?: {
    firstTouch?: string
    lastTouch?: string
    multiTouch?: string[]
  }
  technicalRequirements?: string[]
  budgetConstraints?: string
  decisionCriteria?: string[]
  competitiveThreats?: string[]
}

// Pipeline Models
export interface PipelineModel {
  id: string
  name: string
  description?: string
  isDefault: boolean
  isActive: boolean
  currency: string
  
  // Pipeline Configuration
  stages: PipelineStage[]
  probabilityCalculation: 'manual' | 'automatic' | 'weighted'
  
  // Rules & Automation
  stageRequirements: StageRequirement[]
  automationRules: PipelineAutomationRule[]
  
  // Analytics
  averageDealSize: number
  averageCycleTime: number
  winRate: number
  totalValue: number
  
  // Relations
  organizationId: string
  deals: DealModel[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface PipelineStage {
  id: string
  name: string
  description?: string
  order: number
  probability: number
  color: string
  
  // Stage Configuration
  isClosedWon: boolean
  isClosedLost: boolean
  requiresApproval: boolean
  
  // Stage Requirements
  requiredFields: string[]
  requiredActivities: string[]
  requiredDocuments: string[]
  
  // Automation
  entryActions: StageAction[]
  exitActions: StageAction[]
  
  // Analytics
  dealCount: number
  averageTimeInStage: number
  conversionRate: number
  
  pipelineId: string
}

export interface StageRequirement {
  stageId: string
  type: 'field' | 'activity' | 'document' | 'approval'
  requirement: string
  isRequired: boolean
  description?: string
}

export interface StageAction {
  id: string
  type: 'create_task' | 'send_email' | 'update_field' | 'notification' | 'webhook'
  config: Record<string, any>
  isActive: boolean
}

export interface PipelineAutomationRule {
  id: string
  name: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  isActive: boolean
}

export interface AutomationTrigger {
  type: 'stage_change' | 'value_change' | 'time_based' | 'activity' | 'field_update'
  config: Record<string, any>
}

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in'
  value: any
}

export interface AutomationAction {
  type: 'update_field' | 'create_task' | 'send_email' | 'assign_user' | 'move_stage' | 'create_activity'
  config: Record<string, any>
}

// Deal Products & Services
export interface DealProduct {
  id: string
  dealId: string
  productId: string
  productName: string
  productSku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number
  discountType?: 'percentage' | 'fixed'
  margin?: number
  recurringRevenue?: boolean
  billingFrequency?: 'monthly' | 'quarterly' | 'annual' | 'one_time'
  description?: string
}

export interface DealService {
  id: string
  dealId: string
  serviceId: string
  serviceName: string
  description?: string
  hours?: number
  hourlyRate?: number
  totalPrice: number
  deliveryDate?: Date
  deliverables?: string[]
}

// Competitor Information
export interface CompetitorInfo {
  id: string
  dealId: string
  competitorName: string
  competitorStrengths?: string[]
  competitorWeaknesses?: string[]
  competitiveAdvantage?: string
  competitorPrice?: number
  likelihood: number // 1-10 scale
  notes?: string
}

// Deal Contacts (many-to-many relationship)
export interface DealContact {
  id: string
  dealId: string
  contactId: string
  role: DealContactRole
  influenceLevel: number // 1-10
  isPrimary: boolean
  decisionMaker: boolean
  champion: boolean
  notes?: string
}

export type DealContactRole = 
  | 'decision_maker'
  | 'influencer'
  | 'user'
  | 'technical_evaluator'
  | 'financial_approver'
  | 'champion'
  | 'blocker'
  | 'coach'

// Deal Activities
export interface DealActivity {
  id: string
  dealId: string
  type: DealActivityType
  title: string
  description: string
  outcome?: string
  nextSteps?: string
  participants?: string[] // Contact IDs
  duration?: number
  value?: number // Monetary value associated with activity
  scheduledAt?: Date
  completedAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type DealActivityType = 
  | 'call'
  | 'meeting'
  | 'email'
  | 'demo'
  | 'presentation'
  | 'proposal'
  | 'negotiation'
  | 'contract_review'
  | 'technical_review'
  | 'site_visit'
  | 'reference_call'
  | 'trial'
  | 'pilot'
  | 'training'
  | 'implementation'

// Deal Documents
export interface DealDocument {
  id: string
  dealId: string
  name: string
  type: DealDocumentType
  url: string
  size: number
  version: string
  status: 'draft' | 'pending_review' | 'approved' | 'signed' | 'rejected'
  uploadedBy: string
  uploadedAt: Date
  lastViewedAt?: Date
  viewCount: number
  signedAt?: Date
  signedBy?: string
}

export type DealDocumentType = 
  | 'proposal'
  | 'quote'
  | 'contract'
  | 'msa' // Master Service Agreement
  | 'sow' // Statement of Work
  | 'nda' // Non-Disclosure Agreement
  | 'presentation'
  | 'technical_spec'
  | 'case_study'
  | 'reference'
  | 'compliance_doc'

// Deal Notes
export interface DealNote {
  id: string
  dealId: string
  content: string
  type: 'general' | 'call_summary' | 'meeting_notes' | 'competitor_intel' | 'risk_assessment'
  isPrivate: boolean
  pinned: boolean
  attachments?: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Deal Tasks
export interface DealTask {
  id: string
  dealId: string
  title: string
  description?: string
  type: DealTaskType
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assignedTo: string
  dueDate: Date
  completedAt?: Date
  reminderDate?: Date
  dependencies?: string[] // Other task IDs
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type DealTaskType = 
  | 'follow_up'
  | 'prepare_proposal'
  | 'schedule_demo'
  | 'send_contract'
  | 'get_approval'
  | 'reference_check'
  | 'technical_review'
  | 'pricing_review'
  | 'legal_review'
  | 'implementation_planning'

// Deal Quotes
export interface DealQuote {
  id: string
  dealId: string
  quoteNumber: string
  version: number
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired'
  validUntil: Date
  totalAmount: number
  currency: string
  discount?: number
  terms?: string
  notes?: string
  lineItems: QuoteLineItem[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface QuoteLineItem {
  id: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number
}

// Deal Proposals
export interface DealProposal {
  id: string
  dealId: string
  title: string
  version: number
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
  documentUrl?: string
  validUntil?: Date
  sentAt?: Date
  viewedAt?: Date
  respondedAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Deal Search & Analytics
export interface DealSearchCriteria {
  query?: string
  status?: DealStatus[]
  stageIds?: string[]
  pipelineIds?: string[]
  assignedTo?: string[]
  valueMin?: number
  valueMax?: number
  probabilityMin?: number
  probabilityMax?: number
  expectedCloseAfter?: Date
  expectedCloseBefore?: Date
  actualCloseAfter?: Date
  actualCloseBefore?: Date
  tags?: string[]
  customFields?: Record<string, any>
}

export interface DealAnalytics {
  totalDeals: number
  openDeals: number
  wonDeals: number
  lostDeals: number
  totalValue: number
  averageDealSize: number
  averageCycleTime: number
  winRate: number
  dealsByStage: Record<string, number>
  dealsBySource: Record<string, number>
  forecastValue: number
  weightedForecast: number
  topPerformers: Array<{
    userId: string
    userName: string
    dealCount: number
    totalValue: number
    winRate: number
  }>
  conversionFunnel: Array<{
    stageId: string
    stageName: string
    dealCount: number
    conversionRate: number
  }>
}

// Deal Forecasting
export interface DealForecast {
  id: string
  period: 'monthly' | 'quarterly' | 'annual'
  startDate: Date
  endDate: Date
  forecastValue: number
  weightedValue: number
  bestCase: number
  worstCase: number
  confidence: number
  deals: DealForecastItem[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface DealForecastItem {
  dealId: string
  dealTitle: string
  value: number
  probability: number
  expectedCloseDate: Date
  confidence: 'high' | 'medium' | 'low'
  riskFactors?: string[]
}

// Deal Search Parameters
export interface DealSearchParams {
  query?: string
  status?: DealStatus[]
  stageIds?: string[]
  pipelineIds?: string[]
  assignedTo?: string[]
  valueMin?: number
  valueMax?: number
  probabilityMin?: number
  probabilityMax?: number
  expectedCloseAfter?: Date
  expectedCloseBefore?: Date
  actualCloseAfter?: Date
  actualCloseBefore?: Date
  tags?: string[]
  customFields?: Record<string, any>
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Deal Statistics
export interface DealStats {
  total: number
  open: number
  won: number
  lost: number
  totalValue: number
  averageValue: number
  averageCycleTime: number
  winRate: number
  byStage: Record<string, number>
  byPipeline: Record<string, number>
  byAssignee: Record<string, number>
  forecastValue: number
  weightedForecast: number
}
