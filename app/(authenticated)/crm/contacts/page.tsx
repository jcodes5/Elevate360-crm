"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MessageSquare, Edit, Trash2, Star, Tag, Users, Sliders, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { AddContactModal } from "@/components/modals/add-contact-modal"
import { useContactDashboard } from "@/hooks/use-contact-dashboard"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import type { ContactDashboardData } from "@/lib/models"
import { ContactService } from "@/services/contact-service"

import type { Contact } from "@/types"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function ContactsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { data: dashboardData, isLoading } = useContactDashboard()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Add state for filters
  const [filters, setFilters] = useState<any[]>([])
  
  // Fetch contacts from database
  useEffect(() => {
    let isMounted = true;
    
    const fetchContacts = async (retryCount = 3) => {
      for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
          if (!isMounted) return;
          
          console.log(`Fetching contacts from database (attempt ${attempt})`);
          setLoading(true)
          setError(null)
          
          const fetchedContacts = await ContactService.getAllContacts()
          
          if (!isMounted) return;
          
          setContacts(fetchedContacts)
          console.log("Contacts fetched successfully:", fetchedContacts);
          return fetchedContacts;
        } catch (error) {
          console.error(`Error fetching contacts on attempt ${attempt}:`, error)
          
          if (attempt === retryCount) {
            if (!isMounted) return;
            setError("Failed to load contacts. Please try again.")
            setLoading(false)
            return null;
          }
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    fetchContacts()

    return () => {
      isMounted = false;
    }
  }, [])

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !searchQuery || 
        contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery)
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(contact.status)
      
      // Apply filters from AdvancedFilters component
      const matchesFilters = filters.length === 0 || filters.every(filter => {
        // This is a simplified filter check - in a real app, you would implement proper filtering logic
        return true
      })
      
      return matchesSearch && matchesStatus && matchesFilters
    })
  }, [searchQuery, statusFilter, filters, contacts])

  const toggleStatusFilter = (status: string) => {
    // Convert display name to the format used in the data model
    const dataModelStatus = status.toLowerCase();
    
    setStatusFilter(prev => 
      prev.includes(dataModelStatus) 
        ? prev.filter(s => s !== dataModelStatus) 
        : [...prev, dataModelStatus]
    )
  }

  // Prepare data for charts
  const statusData = dashboardData ? [
    { name: 'Leads', value: dashboardData.byStatus?.lead || 0 },
    { name: 'Prospects', value: dashboardData.byStatus?.prospect || 0 },
    { name: 'Customers', value: dashboardData.byStatus?.customer || 0 },
    { name: 'Inactive', value: dashboardData.byStatus?.inactive || 0 },
    { name: 'Lost', value: dashboardData.byStatus?.lost || 0 },
  ] : []

  const sourceData = dashboardData ? Object.entries(dashboardData.bySource || {})
    .map(([source, count]) => ({ name: source, value: count }))
    .slice(0, 5) : []

  // Function to refresh contacts with retry logic
  const refreshContacts = useCallback(async () => {
    let isMounted = true;
    
    try {
      console.log("Refreshing contacts");
      setLoading(true)
      setError(null)
      
      const fetchedContacts = await ContactService.getAllContacts()
      
      if (isMounted) {
        setContacts(fetchedContacts)
        console.log("Contacts refreshed successfully:", fetchedContacts);
      }
    } catch (error) {
      console.error("Error refreshing contacts:", error)
      if (isMounted) {
        setError("Failed to refresh contacts. Please try again.")
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
    
    return () => {
      isMounted = false;
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your customer contacts and relationships</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Dashboard Stats */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.total?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{dashboardData.newThisMonth || 0} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.conversion?.overall || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.conversion?.overall ? (dashboardData.conversion.overall > 0 ? '+' : '') : ''}{(dashboardData.conversion?.overall || 0) - 20}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Lead Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.averageLeadScore || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{(dashboardData.averageLeadScore || 0) - 65} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.engagement?.withActiveDeals || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.engagement?.withActiveDeals ? (dashboardData.engagement.withActiveDeals > 0 ? '+' : '') : ''}{(dashboardData.engagement?.withActiveDeals || 0) - 5} from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="h-80">
            <CardHeader>
              <CardTitle>Contact Distribution by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="h-80">
            <CardHeader>
              <CardTitle>Top Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sourceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8 md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-4">
                    <AdvancedFilters 
                      onFiltersChange={setFilters}
                      onSegmentSelect={(segment) => console.log('Segment selected:', segment)}
                      contacts={contacts}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-red-500 mb-2">Error: {error}</div>
              <Button onClick={refreshContacts}>Retry</Button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading contacts...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lead Score</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.firstName}+${contact.lastName}`} />
                          <AvatarFallback>{contact.firstName.charAt(0)}{contact.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-muted-foreground">{contact.company}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{contact.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{contact.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        contact.status === 'customer' ? 'default' :
                        contact.status === 'PROSPECT' ? 'secondary' :
                        'outline'
                      }>
                        {contact.status === 'PROSPECT' ? 'Prospect' :
                         contact.status.charAt(0).toUpperCase() + contact.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-500" />
                        <span>{contact.leadScore}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
          )}
        </CardContent>
      </Card>

      <AddContactModal 
        open={isAddModalOpen} 
        onOpenChange={(open) => {
          setIsAddModalOpen(open)
          if (!open) {
            // Refresh contacts when modal is closed
            refreshContacts()
          }
        }} 
      />
    </div>
  )
}