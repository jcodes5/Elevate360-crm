"use client"

import { useState } from "react"
import { Plus, Settings, Edit, Trash2, GripVertical, CheckCircle, Target, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { Pipeline, PipelineStage } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Mock pipeline data
const mockPipelines: Pipeline[] = [
  {
    id: "default",
    name: "Sales Pipeline",
    stages: [
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
    ],
    organizationId: "org-1",
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "enterprise",
    name: "Enterprise Sales",
    stages: [
      {
        id: "e1",
        name: "Lead Generation",
        order: 1,
        color: "#6366f1",
        probability: 5,
        deals: []
      },
      {
        id: "e2", 
        name: "Initial Contact",
        order: 2,
        color: "#8b5cf6",
        probability: 15,
        deals: []
      },
      {
        id: "e3",
        name: "Needs Assessment",
        order: 3,
        color: "#06b6d4",
        probability: 30,
        deals: []
      },
      {
        id: "e4",
        name: "Technical Evaluation",
        order: 4,
        color: "#f59e0b",
        probability: 50,
        deals: []
      },
      {
        id: "e5",
        name: "Procurement",
        order: 5,
        color: "#ef4444",
        probability: 75,
        deals: []
      },
      {
        id: "e6",
        name: "Contract Signed",
        order: 6,
        color: "#10b981",
        probability: 100,
        deals: []
      }
    ],
    organizationId: "org-1",
    isDefault: false,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-20"),
  }
]

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState(mockPipelines)
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline>(pipelines[0])
  const [showCreatePipeline, setShowCreatePipeline] = useState(false)
  const [showCreateStage, setShowCreateStage] = useState(false)
  const [showEditStage, setShowEditStage] = useState(false)
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null)
  const [newPipelineName, setNewPipelineName] = useState("")
  const [newStage, setNewStage] = useState({
    name: "",
    color: "#3b82f6",
    probability: 50
  })
  const { toast } = useToast()

  const addPipeline = () => {
    if (!newPipelineName.trim()) return
    
    const newPipeline: Pipeline = {
      id: Date.now().toString(),
      name: newPipelineName,
      stages: [
        {
          id: "new-1",
          name: "New Lead",
          order: 1,
          color: "#3b82f6",
          probability: 10,
          deals: []
        },
        {
          id: "new-2",
          name: "Qualified",
          order: 2,
          color: "#10b981",
          probability: 100,
          deals: []
        }
      ],
      organizationId: "org-1",
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    setPipelines([...pipelines, newPipeline])
    setNewPipelineName("")
    setShowCreatePipeline(false)
    toast({
      title: "Pipeline Created",
      description: `${newPipelineName} pipeline has been created successfully.`
    })
  }

  const addStage = () => {
    if (!newStage.name.trim()) return
    
    const newStageObj: PipelineStage = {
      id: Date.now().toString(),
      name: newStage.name,
      order: selectedPipeline.stages.length + 1,
      color: newStage.color,
      probability: newStage.probability,
      deals: []
    }
    
    const updatedPipeline = {
      ...selectedPipeline,
      stages: [...selectedPipeline.stages, newStageObj]
    }
    
    setSelectedPipeline(updatedPipeline)
    setPipelines(pipelines.map(p => p.id === selectedPipeline.id ? updatedPipeline : p))
    setNewStage({ name: "", color: "#3b82f6", probability: 50 })
    setShowCreateStage(false)
    toast({
      title: "Stage Added",
      description: `${newStage.name} stage has been added to the pipeline.`
    })
  }

  const deleteStage = (stageId: string) => {
    const updatedPipeline = {
      ...selectedPipeline,
      stages: selectedPipeline.stages.filter(s => s.id !== stageId)
    }
    
    setSelectedPipeline(updatedPipeline)
    setPipelines(pipelines.map(p => p.id === selectedPipeline.id ? updatedPipeline : p))
    toast({
      title: "Stage Deleted",
      description: "Stage has been removed from the pipeline."
    })
  }

  const deletePipeline = (pipelineId: string) => {
    if (pipelines.find(p => p.id === pipelineId)?.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default pipeline cannot be deleted.",
        variant: "destructive"
      })
      return
    }
    
    setPipelines(pipelines.filter(p => p.id !== pipelineId))
    if (selectedPipeline.id === pipelineId) {
      setSelectedPipeline(pipelines[0])
    }
    toast({
      title: "Pipeline Deleted",
      description: "Pipeline has been deleted successfully."
    })
  }

  const colorOptions = [
    "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", 
    "#ef4444", "#ec4899", "#6366f1", "#84cc16", "#f97316"
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipelines</h1>
          <p className="text-muted-foreground">Configure your sales process and pipeline stages</p>
        </div>
        <Button onClick={() => setShowCreatePipeline(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Pipeline
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Total Pipelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelines.length}</div>
            <p className="text-xs text-muted-foreground">
              {pipelines.filter(p => p.isDefault).length} default
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Average Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(pipelines.reduce((sum, p) => sum + p.stages.length, 0) / pipelines.length)}
            </div>
            <p className="text-xs text-muted-foreground">Per pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Active Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedPipeline.stages.length}</div>
            <p className="text-xs text-muted-foreground">In current pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedPipeline.stages.length > 0 
                ? Math.round(selectedPipeline.stages[selectedPipeline.stages.length - 1].probability)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Final stage probability</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Pipelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPipeline.id === pipeline.id 
                    ? "bg-blue-50 border-blue-200" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedPipeline(pipeline)}
              >
                <div>
                  <div className="font-medium">{pipeline.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {pipeline.stages.length} stages
                    {pipeline.isDefault && (
                      <Badge variant="secondary" className="ml-2">Default</Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Pipeline
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Target className="mr-2 h-4 w-4" />
                      Set as Default
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => deletePipeline(pipeline.id)}
                      disabled={pipeline.isDefault}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Pipeline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pipeline Stages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedPipeline.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage stages and conversion probabilities
                </p>
              </div>
              <Button onClick={() => setShowCreateStage(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stage
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedPipeline.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{stage.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Position {stage.order} • {stage.probability}% conversion
                    </div>
                  </div>
                  <div className="w-24">
                    <Progress value={stage.probability} className="h-2" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setEditingStage(stage)
                          setShowEditStage(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Stage
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => deleteStage(stage.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Stage
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Pipeline Modal */}
      <Dialog open={showCreatePipeline} onOpenChange={setShowCreatePipeline}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pipeline</DialogTitle>
            <DialogDescription>
              Create a new sales pipeline to organize your deals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pipelineName">Pipeline Name</Label>
              <Input
                id="pipelineName"
                value={newPipelineName}
                onChange={(e) => setNewPipelineName(e.target.value)}
                placeholder="Enter pipeline name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePipeline(false)}>
              Cancel
            </Button>
            <Button onClick={addPipeline}>Create Pipeline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Stage Modal */}
      <Dialog open={showCreateStage} onOpenChange={setShowCreateStage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stage</DialogTitle>
            <DialogDescription>
              Add a new stage to your pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stageName">Stage Name</Label>
              <Input
                id="stageName"
                value={newStage.name}
                onChange={(e) => setNewStage({...newStage, name: e.target.value})}
                placeholder="Enter stage name"
              />
            </div>
            <div>
              <Label>Stage Color</Label>
              <div className="flex space-x-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newStage.color === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewStage({...newStage, color})}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Conversion Probability: {newStage.probability}%</Label>
              <Slider
                value={[newStage.probability]}
                onValueChange={([value]) => setNewStage({...newStage, probability: value})}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateStage(false)}>
              Cancel
            </Button>
            <Button onClick={addStage}>Add Stage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Modal */}
      <Dialog open={showEditStage} onOpenChange={setShowEditStage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
            <DialogDescription>
              Modify stage properties and settings.
            </DialogDescription>
          </DialogHeader>
          {editingStage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editStageName">Stage Name</Label>
                <Input
                  id="editStageName"
                  defaultValue={editingStage.name}
                  placeholder="Enter stage name"
                />
              </div>
              <div>
                <Label>Stage Color</Label>
                <div className="flex space-x-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingStage.color === color ? "border-gray-800" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Conversion Probability: {editingStage.probability}%</Label>
                <Slider
                  defaultValue={[editingStage.probability]}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditStage(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Stage Updated",
                description: "Stage has been updated successfully."
              })
              setShowEditStage(false)
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
