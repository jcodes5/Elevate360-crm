"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Mail,
  MessageSquare,
  Phone,
  ShoppingCart,
  Heart,
  Gift,
  Users,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  channels: string[]
  steps: number
  estimatedTime: string
  icon: any
  preview: {
    steps: Array<{
      type: string
      name: string
      description: string
    }>
  }
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "welcome-series",
    name: "Welcome Email Series",
    description: "3-part onboarding sequence for new subscribers",
    category: "onboarding",
    difficulty: "beginner",
    channels: ["email"],
    steps: 4,
    estimatedTime: "5 days",
    icon: Mail,
    preview: {
      steps: [
        { type: "trigger", name: "Contact Created", description: "When someone subscribes" },
        { type: "action", name: "Send Welcome Email", description: "Immediate welcome message" },
        { type: "delay", name: "Wait 2 Days", description: "Give them time to engage" },
        { type: "action", name: "Send Tips Email", description: "Helpful tips and resources" },
      ],
    },
  },
  {
    id: "abandoned-cart",
    name: "Abandoned Cart Recovery",
    description: "Multi-channel campaign to recover abandoned carts",
    category: "ecommerce",
    difficulty: "intermediate",
    channels: ["email", "sms", "whatsapp"],
    steps: 6,
    estimatedTime: "7 days",
    icon: ShoppingCart,
    preview: {
      steps: [
        { type: "trigger", name: "Cart Abandoned", description: "When cart is left for 1 hour" },
        { type: "action", name: "Send Email Reminder", description: "Gentle reminder email" },
        { type: "delay", name: "Wait 24 Hours", description: "Give time to complete purchase" },
        { type: "condition", name: "Check Purchase", description: "Did they complete the purchase?" },
        { type: "action", name: "Send SMS", description: "SMS with discount code" },
        { type: "action", name: "Send WhatsApp", description: "Personal WhatsApp message" },
      ],
    },
  },
  {
    id: "lead-nurturing",
    name: "Lead Nurturing Campaign",
    description: "Score-based nurturing for potential customers",
    category: "sales",
    difficulty: "advanced",
    channels: ["email", "sms"],
    steps: 8,
    estimatedTime: "30 days",
    icon: TrendingUp,
    preview: {
      steps: [
        { type: "trigger", name: "Lead Score Threshold", description: "When lead score reaches 50" },
        { type: "action", name: "Send Educational Content", description: "Industry insights email" },
        { type: "delay", name: "Wait 3 Days", description: "Allow time for engagement" },
        { type: "condition", name: "Check Engagement", description: "Did they open/click?" },
        { type: "action", name: "Send Case Study", description: "Success story email" },
        { type: "delay", name: "Wait 5 Days", description: "Build anticipation" },
        { type: "action", name: "Schedule Call SMS", description: "Invite for consultation" },
        { type: "action", name: "Add to Sales Pipeline", description: "Move to sales team" },
      ],
    },
  },
  {
    id: "customer-onboarding",
    name: "Customer Onboarding",
    description: "Complete onboarding flow for new customers",
    category: "onboarding",
    difficulty: "intermediate",
    channels: ["email", "sms"],
    steps: 7,
    estimatedTime: "14 days",
    icon: Users,
    preview: {
      steps: [
        { type: "trigger", name: "Purchase Completed", description: "When customer makes first purchase" },
        { type: "action", name: "Send Thank You Email", description: "Confirmation and next steps" },
        { type: "delay", name: "Wait 1 Day", description: "Let them get started" },
        { type: "action", name: "Send Setup Guide", description: "How to get the most value" },
        { type: "delay", name: "Wait 7 Days", description: "Give time to implement" },
        { type: "action", name: "Check-in SMS", description: "How are things going?" },
        { type: "action", name: "Send Success Tips", description: "Advanced tips for success" },
      ],
    },
  },
  {
    id: "reengagement",
    name: "Re-engagement Campaign",
    description: "Win back inactive customers with special offers",
    category: "retention",
    difficulty: "intermediate",
    channels: ["email", "whatsapp"],
    steps: 5,
    estimatedTime: "10 days",
    icon: Heart,
    preview: {
      steps: [
        { type: "trigger", name: "Inactive for 30 Days", description: "No engagement for a month" },
        { type: "action", name: "We Miss You Email", description: "Emotional reconnection" },
        { type: "delay", name: "Wait 3 Days", description: "Give time to respond" },
        { type: "condition", name: "Check Response", description: "Did they engage?" },
        { type: "action", name: "Special Offer WhatsApp", description: "Exclusive discount offer" },
      ],
    },
  },
  {
    id: "birthday-campaign",
    name: "Birthday Campaign",
    description: "Automated birthday wishes with special offers",
    category: "retention",
    difficulty: "beginner",
    channels: ["email", "sms"],
    steps: 3,
    estimatedTime: "1 day",
    icon: Gift,
    preview: {
      steps: [
        { type: "trigger", name: "Birthday Date", description: "On customer's birthday" },
        { type: "action", name: "Birthday Email", description: "Personalized birthday wishes" },
        { type: "action", name: "Birthday SMS", description: "Special birthday discount" },
      ],
    },
  },
]

const categories = [
  { id: "all", name: "All Templates", count: workflowTemplates.length },
  { id: "onboarding", name: "Onboarding", count: workflowTemplates.filter((t) => t.category === "onboarding").length },
  { id: "sales", name: "Sales", count: workflowTemplates.filter((t) => t.category === "sales").length },
  { id: "ecommerce", name: "E-commerce", count: workflowTemplates.filter((t) => t.category === "ecommerce").length },
  { id: "retention", name: "Retention", count: workflowTemplates.filter((t) => t.category === "retention").length },
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-100 text-green-800"
    case "intermediate":
      return "bg-yellow-100 text-yellow-800"
    case "advanced":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "email":
      return Mail
    case "sms":
      return MessageSquare
    case "whatsapp":
      return Phone
    default:
      return Mail
  }
}

interface TemplatePreviewProps {
  template: WorkflowTemplate | null
  onClose: () => void
  onUse: (template: WorkflowTemplate) => void
}

function TemplatePreview({ template, onClose, onUse }: TemplatePreviewProps) {
  if (!template) return null

  const Icon = template.icon

  return (
    <Dialog open={!!template} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle>{template.name}</DialogTitle>
              <DialogDescription>{template.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Difficulty</div>
              <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Estimated Time</div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{template.estimatedTime}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Channels</div>
              <div className="flex space-x-1">
                {template.channels.map((channel) => {
                  const ChannelIcon = getChannelIcon(channel)
                  return (
                    <div key={channel} className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
                      <ChannelIcon className="h-3 w-3" />
                      <span className="text-xs capitalize">{channel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Steps</div>
              <div className="text-sm">{template.steps} workflow steps</div>
            </div>
          </div>

          {/* Workflow Preview */}
          <div className="space-y-3">
            <h4 className="font-medium">Workflow Preview</h4>
            <div className="space-y-2">
              {template.preview.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{step.name}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {step.type}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onUse(template)}>
              <Play className="mr-2 h-4 w-4" />
              Use This Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface WorkflowTemplatesProps {
  onUseTemplate: (template: WorkflowTemplate) => void
}

export function WorkflowTemplates({ onUseTemplate }: WorkflowTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null)

  const filteredTemplates =
    selectedCategory === "all"
      ? workflowTemplates
      : workflowTemplates.filter((template) => template.category === selectedCategory)

  const handleUseTemplate = (template: WorkflowTemplate) => {
    onUseTemplate(template)
    setPreviewTemplate(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Workflow Templates</h2>
        <p className="text-muted-foreground">Get started quickly with pre-built automation workflows</p>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template, index) => {
              const Icon = template.icon
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge className={`${getDifficultyColor(template.difficulty)} mt-1`}>
                              {template.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-2">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Channels */}
                        <div className="flex space-x-1">
                          {template.channels.map((channel) => {
                            const ChannelIcon = getChannelIcon(channel)
                            return (
                              <div key={channel} className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
                                <ChannelIcon className="h-3 w-3" />
                                <span className="text-xs capitalize">{channel}</span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{template.steps} steps</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{template.estimatedTime}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            Preview
                          </Button>
                          <Button size="sm" className="flex-1" onClick={() => onUseTemplate(template)}>
                            <ArrowRight className="mr-1 h-3 w-3" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Preview Modal */}
      <TemplatePreview template={previewTemplate} onClose={() => setPreviewTemplate(null)} onUse={handleUseTemplate} />
    </div>
  )
}
