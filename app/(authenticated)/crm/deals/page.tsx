"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, DollarSign, Calendar, User, Target, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Deal, PipelineStage } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Mock data for pipeline stages
const mockPipelineStages: PipelineStage[] = [
  {
    id: "1",
    name: "Prospecting",
    order: 1,
    color: "#3b82f6",
    probability: 10,
    deals: []
  },
  {
    id: "2", 
    name: "Qualification",
    order: 2,
    color: "#8b5cf6",
    probability: 25,
    deals: []
  },
  {
    id: "3",
    name: "Proposal",
    order: 3,
    color: "#f59e0b",
    probability: 50,
    deals: []
  },
  {
    id: "4",
    name: "Negotiation", 
    order: 4,
    color: "#ef4444",
    probability: 75,
    deals: []
  },
  {
    id: "5",
    name: "Closed Won",
    order: 5,
    color: "#10b981",
    probability: 100,
    deals: []
  }
]

// Mock deals data
const mockDeals: Deal[] = [
  {
    id: "1",
    title: "Lagos State Government Portal",
    value: 1500000,
    currency: "NGN",
    contactId: "1",
    stageId: "3",
    pipelineId: "default",
    assignedTo: "agent-1",
    probability: 50,
    expectedCloseDate: new Date("2024-02-15"),
    notes: "Large government contract for digital transformation",
    organizationId: "org-1",
    activities: [],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "2", 
    title: "Fintech Mobile App",
    value: 800000,
    currency: "NGN",
    contactId: "2",
    stageId: "2",
    pipelineId: "default",
    assignedTo: "agent-2",
    probability: 25,
    expectedCloseDate: new Date("2024-03-01"),
    notes: "Mobile banking application for startup",
    organizationId: "org-1",
    activities: [],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-22"),
  },
  {
    id: "3",
    title: "E-commerce Platform",
    value: 2200000,
    currency: "NGN", 
    contactId: "3",
    stageId: "4",
    pipelineId: "default",
    assignedTo: "agent-1",
    probability: 75,
    expectedCloseDate: new Date("2024-02-28"),
    notes: "Full e-commerce solution with payment integration",
    organizationId: "org-1",
    activities: [],
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "4",
    title: "Corporate Website Redesign",
    value: 450000,
    currency: "NGN",
    contactId: "1",
    stageId: "1",
    pipelineId: "default", 
    assignedTo: "agent-3",
    probability: 10,
    expectedCloseDate: new Date("2024-04-15"),
    notes: "Website redesign for manufacturing company",
    organizationId: "org-1",
    activities: [],
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-21"),
  },
  {
    id: "5",
    title: "CRM System Implementation",
    value: 650000,
    currency: "NGN",
    contactId: "2",
    stageId: "5",
    pipelineId: "default",
    assignedTo: "agent-2",
    probability: 100,
    actualCloseDate: new Date("2024-01-18"),
    notes: "Successfully implemented CRM for client",
    organizationId: "org-1",
    activities: [],
    createdAt: new Date("2023-12-15"),
    updatedAt: new Date("2024-01-18"),
  }
]

export default function DealsPage() {
  const [deals, setDeals] = useState(mockDeals)
  const [stages] = useState(mockPipelineStages)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStage, setSelectedStage] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline")
  const [showCreateDeal, setShowCreateDeal] = useState(false)
  const { toast } = useToast()

  // Organize deals by stage
  const dealsByStage = stages.map(stage => ({
    ...stage,
    deals: deals.filter(deal => deal.stageId === stage.id)
  }))

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.value.toString().includes(searchTerm)
    const matchesStage = selectedStage === "all" || deal.stageId === selectedStage
    return matchesSearch && matchesStage
  })

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const wonDeals = deals.filter(deal => deal.stageId === "5")
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0)
  const averageDealSize = deals.length > 0 ? totalValue / deals.length : 0

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId)
    return stage?.color || "#6b7280"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Manage your sales pipeline and track deal progress</p>
        </div>
        <Button onClick={() => setShowCreateDeal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Total Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Across {deals.length} deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Won This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wonValue)}</div>
            <p className="text-xs text-muted-foreground">{wonDeals.length} deals closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Average Deal Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDealSize)}</div>
            <p className="text-xs text-muted-foreground">Per deal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Close rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Stage: {selectedStage === "all" ? "All" : stages.find(s => s.id === selectedStage)?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedStage("all")}>All Stages</DropdownMenuItem>
                  {stages.map(stage => (
                    <DropdownMenuItem key={stage.id} onClick={() => setSelectedStage(stage.id)}>
                      {stage.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "pipeline" | "table")}>
                <TabsList>
                  <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "pipeline" ? (
            <div className="grid grid-cols-5 gap-4">
              {dealsByStage.map((stage) => (
                <div key={stage.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium" style={{ color: stage.color }}>
                      {stage.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {stage.deals.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {stage.deals.map((deal) => (
                      <Card key={deal.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm leading-tight">{deal.title}</h4>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(deal.value)}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{deal.probability}% chance</span>
                            <Calendar className="h-3 w-3" />
                          </div>
                          {deal.expectedCloseDate && (
                            <div className="text-xs text-muted-foreground">
                              Close: {deal.expectedCloseDate.toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {deal.assignedTo?.slice(-1)}
                              </AvatarFallback>
                            </Avatar>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Deal
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Move Stage
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="border-t pt-2">
                    <div className="text-xs text-muted-foreground">
                      Total: {formatCurrency(stage.deals.reduce((sum, deal) => sum + deal.value, 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeals.map((deal) => (
                <Card key={deal.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{deal.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3" />
                          {formatCurrency(deal.value)}
                        </span>
                        <span className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {deal.assignedTo}
                        </span>
                        {deal.expectedCloseDate && (
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {deal.expectedCloseDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        className="text-white"
                        style={{ backgroundColor: getStageColor(deal.stageId) }}
                      >
                        {stages.find(s => s.id === deal.stageId)?.name}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">{deal.probability}%</div>
                        <Progress value={deal.probability} className="w-16 h-2" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Deal
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Move Stage
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Deal Modal */}
      <Dialog open={showCreateDeal} onOpenChange={setShowCreateDeal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
            <DialogDescription>
              Add a new deal to your sales pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="title">Deal Title</Label>
              <Input id="title" placeholder="Enter deal title" />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="value">Deal Value (NGN)</Label>
              <Input id="value" type="number" placeholder="0" />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="stage">Pipeline Stage</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="closeDate">Expected Close Date</Label>
              <Input id="closeDate" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any notes about this deal..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDeal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Deal Created",
                description: "New deal has been added to your pipeline.",
              })
              setShowCreateDeal(false)
            }}>
              Create Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
