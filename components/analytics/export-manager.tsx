"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Image, 
  Settings,
  Calendar,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { toast } from "@/hooks/use-toast"

interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'png'
  timeRange: {
    startDate: Date
    endDate: Date
  }
  includeCharts: boolean
  includeData: boolean
  includeSummary: boolean
  reportTitle: string
  reportDescription: string
  sections: string[]
  scheduleExport: boolean
  frequency?: 'daily' | 'weekly' | 'monthly'
  recipients?: string[]
}

interface ExportJob {
  id: string
  title: string
  format: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: Date
  completedAt?: Date
  downloadUrl?: string
  error?: string
}

const defaultOptions: ExportOptions = {
  format: 'pdf',
  timeRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  },
  includeCharts: true,
  includeData: true,
  includeSummary: true,
  reportTitle: 'Analytics Report',
  reportDescription: '',
  sections: ['overview', 'sales', 'marketing', 'performance'],
  scheduleExport: false
}

const sectionOptions = [
  { id: 'overview', label: 'Overview Dashboard', description: 'Key metrics and trends' },
  { id: 'sales', label: 'Sales Analytics', description: 'Revenue, deals, and pipeline data' },
  { id: 'marketing', label: 'Marketing Performance', description: 'Campaign metrics and ROI' },
  { id: 'customers', label: 'Customer Analytics', description: 'Behavior and segmentation' },
  { id: 'performance', label: 'Team Performance', description: 'Individual and team metrics' },
  { id: 'forecasting', label: 'Forecasting', description: 'Predictions and trends' }
]

const formatIcons = {
  pdf: FileText,
  csv: FileSpreadsheet,
  excel: FileSpreadsheet,
  png: Image
}

const formatDescriptions = {
  pdf: 'Complete report with charts and formatting',
  csv: 'Raw data in comma-separated format',
  excel: 'Spreadsheet with multiple sheets and formulas',
  png: 'High-resolution image of dashboards'
}

export function ExportManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ExportOptions>(defaultOptions)
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    // Create export job
    const jobId = `export_${Date.now()}`
    const newJob: ExportJob = {
      id: jobId,
      title: options.reportTitle,
      format: options.format,
      status: 'processing',
      progress: 0,
      createdAt: new Date()
    }
    
    setExportJobs(prev => [newJob, ...prev])

    try {
      // Simulate export process with progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setExportJobs(prev => 
          prev.map(job => 
            job.id === jobId 
              ? { ...job, progress }
              : job
          )
        )
      }

      // Complete the export
      const completedJob: ExportJob = {
        ...newJob,
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        downloadUrl: `/api/exports/${jobId}/download`
      }

      setExportJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? completedJob
            : job
        )
      )

      toast({
        title: "Export Complete",
        description: `Your ${options.format.toUpperCase()} report has been generated successfully.`,
      })

      // If scheduled export, save the schedule
      if (options.scheduleExport) {
        toast({
          title: "Export Scheduled",
          description: `Report will be generated ${options.frequency} and sent to ${options.recipients?.length || 0} recipients.`,
        })
      }

    } catch (error) {
      setExportJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'failed', error: 'Export failed. Please try again.' }
            : job
        )
      )
      
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownload = (job: ExportJob) => {
    if (job.downloadUrl) {
      // In a real app, this would trigger the actual download
      window.open(job.downloadUrl, '_blank')
      
      toast({
        title: "Download Started",
        description: `Downloading ${job.title}.${job.format}`,
      })
    }
  }

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }))
  }

  const toggleSection = (sectionId: string) => {
    setOptions(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId]
    }))
  }

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>
            Generate and download comprehensive analytics reports in various formats
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(formatIcons).map(([format, Icon]) => (
                  <div
                    key={format}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      options.format === format 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateOptions({ format: format as any })}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-6 w-6" />
                      <div>
                        <div className="font-medium">{format.toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDescriptions[format as keyof typeof formatDescriptions]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Details */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Report Details</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={options.reportTitle}
                    onChange={(e) => updateOptions({ reportTitle: e.target.value })}
                    placeholder="Enter report title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={options.reportDescription}
                    onChange={(e) => updateOptions({ reportDescription: e.target.value })}
                    placeholder="Add a description for your report"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Time Range */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Time Range</Label>
              <DatePickerWithRange
                date={{
                  from: options.timeRange.startDate,
                  to: options.timeRange.endDate
                }}
                onDateChange={(range) => {
                  if (range?.from && range?.to) {
                    updateOptions({
                      timeRange: {
                        startDate: range.from,
                        endDate: range.to
                      }
                    })
                  }
                }}
              />
            </div>

            {/* Report Sections */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Include Sections</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectionOptions.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      id={section.id}
                      checked={options.sections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={section.id} className="font-medium cursor-pointer">
                        {section.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Export Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={options.includeCharts}
                    onCheckedChange={(checked) => updateOptions({ includeCharts: !!checked })}
                  />
                  <Label htmlFor="includeCharts">Include charts and visualizations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeData"
                    checked={options.includeData}
                    onCheckedChange={(checked) => updateOptions({ includeData: !!checked })}
                  />
                  <Label htmlFor="includeData">Include raw data tables</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSummary"
                    checked={options.includeSummary}
                    onCheckedChange={(checked) => updateOptions({ includeSummary: !!checked })}
                  />
                  <Label htmlFor="includeSummary">Include executive summary</Label>
                </div>
              </div>
            </div>

            {/* Schedule Export */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scheduleExport"
                  checked={options.scheduleExport}
                  onCheckedChange={(checked) => updateOptions({ scheduleExport: !!checked })}
                />
                <Label htmlFor="scheduleExport" className="text-base font-medium">
                  Schedule Regular Exports
                </Label>
              </div>
              
              {options.scheduleExport && (
                <div className="pl-6 space-y-3">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={options.frequency}
                      onValueChange={(value) => updateOptions({ frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recipients">Email Recipients</Label>
                    <Input
                      id="recipients"
                      placeholder="Enter email addresses separated by commas"
                      value={options.recipients?.join(', ') || ''}
                      onChange={(e) => updateOptions({ 
                        recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Recent Exports</Label>
              <Badge variant="secondary">{exportJobs.length}</Badge>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {exportJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No exports yet</p>
                </div>
              ) : (
                exportJobs.map((job) => (
                  <div key={job.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium text-sm">{job.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {job.format.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {job.status === 'processing' && (
                      <div>
                        <Progress value={job.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {job.progress}% complete
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{job.createdAt.toLocaleString()}</span>
                      {job.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(job)}
                          className="h-auto p-1 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    
                    {job.error && (
                      <p className="text-xs text-red-600">{job.error}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting || options.sections.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
