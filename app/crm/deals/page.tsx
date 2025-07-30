"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { MainLayout } from "@/components/layout/main-layout"
import { formatCurrency } from "@/lib/utils"
import type { Deal } from "@/types"

// Mock data
const mockDeals: Deal[] = [
  {
    id: "1",
    title: "Website Redesign - ABC Corp",
    value: 2500000,
    currency: "NGN",
    contactId: "1",
    stageId: "stage-2",
    pipelineId: "pipeline-1",
    assignedTo: "agent-1",
    probability: 75,
    expectedCloseDate: new Date("2024-02-15"),
    notes: "Client is very interested, waiting for final approval from board",
    organizationId: "org-1",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "2",
    title: "Digital Marketing Package - XYZ Ltd",
    value: 1800000,
    currency: "NGN",
    contactId: "2",
    stageId: "stage-3",
    pipelineId: "pipeline-1",
    assignedTo: "agent-2",
    probability: 90,
    expectedCloseDate: new Date("2024-02-10"),
    notes: "Contract sent, expecting signature this week",
    organizationId: "org-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-26"),
  },
  {
    id: "3",
    title: "E-commerce Platform - StartupCo",
    value: 4200000,
    currency: "NGN",
    contactId: "3",
    stageId: "stage-1",
    pipelineId: "pipeline-1",
    assignedTo: "agent-1",
    probability: 45,
    expectedCloseDate: new Date("2024-03-01"),
    notes: "Initial discussion completed, preparing proposal",
    organizationId: "org-1",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-24"),
  },
]

const stages = [
  { id: "stage-1", name: "Qualification", color: "bg-yellow-100 text-yellow-800" },
  { id: "stage-2", name: "Proposal", color: "bg-blue-100 text-blue-800" },
  { id: "stage-3", name: "Negotiation", color: "bg-purple-100 text-purple-800" },
  { id: "stage-4", name: "Closed Won", color: "bg-green-100 text-green-800" },
  { id: "stage-5", name: "Closed Lost", color: "bg-red-100 text-red-800" },
]

export default function DealsPage() {
  const [deals, setDeals] = useState(mockDeals)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStage, setSelectedStage] = useState<string>("all")

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = selectedStage === "all" || deal.stageId === selectedStage
    return matchesSearch && matchesStage
  })

  const getStageInfo = (stageId: string) => {
    return stages.find((stage) => stage.id === stageId) || stages[0]
  }

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const avgDealSize = totalValue / deals.length
  const winRate = (deals.filter((d) => d.stageId === "stage-4").length / deals.length) * 100

  return (
    <MainLayout
      breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Deals" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline">View Pipeline</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
            <p className="text-muted-foreground">Track your sales opportunities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deals.length}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">3 new</span> this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgDealSize)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.3%</span> from last month
              </p>
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
                      Stage: {selectedStage === "all" ? "All" : getStageInfo(selectedStage).name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedStage("all")}>All Stages</DropdownMenuItem>
                    {stages.map((stage) => (
                      <DropdownMenuItem key={stage.id} onClick={() => setSelectedStage(stage.id)}>
                        {stage.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button variant="outline">View Pipeline</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Expected Close</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal) => {
                  const stage = getStageInfo(deal.stageId)
                  return (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{deal.title}</div>
                          <div className="text-sm text-gray-500">{deal.notes.substring(0, 50)}...</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(deal.value)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stage.color}>{stage.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{deal.probability}%</div>
                          <Progress value={deal.probability} className="w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">JD</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">John Doe</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{deal.expectedCloseDate?.toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                            <DropdownMenuItem>Move Stage</DropdownMenuItem>
                            <DropdownMenuItem>Add Note</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete Deal</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
