"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mail, 
  MessageSquare, 
  Users, 
  Target, 
  Calendar, 
  Zap, 
  ArrowRight,
  Plus,
  Search,
  Filter,
  Star,
  Copy,
  Play
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: React.ComponentType<any>
  color: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
  nodes: number
  popularity: number
  steps: WorkflowStep[]
  preview: string[]
}

interface WorkflowStep {
  type: 'trigger' | 'action' | 'condition' | 'delay'
  name: string
  description: string
  icon: React.ComponentType<any>
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "welcome-series",
    name: "Welcome Email Series",
    description: "Automatically send a series of welcome emails to new contacts over several days",
    category: "Email Marketing",
    icon: Mail,
    color: "#3B82F6",
    difficulty: "beginner",
    estimatedTime: "5 minutes",
    tags: ["email", "welcome", "onboarding"],
    nodes: 6,
    popularity: 95,
    steps: [
      { type: "trigger", name: "Contact Created", description: "When a new contact is added", icon: Users },
      { type: "action", name: "Send Welcome Email", description: "Send immediate welcome message", icon: Mail },
      { type: "delay", name: "Wait 1 Day", description: "Wait 24 hours", icon: Calendar },
      { type: "action", name: "Send Follow-up", description: "Send follow-up with resources", icon: Mail },
      { type: "delay", name: "Wait 3 Days", description: "Wait 72 hours", icon: Calendar },
      { type: "action", name: "Send Check-in", description: "Send final check-in email", icon: Mail },
    ],
    preview: [
      "New contact added → Send welcome email",
      "Wait 1 day → Send resource email", 
      "Wait 3 days → Send check-in email"
    ]
  },
  {
    id: "lead-scoring",
    name: "Lead Scoring Automation",
    description: "Automatically score leads based on actions and move hot leads to sales team",
    category: "Lead Management",
    icon: Target,
    color: "#10B981",
    difficulty: "intermediate",
    estimatedTime: "10 minutes",
    tags: ["lead", "scoring", "sales"],
    nodes: 8,
    popularity: 87,
    steps: [
      { type: "trigger", name: "Email Opened", description: "When contact opens email", icon: Mail },
      { type: "action", name: "Add Score", description: "Increase lead score by 10", icon: Target },
      { type: "condition", name: "Check Score", description: "If score > 50", icon: Target },
      { type: "action", name: "Add Hot Lead Tag", description: "Tag as hot lead", icon: Users },
      { type: "action", name: "Create Task", description: "Create follow-up task for sales", icon: Calendar },
      { type: "action", name: "Send Notification", description: "Notify sales team", icon: Zap },
    ],
    preview: [
      "Email opened → Increase score",
      "If score > 50 → Tag as hot lead",
      "Create sales task → Notify team"
    ]
  },
  {
    id: "abandoned-cart",
    name: "Abandoned Cart Recovery",
    description: "Win back customers who left items in their cart with targeted follow-up messages",
    category: "E-commerce",
    icon: MessageSquare,
    color: "#F59E0B",
    difficulty: "intermediate",
    estimatedTime: "8 minutes",
    tags: ["ecommerce", "cart", "recovery"],
    nodes: 7,
    popularity: 78,
    steps: [
      { type: "trigger", name: "Cart Abandoned", description: "When cart is left for 1 hour", icon: Calendar },
      { type: "action", name: "Send Reminder", description: "Send cart reminder email", icon: Mail },
      { type: "delay", name: "Wait 24 Hours", description: "Wait 1 day", icon: Calendar },
      { type: "condition", name: "Still Abandoned", description: "Check if cart still abandoned", icon: Target },
      { type: "action", name: "Send Discount", description: "Send 10% discount offer", icon: Mail },
      { type: "delay", name: "Wait 48 Hours", description: "Wait 2 days", icon: Calendar },
      { type: "action", name: "Final Attempt", description: "Send final recovery message", icon: MessageSquare },
    ],
    preview: [
      "Cart abandoned → Send reminder",
      "Wait 24h → Send discount offer",
      "Wait 48h → Final recovery attempt"
    ]
  },
  {
    id: "birthday-campaign",
    name: "Birthday Campaign",
    description: "Send personalized birthday messages and special offers to customers",
    category: "Customer Retention",
    icon: Calendar,
    color: "#8B5CF6",
    difficulty: "beginner",
    estimatedTime: "4 minutes",
    tags: ["birthday", "retention", "personal"],
    nodes: 4,
    popularity: 92,
    steps: [
      { type: "trigger", name: "Birthday", description: "On contact's birthday", icon: Calendar },
      { type: "action", name: "Send Birthday Email", description: "Send personalized message", icon: Mail },
      { type: "action", name: "Send SMS", description: "Send birthday SMS", icon: MessageSquare },
      { type: "action", name: "Add Birthday Tag", description: "Tag for tracking", icon: Users },
    ],
    preview: [
      "Birthday triggers → Send email & SMS",
      "Add birthday tag for tracking"
    ]
  },
  {
    id: "re-engagement",
    name: "Re-engagement Campaign",
    description: "Win back inactive contacts with a series of targeted messages",
    category: "Customer Retention",
    icon: Zap,
    color: "#EF4444",
    difficulty: "advanced",
    estimatedTime: "12 minutes",
    tags: ["retention", "inactive", "reactivation"],
    nodes: 10,
    popularity: 71,
    steps: [
      { type: "trigger", name: "Inactivity", description: "No activity for 30 days", icon: Calendar },
      { type: "condition", name: "Check Engagement", description: "Verify low engagement", icon: Target },
      { type: "action", name: "Send Survey", description: "Send feedback survey", icon: Mail },
      { type: "delay", name: "Wait 3 Days", description: "Wait for response", icon: Calendar },
      { type: "condition", name: "Survey Response", description: "Check if responded", icon: Target },
      { type: "action", name: "Send Offer", description: "Send special offer", icon: Mail },
      { type: "delay", name: "Wait 7 Days", description: "Final wait period", icon: Calendar },
      { type: "condition", name: "Still Inactive", description: "Check final status", icon: Target },
      { type: "action", name: "Remove from Active", description: "Move to inactive list", icon: Users },
    ],
    preview: [
      "30 days inactive → Send survey",
      "No response → Send special offer",
      "Still inactive → Move to inactive list"
    ]
  },
  {
    id: "webinar-follow-up",
    name: "Webinar Follow-up",
    description: "Automatically follow up with webinar attendees and non-attendees",
    category: "Event Marketing",
    icon: Users,
    color: "#06B6D4",
    difficulty: "intermediate",
    estimatedTime: "9 minutes",
    tags: ["webinar", "event", "followup"],
    nodes: 9,
    popularity: 83,
    steps: [
      { type: "trigger", name: "Webinar Ended", description: "When webinar concludes", icon: Calendar },
      { type: "condition", name: "Attendance Check", description: "Check if attended", icon: Target },
      { type: "action", name: "Send Thank You", description: "Thank attendees", icon: Mail },
      { type: "action", name: "Send Recording", description: "Send recording to non-attendees", icon: Mail },
      { type: "delay", name: "Wait 2 Days", description: "Wait period", icon: Calendar },
      { type: "action", name: "Send Survey", description: "Send feedback survey", icon: Mail },
      { type: "action", name: "Add Tags", description: "Tag based on attendance", icon: Users },
    ],
    preview: [
      "Webinar ends → Check attendance",
      "Attendees get thanks → Non-attendees get recording",
      "Send survey → Add appropriate tags"
    ]
  }
]

const categories = [
  "All",
  "Email Marketing",
  "Lead Management", 
  "E-commerce",
  "Customer Retention",
  "Event Marketing"
]

const difficulties = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
]

function TemplateCard({ template, onUse }: { template: WorkflowTemplate; onUse: (template: WorkflowTemplate) => void }) {
  const [showPreview, setShowPreview] = useState(false)
  const Icon = template.icon

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4" 
            style={{ borderLeftColor: template.color }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: template.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {template.estimatedTime}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {template.popularity}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CardDescription className="mt-2">
            {template.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{template.nodes} nodes</span>
              <span>{template.category}</span>
            </div>

            {/* Preview */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2 border-t"
              >
                <h4 className="font-medium text-sm">Workflow Preview:</h4>
                {template.preview.map((step, index) => (
                  <div key={index} className="flex items-center text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                    {step}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => onUse(template)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Use Template
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide' : 'Preview'}
              </Button>
              <Button size="sm" variant="ghost">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function WorkflowTemplates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || template.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleUseTemplate = (template: WorkflowTemplate) => {
    toast({
      title: "Template Applied",
      description: `${template.name} has been loaded in the workflow builder.`,
    })
    
    // In a real app, this would load the template into the workflow builder
    console.log("Loading template:", template)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflow Templates</h2>
          <p className="text-muted-foreground">
            Pre-built automation workflows to get you started quickly
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Template</DialogTitle>
              <DialogDescription>
                Save your current workflow as a reusable template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input id="templateName" placeholder="Enter template name" />
              </div>
              <div>
                <Label htmlFor="templateDescription">Description</Label>
                <Textarea id="templateDescription" placeholder="Describe what this template does" />
              </div>
              <div>
                <Label htmlFor="templateCategory">Category</Label>
                <Input id="templateCategory" placeholder="e.g., Email Marketing" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
        <span>{filteredTemplates.length} templates found</span>
        <span>•</span>
        <span>{categories.length - 1} categories</span>
        <span>•</span>
        <span>Most popular: Welcome Email Series</span>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={handleUseTemplate}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm("")
            setSelectedCategory("All")
            setSelectedDifficulty("all")
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
