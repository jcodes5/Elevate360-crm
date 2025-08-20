"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  Calendar,
  Target
} from "lucide-react"
import { CampaignModel } from "@/lib/models"

interface CampaignMetricsCardProps {
  campaign: CampaignModel
}

export function CampaignMetricsCard({ campaign }: CampaignMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Campaign Metrics</span>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          Performance metrics for {campaign.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Delivery Rate</span>
              <span className="font-medium">{campaign.metrics.deliveryRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sent/Delivered</span>
              <span className="text-sm">{campaign.metrics.sent}/{campaign.metrics.delivered}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Open Rate</span>
              <span className="font-medium">{campaign.metrics.openRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Opens</span>
              <span className="text-sm">{campaign.metrics.opened}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Click Rate</span>
              <span className="font-medium">{campaign.metrics.clickRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Clicks</span>
              <span className="text-sm">{campaign.metrics.clicked}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <span className="font-medium">{campaign.metrics.conversionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversions</span>
              <span className="text-sm">{campaign.metrics.conversions}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Revenue Generated</span>
            <span className="font-medium">₦{campaign.metrics.revenue.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}