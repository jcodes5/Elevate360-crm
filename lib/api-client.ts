import type { ApiResponse, PaginationParams } from "@/types";
import { useRouter } from "next/navigation";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  // Public getter for debugging
  get currentToken(): string | null {
    return this.token;
  }

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
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

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      // Make a request to refresh endpoint, cookies will be sent automatically
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.accessToken) {
          return data.data.accessToken;
        }
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
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

    // Add Authorization header if we have a token
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    try {
      // Validate we're in browser environment
      if (typeof window === "undefined") {
        throw new Error("API client can only be used in browser environment");
      }

      // Check network connectivity
      await this.checkNetworkConnectivity();

      // Check if fetch is available
      if (typeof fetch === "undefined") {
        throw new Error("Fetch is not available in this environment");
      }

      console.log(
        `[${requestId}] Making fetch request to:`,
        url,
        "with headers:",
        headers
      );

      let response = await fetch(url, {
        ...options,
        headers,
        // Add credentials to handle cookies if needed
        credentials: "include", // Always include cookies for authentication
      });

      if (response.status === 401) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          this.setToken(newToken);
          // Retry the request with new token
          // Clone existing headers and set new Authorization
          const retryHeaders = new Headers(headers);
          retryHeaders.set("Authorization", `Bearer ${newToken}`);

          response = await fetch(url, {
            ...options,
            headers: retryHeaders,
            credentials: "include",
          });
        } else {
          // If refresh failed, clear token and redirect to login
          this.clearToken();
          // In a real implementation, we would redirect to login here
          // but we can't do that directly from this class
        }
      }

      console.log(
        `[${requestId}] Response status:`,
        response.status,
        "statusText:",
        response.statusText
      );

      let data: any;

      // Parse response based on content type
      const contentType = response.headers.get("content-type");
      console.log(`[${requestId}] Response content-type:`, contentType);
      console.log(`[${requestId}] Response body used?`, response.bodyUsed);

      try {
        // Check if response body has already been consumed
        if (response.bodyUsed) {
          console.warn(
            `[${requestId}] Response body has already been consumed! Using fallback...`
          );
          data = response.ok
            ? {
                success: true,
                message: "Request completed successfully",
                data: {},
              }
            : {
                success: false,
                message: `HTTP ${response.status}: ${response.statusText}`,
              };
        } else {
          // Try to read response as text first
          let responseText: string;
          try {
            responseText = await response.text();
            console.log(
              `[${requestId}] Response text (first 500 chars):`,
              responseText.substring(0, 500)
            );
          } catch (textError) {
            console.error(
              `[${requestId}] Failed to read response text:`,
              textError
            );
            throw new Error(
              `Failed to read response: ${
                textError instanceof Error ? textError.message : "Unknown error"
              }`
            );
          }

          // Parse the response text
          if (!responseText) {
            console.log(`[${requestId}] Empty response, using empty object`);
            data = {};
          } else {
            // Always try to parse as JSON first if it looks like JSON
            const trimmedText = responseText.trim();
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              try {
                console.log(`[${requestId}] Attempting to parse as JSON`);
                data = JSON.parse(responseText);
                console.log(`[${requestId}] Successfully parsed JSON:`, data);
              } catch (jsonError) {
                console.warn(
                  `[${requestId}] Failed to parse as JSON:`,
                  jsonError
                );
                console.warn(`[${requestId}] Raw response:`, responseText);
                data = {
                  success: false,
                  message: responseText,
                  rawResponse: true,
                };
              }
            } else {
              console.log(
                `[${requestId}] Non-JSON response, wrapping in message`
              );
              data = {
                success: false,
                message: responseText,
                rawResponse: true,
              };
            }
          }
        }

        console.log(`[${requestId}] Final parsed data:`, data);
      } catch (parseError) {
        console.error(
          `[${requestId}] Critical error parsing response:`,
          parseError
        );
        throw new Error(
          `Failed to parse server response: ${
            parseError instanceof Error ? parseError.message : "Unknown error"
          }`
        );
      }

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          data?.error ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(
          `[${requestId}] API request failed with status:`,
          response.status,
          "data:",
          data
        );
        console.error(`[${requestId}] Error message:`, errorMessage);

        // If it's an auth error, throw a specific error
        if (response.status === 401) {
          throw new Error("UNAUTHORIZED");
        }

        throw new Error(errorMessage);
      }

      console.log(`[${requestId}] API request successful:`, data);
      return data;
    } catch (error) {
      console.error(`[${requestId}] API request failed:`, {
        url,
        method: options.method || "GET",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        errorConstructor: error?.constructor?.name,
      });

      // Provide more specific error messages
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Unable to connect to server. Please check your internet connection and try again."
        );
      }

      // Handle reference errors (like the text is not defined error)
      if (error instanceof ReferenceError) {
        console.error(
          `[${requestId}] Reference error in API client:`,
          error.message
        );
        throw new Error(`API client error: ${error.message}`);
      }

      // Handle specific error types
      if (error instanceof Error) {
        throw error;
      }

      // Handle non-Error objects
      throw new Error(
        typeof error === "string" ? error : "An unexpected error occurred"
      );
    }
  }

  // Generic CRUD methods
  async get<T>(
    endpoint: string,
    params?: PaginationParams
  ): Promise<ApiResponse<T[]>> {
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

  async put<T>(
    endpoint: string,
    id: string,
    data: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(
    endpoint: string,
    id: string,
    data: any
  ): Promise<ApiResponse<T>> {
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
  async login(email: string, password: string) {
    const response = await this.request<{ token?: string; accessToken?: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    // Set the token if we get one back from login
    const token = response?.data?.token ?? response?.data?.accessToken;
    if (response.success && token) {
      this.setToken(token);
    }

    return response;
  }

  async register(userData: any) {
    const response = await this.request<{ token?: string; accessToken?: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(userData),
      }
    );

    // Set the token if we get one back from registration
    const token = response?.data?.token ?? response?.data?.accessToken;
    if (response.success && token) {
      this.setToken(token);
    }

    return response;
  }

  async refreshToken(refreshToken: string) {
    return this.request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    this.clearToken();
    return this.request("/auth/logout", {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();
