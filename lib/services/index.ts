// CRM Services - Master Export File
// Comprehensive collection of all CRM service modules

export * from './contact-service'
export * from './deal-service'
export * from './campaign-service'
export * from './task-service'
export * from './analytics-service'

// Base Service Class
export abstract class BaseService {
  protected baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }

    return response.json()
  }

  protected buildQueryParams(params: Record<string, any>): URLSearchParams {
    const queryParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','))
        } else if (value instanceof Date) {
          queryParams.append(key, value.toISOString())
        } else {
          queryParams.append(key, value.toString())
        }
      }
    })

    return queryParams
  }
}

// Service Error Classes
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ServiceError {
  constructor(message = 'Forbidden access') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

// Service Utilities
export const serviceUtils = {
  /**
   * Retry a request with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.sleep(delay)
        return this.retry(fn, retries - 1, delay * 2)
      }
      throw error
    }
  },

  /**
   * Check if error is retryable
   */
  isRetryableError(error: any): boolean {
    if (error instanceof ServiceError) {
      return error.statusCode ? error.statusCode >= 500 : false
    }
    return false
  },

  /**
   * Sleep utility for retry delays
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * Format currency values
   */
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  },

  /**
   * Format dates consistently
   */
  formatDate(date: Date, locale = 'en-US'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  },

  /**
   * Debounce function for search inputs
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  /**
   * Generate unique request ID
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Calculate pagination info
   */
  calculatePagination(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return {
      page,
      limit,
      total,
      totalPages,
      offset,
      hasNext,
      hasPrev,
    }
  },
}

// Cache Manager for client-side caching
export class CacheManager {
  private cache = new Map<string, { data: any; expiry: number }>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any, ttl = this.defaultTTL): void {
    const expiry = Date.now() + ttl
    this.cache.set(key, { data, expiry })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const cache = new CacheManager()

// Auto-cleanup cache every 10 minutes
setInterval(() => cache.cleanup(), 10 * 60 * 1000)

// Request interceptor for authentication
export const requestInterceptor = {
  async beforeRequest(config: RequestInit): Promise<RequestInit> {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      }
    }

    // Add request ID for tracking
    config.headers = {
      ...config.headers,
      'X-Request-ID': serviceUtils.generateRequestId(),
    }

    return config
  },

  async afterResponse(response: Response): Promise<Response> {
    // Handle token refresh
    if (response.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        // Implement token refresh logic here
        console.warn('Token expired, refresh needed')
      }
    }

    return response
  },
}

// Service Configuration
export interface ServiceConfig {
  baseURL: string
  timeout: number
  retries: number
  cacheTTL: number
  enableCache: boolean
  enableRetry: boolean
}

export const defaultServiceConfig: ServiceConfig = {
  baseURL: '/api',
  timeout: 30000,
  retries: 3,
  cacheTTL: 5 * 60 * 1000,
  enableCache: true,
  enableRetry: true,
}

// Service Factory
export class ServiceFactory {
  private config: ServiceConfig

  constructor(config: Partial<ServiceConfig> = {}) {
    this.config = { ...defaultServiceConfig, ...config }
  }

  createContactService() {
    return new (class extends BaseService {
      constructor() {
        super('/api/contacts')
      }
    })()
  }

  createDealService() {
    return new (class extends BaseService {
      constructor() {
        super('/api/deals')
      }
    })()
  }

  createCampaignService() {
    return new (class extends BaseService {
      constructor() {
        super('/api/campaigns')
      }
    })()
  }

  createTaskService() {
    return new (class extends BaseService {
      constructor() {
        super('/api/tasks')
      }
    })()
  }

  createAnalyticsService() {
    return new (class extends BaseService {
      constructor() {
        super('/api/analytics')
      }
    })()
  }
}
