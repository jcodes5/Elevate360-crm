"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Edit, Trash2, Eye, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MainLayout } from "@/components/layout/main-layout"
import { formatCurrency } from "@/lib/utils"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

// Mock data
const mockPipelines = [
  {
    id: "pipeline-1",
    name: "Sales Pipeline",
    isDefault: true,
    stages: [
      {
        id: "stage-1",
        name: "Lead",
        order: 1,
        color: "#EF4444",
        deals: [
          {
            id: "deal-1",
            title: "Website Redesign - ABC Corp",
            value: 2500000,
            contact: "John Doe",
            probability: 25,
          },
          {
            id: "deal-2",
            title: "Mobile App Development",
            value: 4200000,
            contact: "Jane Smith",
            probability: 30,
          },
        ],
      },
      {
        id: "stage-2",
        name: "Qualified",
        order: 2,
        color: "#F59E0B",
        deals: [
          {
            id: "deal-3",
            title: "E-commerce Platform",
            value: 3800000,
            contact: "Mike Johnson",
            probability: 50,
          },
        ],
      },
      {
        id: "stage-3",
        name: "Proposal",
        order: 3,
        color: "#3B82F6",
        deals: [
          {
            id: "deal-4",
            title: "Digital Marketing Package",
            value: 1800000,
            contact: "Sarah Wilson",
            probability: 75,
          },
          {
            id: "deal-5",
            title: "Brand Identity Design",
            value: 950000,
            contact: "David Brown",
            probability: 60,
          },
        ],
      },
      {
        id: "stage-4",
        name: "Negotiation",
        order: 4,
        color: "#8B5CF6",
        deals: [
          {
            id: "deal-6",
            title: "CRM Implementation",
            value: 5200000,
            contact: "Lisa Davis",
            probability: 85,
          },
        ],
      },
      {
        id: "stage-5",
        name: "Closed Won",
        order: 5,
        color: "#10B981",
        deals: [
          {
            id: "deal-7",
            title: "Social Media Management",
            value: 1200000,
            contact: "Tom Wilson",
            probability: 100,
          },
        ],
      },
    ],
  },
  {
    id: "pipeline-2",
    name: "Consulting Pipeline",
    isDefault: false,
    stages: [
      {
        id: "stage-6",
        name: "Initial Contact",
        order: 1,
        color: "#EF4444",
        deals: [],
      },
      {
        id: "stage-7",
        name: "Discovery Call",
        order: 2,
        color: "#F59E0B",
        deals: [],
      },
      {
        id: "stage-8",
        name: "Proposal Sent",
        order: 3,
        color: "#3B82F6",
        deals: [],
      },
      {
        id: "stage-9",
        name: "Contract Signed",
        order: 4,
        color: "#10B981",
        deals: [],
      },
    ],
  },
]

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState(mockPipelines)
  const [activePipeline, setActivePipeline] = useState(mockPipelines[0])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Find the deal being moved
    const sourceStage = activePipeline.stages.find((stage) => stage.id === source.droppableId)
    const destStage = activePipeline.stages.find((stage) => stage.id === destination.droppableId)

    if (!sourceStage || !destStage) return

    const deal = sourceStage.deals.find((d) => d.id === draggableId)
    if (!deal) return

    // Update the pipeline
    const updatedPipeline = {
      ...activePipeline,
      stages: activePipeline.stages.map((stage) => {
        if (stage.id === source.droppableId) {
          // Remove deal from source stage
          return {
            ...stage,
            deals: stage.deals.filter((d) => d.id !== draggableId),
          }
        }
        if (stage.id === destination.droppableId) {
          // Add deal to destination stage
          const newDeals = [...stage.deals]
          newDeals.splice(destination.index, 0, deal)
          return {
            ...stage,
            deals: newDeals,
          }
        }
        return stage
      }),
    }

    setActivePipeline(updatedPipeline)

    // Update pipelines array
    setPipelines((prev) => prev.map((pipeline) => (pipeline.id === activePipeline.id ? updatedPipeline : pipeline)))
  }

  const getTotalValue = (stage: any) => {
    return stage.deals.reduce((sum: number, deal: any) => sum + deal.value, 0)
  }

  const getWeightedValue = (stage: any) => {
    return stage.deals.reduce((sum: number, deal: any) => sum + (deal.value * deal.probability) / 100, 0)
  }

  return (
    <MainLayout
      breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Pipelines" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Pipeline Analytics
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Pipeline
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Pipelines</h1>
            <p className="text-muted-foreground">Manage your sales process and track deal progression</p>
          </div>
        </div>

        {/* Pipeline Selector */}
        <div className="flex items-center space-x-4">
          {pipelines.map((pipeline) => (
            <Button
              key={pipeline.id}
              variant={activePipeline.id === pipeline.id ? "default" : "outline"}
              onClick={() => setActivePipeline(pipeline)}
              className="flex items-center space-x-2"
            >
              <span>{pipeline.name}</span>
              {pipeline.isDefault && <Badge variant="secondary">Default</Badge>}
            </Button>
          ))}
        </div>

        {/* Pipeline Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activePipeline.stages.reduce((sum, stage) => sum + stage.deals.length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(activePipeline.stages.reduce((sum, stage) => sum + getTotalValue(stage), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(activePipeline.stages.reduce((sum, stage) => sum + getWeightedValue(stage), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  activePipeline.stages.reduce((sum, stage) => sum + getTotalValue(stage), 0) /
                    Math.max(
                      activePipeline.stages.reduce((sum, stage) => sum + stage.deals.length, 0),
                      1,
                    ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {activePipeline.stages.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                        <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                        <Badge variant="secondary">{stage.deals.length}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Stage
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Deal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Stage
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-xs text-muted-foreground">Total: {formatCurrency(getTotalValue(stage))}</div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? "bg-muted/50" : ""
                          }`}
                        >
                          {stage.deals.map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 bg-background border rounded-lg shadow-sm cursor-move transition-shadow ${
                                    snapshot.isDragging ? "shadow-lg" : "hover:shadow-md"
                                  }`}
                                >
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm line-clamp-2">{deal.title}</h4>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>{deal.contact}</span>
                                      <Badge variant="outline">{deal.probability}%</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1 text-sm font-medium">
                                        <DollarSign className="h-3 w-3" />
                                        <span>{formatCurrency(deal.value)}</span>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Deal
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Deal
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Deal
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </MainLayout>
  )
}
