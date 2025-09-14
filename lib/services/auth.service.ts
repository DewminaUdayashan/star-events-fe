import { apiClient } from "../api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApplicationUser,
} from "../types/api";

export class AuthService {
  async register(data: any): Promise<any> {
    // Prepare data in exact format expected by backend
    const registrationPayload = {
      request: {
        email: data.request.email,
        password: data.request.password,
        fullName: data.request.fullName,
        address: data.request.address || null,
        dateOfBirth: data.request.dateOfBirth
          ? new Date(data.request.dateOfBirth).toISOString()
          : "",
        organizationName: data.request.organizationName || null,
        organizationContact: data.request.organizationContact || null,
      },
    };

    console.log("Sending registration payload:", registrationPayload);

    const response = await apiClient.post<any>(
      "/api/Auth/register",
      registrationPayload
    );

    // Token and user data are handled by AuthContext after successful registration
    // if (response.token) {
    //   apiClient.setToken(response.token)
    // }

    return response;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{
      data: LoginResponse;
      message: string;
      statusCode: number;
    }>("/api/Auth/login", data);

    // Extract the actual login data from the nested structure
    const loginData = response.data;

    // Store token in API client
    if (loginData.token) {
      apiClient.setToken(loginData.token);
    }

    return loginData;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/Auth/logout");
    } finally {
      apiClient.clearToken();
    }
  }

  async getCurrentUser(): Promise<ApplicationUser | null> {
    try {
      const token = apiClient.getToken();
      if (!token) return null;

      return await apiClient.get<ApplicationUser>("/api/Auth/me");
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }
}

export const authService = new AuthService();
