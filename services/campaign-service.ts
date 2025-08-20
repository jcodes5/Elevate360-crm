import { CampaignModel, CampaignSearchParams, PaginatedResult, ApiResponse, CampaignAnalytics } from "@/lib/models"

const API_BASE_URL = "/api/campaigns"

class CampaignService {
  // Get all campaigns with search and pagination
  static async getAllCampaigns(params?: CampaignSearchParams): Promise<PaginatedResult<CampaignModel>> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value instanceof Date) {
            searchParams.append(key, value.toISOString())
          } else if (Array.isArray(value)) {
            searchParams.append(key, value.join(','))
          } else {
            searchParams.append(key, String(value))
          }
        }
      })
    }
    
    const response = await fetch(`${API_BASE_URL}?${searchParams.toString()}`)
    const data: ApiResponse<PaginatedResult<CampaignModel>> = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch campaigns")
    }
    
    return data.data!
  }

  // Get campaign by ID
  static async getCampaignById(id: string): Promise<CampaignModel> {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    const data: ApiResponse<CampaignModel> = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch campaign")
    }
    
    return data.data!
  }

  // Create new campaign
  static async createCampaign(campaign: Partial<CampaignModel>): Promise<CampaignModel> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campaign),
    })
    
    const data: ApiResponse<CampaignModel> = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to create campaign")
    }
    
    return data.data!
  }

  // Update campaign
  static async updateCampaign(id: string, campaign: Partial<CampaignModel>): Promise<CampaignModel> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campaign),
    })
    
    const data: ApiResponse<CampaignModel> = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to update campaign")
    }
    
    return data.data!
  }

  // Delete campaign
  static async deleteCampaign(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
    
    const data: ApiResponse = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to delete campaign")
    }
  }

  // Bulk update campaigns
  static async bulkUpdateCampaigns(ids: string[], updates: Partial<CampaignModel>): Promise<CampaignModel[]> {
    const response = await fetch(`${API_BASE_URL}/bulk`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids, updates }),
    })
    
    const data: ApiResponse<CampaignModel[]> = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to bulk update campaigns")
    }
    
    return data.data!
  }

  // Get campaign analytics
  static async getAnalytics(): Promise<CampaignAnalytics> {
    const response = await fetch(`${API_BASE_URL}/analytics`)
    const data: ApiResponse<CampaignAnalytics> = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch analytics")
    }
    
    return data.data!
  }

  // Send campaign
  static async sendCampaign(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}/send`, {
      method: "POST",
    })
    
    const data: ApiResponse = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to send campaign")
    }
  }

  // Schedule campaign
  static async scheduleCampaign(id: string, scheduleTime: Date): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scheduleTime }),
    })
    
    const data: ApiResponse = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || "Failed to schedule campaign")
    }
  }
}

export { CampaignService }
