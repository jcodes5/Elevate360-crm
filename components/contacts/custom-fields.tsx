"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Type, 
  Hash, 
  Calendar, 
  ToggleLeft,
  List,
  Tag,
  Users,
  Star,
  Save,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface CustomField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'textarea'
  required: boolean
  defaultValue?: any
  options?: string[]
  description?: string
  isActive: boolean
  order: number
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  createdAt: Date
  updatedAt: Date
}

interface FieldValue {
  fieldId: string
  value: any
}

// Default custom fields
const defaultCustomFields: CustomField[] = [
  {
    id: 'company_size',
    name: 'companySize',
    label: 'Company Size',
    type: 'select',
    required: false,
    options: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    description: 'Number of employees in the company',
    isActive: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'annual_revenue',
    name: 'annualRevenue',
    label: 'Annual Revenue',
    type: 'number',
    required: false,
    description: 'Company annual revenue in Naira',
    isActive: true,
    order: 2,
    validation: {
      min: 0,
      message: 'Annual revenue must be a positive number'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'industry',
    name: 'industry',
    label: 'Industry',
    type: 'select',
    required: false,
    options: [
      'Technology',
      'Healthcare', 
      'Finance',
      'Education',
      'Retail',
      'Manufacturing',
      'Real Estate',
      'Consulting',
      'Other'
    ],
    description: 'Primary industry sector',
    isActive: true,
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'last_contacted',
    name: 'lastContacted',
    label: 'Last Contacted',
    type: 'date',
    required: false,
    description: 'Date of last contact attempt',
    isActive: true,
    order: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'interests',
    name: 'interests',
    label: 'Interests',
    type: 'multiselect',
    required: false,
    options: [
      'Product Demo',
      'Pricing Information',
      'Case Studies',
      'Integration Support',
      'Training',
      'Consulting'
    ],
    description: 'Areas of interest or needs',
    isActive: true,
    order: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'priority_level',
    name: 'priorityLevel',
    label: 'Priority Level',
    type: 'select',
    required: false,
    options: ['Low', 'Medium', 'High', 'Critical'],
    description: 'Sales priority level for this contact',
    isActive: true,
    order: 6,
    defaultValue: 'Medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'notes',
    name: 'notes',
    label: 'Internal Notes',
    type: 'textarea',
    required: false,
    description: 'Internal notes about this contact',
    isActive: true,
    order: 7,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  boolean: ToggleLeft,
  select: List,
  multiselect: List,
  textarea: Type
}

const fieldTypeLabels = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  boolean: 'True/False',
  select: 'Dropdown',
  multiselect: 'Multi-Select',
  textarea: 'Long Text'
}

function CustomFieldRow({ 
  field, 
  onEdit, 
  onDelete, 
  onToggle 
}: { 
  field: CustomField
  onEdit: (field: CustomField) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isActive: boolean) => void
}) {
  const Icon = fieldTypeIcons[field.type]

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{field.label}</div>
            <div className="text-sm text-muted-foreground">{field.name}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {fieldTypeLabels[field.type]}
        </Badge>
      </TableCell>
      <TableCell>
        {field.required ? (
          <Badge variant="destructive" className="text-xs">
            Required
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Optional
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Switch
          checked={field.isActive}
          onCheckedChange={(checked) => onToggle(field.id, checked)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(field)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(field.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function CustomFieldForm({ 
  field, 
  onSave, 
  onCancel 
}: { 
  field?: CustomField
  onSave: (field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: field?.name || '',
    label: field?.label || '',
    type: field?.type || 'text' as const,
    required: field?.required || false,
    defaultValue: field?.defaultValue || '',
    options: field?.options?.join('\n') || '',
    description: field?.description || '',
    isActive: field?.isActive ?? true,
    order: field?.order || 1
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const fieldData = {
      ...formData,
      name: formData.name || formData.label.toLowerCase().replace(/\s+/g, '_'),
      options: formData.options ? formData.options.split('\n').filter(Boolean) : undefined
    }

    onSave(fieldData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="label">Field Label</Label>
          <Input
            id="label"
            value={formData.label}
            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
            placeholder="e.g., Company Size"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Field Name (Internal)</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., company_size"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="type">Field Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="boolean">True/False</SelectItem>
            <SelectItem value="select">Dropdown</SelectItem>
            <SelectItem value="multiselect">Multi-Select</SelectItem>
            <SelectItem value="textarea">Long Text</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(formData.type === 'select' || formData.type === 'multiselect') && (
        <div>
          <Label htmlFor="options">Options (one per line)</Label>
          <Textarea
            id="options"
            value={formData.options}
            onChange={(e) => setFormData(prev => ({ ...prev, options: e.target.value }))}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            rows={4}
          />
        </div>
      )}

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this field is for"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="required"
            checked={formData.required}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
          />
          <Label htmlFor="required">Required field</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Field
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function CustomFields() {
  const [fields, setFields] = useState<CustomField[]>(defaultCustomFields)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCreateField = (fieldData: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newField: CustomField = {
      ...fieldData,
      id: `field_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setFields([...fields, newField])
    setShowCreateDialog(false)

    toast({
      title: "Success",
      description: "Custom field created successfully",
    })
  }

  const handleEditField = (fieldData: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingField) return

    const updatedField: CustomField = {
      ...fieldData,
      id: editingField.id,
      createdAt: editingField.createdAt,
      updatedAt: new Date()
    }

    setFields(fields.map(f => f.id === editingField.id ? updatedField : f))
    setEditingField(null)

    toast({
      title: "Success",
      description: "Custom field updated successfully",
    })
  }

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
    
    toast({
      title: "Success",
      description: "Custom field deleted successfully",
    })
  }

  const handleToggleField = (id: string, isActive: boolean) => {
    setFields(fields.map(f => 
      f.id === id ? { ...f, isActive, updatedAt: new Date() } : f
    ))
  }

  const activeFieldsCount = fields.filter(f => f.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Custom Fields</h2>
          <p className="text-muted-foreground">
            Customize contact data collection with additional fields
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {activeFieldsCount} active field{activeFieldsCount !== 1 ? 's' : ''}
          </Badge>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Field</DialogTitle>
                <DialogDescription>
                  Add a new field to collect additional contact information
                </DialogDescription>
              </DialogHeader>
              <CustomFieldForm
                onSave={handleCreateField}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Custom Fields</CardTitle>
          <CardDescription>
            Configure additional fields to capture specific contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <CustomFieldRow
                  key={field.id}
                  field={field}
                  onEdit={setEditingField}
                  onDelete={handleDeleteField}
                  onToggle={handleToggleField}
                />
              ))}
            </TableBody>
          </Table>

          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom fields created yet</p>
              <p className="text-sm">Click "Add Field" to create your first custom field</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Field Dialog */}
      {editingField && (
        <Dialog open={!!editingField} onOpenChange={() => setEditingField(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Custom Field</DialogTitle>
              <DialogDescription>
                Modify the field configuration and settings
              </DialogDescription>
            </DialogHeader>
            <CustomFieldForm
              field={editingField}
              onSave={handleEditField}
              onCancel={() => setEditingField(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
