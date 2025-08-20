"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { Slider } from "@/components/ui/slider"
import { 
  Filter, 
  Plus, 
  X, 
  Save, 
  Users, 
  Target, 
  Calendar,
  Tag,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Star,
  TrendingUp,
  Search,
  RefreshCw
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import { CampaignModel } from "@/lib/models"

interface FilterCondition {
  id: string
  field: string
  operator: string
  value: any
  logicalOperator?: 'AND' | 'OR'
}

interface CampaignSegment {
  id: string
  name: string
  description: string
  conditions: FilterCondition[]
  count: number
  isActive: boolean
  isDynamic: boolean
  color: string
  createdAt: Date
  updatedAt: Date
}

interface CampaignAdvancedFiltersProps {
  onFiltersChange: (filters: FilterCondition[]) => void
  campaigns: CampaignModel[]
}

// Available fields for filtering
const filterFields = [
  { value: 'name', label: 'Campaign Name', type: 'text' },
  { value: 'type', label: 'Type', type: 'select', options: ['email', 'sms', 'whatsapp', 'drip_sequence'] },
  { value: 'channel', label: 'Channel', type: 'select', options: ['email', 'sms', 'whatsapp', 'push', 'facebook', 'instagram', 'twitter', 'linkedin'] },
  { value: 'status', label: 'Status', type: 'select', options: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'completed', 'cancelled', 'failed'] },
  { value: 'category', label: 'Category', type: 'select', options: ['promotional', 'educational', 'newsletter', 'event', 'product_launch', 'nurture', 'retention', 'win_back', 'onboarding', 'survey', 'announcement', 'seasonal'] },
  { value: 'objective', label: 'Objective', type: 'select', options: ['awareness', 'engagement', 'lead_generation', 'conversion', 'retention', 'upsell', 'cross_sell', 'reactivation', 'feedback', 'education', 'event_promotion'] },
  { value: 'tags', label: 'Tags', type: 'multiselect' },
  { value: 'openRate', label: 'Open Rate', type: 'number' },
  { value: 'clickRate', label: 'Click Rate', type: 'number' },
  { value: 'conversionRate', label: 'Conversion Rate', type: 'number' },
  { value: 'revenue', label: 'Revenue', type: 'number' },
  { value: 'createdAt', label: 'Created Date', type: 'date' },
  { value: 'scheduledAt', label: 'Scheduled Date', type: 'date' },
  { value: 'sentAt', label: 'Sent Date', type: 'date' },
  { value: 'audienceSize', label: 'Audience Size', type: 'number' },
]

// Operators for different field types
const operators = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equal', label: 'Greater Than or Equal' },
    { value: 'less_equal', label: 'Less Than or Equal' },
    { value: 'between', label: 'Between' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'in', label: 'Is One Of' },
    { value: 'not_in', label: 'Is Not One Of' },
  ],
  multiselect: [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'contains_all', label: 'Contains All' },
    { value: 'contains_any', label: 'Contains Any' },
  ],
  date: [
    { value: 'equals', label: 'On Date' },
    { value: 'not_equals', label: 'Not On Date' },
    { value: 'after', label: 'After' },
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'last_n_days', label: 'Last N Days' },
    { value: 'next_n_days', label: 'Next N Days' },
  ]
}

// Pre-defined segments
const defaultSegments: CampaignSegment[] = [
  {
    id: 'high-performing',
    name: 'High Performing Campaigns',
    description: 'Campaigns with open rate > 50% and click rate > 10%',
    conditions: [
      { id: '1', field: 'openRate', operator: 'greater_than', value: 50 },
      { id: '2', field: 'clickRate', operator: 'greater_than', value: 10, logicalOperator: 'AND' }
    ],
    count: 12,
    isActive: true,
    isDynamic: true,
    color: '#10B981',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'recently-sent',
    name: 'Recently Sent',
    description: 'Campaigns sent in the last 30 days',
    conditions: [
      { id: '1', field: 'sentAt', operator: 'last_n_days', value: 30 }
    ],
    count: 28,
    isActive: true,
    isDynamic: true,
    color: '#3B82F6',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'email-campaigns',
    name: 'Email Campaigns',
    description: 'All email marketing campaigns',
    conditions: [
      { id: '1', field: 'type', operator: 'equals', value: 'email' }
    ],
    count: 45,
    isActive: true,
    isDynamic: true,
    color: '#8B5CF6',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'conversion-focused',
    name: 'Conversion Focused',
    description: 'Campaigns with conversion rate > 5%',
    conditions: [
      { id: '1', field: 'conversionRate', operator: 'greater_than', value: 5 }
    ],
    count: 18,
    isActive: true,
    isDynamic: true,
    color: '#F59E0B',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'seasonal-campaigns',
    name: 'Seasonal Campaigns',
    description: 'Campaigns tagged as seasonal or holiday',
    conditions: [
      { id: '1', field: 'tags', operator: 'contains_any', value: ['seasonal', 'holiday', 'promo'] }
    ],
    count: 9,
    isActive: true,
    isDynamic: true,
    color: '#EF4444',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

function FilterConditionRow({ 
  condition, 
  index, 
  onUpdate, 
  onRemove, 
  showLogicalOperator = true 
}: {
  condition: FilterCondition
  index: number
  onUpdate: (id: string, updates: Partial<FilterCondition>) => void
  onRemove: (id: string) => void
  showLogicalOperator?: boolean
}) {
  const field = filterFields.find(f => f.value === condition.field)
  const availableOperators = operators[field?.type as keyof typeof operators] || operators.text

  const renderValueInput = () => {
    const fieldType = field?.type || 'text'
    
    switch (fieldType) {
      case 'select':
        return (
          <Select 
            value={condition.value} 
            onValueChange={(value) => onUpdate(condition.id, { value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {field?.options?.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={condition.value || ''}
            onChange={(e) => onUpdate(condition.id, { value: Number(e.target.value) })}
            placeholder="Enter number"
          />
        )
      
      case 'date':
        if (condition.operator === 'between') {
          return (
            <DatePickerWithRange
              date={condition.value}
              onDateChange={(value) => onUpdate(condition.id, { value })}
            />
          )
        } else if (condition.operator === 'last_n_days' || condition.operator === 'next_n_days') {
          return (
            <Input
              type="number"
              value={condition.value || ''}
              onChange={(e) => onUpdate(condition.id, { value: Number(e.target.value) })}
              placeholder="Number of days"
            />
          )
        } else {
          return (
            <Input
              type="date"
              value={condition.value || ''}
              onChange={(e) => onUpdate(condition.id, { value: e.target.value })}
            />
          )
        }
      
      case 'multiselect':
        return (
          <Input
            value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value || ''}
            onChange={(e) => onUpdate(condition.id, { value: e.target.value.split(',').map(v => v.trim()) })}
            placeholder="Enter tags separated by commas"
          />
        )
      
      default:
        return (
          <Input
            value={condition.value || ''}
            onChange={(e) => onUpdate(condition.id, { value: e.target.value })}
            placeholder="Enter value"
          />
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-2 p-3 border rounded-lg bg-background"
    >
      {showLogicalOperator && index > 0 && (
        <Select
          value={condition.logicalOperator || 'AND'}
          onValueChange={(value) => onUpdate(condition.id, { logicalOperator: value as 'AND' | 'OR' })}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>
      )}
      
      <Select
        value={condition.field}
        onValueChange={(value) => onUpdate(condition.id, { field: value })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {filterFields.map((field) => (
            <SelectItem key={field.value} value={field.value}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={condition.operator}
        onValueChange={(value) => onUpdate(condition.id, { operator: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          {availableOperators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1">
        {renderValueInput()}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(condition.id)}
        className="text-red-600 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}

function SegmentCard({ 
  segment, 
  onSelect, 
  onEdit, 
  onDelete 
}: { 
  segment: CampaignSegment
  onSelect: (segment: CampaignSegment) => void
  onEdit: (segment: CampaignSegment) => void
  onDelete: (id: string) => void
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4"
            style={{ borderLeftColor: segment.color }}
            onClick={() => onSelect(segment)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <div>
                <CardTitle className="text-base">{segment.name}</CardTitle>
                <CardDescription className="text-sm">
                  {segment.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {segment.isDynamic && (
                <Badge variant="secondary" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Dynamic
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {segment.count} campaigns
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  )
}

export function CampaignAdvancedFilters({ onFiltersChange, campaigns }: CampaignAdvancedFiltersProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([])
  const [segments, setSegments] = useState<CampaignSegment[]>(defaultSegments)
  const [activeTab, setActiveTab] = useState("filters")
  const [segmentName, setSegmentName] = useState("")
  const [segmentDescription, setSegmentDescription] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [quickFilters, setQuickFilters] = useState({
    performanceRange: [0, 100],
    recentActivity: false,
    highRevenue: false,
    emailEngaged: false
  })

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: `condition_${Date.now()}`,
      field: 'name',
      operator: 'contains',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    }
    setConditions([...conditions, newCondition])
  }

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ))
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id))
  }

  const clearAllConditions = () => {
    setConditions([])
    setQuickFilters({
      performanceRange: [0, 100],
      recentActivity: false,
      highRevenue: false,
      emailEngaged: false
    })
  }

  const saveAsSegment = () => {
    if (!segmentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a segment name",
        variant: "destructive"
      })
      return
    }

    const newSegment: CampaignSegment = {
      id: `segment_${Date.now()}`,
      name: segmentName,
      description: segmentDescription,
      conditions: [...conditions],
      count: 0, // Would be calculated based on actual data
      isActive: true,
      isDynamic: true,
      color: '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSegments([...segments, newSegment])
    setSegmentName("")
    setSegmentDescription("")
    setShowSaveDialog(false)

    toast({
      title: "Success",
      description: "Segment saved successfully",
    })
  }

  const applyQuickFilters = () => {
    const quickConditions: FilterCondition[] = []

    // Performance range
    if (quickFilters.performanceRange[0] > 0 || quickFilters.performanceRange[1] < 100) {
      quickConditions.push({
        id: 'quick_performance',
        field: 'openRate',
        operator: 'between',
        value: quickFilters.performanceRange,
        logicalOperator: quickConditions.length > 0 ? 'AND' : undefined
      })
    }

    // Recent activity
    if (quickFilters.recentActivity) {
      quickConditions.push({
        id: 'quick_recent_activity',
        field: 'sentAt',
        operator: 'last_n_days',
        value: 30,
        logicalOperator: quickConditions.length > 0 ? 'AND' : undefined
      })
    }

    // High revenue
    if (quickFilters.highRevenue) {
      quickConditions.push({
        id: 'quick_high_revenue',
        field: 'revenue',
        operator: 'greater_than',
        value: 10000,
        logicalOperator: quickConditions.length > 0 ? 'AND' : undefined
      })
    }

    // Email engaged
    if (quickFilters.emailEngaged) {
      quickConditions.push({
        id: 'quick_email_engaged',
        field: 'type',
        operator: 'equals',
        value: 'email',
        logicalOperator: quickConditions.length > 0 ? 'AND' : undefined
      })
    }

    setConditions([...conditions, ...quickConditions])
  }

  useEffect(() => {
    onFiltersChange(conditions)
  }, [conditions, onFiltersChange])

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filters">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </TabsTrigger>
          <TabsTrigger value="segments">
            <Users className="h-4 w-4 mr-2" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="quick">
            <Target className="h-4 w-4 mr-2" />
            Quick Filters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Filter Conditions</CardTitle>
                  <CardDescription>
                    Build complex filters to find specific campaigns
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={clearAllConditions}>
                    Clear All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Segment
                  </Button>
                  <Button size="sm" onClick={addCondition}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {conditions.map((condition, index) => (
                    <FilterConditionRow
                      key={condition.id}
                      condition={condition}
                      index={index}
                      onUpdate={updateCondition}
                      onRemove={removeCondition}
                    />
                  ))}
                </AnimatePresence>

                {conditions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No filter conditions set</p>
                    <p className="text-sm">Click "Add Condition" to start filtering</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {showSaveDialog && (
            <Card>
              <CardHeader>
                <CardTitle>Save as Segment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="segmentName">Segment Name</Label>
                  <Input
                    id="segmentName"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    placeholder="Enter segment name"
                  />
                </div>
                <div>
                  <Label htmlFor="segmentDescription">Description (Optional)</Label>
                  <Input
                    id="segmentDescription"
                    value={segmentDescription}
                    onChange={(e) => setSegmentDescription(e.target.value)}
                    placeholder="Describe this segment"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={saveAsSegment}>Save Segment</Button>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Segments</CardTitle>
              <CardDescription>
                Pre-defined and custom campaign segments for targeted actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {segments.map((segment) => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    onSelect={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Filters</CardTitle>
              <CardDescription>
                Common filter options for quick campaign segmentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Performance Range (Open Rate %)</Label>
                <div className="px-3 py-2">
                  <Slider
                    value={quickFilters.performanceRange}
                    onValueChange={(value) => setQuickFilters(prev => ({ ...prev, performanceRange: value }))}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{quickFilters.performanceRange[0]}%</span>
                    <span>{quickFilters.performanceRange[1]}%</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recent Activity (Last 30 days)</Label>
                    <p className="text-sm text-muted-foreground">Campaigns sent in the last month</p>
                  </div>
                  <Switch
                    checked={quickFilters.recentActivity}
                    onCheckedChange={(checked) => setQuickFilters(prev => ({ ...prev, recentActivity: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>High Revenue</Label>
                    <p className="text-sm text-muted-foreground">Campaigns generating &gt; ₦10,000</p>
                  </div>
                  <Switch
                    checked={quickFilters.highRevenue}
                    onCheckedChange={(checked) => setQuickFilters(prev => ({ ...prev, highRevenue: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Campaigns</Label>
                    <p className="text-sm text-muted-foreground">Filter for email marketing campaigns</p>
                  </div>
                  <Switch
                    checked={quickFilters.emailEngaged}
                    onCheckedChange={(checked) => setQuickFilters(prev => ({ ...prev, emailEngaged: checked }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button onClick={applyQuickFilters}>
                  Apply Quick Filters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setQuickFilters({
                    performanceRange: [0, 100],
                    recentActivity: false,
                    highRevenue: false,
                    emailEngaged: false
                  })}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}