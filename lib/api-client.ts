import type { ApiResponse, PaginationParams } from "@/types"

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl

    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken")
    }
  }

  private async checkNetworkConnectivity(): Promise<void> {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const requestId = Math.random().toString(36).substr(2, 9)

    console.log(`[${requestId}] API Request:`, { url, method: options.method || 'GET', baseUrl: this.baseUrl, endpoint })

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

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

      console.log(`[${requestId}] Making fetch request to:`, url, 'with headers:', headers)

      const response = await fetch(url, {
        ...options,
        headers,
        // Add credentials to handle cookies if needed
        credentials: 'same-origin',
      })

      console.log(`[${requestId}] Response status:`, response.status, 'statusText:', response.statusText)

      let data: any

      try {
        // Check if response body has already been consumed
        if (response.bodyUsed) {
          console.error(`[${requestId}] Response body has already been consumed!`)
          throw new Error('Response body has already been consumed by another process')
        }

        // Check if response has content before trying to parse
        const contentType = response.headers.get('content-type')
        console.log(`[${requestId}] Response content-type:`, contentType)
        console.log(`[${requestId}] Response body used?`, response.bodyUsed)

        // Read the response body
        let text: string
        try {
          text = await response.text()
          console.log('Response text:', text)
        } catch (textError) {
          console.error('Failed to read response text:', textError)

          // If text() fails, try to handle the error gracefully
          if (textError instanceof Error && textError.message.includes('body stream already read')) {
            throw new Error('Response body was consumed by another process before API client could read it')
          }
          throw new Error(`Failed to read response: ${textError instanceof Error ? textError.message : 'Unknown error'}`)
        }

        if (!text) {
          data = {}
        } else if (contentType && contentType.includes('application/json')) {
          // Parse as JSON if content-type suggests it
          try {
            data = JSON.parse(text)
          } catch (jsonError) {
            console.warn('Failed to parse JSON despite content-type:', jsonError)
            data = { message: text }
          }
        } else if (text.startsWith('{') || text.startsWith('[')) {
          // Try to parse as JSON if it looks like JSON
          try {
            data = JSON.parse(text)
          } catch (jsonError) {
            console.warn('Failed to parse JSON-like text:', jsonError)
            data = { message: text }
          }
        } else {
          data = { message: text }
        }

        console.log('Parsed response data:', data)
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        throw new Error(`Failed to parse server response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }

      if (!response.ok) {
        const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('API request failed with status:', response.status, 'data:', data)
        throw new Error(errorMessage)
      }

      console.log('API request successful:', data)
      return data
    } catch (error) {
      console.error('API request failed:', {
        url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection and try again.')
      }

      // Handle specific error types
      if (error instanceof Error) {
        throw error
      }

      // Handle non-Error objects
      throw new Error(typeof error === 'string' ? error : 'An unexpected error occurred')
    }
  }

  // Generic CRUD methods
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

  // Authentication methods
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  }

  async logout() {
    this.clearToken()
    return this.request("/auth/logout", {
      method: "POST",
    })
  }
}

export const apiClient = new ApiClient()
