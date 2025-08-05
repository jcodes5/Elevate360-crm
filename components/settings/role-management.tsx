"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Users,
  Eye,
  EyeOff,
  Save,
  Copy,
  Settings,
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface Permission {
  id: string
  name: string
  description: string
  category: string
  isSystem: boolean
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isCustom: boolean
  userCount: number
  color: string
  isSystem?: boolean
  createdAt: Date
  updatedAt: Date
}

// System permissions organized by category
const systemPermissions: Permission[] = [
  // Contacts & CRM
  { id: 'contacts.view', name: 'View Contacts', description: 'View contact information', category: 'Contacts', isSystem: true },
  { id: 'contacts.create', name: 'Create Contacts', description: 'Add new contacts', category: 'Contacts', isSystem: true },
  { id: 'contacts.edit', name: 'Edit Contacts', description: 'Modify contact information', category: 'Contacts', isSystem: true },
  { id: 'contacts.delete', name: 'Delete Contacts', description: 'Remove contacts', category: 'Contacts', isSystem: true },
  { id: 'contacts.export', name: 'Export Contacts', description: 'Export contact data', category: 'Contacts', isSystem: true },
  { id: 'contacts.import', name: 'Import Contacts', description: 'Import contact data', category: 'Contacts', isSystem: true },

  // Deals & Sales
  { id: 'deals.view', name: 'View Deals', description: 'View deal information', category: 'Sales', isSystem: true },
  { id: 'deals.create', name: 'Create Deals', description: 'Create new deals', category: 'Sales', isSystem: true },
  { id: 'deals.edit', name: 'Edit Deals', description: 'Modify deal information', category: 'Sales', isSystem: true },
  { id: 'deals.delete', name: 'Delete Deals', description: 'Remove deals', category: 'Sales', isSystem: true },
  { id: 'deals.forecast', name: 'Sales Forecast', description: 'Access sales forecasting', category: 'Sales', isSystem: true },

  // Marketing & Campaigns
  { id: 'campaigns.view', name: 'View Campaigns', description: 'View marketing campaigns', category: 'Marketing', isSystem: true },
  { id: 'campaigns.create', name: 'Create Campaigns', description: 'Create marketing campaigns', category: 'Marketing', isSystem: true },
  { id: 'campaigns.edit', name: 'Edit Campaigns', description: 'Modify campaigns', category: 'Marketing', isSystem: true },
  { id: 'campaigns.delete', name: 'Delete Campaigns', description: 'Remove campaigns', category: 'Marketing', isSystem: true },
  { id: 'campaigns.send', name: 'Send Campaigns', description: 'Send marketing campaigns', category: 'Marketing', isSystem: true },

  // Analytics & Reports
  { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics dashboard', category: 'Analytics', isSystem: true },
  { id: 'reports.view', name: 'View Reports', description: 'View standard reports', category: 'Analytics', isSystem: true },
  { id: 'reports.create', name: 'Create Reports', description: 'Create custom reports', category: 'Analytics', isSystem: true },
  { id: 'reports.export', name: 'Export Reports', description: 'Export report data', category: 'Analytics', isSystem: true },

  // Automation & Workflows
  { id: 'workflows.view', name: 'View Workflows', description: 'View automation workflows', category: 'Automation', isSystem: true },
  { id: 'workflows.create', name: 'Create Workflows', description: 'Create automation workflows', category: 'Automation', isSystem: true },
  { id: 'workflows.edit', name: 'Edit Workflows', description: 'Modify workflows', category: 'Automation', isSystem: true },
  { id: 'workflows.delete', name: 'Delete Workflows', description: 'Remove workflows', category: 'Automation', isSystem: true },

  // Customer Support
  { id: 'tickets.view', name: 'View Tickets', description: 'View support tickets', category: 'Support', isSystem: true },
  { id: 'tickets.create', name: 'Create Tickets', description: 'Create support tickets', category: 'Support', isSystem: true },
  { id: 'tickets.edit', name: 'Edit Tickets', description: 'Modify support tickets', category: 'Support', isSystem: true },
  { id: 'tickets.assign', name: 'Assign Tickets', description: 'Assign tickets to agents', category: 'Support', isSystem: true },
  { id: 'kb.view', name: 'View Knowledge Base', description: 'Access knowledge base', category: 'Support', isSystem: true },
  { id: 'kb.edit', name: 'Edit Knowledge Base', description: 'Modify knowledge base articles', category: 'Support', isSystem: true },

  // Team & Management
  { id: 'team.view', name: 'View Team', description: 'View team members', category: 'Management', isSystem: true },
  { id: 'team.manage', name: 'Manage Team', description: 'Manage team members', category: 'Management', isSystem: true },
  { id: 'team.performance', name: 'Team Performance', description: 'View team performance metrics', category: 'Management', isSystem: true },

  // System Administration
  { id: 'admin.users', name: 'User Management', description: 'Manage system users', category: 'Administration', isSystem: true },
  { id: 'admin.roles', name: 'Role Management', description: 'Manage roles and permissions', category: 'Administration', isSystem: true },
  { id: 'admin.settings', name: 'System Settings', description: 'Configure system settings', category: 'Administration', isSystem: true },
  { id: 'admin.integrations', name: 'Integrations', description: 'Manage integrations', category: 'Administration', isSystem: true },
  { id: 'admin.billing', name: 'Billing Management', description: 'Manage billing and subscriptions', category: 'Administration', isSystem: true },
]

const defaultRoles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: systemPermissions.map(p => p.id),
    isCustom: false,
    isSystem: true,
    userCount: 1,
    color: '#DC2626',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'System administration without billing access',
    permissions: systemPermissions.filter(p => !p.id.includes('billing')).map(p => p.id),
    isCustom: false,
    userCount: 2,
    color: '#EF4444',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Full sales access with team management',
    permissions: [
      'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.export',
      'deals.view', 'deals.create', 'deals.edit', 'deals.forecast',
      'analytics.view', 'reports.view', 'reports.export',
      'team.view', 'team.manage', 'team.performance'
    ],
    isCustom: false,
    userCount: 3,
    color: '#3B82F6',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sales_rep',
    name: 'Sales Representative',
    description: 'Standard sales access for individual contributors',
    permissions: [
      'contacts.view', 'contacts.create', 'contacts.edit',
      'deals.view', 'deals.create', 'deals.edit',
      'analytics.view', 'reports.view'
    ],
    isCustom: false,
    userCount: 12,
    color: '#10B981',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'marketing',
    name: 'Marketing Team',
    description: 'Marketing and campaign management',
    permissions: [
      'contacts.view', 'contacts.export',
      'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.send',
      'workflows.view', 'workflows.create', 'workflows.edit',
      'analytics.view', 'reports.view', 'reports.export'
    ],
    isCustom: false,
    userCount: 4,
    color: '#F59E0B',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Customer support and knowledge base access',
    permissions: [
      'contacts.view', 'contacts.edit',
      'tickets.view', 'tickets.create', 'tickets.edit', 'tickets.assign',
      'kb.view', 'kb.edit',
      'analytics.view'
    ],
    isCustom: false,
    userCount: 6,
    color: '#8B5CF6',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const permissionCategories = [
  'Contacts',
  'Sales', 
  'Marketing',
  'Analytics',
  'Automation',
  'Support',
  'Management',
  'Administration'
]

function PermissionCategory({ 
  category, 
  permissions, 
  selectedPermissions, 
  onPermissionToggle 
}: {
  category: string
  permissions: Permission[]
  selectedPermissions: string[]
  onPermissionToggle: (permissionId: string) => void
}) {
  const categoryPermissions = permissions.filter(p => p.category === category)
  const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length
  const totalCount = categoryPermissions.length

  const toggleAll = () => {
    const allSelected = selectedCount === totalCount
    categoryPermissions.forEach(permission => {
      if (allSelected && selectedPermissions.includes(permission.id)) {
        onPermissionToggle(permission.id)
      } else if (!allSelected && !selectedPermissions.includes(permission.id)) {
        onPermissionToggle(permission.id)
      }
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{category}</CardTitle>
            <CardDescription className="text-sm">
              {selectedCount} of {totalCount} permissions selected
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAll}
          >
            {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {categoryPermissions.map((permission) => (
          <div key={permission.id} className="flex items-start space-x-3">
            <Switch
              id={permission.id}
              checked={selectedPermissions.includes(permission.id)}
              onCheckedChange={() => onPermissionToggle(permission.id)}
            />
            <div className="flex-1">
              <Label htmlFor={permission.id} className="cursor-pointer font-medium">
                {permission.name}
              </Label>
              <p className="text-sm text-muted-foreground">
                {permission.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RoleForm({ 
  role, 
  onSave, 
  onCancel 
}: { 
  role?: Role
  onSave: (roleData: Partial<Role>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    color: role?.color || '#3B82F6',
    permissions: role?.permissions || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one permission",
        variant: "destructive"
      })
      return
    }

    onSave(formData)
  }

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Role Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Senior Sales Rep"
            required
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the role and its responsibilities"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-base font-medium">Permissions</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select the permissions this role should have
        </p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {permissionCategories.map((category) => (
            <PermissionCategory
              key={category}
              category={category}
              permissions={systemPermissions}
              selectedPermissions={formData.permissions}
              onPermissionToggle={handlePermissionToggle}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {role ? 'Update Role' : 'Create Role'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const handleCreateRole = (roleData: Partial<Role>) => {
    const newRole: Role = {
      id: `role_${Date.now()}`,
      ...roleData,
      isCustom: true,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Role

    setRoles([...roles, newRole])
    setShowCreateDialog(false)

    toast({
      title: "Success",
      description: "Role created successfully",
    })
  }

  const handleUpdateRole = (roleData: Partial<Role>) => {
    if (!editingRole) return

    const updatedRole = { ...editingRole, ...roleData, updatedAt: new Date() }
    setRoles(roles.map(r => r.id === editingRole.id ? updatedRole : r))
    setEditingRole(null)

    toast({
      title: "Success",
      description: "Role updated successfully",
    })
  }

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    
    if (role?.isSystem) {
      toast({
        title: "Error",
        description: "System roles cannot be deleted",
        variant: "destructive"
      })
      return
    }

    if (role?.userCount > 0) {
      toast({
        title: "Error",
        description: "Cannot delete role with assigned users",
        variant: "destructive"
      })
      return
    }

    setRoles(roles.filter(r => r.id !== roleId))
    
    toast({
      title: "Success",
      description: "Role deleted successfully",
    })
  }

  const handleDuplicateRole = (role: Role) => {
    const duplicatedRole: Role = {
      ...role,
      id: `role_${Date.now()}`,
      name: `${role.name} (Copy)`,
      isCustom: true,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setRoles([...roles, duplicatedRole])
    
    toast({
      title: "Success",
      description: "Role duplicated successfully",
    })
  }

  const getPermissionsByCategory = (permissions: string[]) => {
    const categorizedPermissions: Record<string, string[]> = {}
    
    permissions.forEach(permissionId => {
      const permission = systemPermissions.find(p => p.id === permissionId)
      if (permission) {
        if (!categorizedPermissions[permission.category]) {
          categorizedPermissions[permission.category] = []
        }
        categorizedPermissions[permission.category].push(permission.name)
      }
    })
    
    return categorizedPermissions
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role & Permission Management</h2>
          <p className="text-muted-foreground">
            Configure roles and permissions for your team
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter(r => r.isCustom).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemPermissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users with Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4"
                  style={{ borderLeftColor: role.color }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <div>
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {role.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {role.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    )}
                    {role.isCustom && (
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Users:</span>
                  <Badge variant="secondary">{role.userCount}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Permissions:</span>
                  <Badge variant="secondary">{role.permissions.length}</Badge>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRole(role)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRole(role)}
                    disabled={role.isSystem}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateRole(role)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                    disabled={role.isSystem || role.userCount > 0}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions for your team
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            onSave={handleCreateRole}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      {editingRole && (
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Modify role permissions and settings
              </DialogDescription>
            </DialogHeader>
            <RoleForm
              role={editingRole}
              onSave={handleUpdateRole}
              onCancel={() => setEditingRole(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Role Dialog */}
      {selectedRole && (
        <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedRole.name}</DialogTitle>
              <DialogDescription>
                {selectedRole.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Users with this role</Label>
                  <div className="text-2xl font-bold">{selectedRole.userCount}</div>
                </div>
                <div>
                  <Label>Total permissions</Label>
                  <div className="text-2xl font-bold">{selectedRole.permissions.length}</div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Permissions by Category</Label>
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  {Object.entries(getPermissionsByCategory(selectedRole.permissions)).map(([category, perms]) => (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {perms.map((permission, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {permission}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
