"use client"

import { useState, useMemo } from "react"
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MessageSquare, Edit, Trash2, Star, Tag, Users, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdvancedFilters } from "@/components/contacts/advanced-filters"

import type { Contact } from "@/types"

// Mock data
const mockContacts: Contact[] = [
  {
    id: "1",
    firstName: "Adebayo",
    lastName: "Johnson",
    email: "adebayo.johnson@email.com",
    phone: "+2348012345678",
    whatsappNumber: "+2348012345678",
    tags: ["VIP", "Lagos"],
    leadScore: 85,
    status: "customer",
    source: "Website",
    assignedTo: "agent-1",
    organizationId: "org-1",
    customFields: {},
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    firstName: "Fatima",
    lastName: "Abdullahi",
    email: "fatima.abdullahi@email.com",
    phone: "+2348087654321",
    whatsappNumber: "+2348087654321",
    tags: ["Prospect", "Abuja"],
    leadScore: 72,
    status: "PROSPECT",
    source: "Social Media",
    assignedTo: "agent-2",
    organizationId: "org-1",
    customFields: {},
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-22"),
  },
  {
    id: "3",
    firstName: "Chinedu",
    lastName: "Okafor",
    email: "chinedu.okafor@email.com",
    phone: "+2348098765432",
    tags: ["Lead", "Port Harcourt"],
    leadScore: 45,
    status: "lead",
    source: "Referral",
    assignedTo: "agent-1",
    organizationId: "org-1",
    customFields: {},
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-21"),
  },
]

export default function ContactsPage() {
  const [contacts, setContacts] = useState(mockContacts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)

      const matchesStatus = selectedStatus === "all" || contact.status === selectedStatus
      const matchesAdvancedFilters = applyAdvancedFilters(contact, activeFilters)

      return matchesSearch && matchesStatus && matchesAdvancedFilters
    })
  }, [contacts, searchTerm, selectedStatus, activeFilters])

  const handleFiltersChange = (filters: any[]) => {
    setActiveFilters(filters)
  }

  const handleSegmentSelect = (segment: any) => {
    setSelectedSegment(segment)
    setActiveFilters(segment.conditions)
    setShowAdvancedFilters(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "customer":
        return "bg-green-100 text-green-800"
      case "prospect":
        return "bg-blue-100 text-blue-800"
      case "lead":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">Manage your customer relationships</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {activeFilters.length > 0 ? 'Filtered Contacts' : 'Total Contacts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredContacts.length}</div>
              {activeFilters.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  of {contacts.length} total
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredContacts.filter((c) => c.status === "customer").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredContacts.filter((c) => c.status === "prospect").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredContacts.filter((c) => c.status === "lead").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sliders className="h-5 w-5" />
                    <CardTitle>Advanced Filters & Segments</CardTitle>
                    {activeFilters.length > 0 && (
                      <Badge variant="secondary">
                        {activeFilters.length} active
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AdvancedFilters
              onFiltersChange={handleFiltersChange}
              onSegmentSelect={handleSegmentSelect}
              contacts={contacts}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80 pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Status: {selectedStatus === "all" ? "All" : selectedStatus}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All Statuses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("customer")}>Customers</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("prospect")}>Prospects</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("lead")}>Leads</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("inactive")}>Inactive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lead Score</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.firstName} ${contact.lastName}`}
                          />
                          <AvatarFallback>
                            {contact.firstName[0]}
                            {contact.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                          <div className="text-sm text-gray-500">{contact.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`font-medium ${getLeadScoreColor(contact.leadScore)}`}>{contact.leadScore}</div>
                        <div className="h-2 w-16 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              contact.leadScore >= 80
                                ? "bg-green-500"
                                : contact.leadScore >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${contact.leadScore}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{contact.source}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{contact.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="mr-2 h-4 w-4" />
                              Add to Favorites
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="mr-2 h-4 w-4" />
                              Manage Tags
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <AddContactModal open={showAddContact} onOpenChange={setShowAddContact} />
      </div>
      
  )
}
