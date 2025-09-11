"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { User } from "@/types"
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
  Zap,
  UserCircle,
  Edit2,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"
import Confetti from "react-confetti"

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
    title: "Welcome",
    description: "Let's set up your account",
    icon: Sparkles
  },
  {
    id: 2,
    title: "Company Info",
    description: "Tell us about your business",
    icon: Building2
  },
  {
    id: 3,
    title: "Your Goals",
    description: "What do you want to achieve?",
    icon: Target
  },
  {
    id: 4,
    title: "Contact Details",
    description: "How can we reach you?",
    icon: UserCircle
  },
  {
    id: 5,
    title: "Preferences",
    description: "Communication preferences",
    icon: Settings
  },
  {
    id: 6,
    title: "Review & Confirm",
    description: "Let's double-check",
    icon: CheckCircle
  },
  {
    id: 7,
    title: "You're Ready!",
    description: "Let's get started",
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
  "Hospitality",
  "E-commerce",
  "Construction",
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

const timeZones = [
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
  // Add more as needed
]

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    companySize: "",
    industry: "",
    businessGoals: [],
    phone: "",
    website: "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Lagos",
    enableNotifications: true,
    enableEmailMarketing: true,
    enableSMSMarketing: false,
    enableWhatsApp: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const { toast } = useToast()
  const { user, login } = useAuth()
  const router = useRouter()
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

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

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/ // Basic E.164 validation
    if (!phoneRegex.test(phone)) {
      setPhoneError("Please enter a valid international phone number (e.g., +1234567890)")
      return false
    }
    setPhoneError("")
    return true
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      const response: any = await apiClient.post('/users/complete-onboarding', {
        onboardingData: data,
        isOnboardingCompleted: true
      })

      if (response.data && response.data.user && response.data.tokens) {
        apiClient.setToken(response.data.tokens.accessToken)
        login(
          response.data.user, 
          { accessToken: response.data.tokens.accessToken },
          { sessionId: 'session_' + Date.now() }
        )
      } else if (response.data && response.data.user) {
        login(
          response.data.user, 
          { accessToken: apiClient.currentToken || "" },
          { sessionId: 'session_' + Date.now() }
        )
      }

      setShowConfetti(true)
      toast({
        title: "Welcome aboard!",
        description: "Your account is all set. Let's start growing your business.",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Onboarding completion error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to complete onboarding. Please try again."
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
        return data.phone && !phoneError
      default:
        return true
    }
  }

  const getPersonalizedTips = () => {
    return data.businessGoals.map(goalId => {
      const goal = businessGoals.find(g => g.id === goalId)
      return goal ? `Focus on ${goal.label.toLowerCase()} with our tailored tools.` : ""
    }).filter(Boolean)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6 py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg dark:shadow-blue-900/50"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome, {user?.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
                We're excited to help you elevate your business with Elevate360. This quick setup will personalize your experience.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-6">
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Manage Contacts</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Gain Insights</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Automate Processes</p>
              </motion.div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">About Your Business</h2>
              <p className="text-gray-600 dark:text-gray-400">This helps us tailor features to your needs</p>
            </div>
            
            <div className="space-y-6 max-w-md mx-auto w-full">
              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                  Company Size
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 ml-2 text-gray-400 dark:text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select the size that best describes your team</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select 
                  value={data.companySize} 
                  onValueChange={(value) => updateData('companySize', value)}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size} className="text-gray-900 dark:text-gray-100">{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                  Industry
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 ml-2 text-gray-400 dark:text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose your primary industry for customized templates</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select 
                  value={data.industry} 
                  onValueChange={(value) => updateData('industry', value)}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry} className="text-gray-900 dark:text-gray-100">{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Business Goals</h2>
              <p className="text-gray-600 dark:text-gray-400">Select at least one - we'll suggest features accordingly</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {businessGoals.map(goal => {
                const Icon = goal.icon
                const isSelected = data.businessGoals.includes(goal.id)
                return (
                  <motion.div
                    key={goal.id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 border-2 shadow-sm hover:shadow-md bg-white dark:bg-gray-800 ${
                        isSelected 
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                      onClick={() => toggleBusinessGoal(goal.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{goal.label}</span>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-auto" />
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
          <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Required for account verification and support</p>
            </div>
            
            <div className="space-y-6 max-w-md mx-auto w-full">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                  Phone Number *
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 ml-2 text-gray-400 dark:text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter in international format for SMS features</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={data.phone}
                    onChange={(e) => {
                      updateData('phone', e.target.value)
                      validatePhone(e.target.value)
                    }}
                    className={`pl-10 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${phoneError ? 'border-red-500 dark:border-red-400' : ''}`}
                  />
                </div>
                {phoneError && <p className="text-sm text-red-500 dark:text-red-400">{phoneError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                  Website (Optional)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 ml-2 text-gray-400 dark:text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add your site for integration suggestions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={data.website}
                    onChange={(e) => updateData('website', e.target.value)}
                    className="pl-10 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeZone" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                  Time Zone
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 ml-2 text-gray-400 dark:text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>For scheduling and notifications</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select 
                  value={data.timeZone} 
                  onValueChange={(value) => updateData('timeZone', value)}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {timeZones.map(tz => (
                      <SelectItem key={tz.value} value={tz.value} className="text-gray-900 dark:text-gray-100">{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Communication Preferences</h2>
              <p className="text-gray-600 dark:text-gray-400">Control how we and your contacts reach you</p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto w-full">
              <Card className="p-4 shadow-sm bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">For important updates and alerts</p>
                    </div>
                  </div>
                  <Switch
                    checked={data.enableNotifications}
                    onCheckedChange={(checked) => updateData('enableNotifications', checked)}
                  />
                </div>
              </Card>

              <Card className="p-4 shadow-sm bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Marketing Emails</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tips, news, and special offers</p>
                    </div>
                  </div>
                  <Switch
                    checked={data.enableEmailMarketing}
                    onCheckedChange={(checked) => updateData('enableEmailMarketing', checked)}
                  />
                </div>
              </Card>

              <Card className="p-4 shadow-sm bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">SMS Marketing</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quick text message updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={data.enableSMSMarketing}
                    onCheckedChange={(checked) => updateData('enableSMSMarketing', checked)}
                  />
                </div>
              </Card>

              <Card className="p-4 shadow-sm bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">WhatsApp Integration</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enable WhatsApp for customer chats</p>
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
          <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Review Your Setup</h2>
              <p className="text-gray-600 dark:text-gray-400">Make sure everything looks good</p>
            </div>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                    Company Info
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(2)}
                      className="ml-auto text-gray-600 dark:text-gray-400"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Size</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.companySize || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Industry</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.industry || "Not set"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                    Business Goals
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(3)}
                      className="ml-auto text-gray-600 dark:text-gray-400"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    {data.businessGoals.map(goalId => {
                      const goal = businessGoals.find(g => g.id === goalId)
                      return goal ? <li key={goalId} className="text-gray-900 dark:text-gray-100">{goal.label}</li> : null
                    })}
                    {data.businessGoals.length === 0 && <p className="text-gray-500 dark:text-gray-400">None selected</p>}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                    Contact Details
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(4)}
                      className="ml-auto text-gray-600 dark:text-gray-400"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.phone || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Website</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.website || "Not set"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Time Zone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{timeZones.find(tz => tz.value === data.timeZone)?.label || data.timeZone}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                    Preferences
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(5)}
                      className="ml-auto text-gray-600 dark:text-gray-400"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Email Notifications</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.enableNotifications ? "Enabled" : "Disabled"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Marketing Emails</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.enableEmailMarketing ? "Enabled" : "Disabled"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">SMS Marketing</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.enableSMSMarketing ? "Enabled" : "Disabled"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">WhatsApp</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.enableWhatsApp ? "Enabled" : "Disabled"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="text-center space-y-6 py-8 relative">
            {showConfetti && (
              <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={200}
              />
            )}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg dark:shadow-green-900/50"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                You're All Set, {user?.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
                Based on your {data.industry} business with {data.companySize.toLowerCase()}, we're ready to help you achieve your goals.
              </p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto pt-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Personalized Next Steps:</h3>
              <ul className="space-y-2 text-left">
                {getPersonalizedTips().map((tip, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
                <li className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span>Import your contacts to get started</span>
                </li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              {steps.reduce((acc: JSX.Element[], step, index) => {
                const Icon = step.icon
                const isActive = currentStep >= step.id
                const isCurrent = currentStep === step.id
                acc.push(
                  <Tooltip key={`tooltip-${step.id}`}>
                    <TooltipTrigger asChild>
                      <motion.div
                        className={`w-6 md:w-10 h-6 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                          isActive 
                            ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                        } ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-900/50' : ''}`}
                        animate={{ scale: isCurrent ? 1.1 : 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <p>{step.title}: {step.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
                if (index < steps.length - 1) {
                  acc.push(
                    <div 
                      key={`conn-${step.id}`} 
                      className={`w-4 md:w-8 h-0.5 ${
                        currentStep > step.id ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`} 
                    />
                  );
                }
                return acc;
              }, [])}
            </div>
          </div>

          {/* Main content card */}
          <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: currentStep > 1 ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: currentStep > 1 ? -50 : 50 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="flex items-center space-x-2 px-6 h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {currentStep === steps.length ? (
              <Button
                onClick={completeOnboarding}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 flex items-center space-x-2 px-6 h-10 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <span>Launch Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 flex items-center space-x-2 px-6 h-10 text-white"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}