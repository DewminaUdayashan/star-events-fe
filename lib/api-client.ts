import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private token: string | null = null;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://127.0.0.1:5000"
  ) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Check if it's a 401 error with email verification requirement
        if (error.response?.status === 401) {
          const errorData = error.response.data;

          // If it's an email verification required error, don't redirect
          // Let the auth service handle it
          if (errorData?.requiresEmailVerification) {
            // Create a structured error object for the login handler
            const verificationError = {
              statusCode: errorData.statusCode || 401,
              message: errorData.message,
              error: errorData.error,
              requiresEmailVerification: errorData.requiresEmailVerification,
              email: errorData.email,
            };
            return Promise.reject(verificationError);
          }

          // For other 401s, clear token and redirect to login
          this.clearToken();
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/login";
          }
        }

        // For other errors, just pass them through
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  private processResponse(data: any): any {
    // Handle .NET serialization format with $values property recursively
    if (data && typeof data === "object") {
      if ("$values" in data && Array.isArray(data.$values)) {
        // Process each item in the array recursively
        return data.$values.map((item: any) => this.processResponse(item));
      }

      // Process nested objects
      if (Array.isArray(data)) {
        return data.map((item: any) => this.processResponse(item));
      }

      // Process object properties
      const processedData: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          processedData[key] = this.processResponse(data[key]);
        }
      }
      return processedData;
    }

    return data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return this.processResponse(response.data) as T;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return this.processResponse(response.data) as T;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return this.processResponse(response.data) as T;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return this.processResponse(response.data) as T;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return this.processResponse(response.data) as T;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types for API responses
export type { AxiosRequestConfig, AxiosResponse };
