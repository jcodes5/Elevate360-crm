"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Building2, 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Clock, 
  Mail, 
  Phone,
  MapPin,
  CreditCard,
  Users,
  Database,
  Key,
  Upload,
  Download,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface OrganizationSettings {
  // Company Information
  companyName: string
  companyLogo?: string
  industry: string
  companySize: string
  website?: string
  description?: string
  
  // Contact Information
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  phone?: string
  email: string
  
  // Business Settings
  timezone: string
  dateFormat: string
  timeFormat: string
  currency: string
  language: string
  fiscalYearStart: string
  
  // Security Settings
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
    expiryDays: number
  }
  twoFactorRequired: boolean
  sessionTimeout: number
  allowRemoteAccess: boolean
  ipWhitelist: string[]
  
  // Email & Notifications
  emailSettings: {
    smtpServer: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    useSSL: boolean
    fromName: string
    fromEmail: string
  }
  notificationSettings: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    webhookNotifications: boolean
    dailyReports: boolean
    weeklyReports: boolean
    systemAlerts: boolean
  }
  
  // API & Integrations
  apiSettings: {
    enablePublicAPI: boolean
    rateLimitPerHour: number
    webhookSecret: string
    allowedOrigins: string[]
  }
  
  // Data & Privacy
  dataRetention: {
    contactDataDays: number
    activityLogsDays: number
    emailLogsDays: number
    backupFrequency: string
    anonymizeAfterDays: number
  }
  privacySettings: {
    allowDataExport: boolean
    allowDataDeletion: boolean
    cookieConsent: boolean
    gdprCompliant: boolean
  }
  
  // Customization
  branding: {
    primaryColor: string
    secondaryColor: string
    logoUrl?: string
    faviconUrl?: string
    customCSS?: string
    hideBuilderBranding: boolean
  }
}

const defaultSettings: OrganizationSettings = {
  companyName: "Elevate360 CRM",
  industry: "Technology",
  companySize: "11-50",
  email: "admin@elevate360.com",
  address: {
    street: "",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    postalCode: ""
  },
  timezone: "Africa/Lagos",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  currency: "NGN",
  language: "en",
  fiscalYearStart: "January",
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    expiryDays: 90
  },
  twoFactorRequired: false,
  sessionTimeout: 480,
  allowRemoteAccess: true,
  ipWhitelist: [],
  emailSettings: {
    smtpServer: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    useSSL: true,
    fromName: "Elevate360 CRM",
    fromEmail: "noreply@elevate360.com"
  },
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    webhookNotifications: false,
    dailyReports: true,
    weeklyReports: true,
    systemAlerts: true
  },
  apiSettings: {
    enablePublicAPI: false,
    rateLimitPerHour: 1000,
    webhookSecret: "",
    allowedOrigins: []
  },
  dataRetention: {
    contactDataDays: 2555, // 7 years
    activityLogsDays: 365,
    emailLogsDays: 180,
    backupFrequency: "daily",
    anonymizeAfterDays: 2555
  },
  privacySettings: {
    allowDataExport: true,
    allowDataDeletion: true,
    cookieConsent: true,
    gdprCompliant: true
  },
  branding: {
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    hideBuilderBranding: false
  }
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Professional Services",
  "Non-Profit",
  "Other"
]

const companySizes = [
  "1-10",
  "11-50", 
  "51-200",
  "201-500",
  "501-1000",
  "1000+"
]

const timezones = [
  "Africa/Lagos",
  "Africa/Cairo",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney"
]

const currencies = [
  { code: "NGN", name: "Nigerian Naira (₦)" },
  { code: "USD", name: "US Dollar ($)" },
  { code: "EUR", name: "Euro (€)" },
  { code: "GBP", name: "British Pound (£)" },
  { code: "CAD", name: "Canadian Dollar (C$)" }
]

const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France"
]

function CompanyInfoSection({ settings, onUpdate }: { 
  settings: OrganizationSettings, 
  onUpdate: (updates: Partial<OrganizationSettings>) => void 
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Company Information</span>
          </CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => onUpdate({ companyName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={settings.website || ''}
                onChange={(e) => onUpdate({ website: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={settings.industry} 
                onValueChange={(value) => onUpdate({ industry: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="companySize">Company Size</Label>
              <Select 
                value={settings.companySize} 
                onValueChange={(value) => onUpdate({ companySize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              value={settings.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Brief description of your company"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Company Email *</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone || ''}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                placeholder="+234..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={settings.address.street}
              onChange={(e) => onUpdate({ 
                address: { ...settings.address, street: e.target.value }
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={settings.address.city}
                onChange={(e) => onUpdate({ 
                  address: { ...settings.address, city: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={settings.address.state}
                onChange={(e) => onUpdate({ 
                  address: { ...settings.address, state: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select 
                value={settings.address.country} 
                onValueChange={(value) => onUpdate({ 
                  address: { ...settings.address, country: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={settings.address.postalCode}
                onChange={(e) => onUpdate({ 
                  address: { ...settings.address, postalCode: e.target.value }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BusinessSettingsSection({ settings, onUpdate }: { 
  settings: OrganizationSettings, 
  onUpdate: (updates: Partial<OrganizationSettings>) => void 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Regional & Business Settings</span>
        </CardTitle>
        <CardDescription>
          Configure timezone, currency, and date formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select 
              value={settings.timezone} 
              onValueChange={(value) => onUpdate({ timezone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="currency">Default Currency</Label>
            <Select 
              value={settings.currency} 
              onValueChange={(value) => onUpdate({ currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select 
              value={settings.dateFormat} 
              onValueChange={(value) => onUpdate({ dateFormat: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="timeFormat">Time Format</Label>
            <Select 
              value={settings.timeFormat} 
              onValueChange={(value) => onUpdate({ timeFormat: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12 Hour</SelectItem>
                <SelectItem value="24h">24 Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
            <Select 
              value={settings.fiscalYearStart} 
              onValueChange={(value) => onUpdate({ fiscalYearStart: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="January">January</SelectItem>
                <SelectItem value="April">April</SelectItem>
                <SelectItem value="July">July</SelectItem>
                <SelectItem value="October">October</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SecuritySettingsSection({ settings, onUpdate }: { 
  settings: OrganizationSettings, 
  onUpdate: (updates: Partial<OrganizationSettings>) => void 
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Password Policy</span>
          </CardTitle>
          <CardDescription>
            Configure password requirements for all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="minLength">Minimum Password Length</Label>
            <Input
              id="minLength"
              type="number"
              min="6"
              max="32"
              value={settings.passwordPolicy.minLength}
              onChange={(e) => onUpdate({ 
                passwordPolicy: { 
                  ...settings.passwordPolicy, 
                  minLength: parseInt(e.target.value) 
                }
              })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="requireUppercase"
                checked={settings.passwordPolicy.requireUppercase}
                onCheckedChange={(checked) => onUpdate({ 
                  passwordPolicy: { 
                    ...settings.passwordPolicy, 
                    requireUppercase: checked 
                  }
                })}
              />
              <Label htmlFor="requireUppercase">Require uppercase letters</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="requireNumbers"
                checked={settings.passwordPolicy.requireNumbers}
                onCheckedChange={(checked) => onUpdate({ 
                  passwordPolicy: { 
                    ...settings.passwordPolicy, 
                    requireNumbers: checked 
                  }
                })}
              />
              <Label htmlFor="requireNumbers">Require numbers</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="requireSymbols"
                checked={settings.passwordPolicy.requireSymbols}
                onCheckedChange={(checked) => onUpdate({ 
                  passwordPolicy: { 
                    ...settings.passwordPolicy, 
                    requireSymbols: checked 
                  }
                })}
              />
              <Label htmlFor="requireSymbols">Require special characters</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="expiryDays">Password Expiry (days)</Label>
            <Input
              id="expiryDays"
              type="number"
              min="30"
              max="365"
              value={settings.passwordPolicy.expiryDays}
              onChange={(e) => onUpdate({ 
                passwordPolicy: { 
                  ...settings.passwordPolicy, 
                  expiryDays: parseInt(e.target.value) 
                }
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>
            Manage session and access security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="twoFactorRequired"
              checked={settings.twoFactorRequired}
              onCheckedChange={(checked) => onUpdate({ twoFactorRequired: checked })}
            />
            <Label htmlFor="twoFactorRequired">Require Two-Factor Authentication for all users</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allowRemoteAccess"
              checked={settings.allowRemoteAccess}
              onCheckedChange={(checked) => onUpdate({ allowRemoteAccess: checked })}
            />
            <Label htmlFor="allowRemoteAccess">Allow remote access</Label>
          </div>

          <div>
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              min="30"
              max="1440"
              value={settings.sessionTimeout}
              onChange={(e) => onUpdate({ sessionTimeout: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function OrganizationSettings() {
  const [settings, setSettings] = useState<OrganizationSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState("company")
  const [hasChanges, setHasChanges] = useState(false)

  const handleUpdate = (updates: Partial<OrganizationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // In real app, save to backend
    setHasChanges(false)
    toast({
      title: "Success",
      description: "Organization settings saved successfully",
    })
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(false)
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Settings</h2>
          <p className="text-muted-foreground">
            Configure your organization's information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="business">
            <Globe className="h-4 w-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanyInfoSection settings={settings} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <BusinessSettingsSection settings={settings} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettingsSection settings={settings} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure how your organization receives notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={settings.notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleUpdate({ 
                      notificationSettings: { 
                        ...settings.notificationSettings, 
                        emailNotifications: checked 
                      }
                    })}
                  />
                  <Label htmlFor="emailNotifications">Email notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="systemAlerts"
                    checked={settings.notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => handleUpdate({ 
                      notificationSettings: { 
                        ...settings.notificationSettings, 
                        systemAlerts: checked 
                      }
                    })}
                  />
                  <Label htmlFor="systemAlerts">System alerts</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dailyReports"
                    checked={settings.notificationSettings.dailyReports}
                    onCheckedChange={(checked) => handleUpdate({ 
                      notificationSettings: { 
                        ...settings.notificationSettings, 
                        dailyReports: checked 
                      }
                    })}
                  />
                  <Label htmlFor="dailyReports">Daily reports</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="weeklyReports"
                    checked={settings.notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => handleUpdate({ 
                      notificationSettings: { 
                        ...settings.notificationSettings, 
                        weeklyReports: checked 
                      }
                    })}
                  />
                  <Label htmlFor="weeklyReports">Weekly reports</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
