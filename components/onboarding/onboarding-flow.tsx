"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Building2,
  Users,
  Target,
  BarChart3,
  MessageSquare,
  Calendar,
  Settings,
  Phone,
  Mail,
  Globe,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"

interface OnboardingData {
  companySize: string
  industry: string
  businessGoals: string[]
  phone: string
  website: string
  timeZone: string
  enableNotifications: boolean
  enableEmailMarketing: boolean
  enableSMSMarketing: boolean
  enableWhatsApp: boolean
}

const steps = [
  {
    id: 1,
    title: "Welcome to Elevate360 CRM",
    description: "Let's get you set up for success",
    icon: Sparkles
  },
  {
    id: 2,
    title: "Company Information",
    description: "Tell us about your business",
    icon: Building2
  },
  {
    id: 3,
    title: "Business Goals",
    description: "What do you want to achieve?",
    icon: Target
  },
  {
    id: 4,
    title: "Contact & Settings",
    description: "Configure your preferences",
    icon: Settings
  },
  {
    id: 5,
    title: "Marketing Channels",
    description: "Choose your communication methods",
    icon: MessageSquare
  },
  {
    id: 6,
    title: "All Set!",
    description: "You're ready to start growing",
    icon: CheckCircle
  }
]

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "Manufacturing",
  "Retail",
  "Professional Services",
  "Marketing & Advertising",
  "Non-profit",
  "Other"
]

const companySizes = [
  "Just me",
  "2-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees"
]

const businessGoals = [
  { id: "lead-generation", label: "Generate more leads", icon: Users },
  { id: "sales-automation", label: "Automate sales processes", icon: Zap },
  { id: "customer-retention", label: "Improve customer retention", icon: Target },
  { id: "analytics", label: "Better business insights", icon: BarChart3 },
  { id: "communication", label: "Streamline communications", icon: MessageSquare },
  { id: "scheduling", label: "Manage appointments", icon: Calendar }
]

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    companySize: "",
    industry: "",
    businessGoals: [],
    phone: "",
    website: "",
    timeZone: "Africa/Lagos",
    enableNotifications: true,
    enableEmailMarketing: true,
    enableSMSMarketing: false,
    enableWhatsApp: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleBusinessGoal = (goalId: string) => {
    setData(prev => ({
      ...prev,
      businessGoals: prev.businessGoals.includes(goalId)
        ? prev.businessGoals.filter(id => id !== goalId)
        : [...prev.businessGoals, goalId]
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      console.log("Starting onboarding completion with data:", data)

      // Save onboarding data
      const response = await apiClient.post('/users/complete-onboarding', {
        onboardingData: data,
        isOnboardingCompleted: true
      })

      console.log("Onboarding completion response:", response)

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your account has been set up successfully. Let's start growing your business!",
      })

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Onboarding completion error:", error)

      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to complete onboarding. Please try again."

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return data.companySize && data.industry
      case 3:
        return data.businessGoals.length > 0
      case 4:
        return data.phone
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Elevate360 CRM, {user?.firstName}! 👋
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                We're excited to help you transform your business. This quick setup will personalize 
                your CRM experience and get you started on the right track.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Manage Contacts</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Track Performance</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Automate Workflows</p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your company</h2>
              <p className="text-gray-600">This helps us customize your experience</p>
            </div>
            
            <div className="space-y-6 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={data.companySize} onValueChange={(value) => updateData('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={data.industry} onValueChange={(value) => updateData('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are your main business goals?</h2>
              <p className="text-gray-600">Select all that apply - we'll help you achieve them</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {businessGoals.map(goal => {
                const Icon = goal.icon
                const isSelected = data.businessGoals.includes(goal.id)
                return (
                  <motion.div
                    key={goal.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => toggleBusinessGoal(goal.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              isSelected ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <span className="font-medium text-gray-900">{goal.label}</span>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact information & settings</h2>
              <p className="text-gray-600">Help us reach you and configure your preferences</p>
            </div>
            
            <div className="space-y-6 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    value={data.phone}
                    onChange={(e) => updateData('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={data.website}
                    onChange={(e) => updateData('website', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Select value={data.timeZone} onValueChange={(value) => updateData('timeZone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Lagos">Lagos (WAT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">New York (EST)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified about important updates</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={data.enableNotifications}
                    onCheckedChange={(checked) => updateData('enableNotifications', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your marketing channels</h2>
              <p className="text-gray-600">Select the communication methods you want to use</p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Marketing</h3>
                      <p className="text-sm text-gray-500">Send newsletters and campaigns</p>
                    </div>
                  </div>
                  <Switch
                    checked={data.enableEmailMarketing}
                    onCheckedChange={(checked) => updateData('enableEmailMarketing', checked)}
                  />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">SMS Marketing</h3>
                      <p className="text-sm text-gray-500">Reach customers via text messages</p>
                    </div>
                  </div>
                  <Switch
                    checked={data.enableSMSMarketing}
                    onCheckedChange={(checked) => updateData('enableSMSMarketing', checked)}
                  />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">WhatsApp Business</h3>
                      <p className="text-sm text-gray-500">Connect via WhatsApp</p>
                    </div>
                  </div>
                  <Switch
                    checked={data.enableWhatsApp}
                    onCheckedChange={(checked) => updateData('enableWhatsApp', checked)}
                  />
                </div>
              </Card>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto w-24 h-24 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 You're all set!
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
                Welcome to Elevate360 CRM! Your account is now configured and ready to help you 
                grow your business. Let's start building those customer relationships!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Add Contacts</h3>
                    <p className="text-sm text-gray-500 mt-1">Start building your database</p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-medium">Create Campaigns</h3>
                    <p className="text-sm text-gray-500 mt-1">Engage your audience</p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium">Track Analytics</h3>
                    <p className="text-sm text-gray-500 mt-1">Monitor your progress</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-medium text-gray-500">
              Step {currentStep} of {steps.length}
            </h1>
            <div className="text-sm text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep >= step.id
              const isCurrent = currentStep === step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {currentStep === steps.length ? (
              <Button
                onClick={completeOnboarding}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{isLoading ? "Setting up..." : "Get Started"}</span>
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
