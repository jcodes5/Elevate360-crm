"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search,
  Filter,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  UserPlus,
  Settings,
  Calendar,
  Activity,
  Key,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Eye,
  EyeOff,
  Download,
  Upload
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  lastLogin?: Date
  createdAt: Date
  permissions: string[]
  isEmailVerified: boolean
  isTwoFactorEnabled: boolean
  loginAttempts: number
  lastActivity?: Date
  directReports?: string[]
  managerId?: string
  timezone: string
  language: string
  customFields: Record<string, any>
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isCustom: boolean
  userCount: number
  color: string
}

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access and management',
    permissions: ['all'],
    isCustom: false,
    userCount: 2,
    color: '#EF4444'
  },
  {
    id: 'manager',
    name: 'Sales Manager',
    description: 'Manage team and view all sales data',
    permissions: ['sales.view', 'sales.edit', 'team.manage', 'reports.view'],
    isCustom: false,
    userCount: 3,
    color: '#3B82F6'
  },
  {
    id: 'sales_rep',
    name: 'Sales Representative',
    description: 'Manage own contacts and deals',
    permissions: ['contacts.view', 'contacts.edit', 'deals.view', 'deals.edit'],
    isCustom: false,
    userCount: 12,
    color: '#10B981'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Manage campaigns and marketing data',
    permissions: ['campaigns.view', 'campaigns.edit', 'contacts.view', 'analytics.view'],
    isCustom: false,
    userCount: 4,
    color: '#F59E0B'
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Handle customer inquiries and tickets',
    permissions: ['tickets.view', 'tickets.edit', 'contacts.view', 'kb.view'],
    isCustom: false,
    userCount: 6,
    color: '#8B5CF6'
  }
]

const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    phone: '+2348012345678',
    role: 'admin',
    department: 'Management',
    status: 'active',
    lastLogin: new Date('2024-01-20T10:30:00'),
    createdAt: new Date('2023-12-01'),
    permissions: ['all'],
    isEmailVerified: true,
    isTwoFactorEnabled: true,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-20T15:45:00'),
    timezone: 'Africa/Lagos',
    language: 'en',
    customFields: {}
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+2348087654321',
    role: 'manager',
    department: 'Sales',
    status: 'active',
    lastLogin: new Date('2024-01-20T09:15:00'),
    createdAt: new Date('2023-11-15'),
    permissions: ['sales.view', 'sales.edit', 'team.manage', 'reports.view'],
    isEmailVerified: true,
    isTwoFactorEnabled: false,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-20T14:20:00'),
    timezone: 'Africa/Lagos',
    language: 'en',
    customFields: {}
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike.davis@company.com',
    role: 'sales_rep',
    department: 'Sales',
    status: 'active',
    lastLogin: new Date('2024-01-19T16:45:00'),
    createdAt: new Date('2024-01-05'),
    permissions: ['contacts.view', 'contacts.edit', 'deals.view', 'deals.edit'],
    isEmailVerified: true,
    isTwoFactorEnabled: false,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-19T17:30:00'),
    timezone: 'Africa/Lagos',
    language: 'en',
    customFields: {}
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@company.com',
    role: 'marketing',
    department: 'Marketing',
    status: 'pending',
    createdAt: new Date('2024-01-18'),
    permissions: ['campaigns.view', 'campaigns.edit', 'contacts.view', 'analytics.view'],
    isEmailVerified: false,
    isTwoFactorEnabled: false,
    loginAttempts: 0,
    timezone: 'Africa/Lagos',
    language: 'en',
    customFields: {}
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@company.com',
    role: 'support',
    department: 'Customer Success',
    status: 'suspended',
    lastLogin: new Date('2024-01-10T11:20:00'),
    createdAt: new Date('2023-10-20'),
    permissions: ['tickets.view', 'tickets.edit', 'contacts.view', 'kb.view'],
    isEmailVerified: true,
    isTwoFactorEnabled: false,
    loginAttempts: 3,
    lastActivity: new Date('2024-01-10T12:00:00'),
    timezone: 'Africa/Lagos',
    language: 'en',
    customFields: {}
  }
]

const departments = [
  'Management',
  'Sales',
  'Marketing', 
  'Customer Success',
  'Operations',
  'Finance',
  'Human Resources',
  'IT'
]

const timezones = [
  'Africa/Lagos',
  'Africa/Cairo',
  'Europe/London',
  'America/New_York',
  'Asia/Tokyo'
]

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }
]

function UserStatusBadge({ status }: { status: User['status'] }) {
  const config = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Inactive' },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    suspended: { color: 'bg-red-100 text-red-800', icon: Ban, label: 'Suspended' }
  }

  const { color, icon: Icon, label } = config[status]

  return (
    <Badge className={color}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}

function UserForm({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user?: User
  onSave: (userData: Partial<User>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'sales_rep',
    department: user?.department || 'Sales',
    status: user?.status || 'active',
    timezone: user?.timezone || 'Africa/Lagos',
    language: user?.language || 'en',
    isTwoFactorEnabled: user?.isTwoFactorEnabled || false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="+234..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {defaultRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select 
            value={formData.department} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select 
            value={formData.timezone} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Select 
            value={formData.language} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {user && (
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="twoFactor"
          checked={formData.isTwoFactorEnabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTwoFactorEnabled: checked }))}
        />
        <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Button type="submit">
          {user ? 'Update User' : 'Create User'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function BulkActions({ 
  selectedUsers, 
  onBulkAction, 
  onClearSelection 
}: {
  selectedUsers: string[]
  onBulkAction: (action: string, userIds: string[]) => void
  onClearSelection: () => void
}) {
  if (selectedUsers.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary text-primary-foreground p-4 rounded-lg flex items-center justify-between"
    >
      <div className="flex items-center space-x-4">
        <span className="font-medium">
          {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onBulkAction('activate', selectedUsers)}
          >
            Activate
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onBulkAction('deactivate', selectedUsers)}
          >
            Deactivate
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onBulkAction('export', selectedUsers)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear Selection
      </Button>
    </motion.div>
  )
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = filterRole === "all" || user.role === filterRole
      const matchesStatus = filterStatus === "all" || user.status === filterStatus
      const matchesDepartment = filterDepartment === "all" || user.department === filterDepartment

      return matchesSearch && matchesRole && matchesStatus && matchesDepartment
    })
  }, [users, searchTerm, filterRole, filterStatus, filterDepartment])

  const handleCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      permissions: defaultRoles.find(r => r.id === userData.role)?.permissions || [],
      isEmailVerified: false,
      loginAttempts: 0,
      customFields: {}
    } as User

    setUsers([...users, newUser])
    setShowCreateDialog(false)

    toast({
      title: "Success",
      description: "User created successfully. An invitation email has been sent.",
    })
  }

  const handleUpdateUser = (userData: Partial<User>) => {
    if (!editingUser) return

    const updatedUser = { ...editingUser, ...userData }
    setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u))
    setEditingUser(null)

    toast({
      title: "Success",
      description: "User updated successfully",
    })
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId))
    
    toast({
      title: "Success",
      description: "User deleted successfully",
    })
  }

  const handleBulkAction = (action: string, userIds: string[]) => {
    switch (action) {
      case 'activate':
        setUsers(users.map(u => 
          userIds.includes(u.id) ? { ...u, status: 'active' } : u
        ))
        toast({ title: "Success", description: `${userIds.length} users activated` })
        break
      case 'deactivate':
        setUsers(users.map(u => 
          userIds.includes(u.id) ? { ...u, status: 'inactive' } : u
        ))
        toast({ title: "Success", description: `${userIds.length} users deactivated` })
        break
      case 'export':
        toast({ title: "Success", description: "User data exported successfully" })
        break
    }
    setSelectedUsers([])
  }

  const handleUserSelection = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const getActivityStatus = (lastActivity?: Date) => {
    if (!lastActivity) return 'Never'
    
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Active now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`
    return lastActivity.toLocaleDateString()
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowBulkImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Users
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedUsers={selectedUsers}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedUsers([])}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-8"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {defaultRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {user.isEmailVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {user.isTwoFactorEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              2FA
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" style={{ 
                      backgroundColor: defaultRoles.find(r => r.id === user.role)?.color + '20',
                      borderColor: defaultRoles.find(r => r.id === user.role)?.color
                    }}>
                      {defaultRoles.find(r => r.id === user.role)?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getActivityStatus(user.lastActivity)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Invitation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new team member account and send them an invitation
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSave={handleCreateUser}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={editingUser}
              onSave={handleUpdateUser}
              onCancel={() => setEditingUser(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
