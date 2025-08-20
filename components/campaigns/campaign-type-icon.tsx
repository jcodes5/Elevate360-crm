"use client"

import { FileText, MessageSquare, Phone } from "lucide-react"
import { CampaignType } from "@/lib/models"

interface CampaignTypeIconProps {
  type: CampaignType
  className?: string
}

export function CampaignTypeIcon({ type, className = "h-5 w-5" }: CampaignTypeIconProps) {
  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case "email":
        return <FileText className={className} />
      case "sms":
        return <MessageSquare className={className} />
      case "whatsapp":
        return <MessageSquare className={className} />
      case "push_notification":
        return <Phone className={className} />
      default:
        return <FileText className={className} />
    }
  }

  return (
    <div className="flex items-center justify-center">
      {getTypeIcon(type)}
    </div>
  )
}