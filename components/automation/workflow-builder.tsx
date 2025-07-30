"use client"

import { useState, useCallback } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Save,
  Trash2,
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
import { toast } from "sonner"

// Validation schemas
const emailConfigSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  template: z.string().optional(),
})

const smsConfigSchema = z.object({
  message: z.string().min(1, "Message is required").max(160, "Message must be 160 characters or less"),
})

const delayConfigSchema = z.object({
  duration: z.number().min(1, "Duration must be at least 1"),
  unit: z.enum(["minutes", "hours", "days", "weeks"]),
})

const tagConfigSchema = z.object({
  tag: z.string().min(1, "Tag name is required"),
})

// Node types and templates
const nodeTemplates = {
  triggers: [
    {
      id: "contact_created",
      name: "Contact Created",
      description: "When a new contact is added",
      icon: User,
      type: "trigger",
      subType: "contact_created",
      color: "bg-green-500",
    },
    {
      id: "form_submitted",
      name: "Form Submitted",
      description: "When a form is submitted",
      icon: Target,
      type: "trigger",
      subType: "form_submitted",
      color: "bg-green-500",
    },
    {
      id: "tag_added",
      name: "Tag Added",
      description: "When a tag is added to contact",
      icon: Tag,
      type: "trigger",
      subType: "tag_added",
      color: "bg-green-500",
    },
    {
      id: "date_based",
      name: "Date Based",
      description: "On a specific date",
      icon: Calendar,
      type: "trigger",
      subType: "date_based",
      color: "bg-green-500",
    },
  ],
  actions: [
    {
      id: "send_email",
      name: "Send Email",
      description: "Send an email message",
      icon: Mail,
      type: "action",
      subType: "send_email",
      color: "bg-blue-500",
    },
    {
      id: "send_sms",
      name: "Send SMS",
      description: "Send an SMS message",
      icon: MessageSquare,
      type: "action",
      subType: "send_sms",
      color: "bg-blue-500",
    },
    {
      id: "send_whatsapp",
      name: "Send WhatsApp",
      description: "Send a WhatsApp message",
      icon: Phone,
      type: "action",
      subType: "send_whatsapp",
      color: "bg-blue-500",
    },
    {
      id: "add_tag",
      name: "Add Tag",
      description: "Add a tag to contact",
      icon: Tag,
      type: "action",
      subType: "add_tag",
      color: "bg-blue-500",
    },
  ],
  conditions: [
    {
      id: "field_equals",
      name: "Field Equals",
      description: "Check if field equals value",
      icon: GitBranch,
      type: "condition",
      subType: "field_equals",
      color: "bg-yellow-500",
    },
    {
      id: "has_tag",
      name: "Has Tag",
      description: "Check if contact has tag",
      icon: Tag,
      type: "condition",
      subType: "has_tag",
      color: "bg-yellow-500",
    },
  ],
  delays: [
    {
      id: "wait_time",
      name: "Wait Time",
      description: "Wait for specified time",
      icon: Clock,
      type: "delay",
      subType: "wait_time",
      color: "bg-purple-500",
    },
  ],
}

interface WorkflowNode {
  id: string
  type: string
  subType: string
  name: string
  position: { x: number; y: number }
  config: Record<string, any>
  template: any
}

interface DraggableNodeProps {
  template: any
}

function DraggableNode({ template }: DraggableNodeProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "node-template",
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
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded ${template.color} text-white`}>
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

interface WorkflowCanvasProps {
  nodes: WorkflowNode[]
  onAddNode: (template: any, position: { x: number; y: number }) => void
  onSelectNode: (node: WorkflowNode | null) => void
  selectedNode: WorkflowNode | null
  onDeleteNode: (nodeId: string) => void
}

function WorkflowCanvas({ nodes, onAddNode, onSelectNode, selectedNode, onDeleteNode }: WorkflowCanvasProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "node-template",
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset) {
        const canvasRect = document.getElementById("workflow-canvas")?.getBoundingClientRect()
        if (canvasRect) {
          const position = {
            x: offset.x - canvasRect.left - 75,
            y: offset.y - canvasRect.top - 40,
          }
          onAddNode(item, position)
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      id="workflow-canvas"
      className={`relative h-[600px] bg-gray-50 border-2 border-dashed rounded-lg overflow-auto transition-all duration-200 ${
        isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      style={{
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    >
      <AnimatePresence>
        {nodes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
              <p className="text-gray-500">Drag components from the sidebar to create your automation</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nodes.map((node) => {
          const Icon = node.template.icon
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className={`absolute cursor-pointer transition-all ${
                selectedNode?.id === node.id ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
              }}
              onClick={() => onSelectNode(node)}
            >
              <div className="bg-white border rounded-lg shadow-sm p-3 min-w-[150px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${node.template.color} text-white`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="text-sm font-medium">{node.name}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteNode(node.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {node.type}
                </Badge>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  onUpdateNode: (nodeId: string, config: Record<string, any>) => void
  onClose: () => void
}

function NodeConfigPanel({ node, onUpdateNode, onClose }: NodeConfigPanelProps) {
  const getSchema = (subType: string) => {
    switch (subType) {
      case "send_email":
        return emailConfigSchema
      case "send_sms":
        return smsConfigSchema
      case "wait_time":
        return delayConfigSchema
      case "add_tag":
        return tagConfigSchema
      default:
        return z.object({})
    }
  }

  const form = useForm({
    resolver: zodResolver(getSchema(node?.subType || "")),
    defaultValues: node?.config || {},
  })

  const handleSave = (data: any) => {
    if (node) {
      onUpdateNode(node.id, data)
      toast.success("Node configuration saved")
      onClose()
    }
  }

  if (!node) return null

  const renderConfigFields = () => {
    switch (node.subType) {
      case "send_email":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                {...form.register("subject")}
                placeholder="Email subject"
                className={form.formState.errors.subject ? "border-red-500" : ""}
              />
              {form.formState.errors.subject && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.subject.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                {...form.register("content")}
                placeholder="Email content"
                rows={4}
                className={form.formState.errors.content ? "border-red-500" : ""}
              />
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={form.watch("template") || ""} onValueChange={(value) => form.setValue("template", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="followup">Follow-up Email</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
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
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                {...form.register("message")}
                placeholder="SMS message (160 characters max)"
                rows={3}
                maxLength={160}
                className={form.formState.errors.message ? "border-red-500" : ""}
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
          </div>
        )

      case "wait_time":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                type="number"
                {...form.register("duration", { valueAsNumber: true })}
                placeholder="Duration"
                className={form.formState.errors.duration ? "border-red-500" : ""}
              />
              {form.formState.errors.duration && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
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

      case "add_tag":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag">Tag Name</Label>
              <Input
                id="tag"
                {...form.register("tag")}
                placeholder="Tag to add"
                className={form.formState.errors.tag ? "border-red-500" : ""}
              />
              {form.formState.errors.tag && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.tag.message}</p>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No configuration options for this node type.</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={!!node} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {node.name}</DialogTitle>
          <DialogDescription>Set up the parameters for this workflow step.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
          <div className="py-4">{renderConfigFields()}</div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function WorkflowBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const queryClient = useQueryClient()

  // React Query mutations for workflow operations
  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflow: any) => {
      // This would be your API call
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      })
      if (!response.ok) throw new Error("Failed to save workflow")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Workflow saved successfully!")
      queryClient.invalidateQueries({ queryKey: ["workflows"] })
    },
    onError: () => {
      toast.error("Failed to save workflow")
    },
  })

  const testWorkflowMutation = useMutation({
    mutationFn: async (workflow: any) => {
      const response = await fetch("/api/workflows/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      })
      if (!response.ok) throw new Error("Failed to test workflow")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Workflow test completed!")
    },
    onError: () => {
      toast.error("Workflow test failed")
    },
  })

  const addNode = useCallback((template: any, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: template.type,
      subType: template.subType,
      name: template.name,
      position,
      config: {},
      template,
    }
    setNodes((prev) => [...prev, newNode])
    toast.success(`Added ${template.name} to workflow`)
  }, [])

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== nodeId))
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null)
      }
      toast.success("Node removed from workflow")
    },
    [selectedNode],
  )

  const updateNode = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, config } : node)))
  }, [])

  const saveWorkflow = () => {
    const workflow = {
      name: workflowName,
      nodes,
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    saveWorkflowMutation.mutate(workflow)
  }

  const testWorkflow = () => {
    const workflow = {
      name: workflowName,
      nodes,
      connections: [],
    }
    testWorkflowMutation.mutate(workflow)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex">
        {/* Sidebar */}
        <motion.div initial={{ x: -300 }} animate={{ x: 0 }} className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Workflow Components</h2>
            <p className="text-sm text-muted-foreground">Drag components to the canvas</p>
          </div>

          <Tabs defaultValue="triggers" className="p-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="triggers" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-green-700">Triggers</h3>
                {nodeTemplates.triggers.map((template) => (
                  <DraggableNode key={template.id} template={template} />
                ))}
              </div>
              <div className="space-y-2 mt-4">
                <h3 className="font-medium text-sm text-yellow-700">Conditions</h3>
                {nodeTemplates.conditions.map((template) => (
                  <DraggableNode key={template.id} template={template} />
                ))}
              </div>
              <div className="space-y-2 mt-4">
                <h3 className="font-medium text-sm text-purple-700">Delays</h3>
                {nodeTemplates.delays.map((template) => (
                  <DraggableNode key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-blue-700">Actions</h3>
                {nodeTemplates.actions.map((template) => (
                  <DraggableNode key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} className="font-medium" />
                <Badge variant="outline">{nodes.length} nodes</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={testWorkflow}
                  disabled={testWorkflowMutation.isPending || nodes.length === 0}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {testWorkflowMutation.isPending ? "Testing..." : "Test"}
                </Button>
                <Button onClick={saveWorkflow} disabled={saveWorkflowMutation.isPending || nodes.length === 0}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveWorkflowMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Canvas */}
          <div className="flex-1 p-4">
            <WorkflowCanvas
              nodes={nodes}
              onAddNode={addNode}
              onSelectNode={setSelectedNode}
              selectedNode={selectedNode}
              onDeleteNode={deleteNode}
            />
          </div>
        </div>
      </motion.div>

      {/* Node Configuration Panel */}
      <NodeConfigPanel node={selectedNode} onUpdateNode={updateNode} onClose={() => setSelectedNode(null)} />
    </DndProvider>
  )
}
