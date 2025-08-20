"use client"

import { useState } from "react"
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileText, 
  Target, 
  Calendar, 
  Wallet, 
  Users, 
  Settings,
  Eye,
  BarChart3,
  Send,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CampaignService } from "@/services/campaign-service"
import { CampaignModel } from "@/lib/models"

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    type: "email" as const,
    category: "promotional" as const,
    channel: "email" as const,
    objective: "awareness" as const,
    subject: "",
    content: "",
    targetAudience: {
      totalSize: 0,
      targetCriteria: {},
      dynamicSegmentation: false,
      lastUpdated: new Date()
    },
    segmentIds: [] as string[],
    listIds: [] as string[],
    status: "draft" as const,
    timezone: "Africa/Lagos",
    isABTest: false,
    personalizationFields: [] as string[],
    trackingEnabled: true,
    scheduledAt: null as Date | null,
    budget: 0,
    tags: [] as string[],
    complianceChecks: [] as any[],
    gdprCompliant: true,
    canSpamCompliant: true,
    customFields: {} as Record<string, any>
  })

  const totalSteps = 5

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = async () => {
    try {
      // In a real implementation, this would call CampaignService.createCampaign
      // const newCampaign = await CampaignService.createCampaign(campaignData)
      toast({
        title: "Campaign Saved",
        description: "Your campaign has been saved as a draft."
      })
      router.push("/marketing/campaigns")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save campaign. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSendCampaign = async () => {
    try {
      // In a real implementation, this would call CampaignService.createCampaign
      // and then immediately send it or schedule it
      toast({
        title: "Campaign Sent",
        description: "Your campaign has been sent successfully."
      })
      router.push("/marketing/campaigns")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleScheduleCampaign = async () => {
    try {
      // In a real implementation, this would call CampaignService.createCampaign
      // and schedule it for later
      toast({
        title: "Campaign Scheduled",
        description: "Your campaign has been scheduled successfully."
      })
      router.push("/marketing/campaigns")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule campaign. Please try again.",
        variant: "destructive"
      })
    }
  }

  const updateCampaignData = (field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={campaignData.name}
                  onChange={(e) => updateCampaignData("name", e.target.value)}
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type *</Label>
                <Select 
                  value={campaignData.type} 
                  onValueChange={(value) => updateCampaignData("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="drip_sequence">Drip Sequence</SelectItem>
                    <SelectItem value="push_notification">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={campaignData.description}
                onChange={(e) => updateCampaignData("description", e.target.value)}
                placeholder="Enter campaign description"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={campaignData.category} 
                  onValueChange={(value) => updateCampaignData("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="product_launch">Product Launch</SelectItem>
                    <SelectItem value="nurture">Nurture</SelectItem>
                    <SelectItem value="retention">Retention</SelectItem>
                    <SelectItem value="win_back">Win Back</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select 
                  value={campaignData.channel} 
                  onValueChange={(value) => updateCampaignData("channel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="objective">Objective</Label>
                <Select 
                  value={campaignData.objective} 
                  onValueChange={(value) => updateCampaignData("objective", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="lead_generation">Lead Generation</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                    <SelectItem value="retention">Retention</SelectItem>
                    <SelectItem value="upsell">Upsell</SelectItem>
                    <SelectItem value="cross_sell">Cross Sell</SelectItem>
                    <SelectItem value="reactivation">Reactivation</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="event_promotion">Event Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    const tag = e.currentTarget.value.trim()
                    if (tag && !campaignData.tags.includes(tag)) {
                      updateCampaignData("tags", [...campaignData.tags, tag])
                      e.currentTarget.value = ""
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {campaignData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button 
                      onClick={() => {
                        const newTags = [...campaignData.tags]
                        newTags.splice(index, 1)
                        updateCampaignData("tags", newTags)
                      }}
                      className="ml-1 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            {campaignData.type === "email" && (
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={campaignData.subject}
                  onChange={(e) => updateCampaignData("subject", e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="content">
                {campaignData.type === "email" ? "Email Content" : 
                 campaignData.type === "sms" ? "SMS Content" : 
                 "Message Content"} *
              </Label>
              <Textarea
                id="content"
                value={campaignData.content}
                onChange={(e) => updateCampaignData("content", e.target.value)}
                placeholder="Enter your message content"
                className="min-h-[200px]"
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Personalization</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  updateCampaignData("content", campaignData.content + "{{first_name}}")
                }}>
                  First Name
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  updateCampaignData("content", campaignData.content + "{{last_name}}")
                }}>
                  Last Name
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  updateCampaignData("content", campaignData.content + "{{company}}")
                }}>
                  Company
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">A/B Testing</h3>
                <p className="text-sm text-muted-foreground">Test different versions of your campaign</p>
              </div>
              <Switch 
                checked={campaignData.isABTest} 
                onCheckedChange={(checked) => updateCampaignData("isABTest", checked)} 
              />
            </div>
            
            {campaignData.isABTest && (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">A/B Test Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Variant A Subject</Label>
                    <Input placeholder="Subject for variant A" />
                  </div>
                  <div>
                    <Label>Variant B Subject</Label>
                    <Input placeholder="Subject for variant B" />
                  </div>
                </div>
                <div>
                  <Label>Test Metric</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open_rate">Open Rate</SelectItem>
                      <SelectItem value="click_rate">Click Rate</SelectItem>
                      <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Target Audience</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select List</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact list" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_contacts">All Contacts</SelectItem>
                      <SelectItem value="subscribers">Newsletter Subscribers</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="prospects">Prospects</SelectItem>
                      <SelectItem value="high_value">High Value Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Segment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engaged">Engaged Contacts</SelectItem>
                      <SelectItem value="inactive">Inactive Contacts</SelectItem>
                      <SelectItem value="recent_purchasers">Recent Purchasers</SelectItem>
                      <SelectItem value="no_purchase_30">No Purchase 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Advanced Filters</h4>
                <Button variant="outline" className="w-full">
                  Add Filter Condition
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Exclusion Rules</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="exclude_bounced" />
                  <Label htmlFor="exclude_bounced">Exclude contacts with bounced emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="exclude_unsubscribed" />
                  <Label htmlFor="exclude_unsubscribed">Exclude unsubscribed contacts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="exclude_complained" />
                  <Label htmlFor="exclude_complained">Exclude contacts who complained</Label>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Dynamic Segmentation</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Automatically update audience based on criteria</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Budget & Scheduling</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₦)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={campaignData.budget}
                    onChange={(e) => updateCampaignData("budget", Number(e.target.value))}
                    placeholder="Enter budget"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={campaignData.timezone} 
                    onValueChange={(value) => updateCampaignData("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                      <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label>Schedule Campaign</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="datetime-local" 
                    value={campaignData.scheduledAt ? campaignData.scheduledAt.toISOString().slice(0, 16) : ""}
                    onChange={(e) => updateCampaignData("scheduledAt", e.target.value ? new Date(e.target.value) : null)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => updateCampaignData("scheduledAt", null)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Tracking & Compliance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Track Opens</Label>
                    <p className="text-sm text-muted-foreground">Track when recipients open your emails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Track Clicks</Label>
                    <p className="text-sm text-muted-foreground">Track when recipients click links</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>GDPR Compliance</Label>
                    <p className="text-sm text-muted-foreground">Ensure compliance with GDPR regulations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>CAN-SPAM Compliance</Label>
                    <p className="text-sm text-muted-foreground">Ensure compliance with CAN-SPAM Act</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
                <CardDescription>Review your campaign details before sending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Basic Information</h4>
                    <div className="text-sm">
                      <p><span className="font-medium">Name:</span> {campaignData.name}</p>
                      <p><span className="font-medium">Type:</span> {campaignData.type}</p>
                      <p><span className="font-medium">Category:</span> {campaignData.category}</p>
                      <p><span className="font-medium">Channel:</span> {campaignData.channel}</p>
                      <p><span className="font-medium">Objective:</span> {campaignData.objective}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Settings</h4>
                    <div className="text-sm">
                      <p><span className="font-medium">Status:</span> {campaignData.status}</p>
                      <p><span className="font-medium">Timezone:</span> {campaignData.timezone}</p>
                      <p><span className="font-medium">Budget:</span> ₦{campaignData.budget.toLocaleString()}</p>
                      <p><span className="font-medium">Scheduled:</span> {campaignData.scheduledAt ? campaignData.scheduledAt.toLocaleString() : "Not scheduled"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Content Preview</h4>
                  <div className="border rounded-lg p-4 bg-muted">
                    {campaignData.type === "email" && (
                      <div>
                        <p className="font-medium">{campaignData.subject || "No subject"}</p>
                        <div className="mt-2 text-sm whitespace-pre-wrap">
                          {campaignData.content || "No content"}
                        </div>
                      </div>
                    )}
                    {campaignData.type !== "email" && (
                      <div className="text-sm whitespace-pre-wrap">
                        {campaignData.content || "No content"}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Target Audience</h4>
                  <div className="text-sm">
                    <p>Total contacts: {campaignData.targetAudience.totalSize || "Not specified"}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {campaignData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                onClick={handleScheduleCampaign}
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Campaign
              </Button>
              <Button 
                onClick={handleSendCampaign}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
            <p className="text-muted-foreground">Design and launch your marketing campaign</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i + 1 === currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : i + 1 < currentStep 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                }`}
              >
                {i + 1 < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`w-16 h-1 ${i + 1 < currentStep ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Titles */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          {currentStep === 1 && "Campaign Information"}
          {currentStep === 2 && "Content & Personalization"}
          {currentStep === 3 && "Target Audience"}
          {currentStep === 4 && "Budget & Scheduling"}
          {currentStep === 5 && "Review & Send"}
        </h2>
        <p className="text-muted-foreground">
          {currentStep === 1 && "Set up the basic details for your campaign"}
          {currentStep === 2 && "Create compelling content for your audience"}
          {currentStep === 3 && "Define who will receive your campaign"}
          {currentStep === 4 && "Set your budget and schedule"}
          {currentStep === 5 && "Review and send your campaign"}
        </p>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious} 
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={currentStep === totalSteps ? handleSendCampaign : handleNext}
          disabled={currentStep === totalSteps}
        >
          {currentStep === totalSteps ? "Send Campaign" : "Next"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}