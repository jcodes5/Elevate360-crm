import type { ApiResponse, PaginationParams } from "@/types";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
  }

  // Read access token from cookies
  private getTokenFromCookies(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('accessToken=')
    );
    
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    return null;
  }

  // Get current token (from memory or cookies)
  private getCurrentToken(): string | null {
    return this.token || this.getTokenFromCookies();
  }

  // Public getter for debugging
  get currentToken(): string | null {
    return this.getCurrentToken();
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async checkNetworkConnectivity(): Promise<void> {
    if (
      typeof navigator !== "undefined" &&
      "onLine" in navigator &&
      !navigator.onLine
    ) {
      throw new Error(
        "No internet connection. Please check your network and try again."
      );
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      console.log("🔄 Attempting token refresh...");
      
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Include cookies for refresh token
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Token refresh response:", data);
        
        if (data.success && data.data?.accessToken) {
          // Update in-memory token
          this.setToken(data.data.accessToken);
          return data.data.accessToken;
        }
      } else {
        console.error("❌ Token refresh failed:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("❌ Token refresh error:", error);
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = Math.random().toString(36).substr(2, 9);

    console.log(`[${requestId}] API Request:`, {
      url,
      method: options.method || "GET",
      baseUrl: this.baseUrl,
      endpoint,
    });

    const headersInit: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers as HeadersInit),
    };
    const headers = new Headers(headersInit);

    // Get current token (memory or cookies)
    const currentToken = this.getCurrentToken();
    console.log(`[${requestId}] Current token available:`, !!currentToken);

    // Add Authorization header if we have a token
    if (currentToken) {
      headers.set("Authorization", `Bearer ${currentToken}`);
      console.log(`[${requestId}] Added Authorization header`);
    }

    try {
      // Validate we're in browser environment
      if (typeof window === "undefined") {
        throw new Error("API client can only be used in browser environment");
      }

      // Check network connectivity
      await this.checkNetworkConnectivity();

      console.log(`[${requestId}] Making request with headers:`, Array.from(headers.entries()));

      let response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Always include cookies
      });

      console.log(`[${requestId}] Response status:`, response.status);

      // Handle 401 - try token refresh
      if (response.status === 401) {
        console.log(`[${requestId}] Received 401, attempting token refresh...`);
        
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          console.log(`[${requestId}] Token refresh successful, retrying request...`);
          
          // Retry the request with new token
          const retryHeaders = new Headers(headers);
          retryHeaders.set("Authorization", `Bearer ${newToken}`);

          response = await fetch(url, {
            ...options,
            headers: retryHeaders,
            credentials: "include",
          });
          
          console.log(`[${requestId}] Retry response status:`, response.status);
        } else {
          console.log(`[${requestId}] Token refresh failed, redirecting to login...`);
          // Clear token and redirect to login
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login?reason=session_expired';
          }
          throw new Error("Session expired. Please log in again.");
        }
      }

      let data: any;

      // Parse response
      const contentType = response.headers.get("content-type");
      console.log(`[${requestId}] Response content-type:`, contentType);

      try {
        if (response.bodyUsed) {
          console.warn(`[${requestId}] Response body already consumed`);
          data = response.ok
            ? { success: true, message: "Request completed successfully", data: {} }
            : { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
        } else {
          const responseText = await response.text();
          console.log(`[${requestId}] Response text length:`, responseText.length);

          if (!responseText) {
            data = {};
          } else {
            const trimmedText = responseText.trim();
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              try {
                data = JSON.parse(responseText);
                console.log(`[${requestId}] Parsed JSON response`);
              } catch (jsonError) {
                console.warn(`[${requestId}] JSON parse error:`, jsonError);
                data = { success: false, message: responseText, rawResponse: true };
              }
            } else {
              data = { success: false, message: responseText, rawResponse: true };
            }
          }
        }
      } catch (parseError) {
        console.error(`[${requestId}] Parse error:`, parseError);
        throw new Error(`Failed to parse server response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`[${requestId}] Request failed:`, errorMessage);
        
        if (response.status === 401) {
          throw new Error("UNAUTHORIZED");
        }
        
        throw new Error(errorMessage);
      }

      console.log(`[${requestId}] Request successful`);
      return data;
    } catch (error) {
      console.error(`[${requestId}] Request error:`, error);

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Network error: Unable to connect to server. Please check your internet connection and try again.");
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(typeof error === "string" ? error : "An unexpected error occurred");
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, params?: PaginationParams): Promise<ApiResponse<T[]>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    const url = query ? `${endpoint}?${query}` : endpoint;

    return this.request<T[]>(url);
  }

  async getById<T>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, id: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, id: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string, id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${endpoint}/${id}`, {
      method: "DELETE",
    });
  }

  // Authentication methods
  async login(email: string, password: string, rememberMe = false) {
    console.log("🔐 Attempting login...");
    
    const response = await this.request<{ 
      token?: string; 
      accessToken?: string; 
      user?: any 
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    });

    console.log("✅ Login response:", response);

    // The tokens will be set in cookies by the server
    // We don't need to set them manually anymore
    if (response.success) {
      // Wait a bit for cookies to be set
      setTimeout(() => {
        const cookieToken = this.getTokenFromCookies();
        if (cookieToken) {
          console.log("✅ Token found in cookies after login");
        } else {
          console.warn("⚠️ No token found in cookies after login");
        }
      }, 100);
    }

    return response;
  }

  async register(userData: any) {
    console.log("📝 Attempting registration...");
    
    const response = await this.request<{ 
      token?: string; 
      accessToken?: string; 
      user?: any 
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    console.log("✅ Registration response:", response);

    // Tokens will be set in cookies by the server
    return response;
  }

  async refreshToken(refreshToken?: string) {
    return this.request("/auth/refresh", {
      method: "POST",
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    });
  }

  async logout() {
    console.log("🚪 Logging out...");
    
    this.clearToken();
    
    try {
      const response = await this.request("/auth/logout", {
        method: "POST",
      });
      console.log("✅ Logout response:", response);
      return response;
    } catch (error) {
      console.warn("⚠️ Logout request failed, but clearing local state anyway:", error);
      // Even if logout fails, clear local state
      return { success: true, message: "Logged out locally" };
    }
  }

  // Complete onboarding
  async completeOnboarding(onboardingData: any) {
    console.log("📋 Completing onboarding...");
    
    return this.request("/users/complete-onboarding", {
      method: "POST",
      body: JSON.stringify({
        onboardingData,
        isOnboardingCompleted: true,
      }),
    });
  }
}

export const apiClient = new ApiClient();

// Initialize token from cookies on page load
if (typeof window !== 'undefined') {
  // Give the page a moment to load before checking cookies
  setTimeout(() => {
    const token = apiClient.currentToken;
    if (token) {
      console.log("🔄 Found existing token in cookies");
    }
  }, 100);
}
