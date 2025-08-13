// Enhanced Contact Management Models
export interface ContactModel {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsappNumber?: string
  alternateEmail?: string
  alternatePhone?: string
  
  // Company Information
  company?: string
  position?: string
  department?: string
  industry?: string
  companySize?: string
  website?: string
  
  // Address Information
  address?: ContactAddress
  
  // Classification & Scoring
  tags: string[]
  leadScore: number
  status: ContactStatus
  lifecycle: ContactLifecycle
  source: string
  sourceDetails?: string
  
  // Assignment & Ownership
  assignedTo?: string
  assignedTeam?: string
  territory?: string
  
  // Social Media & Communication
  socialProfiles?: SocialProfiles
  communicationPreferences?: CommunicationPreferences
  
  // Custom Fields & Metadata
  customFields: Record<string, any>
  metadata?: ContactMetadata
  
  // Relations
  organizationId: string
  parentContactId?: string // For contact hierarchies
  childContacts?: ContactModel[]
  
  // Activity & Engagement
  lastContactDate?: Date
  lastActivityDate?: Date
  lastEmailOpened?: Date
  lastWebsiteVisit?: Date
  engagementScore?: number
  
  // Business Value
  estimatedValue?: number
  actualValue?: number
  currency?: string
  
  // Relationships
  notes: ContactNote[]
  activities: ContactActivity[]
  deals: ContactDeal[]
  appointments: ContactAppointment[]
  campaigns: ContactCampaign[]
  tasks: ContactTask[]
  documents: ContactDocument[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ContactAddress {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  type?: 'home' | 'work' | 'billing' | 'shipping'
}

export interface SocialProfiles {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  youtube?: string
  github?: string
}

export interface CommunicationPreferences {
  preferredChannel: 'email' | 'phone' | 'whatsapp' | 'sms'
  emailOptIn: boolean
  smsOptIn: boolean
  whatsappOptIn: boolean
  marketingOptIn: boolean
  timezone?: string
  bestTimeToContact?: string
  doNotContact: boolean
  unsubscribeReason?: string
}

export interface ContactMetadata {
  ipAddress?: string
  userAgent?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  geoLocation?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }
}

// Enhanced Contact Statuses
export type ContactStatus = 
  | 'lead'           // Initial inquiry
  | 'prospect'       // Qualified lead
  | 'opportunity'    // Active sales process
  | 'customer'       // Closed/won
  | 'inactive'       // No recent activity
  | 'lost'          // Lost to competitor
  | 'nurture'       // Long-term nurturing
  | 'disqualified'  // Not a fit
  | 'partner'       // Business partner
  | 'vendor'        // Service provider

export type ContactLifecycle = 
  | 'subscriber'     // Newsletter/content subscriber
  | 'lead'          // Marketing qualified lead
  | 'mql'           // Marketing qualified lead
  | 'sql'           // Sales qualified lead
  | 'opportunity'   // Sales opportunity
  | 'customer'      // Paying customer
  | 'evangelist'    // Promoter/advocate

// Contact Notes Model
export interface ContactNote {
  id: string
  contactId: string
  content: string
  type: 'general' | 'call' | 'meeting' | 'email' | 'follow-up' | 'private'
  isPrivate: boolean
  attachments?: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Contact Activities Model
export interface ContactActivity {
  id: string
  contactId: string
  type: ContactActivityType
  title: string
  description: string
  outcome?: string
  duration?: number // in minutes
  location?: string
  participants?: string[] // User IDs
  attachments?: string[]
  metadata?: Record<string, any>
  scheduledAt?: Date
  completedAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type ContactActivityType = 
  | 'call'
  | 'email'
  | 'meeting'
  | 'task'
  | 'note'
  | 'form_submission'
  | 'website_visit'
  | 'email_open'
  | 'email_click'
  | 'document_view'
  | 'proposal_sent'
  | 'quote_sent'
  | 'contract_sent'
  | 'payment_received'
  | 'support_ticket'
  | 'social_interaction'
  | 'referral'
  | 'demo'
  | 'presentation'
  | 'webinar'
  | 'trade_show'

// Contact Deal Association
export interface ContactDeal {
  id: string
  contactId: string
  dealId: string
  role: 'primary' | 'influencer' | 'decision_maker' | 'user' | 'champion'
  influenceLevel: number // 1-10
}

// Contact Appointment Association
export interface ContactAppointment {
  id: string
  contactId: string
  appointmentId: string
  status: 'invited' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
  role: 'organizer' | 'attendee' | 'optional'
}

// Contact Campaign Association
export interface ContactCampaign {
  id: string
  contactId: string
  campaignId: string
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed'
  sentAt?: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  repliedAt?: Date
  bouncedAt?: Date
  unsubscribedAt?: Date
}

// Contact Task Association
export interface ContactTask {
  id: string
  contactId: string
  taskId: string
  type: 'follow_up' | 'call' | 'email' | 'demo' | 'proposal' | 'meeting'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate: Date
  completedAt?: Date
}

// Contact Document Association
export interface ContactDocument {
  id: string
  contactId: string
  name: string
  type: 'proposal' | 'contract' | 'quote' | 'presentation' | 'brochure' | 'other'
  url: string
  size: number
  mimeType: string
  uploadedBy: string
  uploadedAt: Date
  lastViewedAt?: Date
  viewCount: number
}

// Contact Search & Filter Models
export interface ContactSearchCriteria {
  query?: string
  status?: ContactStatus[]
  lifecycle?: ContactLifecycle[]
  tags?: string[]
  assignedTo?: string[]
  source?: string[]
  company?: string
  leadScoreMin?: number
  leadScoreMax?: number
  createdAfter?: Date
  createdBefore?: Date
  lastActivityAfter?: Date
  lastActivityBefore?: Date
  customFields?: Record<string, any>
}

export interface ContactListOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  fields?: string[] // Fields to include in response
}

// Contact Import/Export Models
export interface ContactImportMapping {
  sourceField: string
  targetField: string
  transformation?: string
  defaultValue?: any
}

export interface ContactImportResult {
  total: number
  successful: number
  failed: number
  errors: ContactImportError[]
  duplicates: number
  skipped: number
}

export interface ContactImportError {
  row: number
  field: string
  value: any
  error: string
}

// Contact Duplicate Detection
export interface ContactDuplicate {
  contactId: string
  duplicateContactId: string
  matchScore: number
  matchFields: string[]
  suggestedAction: 'merge' | 'keep_separate' | 'review'
}

// Contact Merge Model
export interface ContactMergeRequest {
  primaryContactId: string
  duplicateContactIds: string[]
  fieldResolutions: Record<string, {
    useValue: any
    sourceContactId: string
  }>
  mergeActivities: boolean
  mergeDeals: boolean
  mergeDocuments: boolean
}

// Contact Segmentation
export interface ContactSegment {
  id: string
  name: string
  description?: string
  criteria: ContactSearchCriteria
  isAutoUpdating: boolean
  contactCount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Contact Analytics
export interface ContactAnalytics {
  totalContacts: number
  newContactsToday: number
  newContactsThisWeek: number
  newContactsThisMonth: number
  contactsByStatus: Record<ContactStatus, number>
  contactsByLifecycle: Record<ContactLifecycle, number>
  contactsBySource: Record<string, number>
  averageLeadScore: number
  topPerformingTags: Array<{ tag: string; count: number }>
  conversionRates: {
    leadToProspect: number
    prospectToOpportunity: number
    opportunityToCustomer: number
  }
}

// Contact Search Parameters
export interface ContactSearchParams {
  query?: string
  status?: ContactStatus[]
  lifecycle?: ContactLifecycle[]
  tags?: string[]
  assignedTo?: string[]
  source?: string[]
  company?: string
  leadScoreMin?: number
  leadScoreMax?: number
  createdAfter?: Date
  createdBefore?: Date
  lastActivityAfter?: Date
  lastActivityBefore?: Date
  customFields?: Record<string, any>
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Contact Statistics
export interface ContactStats {
  total: number
  leads: number
  prospects: number
  customers: number
  inactive: number
  byStatus: Record<ContactStatus, number>
  byLifecycle: Record<ContactLifecycle, number>
  bySource: Record<string, number>
  averageLeadScore: number
  conversionRate: number
  newThisMonth: number
}

// Enhanced Contact Dashboard Data
export interface ContactDashboardData {
  // Overview metrics
  total: number
  newToday: number
  newThisWeek: number
  newThisMonth: number
  newThisYear: number
  
  // Status breakdown
  byStatus: Record<ContactStatus, number> & {
    lead: number
    prospect: number
    customer: number
    inactive: number
    lost: number
  }
  
  // Source breakdown
  bySource: Record<string, number>
  topSources: Array<{
    source: string
    count: number
  }>
  
  // Lead scoring
  averageLeadScore: number
  leadScoreDistribution: {
    min: number
    max: number
    average: number
  }
  
  // Engagement metrics
  engagement: {
    withActiveDeals: number
    withPendingTasks: number
    recentActivity: number
    activeLast30Days: number
    activeLast7Days: number
    neverContacted: number
  }
  
  // Conversion metrics
  conversion: {
    leadToProspect: number
    prospectToCustomer: number
    overall: number
  }
  
  // Growth metrics
  growth: {
    weekly: {
      current: number
      previous: number
      growth: number
      growthRate: number
    }
    monthly: {
      current: number
      previous: number
      growth: number
      growthRate: number
    }
  }
  
  // Assignment metrics
  byAssignedUser: Array<{
    userId: string
    count: number
  }>
  
  // Calculated percentages
  percentages: {
    customers: number
    prospects: number
    leads: number
  }
}
