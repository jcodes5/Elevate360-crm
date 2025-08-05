"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { motion } from "framer-motion"
import ReactFlow, {
  type Node,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  ReactFlowProvider,
  type ReactFlowInstance,
} from "reactflow"
import "reactflow/dist/style.css"
import {
  Play,
  Save,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  GitBranch,
  Tag,
  User,
  Calendar,
  Zap,
  Target,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

// Enhanced node templates with more types and actions
const nodeTemplates = {
  triggers: [
    {
      id: "form_submitted",
      name: "Form Submitted",
      description: "When a form is submitted",
      icon: Target,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "contact_created",
      name: "Contact Created",
      description: "When a new contact is added",
      icon: User,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "tag_applied",
      name: "Tag Applied",
      description: "When a tag is applied to contact",
      icon: Tag,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "date_trigger",
      name: "Date/Time",
      description: "On a specific date or time",
      icon: Calendar,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "email_opened",
      name: "Email Opened",
      description: "When contact opens an email",
      icon: Mail,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "link_clicked",
      name: "Link Clicked",
      description: "When contact clicks a link",
      icon: Zap,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "deal_stage_changed",
      name: "Deal Stage Changed",
      description: "When deal moves to different stage",
      icon: Target,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "webhook_received",
      name: "Webhook",
      description: "When webhook is received",
      icon: Zap,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "birthday",
      name: "Birthday",
      description: "On contact's birthday",
      icon: Calendar,
      type: "trigger",
      color: "#10B981",
    },
    {
      id: "inactivity",
      name: "Inactivity",
      description: "After period of no activity",
      icon: Clock,
      type: "trigger",
      color: "#10B981",
    },
  ],
  actions: [
    {
      id: "send_email",
      name: "Send Email",
      description: "Send an email to contacts",
      icon: Mail,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "send_sms",
      name: "Send SMS",
      description: "Send SMS message",
      icon: MessageSquare,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "send_whatsapp",
      name: "Send WhatsApp",
      description: "Send WhatsApp message",
      icon: Phone,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "add_tag",
      name: "Add Tag",
      description: "Add tag to contact",
      icon: Tag,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "remove_tag",
      name: "Remove Tag",
      description: "Remove tag from contact",
      icon: Tag,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "update_contact",
      name: "Update Contact",
      description: "Update contact information",
      icon: User,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "create_deal",
      name: "Create Deal",
      description: "Create a new deal",
      icon: Target,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "update_deal",
      name: "Update Deal",
      description: "Update deal information",
      icon: Target,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "create_task",
      name: "Create Task",
      description: "Create a follow-up task",
      icon: Calendar,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "send_notification",
      name: "Send Notification",
      description: "Send internal notification",
      icon: Zap,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "call_webhook",
      name: "Call Webhook",
      description: "Send data to external URL",
      icon: Zap,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "add_to_campaign",
      name: "Add to Campaign",
      description: "Add contact to campaign",
      icon: Mail,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "remove_from_campaign",
      name: "Remove from Campaign",
      description: "Remove contact from campaign",
      icon: Mail,
      type: "action",
      color: "#3B82F6",
    },
    {
      id: "calculate_score",
      name: "Calculate Score",
      description: "Update lead score",
      icon: Target,
      type: "action",
      color: "#3B82F6",
    },
  ],
  conditions: [
    {
      id: "if_condition",
      name: "If/Then",
      description: "Branch based on conditions",
      icon: GitBranch,
      type: "condition",
      color: "#F59E0B",
    },
    {
      id: "has_tag",
      name: "Has Tag",
      description: "Check if contact has specific tag",
      icon: Tag,
      type: "condition",
      color: "#F59E0B",
    },
    {
      id: "field_value",
      name: "Field Value",
      description: "Check contact field value",
      icon: User,
      type: "condition",
      color: "#F59E0B",
    },
    {
      id: "deal_value",
      name: "Deal Value",
      description: "Check deal value amount",
      icon: DollarSign,
      type: "condition",
      color: "#F59E0B",
    },
    {
      id: "engagement_score",
      name: "Engagement Score",
      description: "Check engagement level",
      icon: Target,
      type: "condition",
      color: "#F59E0B",
    },
    {
      id: "time_condition",
      name: "Time Condition",
      description: "Check time-based criteria",
      icon: Clock,
      type: "condition",
      color: "#F59E0B",
    },
    {
      id: "campaign_status",
      name: "Campaign Status",
      description: "Check campaign interaction",
      icon: Mail,
      type: "condition",
      color: "#F59E0B",
    },
  ],
  delays: [
    {
      id: "wait",
      name: "Wait",
      description: "Wait for specified time",
      icon: Clock,
      type: "delay",
      color: "#8B5CF6",
    },
    {
      id: "wait_until",
      name: "Wait Until",
      description: "Wait until specific condition",
      icon: Clock,
      type: "delay",
      color: "#8B5CF6",
    },
    {
      id: "business_hours",
      name: "Business Hours",
      description: "Wait for business hours",
      icon: Clock,
      type: "delay",
      color: "#8B5CF6",
    },
  ],
  integrations: [
    {
      id: "google_sheets",
      name: "Google Sheets",
      description: "Update Google Sheets",
      icon: Settings,
      type: "integration",
      color: "#EF4444",
    },
    {
      id: "slack_message",
      name: "Slack Message",
      description: "Send Slack notification",
      icon: MessageSquare,
      type: "integration",
      color: "#EF4444",
    },
    {
      id: "zapier_trigger",
      name: "Zapier",
      description: "Trigger Zapier workflow",
      icon: Zap,
      type: "integration",
      color: "#EF4444",
    },
    {
      id: "calendly_booking",
      name: "Calendly",
      description: "Create calendar booking",
      icon: Calendar,
      type: "integration",
      color: "#EF4444",
    },
  ],
}

// Custom node component
function CustomNode({ data }: { data: any }) {
  const Icon = data.icon
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[180px] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <div
          className="p-2 rounded-full text-white flex items-center justify-center"
          style={{ backgroundColor: data.color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="font-medium text-sm">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
      </div>
      {data.configured && (
        <Badge variant="secondary" className="mt-2 text-xs">
          Configured
        </Badge>
      )}
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

// Draggable node component for sidebar
function DraggableNode({ template }: { template: any }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "workflow-node",
    item: template,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const Icon = template.icon

  return (
    <motion.div
      ref={drag}
      className={`p-3 border rounded-lg cursor-move transition-all hover:shadow-md ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded text-white" style={{ backgroundColor: template.color }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{template.name}</div>
          <div className="text-xs text-muted-foreground">{template.description}</div>
        </div>
      </div>
    </motion.div>
  )
}

// Enhanced node configuration schemas
const emailConfigSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  fromEmail: z.string().email("Valid email required").optional(),
  template: z.string().optional(),
})

const smsConfigSchema = z.object({
  message: z.string().min(1, "Message is required").max(160, "Message must be 160 characters or less"),
  sender: z.string().optional(),
})

const whatsappConfigSchema = z.object({
  message: z.string().min(1, "Message is required"),
  template: z.string().optional(),
})

const waitConfigSchema = z.object({
  duration: z.number().min(1, "Duration must be at least 1"),
  unit: z.enum(["minutes", "hours", "days", "weeks"]),
})

const tagConfigSchema = z.object({
  tagName: z.string().min(1, "Tag name is required"),
  action: z.enum(["add", "remove"]),
})

const dealConfigSchema = z.object({
  dealName: z.string().min(1, "Deal name is required"),
  value: z.number().min(0, "Deal value must be positive"),
  stage: z.string().min(1, "Stage is required"),
  assignedTo: z.string().optional(),
})

const taskConfigSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
})

const webhookConfigSchema = z.object({
  url: z.string().url("Valid URL is required"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  headers: z.string().optional(),
  payload: z.string().optional(),
})

const conditionConfigSchema = z.object({
  field: z.string().min(1, "Field is required"),
  operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
  value: z.string().min(1, "Value is required"),
})

const integrationConfigSchema = z.object({
  action: z.string().min(1, "Action is required"),
  settings: z.record(z.any()).optional(),
})

// Node configuration modal
function NodeConfigModal({ node, isOpen, onClose, onSave }: any) {
  const getSchema = () => {
    switch (node?.data?.template?.id) {
      case "send_email":
        return emailConfigSchema
      case "send_sms":
        return smsConfigSchema
      case "send_whatsapp":
        return whatsappConfigSchema
      case "wait":
      case "wait_until":
      case "business_hours":
        return waitConfigSchema
      case "add_tag":
      case "remove_tag":
        return tagConfigSchema
      case "create_deal":
      case "update_deal":
        return dealConfigSchema
      case "create_task":
        return taskConfigSchema
      case "call_webhook":
        return webhookConfigSchema
      case "if_condition":
      case "has_tag":
      case "field_value":
      case "deal_value":
      case "engagement_score":
      case "time_condition":
      case "campaign_status":
        return conditionConfigSchema
      case "google_sheets":
      case "slack_message":
      case "zapier_trigger":
      case "calendly_booking":
        return integrationConfigSchema
      default:
        return z.object({})
    }
  }

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: node?.data?.config || {},
  })

  const handleSave = (data: any) => {
    onSave(node.id, data)
    toast({
      title: "Success",
      description: "Node configuration saved successfully",
    })
    onClose()
  }

  if (!node) return null

  const renderConfigFields = () => {
    switch (node.data.template?.id) {
      case "send_email":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input id="subject" {...form.register("subject")} placeholder="Enter email subject" />
              {form.formState.errors.subject && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.subject.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="content">Email Content</Label>
              <Textarea id="content" {...form.register("content")} placeholder="Enter email content" rows={6} />
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="fromEmail">From Email (Optional)</Label>
              <Input id="fromEmail" type="email" {...form.register("fromEmail")} placeholder="sender@yourcompany.com" />
            </div>
            <div>
              <Label htmlFor="template">Template (Optional)</Label>
              <Select onValueChange={(value) => form.setValue("template", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="followup">Follow-up Email</SelectItem>
                  <SelectItem value="reminder">Reminder Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "send_sms":
        const messageLength = form.watch("message")?.length || 0
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">SMS Message</Label>
              <Textarea
                id="message"
                {...form.register("message")}
                placeholder="Enter SMS message (160 characters max)"
                rows={4}
                maxLength={160}
              />
              <div className="flex justify-between items-center mt-1">
                {form.formState.errors.message && (
                  <p className="text-red-500 text-sm">{form.formState.errors.message.message}</p>
                )}
                <div className={`text-xs ml-auto ${messageLength > 160 ? "text-red-500" : "text-muted-foreground"}`}>
                  {messageLength}/160 characters
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="sender">Sender ID (Optional)</Label>
              <Input id="sender" {...form.register("sender")} placeholder="Your Company" />
            </div>
          </div>
        )

      case "send_whatsapp":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">WhatsApp Message</Label>
              <Textarea
                id="message"
                {...form.register("message")}
                placeholder="Enter WhatsApp message"
                rows={4}
              />
              {form.formState.errors.message && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.message.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="template">Template (Optional)</Label>
              <Select onValueChange={(value) => form.setValue("template", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greeting">Greeting Template</SelectItem>
                  <SelectItem value="promotion">Promotion Template</SelectItem>
                  <SelectItem value="support">Support Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "add_tag":
      case "remove_tag":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tagName">Tag Name</Label>
              <Input id="tagName" {...form.register("tagName")} placeholder="Enter tag name" />
              {form.formState.errors.tagName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.tagName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Select
                value={form.watch("action") || (node.data.template?.id === "add_tag" ? "add" : "remove")}
                onValueChange={(value) => form.setValue("action", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Tag</SelectItem>
                  <SelectItem value="remove">Remove Tag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "create_deal":
      case "update_deal":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dealName">Deal Name</Label>
              <Input id="dealName" {...form.register("dealName")} placeholder="Enter deal name" />
              {form.formState.errors.dealName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.dealName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="value">Deal Value</Label>
              <Input
                id="value"
                type="number"
                {...form.register("value", { valueAsNumber: true })}
                placeholder="0"
                min="0"
              />
              {form.formState.errors.value && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.value.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select onValueChange={(value) => form.setValue("stage", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
              <Input id="assignedTo" {...form.register("assignedTo")} placeholder="User ID or email" />
            </div>
          </div>
        )

      case "create_task":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" {...form.register("title")} placeholder="Enter task title" />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" {...form.register("description")} placeholder="Task description" rows={3} />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input id="dueDate" type="date" {...form.register("dueDate")} />
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
              <Input id="assignedTo" {...form.register("assignedTo")} placeholder="User ID or email" />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch("priority") || "medium"}
                onValueChange={(value) => form.setValue("priority", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "call_webhook":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Webhook URL</Label>
              <Input id="url" {...form.register("url")} placeholder="https://api.example.com/webhook" />
              {form.formState.errors.url && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.url.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={form.watch("method") || "POST"}
                onValueChange={(value) => form.setValue("method", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="headers">Headers (Optional)</Label>
              <Textarea
                id="headers"
                {...form.register("headers")}
                placeholder='{"Content-Type": "application/json"}'
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="payload">Payload (Optional)</Label>
              <Textarea
                id="payload"
                {...form.register("payload")}
                placeholder='{"key": "value"}'
                rows={4}
              />
            </div>
          </div>
        )

      case "if_condition":
      case "has_tag":
      case "field_value":
      case "deal_value":
      case "engagement_score":
      case "time_condition":
      case "campaign_status":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field">Field/Property</Label>
              <Input id="field" {...form.register("field")} placeholder="Enter field name" />
              {form.formState.errors.field && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.field.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="operator">Operator</Label>
              <Select
                value={form.watch("operator") || "equals"}
                onValueChange={(value) => form.setValue("operator", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input id="value" {...form.register("value")} placeholder="Enter comparison value" />
              {form.formState.errors.value && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.value.message}</p>
              )}
            </div>
          </div>
        )

      case "wait":
      case "wait_until":
      case "business_hours":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="duration">Wait Duration</Label>
              <Input
                id="duration"
                type="number"
                {...form.register("duration", { valueAsNumber: true })}
                placeholder="1"
                min="1"
              />
              {form.formState.errors.duration && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="unit">Time Unit</Label>
              <Select
                value={form.watch("unit") || "minutes"}
                onValueChange={(value) => form.setValue("unit", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "google_sheets":
      case "slack_message":
      case "zapier_trigger":
      case "calendly_booking":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="action">Action</Label>
              <Input id="action" {...form.register("action")} placeholder="Specify the action to perform" />
              {form.formState.errors.action && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.action.message}</p>
              )}
            </div>
            <div>
              <Label>Integration Settings</Label>
              <Textarea
                {...form.register("settings")}
                placeholder='{"key": "value"}'
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Configure integration-specific settings as JSON
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No configuration needed for this node type.</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {node.data.label}</DialogTitle>
          <DialogDescription>Set up the parameters for this workflow step.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {renderConfigFields()}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Configuration</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Main visual flow builder component
export function VisualFlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Drop zone for adding new nodes
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "workflow-node",
    drop: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset()
      if (clientOffset && reactFlowInstance && reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
        const position = reactFlowInstance.project({
          x: clientOffset.x - reactFlowBounds.left,
          y: clientOffset.y - reactFlowBounds.top,
        })

        const newNode: Node = {
          id: `${item.id}_${Date.now()}`,
          type: "custom",
          position,
          data: {
            label: item.name,
            icon: item.icon,
            color: item.color,
            type: item.type,
            template: item,
            config: {},
            configured: false,
          },
        }

        setNodes((nds) => nds.concat(newNode))
        toast({
          title: "Node Added",
          description: `${item.name} has been added to your workflow`,
        })
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setIsConfigModalOpen(true)
  }, [])

  const onNodeConfigSave = useCallback(
    (nodeId: string, config: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  config,
                  configured: true,
                },
              }
            : node,
        ),
      )
    },
    [setNodes],
  )

  // Save workflow mutation
  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      const response = await apiClient.post("/workflows", workflowData)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow saved successfully!",
      })
      queryClient.invalidateQueries({ queryKey: ["workflows"] })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save workflow",
        variant: "destructive",
      })
    },
  })

  // Test workflow mutation
  const testWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      const response = await apiClient.post("/workflows/test", workflowData)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow test completed successfully!",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Workflow test failed",
        variant: "destructive",
      })
    },
  })

  const handleSaveWorkflow = () => {
    const workflowData = {
      name: workflowName,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.data.template?.id || node.data.type,
        position: node.position,
        config: node.data.config,
      })),
      connections: edges.map((edge) => ({
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
      })),
      status: "draft",
    }

    saveWorkflowMutation.mutate(workflowData)
  }

  const handleTestWorkflow = () => {
    const workflowData = {
      name: workflowName,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.data.template?.id || node.data.type,
        position: node.position,
        config: node.data.config,
      })),
      connections: edges.map((edge) => ({
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
      })),
    }

    testWorkflowMutation.mutate(workflowData)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex bg-gray-50">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-white border-r shadow-sm overflow-y-auto"
        >
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Builder</h2>
            <p className="text-sm text-gray-600">Drag components to create your automation</p>
          </div>

          <Tabs defaultValue="triggers" className="p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="triggers">Start</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="integrations">Apps</TabsTrigger>
            </TabsList>

            <TabsContent value="triggers" className="space-y-4 mt-4">
              <div>
                <h3 className="font-medium text-sm text-green-700 mb-2">Triggers</h3>
                <div className="space-y-2">
                  {nodeTemplates.triggers.map((template) => (
                    <DraggableNode key={template.id} template={template} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-yellow-700 mb-2">Conditions</h3>
                <div className="space-y-2">
                  {nodeTemplates.conditions.map((template) => (
                    <DraggableNode key={template.id} template={template} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-purple-700 mb-2">Delays</h3>
                <div className="space-y-2">
                  {nodeTemplates.delays.map((template) => (
                    <DraggableNode key={template.id} template={template} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4 mt-4">
              <div>
                <h3 className="font-medium text-sm text-blue-700 mb-2">Actions</h3>
                <div className="space-y-2">
                  {nodeTemplates.actions.map((template) => (
                    <DraggableNode key={template.id} template={template} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4 mt-4">
              <div>
                <h3 className="font-medium text-sm text-red-700 mb-2">Integrations</h3>
                <div className="space-y-2">
                  {nodeTemplates.integrations.map((template) => (
                    <DraggableNode key={template.id} template={template} />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-white border-b p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="font-medium text-lg border-none p-0 focus:ring-0 bg-transparent"
                  placeholder="Workflow Name"
                />
                <Badge variant="outline" className="text-xs">
                  {nodes.length} nodes
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestWorkflow}
                  disabled={testWorkflowMutation.isPending || nodes.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {testWorkflowMutation.isPending ? "Testing..." : "Test"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveWorkflow}
                  disabled={saveWorkflowMutation.isPending || nodes.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveWorkflowMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* React Flow Canvas */}
          <div className="flex-1" ref={reactFlowWrapper}>
            <div ref={drop} className="h-full">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  className={`transition-colors duration-200 ${isOver ? "bg-blue-50" : "bg-gray-50"}`}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  minZoom={0.2}
                  maxZoom={2}
                  attributionPosition="bottom-left"
                >
                  <Background color="#aaa" gap={16} />
                  <MiniMap
                    nodeColor={(node) => node.data.color || "#e2e8f0"}
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                    className="bg-white"
                  />
                  <Controls className="bg-white shadow-lg border" />
                </ReactFlow>

                {nodes.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="text-center">
                      <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-600 mb-2">Start Building Your Workflow</h3>
                      <p className="text-gray-500 max-w-md">
                        Drag workflow components from the sidebar to create your marketing automation sequence
                      </p>
                    </div>
                  </motion.div>
                )}
              </ReactFlowProvider>
            </div>
          </div>
        </div>

        {/* Node Configuration Modal */}
        <NodeConfigModal
          node={selectedNode}
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false)
            setSelectedNode(null)
          }}
          onSave={onNodeConfigSave}
        />
      </div>
    </DndProvider>
  )
}
