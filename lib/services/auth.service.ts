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

  async verifyEmail(email: string, verificationCode: string): Promise<any> {
    const response = await apiClient.post<{
      data: any;
      message: string;
      statusCode: number;
    }>("/api/Auth/verify-email", {
      email,
      verificationCode,
    });

    return response;
  }

  async resendVerificationCode(email: string): Promise<any> {
    const response = await apiClient.post<{
      message: string;
      statusCode: number;
    }>("/api/Auth/resend-verification", {
      email,
    });

    return response;
  }

  async createAdmin(data: {
    email: string;
    password: string;
    fullName: string;
    address: string;
    dateOfBirth: string;
  }): Promise<any> {
    const payload = {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      address: data.address,
      dateOfBirth: data.dateOfBirth,
    };

    console.log("Sending create admin payload:", payload);

    const response = await apiClient.post<{
      message: string;
      data: any;
      statusCode: number;
    }>("/api/Auth/create-admin", payload);

    return response;
  }

  async getAllAdminUsers(): Promise<{
    totalCount: number;
    adminUsers: any[];
  }> {
    const response = await apiClient.get<{
      message: string;
      data: {
        totalCount: number;
        adminUsers: any[];
      };
      statusCode: number;
    }>("/api/Auth/admin-users");

    return response.data;
  }

  async getProfile(): Promise<{
    message: string;
    data: {
      id: string;
      email: string;
      fullName: string;
      isActive: boolean;
      emailConfirmed: boolean;
      isEmailVerified: boolean;
      createdAt: string;
      lastLogin: string;
      roles: string[];
    };
    statusCode: number;
  }> {
    const response = await apiClient.get<{
      message: string;
      data: {
        id: string;
        email: string;
        fullName: string;
        isActive: boolean;
        emailConfirmed: boolean;
        isEmailVerified: boolean;
        createdAt: string;
        lastLogin: string;
        roles: string[];
      };
      statusCode: number;
    }>("/api/Auth/profile");

    return response;
  }

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }
}

export const authService = new AuthService();
