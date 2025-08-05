"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  FileText, 
  Video, 
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  Users,
  Tag,
  Filter,
  ChevronRight,
  ChevronDown,
  Help,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Globe,
  Lock,
  Settings,
  BarChart3,
  TrendingUp
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'internal' | 'customer_only'
  type: 'article' | 'tutorial' | 'faq' | 'video' | 'download'
  helpfulness: {
    helpful: number
    notHelpful: number
  }
  views: number
  lastUpdated: Date
  createdAt: Date
  attachments?: {
    name: string
    url: string
    type: string
    size: number
  }[]
  relatedArticles?: string[]
}

interface Category {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  articleCount: number
  isPublic: boolean
  order: number
  parentId?: string
  subcategories?: Category[]
}

interface KnowledgeBaseAnalytics {
  totalArticles: number
  totalViews: number
  avgHelpfulness: number
  topSearches: string[]
  popularArticles: Article[]
  categoryPerformance: {
    category: string
    views: number
    helpfulness: number
  }[]
}

const defaultCategories: Category[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics and set up your account',
    icon: Lightbulb,
    articleCount: 12,
    isPublic: true,
    order: 1
  },
  {
    id: 'account-management',
    name: 'Account Management',
    description: 'Manage your account settings and preferences',
    icon: Settings,
    articleCount: 8,
    isPublic: true,
    order: 2
  },
  {
    id: 'features',
    name: 'Features & How-to',
    description: 'Detailed guides on using platform features',
    icon: BookOpen,
    articleCount: 24,
    isPublic: true,
    order: 3
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and their solutions',
    icon: AlertCircle,
    articleCount: 16,
    isPublic: true,
    order: 4
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    description: 'Technical documentation for developers',
    icon: FileText,
    articleCount: 32,
    isPublic: true,
    order: 5
  },
  {
    id: 'billing',
    name: 'Billing & Pricing',
    description: 'Information about pricing plans and billing',
    icon: CreditCard,
    articleCount: 6,
    isPublic: true,
    order: 6
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    description: 'Security features and privacy policies',
    icon: Lock,
    articleCount: 10,
    isPublic: true,
    order: 7
  }
]

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Getting Started with Your CRM',
    content: `# Getting Started with Your CRM

Welcome to Elevate360 CRM! This guide will help you get started with your new CRM system.

## Step 1: Set Up Your Profile
First, complete your user profile by adding your personal information and preferences.

## Step 2: Import Your Contacts
You can import contacts from CSV files or connect to other systems.

## Step 3: Configure Your Pipeline
Set up your sales pipeline stages to match your business process.

## Next Steps
- Explore the dashboard
- Set up your first campaign
- Invite team members`,
    excerpt: 'Learn how to set up and configure your CRM account for the first time.',
    category: 'getting-started',
    tags: ['setup', 'onboarding', 'basics'],
    author: 'Support Team',
    status: 'published',
    visibility: 'public',
    type: 'tutorial',
    helpfulness: { helpful: 45, notHelpful: 3 },
    views: 1247,
    lastUpdated: new Date('2024-01-20'),
    createdAt: new Date('2024-01-15'),
    relatedArticles: ['2', '3']
  },
  {
    id: '2',
    title: 'How to Import Contacts from CSV',
    content: `# How to Import Contacts from CSV

Follow these steps to import your existing contacts into the CRM.

## Preparing Your CSV File
- Ensure proper column headers
- Clean your data
- Remove duplicates

## Import Process
1. Go to Contacts > Import
2. Select your CSV file
3. Map the columns
4. Review and confirm

## Troubleshooting
Common issues and how to resolve them.`,
    excerpt: 'Step-by-step guide to importing your contacts from CSV files.',
    category: 'features',
    tags: ['import', 'contacts', 'csv'],
    author: 'John Smith',
    status: 'published',
    visibility: 'public',
    type: 'tutorial',
    helpfulness: { helpful: 38, notHelpful: 2 },
    views: 892,
    lastUpdated: new Date('2024-01-18'),
    createdAt: new Date('2024-01-10'),
    attachments: [
      {
        name: 'sample-contacts.csv',
        url: '/downloads/sample-contacts.csv',
        type: 'text/csv',
        size: 2048
      }
    ]
  },
  {
    id: '3',
    title: 'Setting Up Email Campaigns',
    content: `# Setting Up Email Campaigns

Create effective email campaigns to engage your contacts.

## Campaign Types
- Welcome series
- Newsletter
- Product announcements
- Follow-up sequences

## Best Practices
- Segment your audience
- Personalize content
- Test subject lines
- Track performance`,
    excerpt: 'Learn how to create and manage email marketing campaigns.',
    category: 'features',
    tags: ['email', 'campaigns', 'marketing'],
    author: 'Sarah Johnson',
    status: 'published',
    visibility: 'public',
    type: 'article',
    helpfulness: { helpful: 52, notHelpful: 1 },
    views: 1156,
    lastUpdated: new Date('2024-01-19'),
    createdAt: new Date('2024-01-12')
  },
  {
    id: '4',
    title: 'Why Are My Emails Not Sending?',
    content: `# Why Are My Emails Not Sending?

Common reasons why emails might not be sending and how to fix them.

## Check Your SMTP Settings
Verify your email configuration...

## Sender Reputation
Ensure your domain has proper authentication...

## Contact List Issues
Review your contact lists for issues...`,
    excerpt: 'Troubleshoot common email delivery issues.',
    category: 'troubleshooting',
    tags: ['email', 'troubleshooting', 'delivery'],
    author: 'Support Team',
    status: 'published',
    visibility: 'public',
    type: 'faq',
    helpfulness: { helpful: 29, notHelpful: 4 },
    views: 634,
    lastUpdated: new Date('2024-01-21'),
    createdAt: new Date('2024-01-16')
  },
  {
    id: '5',
    title: 'API Authentication Guide',
    content: `# API Authentication Guide

Learn how to authenticate with our API.

## Getting Your API Key
1. Go to Settings > API
2. Generate a new key
3. Store it securely

## Making Authenticated Requests
Include your API key in the header...

## Rate Limits
Understand API rate limiting...`,
    excerpt: 'Complete guide to authenticating with the CRM API.',
    category: 'api-documentation',
    tags: ['api', 'authentication', 'developers'],
    author: 'Dev Team',
    status: 'published',
    visibility: 'public',
    type: 'article',
    helpfulness: { helpful: 67, notHelpful: 2 },
    views: 2134,
    lastUpdated: new Date('2024-01-22'),
    createdAt: new Date('2024-01-05')
  }
]

const analytics: KnowledgeBaseAnalytics = {
  totalArticles: 108,
  totalViews: 15247,
  avgHelpfulness: 91.2,
  topSearches: ['email setup', 'import contacts', 'api documentation', 'troubleshooting', 'billing'],
  popularArticles: mockArticles.slice(0, 3),
  categoryPerformance: [
    { category: 'Features & How-to', views: 4200, helpfulness: 89 },
    { category: 'API Documentation', views: 3800, helpfulness: 94 },
    { category: 'Getting Started', views: 3200, helpfulness: 92 },
    { category: 'Troubleshooting', views: 2100, helpfulness: 86 },
    { category: 'Account Management', views: 1400, helpfulness: 88 }
  ]
}

function ArticleCard({ article, onEdit, onDelete }: { 
  article: Article
  onEdit: (article: Article) => void
  onDelete: (id: string) => void
}) {
  const getTypeIcon = (type: Article['type']) => {
    switch (type) {
      case 'tutorial': return BookOpen
      case 'faq': return Help
      case 'video': return Video
      case 'download': return Download
      default: return FileText
    }
  }

  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVisibilityIcon = (visibility: Article['visibility']) => {
    switch (visibility) {
      case 'public': return Globe
      case 'internal': return Users
      case 'customer_only': return Lock
      default: return Globe
    }
  }

  const Icon = getTypeIcon(article.type)
  const VisibilityIcon = getVisibilityIcon(article.visibility)
  const helpfulnessRate = article.helpfulness.helpful + article.helpfulness.notHelpful > 0 
    ? (article.helpfulness.helpful / (article.helpfulness.helpful + article.helpfulness.notHelpful)) * 100 
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <CardTitle className="text-base mb-1">{article.title}</CardTitle>
                <CardDescription className="text-sm">
                  {article.excerpt}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(article.status)}>
                {article.status}
              </Badge>
              <VisibilityIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{article.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-3 w-3" />
                <span>{helpfulnessRate.toFixed(0)}% helpful</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                By {article.author} • {article.lastUpdated.toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(article)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(article.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CategoryTree({ categories, onSelectCategory }: { 
  categories: Category[]
  onSelectCategory: (categoryId: string) => void 
}) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const Icon = category.icon
        const isExpanded = expandedCategories.includes(category.id)
        
        return (
          <div key={category.id}>
            <div 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => onSelectCategory(category.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 font-medium">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.articleCount}
              </Badge>
              {category.subcategories && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCategory(category.id)
                  }}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
            </div>
            
            {category.subcategories && isExpanded && (
              <div className="ml-6 space-y-1">
                {category.subcategories.map((subcategory) => {
                  const SubIcon = subcategory.icon
                  return (
                    <div 
                      key={subcategory.id}
                      className="flex items-center space-x-2 p-1 rounded hover:bg-muted cursor-pointer"
                      onClick={() => onSelectCategory(subcategory.id)}
                    >
                      <SubIcon className="h-3 w-3" />
                      <span className="text-sm">{subcategory.name}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {subcategory.articleCount}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ArticleEditor({ 
  article, 
  onSave, 
  onCancel 
}: { 
  article?: Article
  onSave: (articleData: Partial<Article>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    excerpt: article?.excerpt || '',
    category: article?.category || 'getting-started',
    tags: article?.tags?.join(', ') || '',
    type: article?.type || 'article',
    status: article?.status || 'draft',
    visibility: article?.visibility || 'public'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const articleData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      lastUpdated: new Date()
    }

    onSave(articleData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Article Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter article title"
          required
        />
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          placeholder="Brief description of the article"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {defaultCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
              <SelectItem value="faq">FAQ</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="download">Download</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="setup, tutorial, beginner"
        />
      </div>

      <div>
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Write your article content in Markdown format..."
          rows={15}
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="visibility">Visibility</Label>
          <Select 
            value={formData.visibility} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="customer_only">Customer Only</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Button type="submit">
          {article ? 'Update Article' : 'Create Article'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [categories] = useState<Category[]>(defaultCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || article.status === selectedStatus
      const matchesType = selectedType === "all" || article.type === selectedType

      return matchesSearch && matchesCategory && matchesStatus && matchesType
    })
  }, [articles, searchTerm, selectedCategory, selectedStatus, selectedType])

  const handleCreateArticle = (articleData: Partial<Article>) => {
    const newArticle: Article = {
      id: `article_${Date.now()}`,
      ...articleData,
      author: 'Current User',
      helpfulness: { helpful: 0, notHelpful: 0 },
      views: 0,
      createdAt: new Date()
    } as Article

    setArticles([...articles, newArticle])
    setShowCreateDialog(false)

    toast({
      title: "Success",
      description: "Article created successfully",
    })
  }

  const handleUpdateArticle = (articleData: Partial<Article>) => {
    if (!editingArticle) return

    const updatedArticle = { ...editingArticle, ...articleData }
    setArticles(articles.map(a => a.id === editingArticle.id ? updatedArticle : a))
    setEditingArticle(null)

    toast({
      title: "Success",
      description: "Article updated successfully",
    })
  }

  const handleDeleteArticle = (articleId: string) => {
    setArticles(articles.filter(a => a.id !== articleId))
    
    toast({
      title: "Success",
      description: "Article deleted successfully",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Create and manage help articles for your customers
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Helpfulness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgHelpfulness}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1.5%</span> improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.filter(a => a.status === 'published').length}</div>
            <p className="text-xs text-muted-foreground">
              {articles.filter(a => a.status === 'draft').length} drafts pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div 
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                        selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span className="flex-1">All Articles</span>
                      <Badge variant="secondary" className="text-xs">
                        {articles.length}
                      </Badge>
                    </div>
                    <CategoryTree 
                      categories={categories} 
                      onSelectCategory={setSelectedCategory}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search articles..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Articles Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onEdit={setEditingArticle}
                      onDelete={handleDeleteArticle}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {filteredArticles.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No articles found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first article'}
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Article
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Categories</CardTitle>
              <CardDescription>
                Organize your articles into categories for better navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{category.articleCount}</Badge>
                        </TableCell>
                        <TableCell>
                          {category.isPublic ? (
                            <Badge className="bg-green-500">Public</Badge>
                          ) : (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Articles</CardTitle>
                <CardDescription>Most viewed articles this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.popularArticles.map((article, index) => (
                    <div key={article.id} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-muted-foreground">{article.views} views</div>
                      </div>
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Searches</CardTitle>
                <CardDescription>What users are searching for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{search}</span>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Views and helpfulness by category</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Helpfulness</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.categoryPerformance.map((category) => (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell>{category.views.toLocaleString()}</TableCell>
                      <TableCell>{category.helpfulness}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant={category.helpfulness > 90 ? "default" : category.helpfulness > 80 ? "secondary" : "destructive"}
                          className={category.helpfulness > 90 ? "bg-green-500" : ""}
                        >
                          {category.helpfulness > 90 ? 'Excellent' : category.helpfulness > 80 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Article Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
            <DialogDescription>
              Add a new article to your knowledge base
            </DialogDescription>
          </DialogHeader>
          <ArticleEditor
            onSave={handleCreateArticle}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      {editingArticle && (
        <Dialog open={!!editingArticle} onOpenChange={() => setEditingArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Article</DialogTitle>
              <DialogDescription>
                Update article content and settings
              </DialogDescription>
            </DialogHeader>
            <ArticleEditor
              article={editingArticle}
              onSave={handleUpdateArticle}
              onCancel={() => setEditingArticle(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
