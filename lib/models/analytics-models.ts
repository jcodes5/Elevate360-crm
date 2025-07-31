// Enhanced Analytics & Reporting Models
export interface AnalyticsModel {
  id: string
  name: string
  description?: string
  type: AnalyticsType
  category: AnalyticsCategory
  
  // Data Source & Configuration
  dataSource: DataSource
  metrics: AnalyticsMetric[]
  dimensions: AnalyticsDimension[]
  filters: AnalyticsFilter[]
  
  // Time Configuration
  dateRange: DateRange
  granularity: TimeGranularity
  timezone: string
  
  // Visualization
  visualization: VisualizationConfig
  dashboard?: DashboardConfig
  
  // Access & Permissions
  isPublic: boolean
  accessLevel: AccessLevel
  allowedUsers: string[]
  allowedRoles: string[]
  
  // Automation & Scheduling
  isAutoRefresh: boolean
  refreshInterval?: number // in minutes
  schedule?: ReportSchedule
  
  // Export & Sharing
  exportFormats: ExportFormat[]
  shareSettings: ShareSettings
  
  // Custom Configuration
  customFields: Record<string, any>
  tags: string[]
  
  // Relations
  organizationId: string
  createdBy: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastCalculated?: Date
}

export type AnalyticsType = 
  | 'dashboard'
  | 'report'
  | 'chart'
  | 'table'
  | 'kpi'
  | 'forecast'
  | 'trend'
  | 'comparison'
  | 'cohort'
  | 'funnel'
  | 'heatmap'

export type AnalyticsCategory = 
  | 'sales'
  | 'marketing'
  | 'customer'
  | 'financial'
  | 'operational'
  | 'performance'
  | 'activity'
  | 'pipeline'
  | 'campaign'
  | 'user'
  | 'custom'

export type AccessLevel = 
  | 'private'
  | 'team'
  | 'organization'
  | 'public'

export type TimeGranularity = 
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'

// Data Source Configuration
export interface DataSource {
  type: DataSourceType
  tables: string[]
  joins?: DataJoin[]
  customQuery?: string
  realTime: boolean
  cacheSettings?: CacheSettings
}

export type DataSourceType = 
  | 'contacts'
  | 'deals'
  | 'campaigns'
  | 'tasks'
  | 'activities'
  | 'appointments'
  | 'users'
  | 'organizations'
  | 'custom'
  | 'api'
  | 'webhook'

export interface DataJoin {
  table: string
  type: 'inner' | 'left' | 'right' | 'full'
  condition: string
}

export interface CacheSettings {
  enabled: boolean
  ttl: number // Time to live in minutes
  strategy: 'refresh' | 'invalidate' | 'background'
}

// Analytics Metrics
export interface AnalyticsMetric {
  id: string
  name: string
  field: string
  aggregation: AggregationType
  format: MetricFormat
  calculation?: CustomCalculation
  benchmark?: MetricBenchmark
  target?: MetricTarget
  threshold?: MetricThreshold
  isVisible: boolean
  order: number
}

export type AggregationType = 
  | 'sum'
  | 'count'
  | 'avg'
  | 'min'
  | 'max'
  | 'median'
  | 'percentile'
  | 'distinct_count'
  | 'ratio'
  | 'growth_rate'
  | 'conversion_rate'

export interface MetricFormat {
  type: 'number' | 'currency' | 'percentage' | 'duration' | 'date'
  decimals?: number
  prefix?: string
  suffix?: string
  currency?: string
}

export interface CustomCalculation {
  formula: string
  variables: CalculationVariable[]
}

export interface CalculationVariable {
  name: string
  field: string
  aggregation: AggregationType
}

export interface MetricBenchmark {
  value: number
  period: 'previous_period' | 'same_period_last_year' | 'industry_average' | 'custom'
  source?: string
}

export interface MetricTarget {
  value: number
  type: 'absolute' | 'percentage_increase' | 'percentage_decrease'
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
}

export interface MetricThreshold {
  low: number
  medium: number
  high: number
  colors: {
    low: string
    medium: string
    high: string
  }
}

// Analytics Dimensions
export interface AnalyticsDimension {
  id: string
  name: string
  field: string
  type: DimensionType
  grouping?: DimensionGrouping
  sorting?: DimensionSorting
  isVisible: boolean
  order: number
}

export type DimensionType = 
  | 'string'
  | 'number'
  | 'date'
  | 'boolean'
  | 'category'
  | 'geography'
  | 'user'
  | 'custom'

export interface DimensionGrouping {
  enabled: boolean
  method: 'range' | 'bucket' | 'custom'
  buckets?: DimensionBucket[]
  ranges?: DimensionRange[]
}

export interface DimensionBucket {
  label: string
  values: any[]
}

export interface DimensionRange {
  label: string
  min: number
  max: number
}

export interface DimensionSorting {
  field: string
  direction: 'asc' | 'desc'
  type: 'alphabetical' | 'numerical' | 'frequency'
}

// Analytics Filters
export interface AnalyticsFilter {
  id: string
  field: string
  operator: FilterOperator
  value: any
  logicOperator?: 'AND' | 'OR'
  isRequired: boolean
  isUserEditable: boolean
}

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'between'
  | 'is_null'
  | 'is_not_null'

// Date Range Configuration
export interface DateRange {
  type: DateRangeType
  startDate?: Date
  endDate?: Date
  relativePeriod?: RelativePeriod
  compareWith?: ComparisonPeriod
}

export type DateRangeType = 
  | 'custom'
  | 'relative'
  | 'preset'

export interface RelativePeriod {
  amount: number
  unit: 'days' | 'weeks' | 'months' | 'quarters' | 'years'
  anchor: 'current' | 'complete'
}

export interface ComparisonPeriod {
  type: 'previous_period' | 'same_period_last_year' | 'custom'
  startDate?: Date
  endDate?: Date
}

// Visualization Configuration
export interface VisualizationConfig {
  type: VisualizationType
  layout: LayoutConfig
  styling: StylingConfig
  interactivity: InteractivityConfig
  annotations?: AnnotationConfig[]
}

export type VisualizationType = 
  | 'line_chart'
  | 'bar_chart'
  | 'column_chart'
  | 'pie_chart'
  | 'donut_chart'
  | 'area_chart'
  | 'scatter_plot'
  | 'heatmap'
  | 'table'
  | 'kpi_card'
  | 'gauge'
  | 'funnel'
  | 'waterfall'
  | 'treemap'
  | 'sankey'

export interface LayoutConfig {
  width?: number
  height?: number
  margin: Margin
  showLegend: boolean
  legendPosition: 'top' | 'bottom' | 'left' | 'right'
  showTitle: boolean
  title?: string
  subtitle?: string
}

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface StylingConfig {
  colorScheme: string[]
  fontFamily: string
  fontSize: number
  backgroundColor: string
  gridLines: boolean
  borderRadius: number
  opacity: number
}

export interface InteractivityConfig {
  zoom: boolean
  pan: boolean
  hover: boolean
  click: boolean
  crossfilter: boolean
  drilldown: boolean
  export: boolean
}

export interface AnnotationConfig {
  type: 'line' | 'band' | 'point' | 'text'
  value: any
  label: string
  color: string
  style?: string
}

// Dashboard Configuration
export interface DashboardConfig {
  layout: 'grid' | 'free' | 'tabs'
  columns: number
  widgets: DashboardWidget[]
  filters: GlobalFilter[]
  refreshRate?: number
  theme: DashboardTheme
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'table' | 'kpi' | 'text' | 'image'
  position: WidgetPosition
  size: WidgetSize
  config: WidgetConfig
  dataSource?: string
}

export interface WidgetPosition {
  x: number
  y: number
  z?: number
}

export interface WidgetSize {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export interface WidgetConfig {
  title?: string
  showHeader: boolean
  showBorder: boolean
  backgroundColor?: string
  refreshRate?: number
  customSettings: Record<string, any>
}

export interface GlobalFilter {
  id: string
  field: string
  type: 'dropdown' | 'multiselect' | 'date_picker' | 'range_slider'
  defaultValue?: any
  affectedWidgets: string[]
}

export interface DashboardTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    border: string
  }
  fonts: {
    heading: string
    body: string
  }
}

// Report Scheduling
export interface ReportSchedule {
  frequency: ScheduleFrequency
  time: string // HH:mm format
  dayOfWeek?: number // 0-6, 0 = Sunday
  dayOfMonth?: number // 1-31
  timezone: string
  isActive: boolean
  recipients: ScheduleRecipient[]
  format: ExportFormat
  deliveryMethod: DeliveryMethod
}

export type ScheduleFrequency = 
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'

export interface ScheduleRecipient {
  type: 'user' | 'email' | 'webhook'
  identifier: string
  preferences?: RecipientPreferences
}

export interface RecipientPreferences {
  format?: ExportFormat
  includeCharts: boolean
  includeData: boolean
  compression?: 'none' | 'zip' | 'gzip'
}

export type DeliveryMethod = 
  | 'email'
  | 'webhook'
  | 'ftp'
  | 'api'
  | 'notification'

// Export & Sharing
export type ExportFormat = 
  | 'pdf'
  | 'excel'
  | 'csv'
  | 'json'
  | 'png'
  | 'jpeg'
  | 'svg'
  | 'powerpoint'

export interface ShareSettings {
  isPublic: boolean
  publicUrl?: string
  password?: string
  expiresAt?: Date
  allowDownload: boolean
  allowComments: boolean
  watermark?: string
}

// Analytics Results
export interface AnalyticsResult {
  id: string
  analyticsId: string
  data: AnalyticsData
  metadata: ResultMetadata
  generatedAt: Date
  expiresAt?: Date
}

export interface AnalyticsData {
  series: DataSeries[]
  summary: DataSummary
  totals: Record<string, number>
  dimensions: DimensionData[]
  timeRange: ProcessedDateRange
}

export interface DataSeries {
  name: string
  data: DataPoint[]
  color?: string
  type?: string
  yAxis?: number
}

export interface DataPoint {
  x: any // Dimension value
  y: number // Metric value
  label?: string
  metadata?: Record<string, any>
}

export interface DataSummary {
  totalRecords: number
  filteredRecords: number
  aggregatedMetrics: Record<string, number>
  trends: TrendData[]
  insights: AnalyticsInsight[]
}

export interface TrendData {
  metric: string
  direction: 'up' | 'down' | 'stable'
  change: number
  changePercent: number
  significance: 'high' | 'medium' | 'low'
}

export interface AnalyticsInsight {
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'opportunity'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  recommendation?: string
  metadata?: Record<string, any>
}

export interface DimensionData {
  name: string
  values: DimensionValue[]
  total: number
}

export interface DimensionValue {
  value: any
  label: string
  count: number
  percentage: number
  metrics: Record<string, number>
}

export interface ProcessedDateRange {
  startDate: Date
  endDate: Date
  granularity: TimeGranularity
  periods: TimePeriod[]
  comparison?: ProcessedDateRange
}

export interface TimePeriod {
  startDate: Date
  endDate: Date
  label: string
  value?: number
}

export interface ResultMetadata {
  executionTime: number
  dataFreshness: Date
  cacheHit: boolean
  rowCount: number
  queryComplexity: 'low' | 'medium' | 'high'
  warnings?: string[]
  errors?: string[]
}

// KPI Models
export interface KPIModel {
  id: string
  name: string
  description?: string
  category: string
  metric: AnalyticsMetric
  target?: MetricTarget
  benchmark?: MetricBenchmark
  threshold?: MetricThreshold
  
  // KPI Configuration
  calculation: KPICalculation
  frequency: CalculationFrequency
  unit: string
  format: MetricFormat
  
  // Alerts & Notifications
  alerts: KPIAlert[]
  notifications: KPINotification[]
  
  // Historical Data
  history: KPIHistory[]
  trend: TrendData
  forecast?: KPIForecast
  
  // Relations
  organizationId: string
  ownerId: string
  watchers: string[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastCalculated?: Date
}

export interface KPICalculation {
  type: 'simple' | 'ratio' | 'weighted' | 'custom'
  numerator: AnalyticsMetric
  denominator?: AnalyticsMetric
  weights?: KPIWeight[]
  formula?: string
}

export interface KPIWeight {
  dimension: string
  weight: number
}

export type CalculationFrequency = 
  | 'real_time'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'

export interface KPIAlert {
  id: string
  condition: AlertCondition
  recipients: string[]
  isActive: boolean
  lastTriggered?: Date
  triggerCount: number
}

export interface AlertCondition {
  metric: string
  operator: FilterOperator
  value: number
  threshold: 'target' | 'benchmark' | 'custom'
}

export interface KPINotification {
  id: string
  type: 'achievement' | 'decline' | 'milestone' | 'anomaly'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
  isRead: boolean
  sentAt: Date
}

export interface KPIHistory {
  date: Date
  value: number
  target?: number
  benchmark?: number
  change?: number
  changePercent?: number
}

export interface KPIForecast {
  periods: KPIForecastPeriod[]
  model: 'linear' | 'exponential' | 'seasonal' | 'arima'
  confidence: number
  accuracy?: number
  generatedAt: Date
}

export interface KPIForecastPeriod {
  date: Date
  predicted: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  factors?: Record<string, number>
}

// Cohort Analysis
export interface CohortAnalysis {
  id: string
  name: string
  type: CohortType
  metric: string
  periodType: 'day' | 'week' | 'month'
  cohorts: CohortData[]
  dateRange: DateRange
  organizationId: string
  createdAt: Date
}

export type CohortType = 
  | 'acquisition'
  | 'retention'
  | 'revenue'
  | 'activity'

export interface CohortData {
  cohortDate: Date
  cohortSize: number
  periods: CohortPeriod[]
}

export interface CohortPeriod {
  period: number
  value: number
  percentage: number
  retained: number
}

// Funnel Analysis
export interface FunnelAnalysis {
  id: string
  name: string
  steps: FunnelStep[]
  conversionRates: FunnelConversion[]
  dropOffPoints: DropOffPoint[]
  dateRange: DateRange
  segmentation?: FunnelSegmentation
  organizationId: string
  createdAt: Date
}

export interface FunnelStep {
  id: string
  name: string
  condition: AnalyticsFilter[]
  order: number
  count: number
  percentage: number
}

export interface FunnelConversion {
  fromStep: string
  toStep: string
  rate: number
  dropOffRate: number
  volume: number
}

export interface DropOffPoint {
  step: string
  dropOffCount: number
  dropOffRate: number
  commonReasons?: string[]
}

export interface FunnelSegmentation {
  dimension: string
  segments: FunnelSegment[]
}

export interface FunnelSegment {
  value: any
  label: string
  steps: FunnelStep[]
  conversionRates: FunnelConversion[]
}

// Dashboard Model
export interface DashboardModel {
  id: string
  name: string
  description?: string
  layout: DashboardConfig
  widgets: DashboardWidget[]
  filters: GlobalFilter[]
  permissions: DashboardPermissions
  settings: DashboardSettings
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastViewedAt?: Date
  viewCount: number
  isPublic: boolean
  shareUrl?: string
}

export interface DashboardPermissions {
  canView: string[]
  canEdit: string[]
  canShare: string[]
  canDelete: string[]
  defaultAccess: 'view' | 'edit' | 'none'
}

export interface DashboardSettings {
  autoRefresh: boolean
  refreshInterval: number
  showFilters: boolean
  showHeader: boolean
  showFooter: boolean
  fullScreen: boolean
  theme: string
  customCss?: string
}

// Report Model
export interface ReportModel {
  id: string
  name: string
  description?: string
  type: ReportType
  category: string
  dataSource: DataSource
  parameters: ReportParameter[]
  columns: ReportColumn[]
  filters: AnalyticsFilter[]
  sorting: ReportSorting[]
  grouping: ReportGrouping[]
  formatting: ReportFormatting
  schedule?: ReportSchedule
  distribution: ReportDistribution
  permissions: ReportPermissions
  organizationId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastRunAt?: Date
  runCount: number
}

export type ReportType =
  | 'tabular'
  | 'summary'
  | 'analytical'
  | 'dashboard'
  | 'chart'
  | 'crosstab'
  | 'matrix'
  | 'subreport'

export interface ReportParameter {
  id: string
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'list'
  defaultValue?: any
  required: boolean
  validation?: ParameterValidation
  options?: ParameterOption[]
  dependsOn?: string[]
}

export interface ParameterValidation {
  min?: number
  max?: number
  pattern?: string
  message?: string
}

export interface ParameterOption {
  value: any
  label: string
  selected?: boolean
}

export interface ReportColumn {
  id: string
  field: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency'
  width?: number
  alignment: 'left' | 'center' | 'right'
  format?: ColumnFormat
  aggregation?: AggregationType
  isVisible: boolean
  order: number
  groupable: boolean
  sortable: boolean
  filterable: boolean
}

export interface ColumnFormat {
  type: 'number' | 'currency' | 'percentage' | 'date' | 'text'
  decimals?: number
  prefix?: string
  suffix?: string
  dateFormat?: string
  currencyCode?: string
}

export interface ReportSorting {
  column: string
  direction: 'asc' | 'desc'
  priority: number
}

export interface ReportGrouping {
  column: string
  level: number
  showTotals: boolean
  pageBreak: boolean
  collapsed: boolean
}

export interface ReportFormatting {
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom'
  orientation: 'portrait' | 'landscape'
  margins: Margin
  header?: ReportSection
  footer?: ReportSection
  watermark?: string
  styles: ReportStyle[]
}

export interface ReportSection {
  height: number
  content: string
  showOnFirstPage: boolean
  showOnLastPage: boolean
}

export interface ReportStyle {
  selector: string
  properties: Record<string, string>
}

export interface ReportDistribution {
  email: {
    enabled: boolean
    recipients: string[]
    subject?: string
    body?: string
    attachmentFormat: ExportFormat[]
  }
  webhook: {
    enabled: boolean
    url?: string
    method: 'POST' | 'PUT'
    headers?: Record<string, string>
    authentication?: WebhookAuth
  }
  ftp: {
    enabled: boolean
    host?: string
    username?: string
    password?: string
    path?: string
    format: ExportFormat
  }
}

export interface WebhookAuth {
  type: 'none' | 'basic' | 'bearer' | 'api_key'
  username?: string
  password?: string
  token?: string
  apiKey?: string
  headerName?: string
}

export interface ReportPermissions {
  canView: string[]
  canEdit: string[]
  canRun: string[]
  canSchedule: string[]
  canDistribute: string[]
  defaultAccess: 'view' | 'run' | 'none'
}
