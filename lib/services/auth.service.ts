import { apiClient } from "../api-client"
import type { LoginRequest, LoginResponse, RegisterRequest, ApplicationUser } from "../types/api"

export class AuthService {
  async register(data: RegisterRequest): Promise<ApplicationUser> {
    return apiClient.post("/api/Auth/register", data)
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/api/Auth/login", data)

    // Store token in API client
    if (response.token) {
      apiClient.setToken(response.token)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/Auth/logout")
    } finally {
      apiClient.clearToken()
    }
  }

  async getCurrentUser(): Promise<ApplicationUser | null> {
    try {
      const token = apiClient.getToken()
      if (!token) return null

      return await apiClient.get<ApplicationUser>("/api/Auth/me")
    } catch (error) {
      console.error("Failed to get current user:", error)
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!apiClient.getToken()
  }
}

export const authService = new AuthService()
