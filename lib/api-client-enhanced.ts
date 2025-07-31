import type { ApiResponse, PaginationParams } from "@/types"

class EnhancedApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl

    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken") || localStorage.getItem("accessToken")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token)
      localStorage.setItem("authToken", token) // Backward compatibility
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("authToken")
      localStorage.removeItem("refreshToken")
    }
  }

  private async checkNetworkConnectivity(): Promise<void> {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const requestId = Math.random().toString(36).substr(2, 9)
    
    console.log(`[${requestId}] Enhanced API Request:`, { url, method: options.method || 'GET' })

    try {
      // Validate we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('API client can only be used in browser environment')
      }

      // Check network connectivity
      await this.checkNetworkConnectivity()

      // Check if fetch is available
      if (typeof fetch === 'undefined') {
        throw new Error('Fetch is not available in this environment')
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      console.log(`[${requestId}] Making fetch request to:`, url)
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for enhanced auth
      })

      console.log(`[${requestId}] Response status:`, response.status)

      let data: any
      
      try {
        const contentType = response.headers.get('content-type')
        console.log(`[${requestId}] Response content-type:`, contentType)
        
        const text = await response.text()
        console.log(`[${requestId}] Response text:`, text)
        
        if (!text) {
          data = {}
        } else if (contentType && contentType.includes('application/json')) {
          try {
            data = JSON.parse(text)
          } catch (jsonError) {
            console.warn(`[${requestId}] Failed to parse JSON despite content-type:`, jsonError)
            data = { message: text }
          }
        } else if (text.startsWith('{') || text.startsWith('[')) {
          try {
            data = JSON.parse(text)
          } catch (jsonError) {
            console.warn(`[${requestId}] Failed to parse JSON-like text:`, jsonError)
            data = { message: text }
          }
        } else {
          data = { message: text }
        }
        
        console.log(`[${requestId}] Parsed response data:`, data)
      } catch (parseError) {
        console.error(`[${requestId}] Error parsing response:`, parseError)
        throw new Error(`Failed to parse server response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }

      if (!response.ok) {
        const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`
        console.error(`[${requestId}] API request failed with status:`, response.status, 'data:', data)
        
        // Handle token expiry
        if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
          console.log(`[${requestId}] Token expired, attempting refresh...`)
          return this.handleTokenRefresh(endpoint, options)
        }
        
        throw new Error(errorMessage)
      }

      console.log(`[${requestId}] API request successful:`, data)
      return data
    } catch (error) {
      console.error(`[${requestId}] API request failed:`, {
        url,
        error: error instanceof Error ? error.message : String(error),
      })
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection and try again.')
      }
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error(typeof error === 'string' ? error : 'An unexpected error occurred')
    }
  }

  private async handleTokenRefresh<T>(originalEndpoint: string, originalOptions: RequestInit): Promise<ApiResponse<T>> {
    try {
      console.log('Attempting to refresh token...')
      
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        if (refreshData.success && refreshData.data.accessToken) {
          console.log('Token refreshed successfully')
          this.setToken(refreshData.data.accessToken)
          
          // Retry original request with new token
          return this.request(originalEndpoint, originalOptions)
        }
      }
      
      // Refresh failed, clear tokens and redirect to login
      console.log('Token refresh failed, redirecting to login')
      this.clearToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      throw new Error('Authentication expired. Please log in again.')
      
    } catch (error) {
      console.error('Token refresh error:', error)
      this.clearToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      throw new Error('Authentication expired. Please log in again.')
    }
  }

  // Enhanced login method
  async login(email: string, password: string, rememberMe = false) {
    return this.request("/auth/login-enhanced", {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    })
  }

  // Enhanced register method
  async register(userData: any) {
    return this.request("/auth/register-enhanced", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Fallback to original login for backward compatibility
  async loginOriginal(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async logout() {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.clearToken()
    }
  }

  async verifyUser() {
    return this.request("/auth/verify", {
      method: "GET",
    })
  }

  // Generic CRUD methods (same as before)
  async get<T>(endpoint: string, params?: PaginationParams): Promise<ApiResponse<T[]>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }

    const query = searchParams.toString()
    const url = query ? `${endpoint}?${query}` : endpoint

    return this.request<T[]>(url)
  }

  async getById<T>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`)
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, id: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, id: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string, id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${endpoint}/${id}`, {
      method: "DELETE",
    })
  }
}

// Export both the class and an instance
export const enhancedApiClient = new EnhancedApiClient()
export { EnhancedApiClient }

// For backward compatibility, also export as apiClient
export const apiClient = enhancedApiClient
