"use client"

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  Trash2, 
  Send, 
  Pause, 
  Play, 
  BarChart3, 
  MoreHorizontal 
} from "lucide-react"
import { CampaignModel } from "@/lib/models"

interface CampaignActionsDropdownProps {
  campaign: CampaignModel
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onSend: (id: string) => void
  onPause: (id: string) => void
  onViewAnalytics: (id: string) => void
}

export function CampaignActionsDropdown({ 
  campaign, 
  onEdit, 
  onDelete, 
  onSend, 
  onPause,
  onViewAnalytics
}: CampaignActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(campaign.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        {campaign.status === "draft" && (
          <DropdownMenuItem onClick={() => onSend(campaign.id)}>
            <Send className="mr-2 h-4 w-4" />
            Send
          </DropdownMenuItem>
        )}
        {campaign.status === "scheduled" && (
          <DropdownMenuItem onClick={() => onPause(campaign.id)}>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onViewAnalytics(campaign.id)}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600" 
          onClick={() => onDelete(campaign.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}