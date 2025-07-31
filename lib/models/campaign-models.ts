// Enhanced Campaign & Marketing Models
export interface CampaignModel {
  id: string
  name: string
  description?: string
  
  // Campaign Configuration
  type: CampaignType
  category: CampaignCategory
  channel: CampaignChannel
  objective: CampaignObjective
  
  // Campaign Content
  subject?: string
  content: string
  template?: CampaignTemplate
  
  // Targeting & Audience
  targetAudience: CampaignAudience
  segmentIds: string[]
  listIds: string[]
  excludeListIds?: string[]
  
  // Scheduling
  status: CampaignStatus
  scheduledAt?: Date
  sentAt?: Date
  completedAt?: Date
  timezone: string
  
  // A/B Testing
  isABTest: boolean
  abTestConfig?: ABTestConfig
  
  // Personalization
  personalizationFields: PersonalizationField[]
  dynamicContent?: DynamicContent[]
  
  // Tracking & Analytics
  trackingEnabled: boolean
  utmParameters?: UTMParameters
  metrics: CampaignMetrics
  
  // Workflow Integration
  workflowId?: string
  triggerConditions?: TriggerCondition[]
  
  // Relations
  organizationId: string
  createdBy: string
  assignedTo?: string
  parentCampaignId?: string
  childCampaigns?: CampaignModel[]
  
  // Compliance & Permissions
  complianceChecks: ComplianceCheck[]
  gdprCompliant: boolean
  canSpamCompliant: boolean
  
  // Custom Fields
  customFields: Record<string, any>
  tags: string[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type CampaignType = 
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'push_notification'
  | 'social_media'
  | 'direct_mail'
  | 'webinar'
  | 'survey'
  | 'drip_sequence'
  | 'trigger_based'
  | 'multi_channel'

export type CampaignCategory = 
  | 'promotional'
  | 'educational'
  | 'newsletter'
  | 'event'
  | 'product_launch'
  | 'nurture'
  | 'retention'
  | 'win_back'
  | 'onboarding'
  | 'survey'
  | 'announcement'
  | 'seasonal'

export type CampaignChannel = 
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'push'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'google_ads'
  | 'direct_mail'
  | 'webinar'
  | 'phone'

export type CampaignObjective = 
  | 'awareness'
  | 'engagement'
  | 'lead_generation'
  | 'conversion'
  | 'retention'
  | 'upsell'
  | 'cross_sell'
  | 'reactivation'
  | 'feedback'
  | 'education'
  | 'event_promotion'

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed'

// Campaign Audience & Targeting
export interface CampaignAudience {
  totalSize: number
  targetCriteria: AudienceCriteria
  exclusionCriteria?: AudienceCriteria
  dynamicSegmentation: boolean
  lastUpdated: Date
}

export interface AudienceCriteria {
  demographics?: DemographicCriteria
  behavioral?: BehavioralCriteria
  geographic?: GeographicCriteria
  psychographic?: PsychographicCriteria
  technographic?: TechnographicCriteria
  customFields?: Record<string, any>
}

export interface DemographicCriteria {
  ageMin?: number
  ageMax?: number
  gender?: string[]
  income?: IncomeRange
  education?: string[]
  occupation?: string[]
  companySize?: string[]
  industry?: string[]
}

export interface BehavioralCriteria {
  websiteActivity?: WebsiteActivity
  emailActivity?: EmailActivity
  purchaseHistory?: PurchaseHistory
  engagementScore?: ScoreRange
  lifecycle?: string[]
  tags?: string[]
}

export interface GeographicCriteria {
  countries?: string[]
  regions?: string[]
  cities?: string[]
  postalCodes?: string[]
  timezone?: string[]
  radius?: RadiusTargeting
}

export interface PsychographicCriteria {
  interests?: string[]
  values?: string[]
  lifestyle?: string[]
  personality?: string[]
}

export interface TechnographicCriteria {
  devices?: string[]
  browsers?: string[]
  operatingSystems?: string[]
  technologies?: string[]
  tools?: string[]
}

export interface IncomeRange {
  min?: number
  max?: number
  currency: string
}

export interface ScoreRange {
  min?: number
  max?: number
}

export interface WebsiteActivity {
  pagesVisited?: string[]
  timeOnSite?: number
  sessionsCount?: number
  lastVisitDate?: Date
  conversionEvents?: string[]
}

export interface EmailActivity {
  lastOpenDate?: Date
  lastClickDate?: Date
  openRate?: number
  clickRate?: number
  unsubscribed?: boolean
}

export interface PurchaseHistory {
  totalSpent?: number
  lastPurchaseDate?: Date
  averageOrderValue?: number
  products?: string[]
  categories?: string[]
}

export interface RadiusTargeting {
  latitude: number
  longitude: number
  radius: number
  unit: 'km' | 'miles'
}

// A/B Testing
export interface ABTestConfig {
  variants: ABTestVariant[]
  trafficSplit: number[] // Percentage for each variant
  metric: ABTestMetric
  duration: number // in hours
  minimumSampleSize: number
  confidenceLevel: number
  autoPromoteWinner: boolean
}

export interface ABTestVariant {
  id: string
  name: string
  subject?: string
  content: string
  percentage: number
}

export type ABTestMetric = 
  | 'open_rate'
  | 'click_rate'
  | 'conversion_rate'
  | 'revenue'
  | 'unsubscribe_rate'
  | 'bounce_rate'

// Personalization
export interface PersonalizationField {
  key: string
  fieldName: string
  fallbackValue?: string
  format?: string
}

export interface DynamicContent {
  id: string
  condition: string
  content: string
  priority: number
}

// UTM Parameters
export interface UTMParameters {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

// Trigger Conditions
export interface TriggerCondition {
  id: string
  type: TriggerType
  field: string
  operator: string
  value: any
  logicOperator?: 'AND' | 'OR'
}

export type TriggerType = 
  | 'field_change'
  | 'date_based'
  | 'activity'
  | 'behavior'
  | 'score_change'
  | 'tag_added'
  | 'list_joined'

// Campaign Metrics
export interface CampaignMetrics {
  sent: number
  delivered: number
  bounced: number
  opened: number
  clicked: number
  replied: number
  forwarded: number
  unsubscribed: number
  spamReports: number
  conversions: number
  revenue: number
  
  // Calculated Rates
  deliveryRate: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  conversionRate: number
  unsubscribeRate: number
  spamRate: number
  bounceRate: number
  
  // Time-based Metrics
  firstOpenTime?: Date
  lastOpenTime?: Date
  averageTimeToOpen?: number
  averageTimeToClick?: number
  
  // Engagement Metrics
  totalEngagementTime: number
  averageEngagementTime: number
  returnVisits: number
  socialShares: number
  
  // Revenue Metrics
  totalRevenue: number
  averageOrderValue: number
  returnOnInvestment: number
  costPerAcquisition: number
  lifetimeValue: number
}

// Campaign Templates
export interface CampaignTemplate {
  id: string
  name: string
  description?: string
  type: CampaignType
  category: string
  subject?: string
  content: string
  thumbnail?: string
  variables: TemplateVariable[]
  isPublic: boolean
  usageCount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TemplateVariable {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'url'
  defaultValue?: any
  required: boolean
  description?: string
}

// Compliance
export interface ComplianceCheck {
  type: ComplianceType
  status: 'passed' | 'failed' | 'warning'
  message?: string
  checkedAt: Date
}

export type ComplianceType = 
  | 'gdpr'
  | 'can_spam'
  | 'casl'
  | 'double_opt_in'
  | 'unsubscribe_link'
  | 'sender_identity'
  | 'content_policy'

// Campaign Recipients
export interface CampaignRecipient {
  id: string
  campaignId: string
  contactId: string
  email: string
  status: RecipientStatus
  personalizedSubject?: string
  personalizedContent?: string
  
  // Delivery Tracking
  sentAt?: Date
  deliveredAt?: Date
  bouncedAt?: Date
  bounceReason?: string
  
  // Engagement Tracking
  firstOpenedAt?: Date
  lastOpenedAt?: Date
  openCount: number
  firstClickedAt?: Date
  lastClickedAt?: Date
  clickCount: number
  clickedLinks: ClickedLink[]
  
  // Actions
  unsubscribedAt?: Date
  spamReportedAt?: Date
  repliedAt?: Date
  forwardedAt?: Date
  
  // Conversion Tracking
  convertedAt?: Date
  conversionValue?: number
  conversionEvent?: string
}

export type RecipientStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'opened'
  | 'clicked'
  | 'replied'
  | 'unsubscribed'
  | 'spam_report'
  | 'converted'
  | 'failed'

export interface ClickedLink {
  url: string
  clickedAt: Date
  userAgent?: string
  ipAddress?: string
}

// Campaign Automation
export interface CampaignAutomation {
  id: string
  name: string
  description?: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: CampaignAction[]
  isActive: boolean
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface AutomationTrigger {
  type: 'contact_created' | 'tag_added' | 'field_updated' | 'date_based' | 'activity' | 'score_change'
  config: Record<string, any>
  delay?: AutomationDelay
}

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
}

export interface CampaignAction {
  type: 'send_campaign' | 'add_to_list' | 'remove_from_list' | 'add_tag' | 'remove_tag' | 'update_field' | 'create_task'
  config: Record<string, any>
  delay?: AutomationDelay
}

export interface AutomationDelay {
  amount: number
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
}

// Campaign Lists & Segments
export interface CampaignList {
  id: string
  name: string
  description?: string
  type: 'static' | 'dynamic'
  criteria?: AudienceCriteria
  contactCount: number
  lastUpdated: Date
  isPublic: boolean
  tags: string[]
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CampaignSegment {
  id: string
  name: string
  description?: string
  criteria: AudienceCriteria
  contactCount: number
  isAutoUpdating: boolean
  lastCalculated: Date
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Campaign Analytics & Reporting
export interface CampaignReport {
  campaignId: string
  campaignName: string
  period: ReportPeriod
  metrics: CampaignMetrics
  demographics: DemographicBreakdown
  geographic: GeographicBreakdown
  deviceBreakdown: DeviceBreakdown
  timeAnalysis: TimeAnalysis
  topLinks: LinkPerformance[]
  comparisons: CampaignComparison[]
  recommendations: string[]
  generatedAt: Date
}

export interface ReportPeriod {
  startDate: Date
  endDate: Date
  timezone: string
}

export interface DemographicBreakdown {
  age: Record<string, number>
  gender: Record<string, number>
  industry: Record<string, number>
  company_size: Record<string, number>
}

export interface GeographicBreakdown {
  countries: Record<string, number>
  regions: Record<string, number>
  cities: Record<string, number>
}

export interface DeviceBreakdown {
  desktop: number
  mobile: number
  tablet: number
  email_clients: Record<string, number>
  browsers: Record<string, number>
}

export interface TimeAnalysis {
  opensByHour: Record<string, number>
  clicksByHour: Record<string, number>
  opensByDay: Record<string, number>
  clicksByDay: Record<string, number>
  bestTimeToSend: {
    hour: number
    day: string
  }
}

export interface LinkPerformance {
  url: string
  clickCount: number
  uniqueClicks: number
  clickRate: number
}

export interface CampaignComparison {
  campaignId: string
  campaignName: string
  metric: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'no_change'
}

// Email-specific Models
export interface EmailCampaign extends CampaignModel {
  fromName: string
  fromEmail: string
  replyToEmail?: string
  preheaderText?: string
  htmlContent: string
  textContent?: string
  attachments?: EmailAttachment[]
  emailSettings: EmailSettings
}

export interface EmailAttachment {
  name: string
  url: string
  size: number
  mimeType: string
}

export interface EmailSettings {
  trackOpens: boolean
  trackClicks: boolean
  trackUnsubscribes: boolean
  enableFooter: boolean
  footerText?: string
  unsubscribeText?: string
}

// SMS-specific Models
export interface SMSCampaign extends CampaignModel {
  message: string
  sender: string
  encoding: 'GSM7' | 'UCS2'
  messageLength: number
  messageCount: number
  smsSettings: SMSSettings
}

export interface SMSSettings {
  deliveryReports: boolean
  validityPeriod?: number
  flashMessage: boolean
  concatenateMessage: boolean
}

// WhatsApp-specific Models
export interface WhatsAppCampaign extends CampaignModel {
  templateId?: string
  templateName?: string
  templateLanguage: string
  templateParameters?: TemplateParameter[]
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'document' | 'audio'
  whatsappSettings: WhatsAppSettings
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document' | 'video'
  value: string
}

export interface WhatsAppSettings {
  businessAccountId: string
  phoneNumberId: string
  accessToken: string
  webhookUrl?: string
}

// Campaign Search Parameters
export interface CampaignSearchParams {
  query?: string
  type?: CampaignType[]
  status?: CampaignStatus[]
  category?: CampaignCategory[]
  channel?: CampaignChannel[]
  createdBy?: string[]
  scheduledAfter?: Date
  scheduledBefore?: Date
  sentAfter?: Date
  sentBefore?: Date
  tags?: string[]
  customFields?: Record<string, any>
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Campaign Statistics
export interface CampaignStats {
  total: number
  sent: number
  scheduled: number
  draft: number
  byType: Record<CampaignType, number>
  byStatus: Record<CampaignStatus, number>
  byChannel: Record<CampaignChannel, number>
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  averageOpenRate: number
  averageClickRate: number
  totalRevenue: number
}

// Campaign Analytics (separate from metrics for broader analysis)
export interface CampaignAnalytics {
  performance: CampaignPerformanceAnalytics
  audience: CampaignAudienceAnalytics
  engagement: CampaignEngagementAnalytics
  conversion: CampaignConversionAnalytics
  trends: CampaignTrendAnalytics
  benchmarks: CampaignBenchmarkAnalytics
}

export interface CampaignPerformanceAnalytics {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  averageOpenRate: number
  averageClickRate: number
  averageConversionRate: number
  totalRevenue: number
  averageROI: number
  bestPerformingCampaign: {
    id: string
    name: string
    metric: string
    value: number
  }
}

export interface CampaignAudienceAnalytics {
  totalAudience: number
  activeSubscribers: number
  unsubscribed: number
  bounced: number
  demographics: DemographicBreakdown
  geographic: GeographicBreakdown
  segmentPerformance: Record<string, number>
}

export interface CampaignEngagementAnalytics {
  emailOpens: number
  linkClicks: number
  socialShares: number
  forwardRate: number
  timeToOpen: number
  timeToClick: number
  engagementByTime: TimeAnalysis
  topPerformingContent: Array<{
    content: string
    metric: string
    value: number
  }>
}

export interface CampaignConversionAnalytics {
  totalConversions: number
  conversionRate: number
  conversionValue: number
  averageOrderValue: number
  topConvertingCampaigns: Array<{
    id: string
    name: string
    conversions: number
    value: number
  }>
  conversionFunnel: Array<{
    stage: string
    count: number
    rate: number
  }>
}

export interface CampaignTrendAnalytics {
  openRateTrend: TrendData[]
  clickRateTrend: TrendData[]
  conversionTrend: TrendData[]
  revenueTrend: TrendData[]
  audienceGrowth: TrendData[]
}

export interface CampaignBenchmarkAnalytics {
  industryBenchmarks: Record<string, number>
  competitorComparison: Record<string, number>
  historicalComparison: Record<string, number>
  performanceGrades: Record<string, 'A' | 'B' | 'C' | 'D' | 'F'>
}

export interface TrendData {
  date: Date
  value: number
  change: number
  changePercent: number
}
