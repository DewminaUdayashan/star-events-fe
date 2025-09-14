import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/types/auth";

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/Auth/login", credentials);
  }

  static async register(userData: RegisterRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/Auth/register", userData);
  }

  static async logout(): Promise<void> {
    return apiClient.post("/api/Auth/logout");
  }

  static async refreshToken(): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/Auth/refresh-token");
  }

  static async getCurrentUser(): Promise<LoginResponse> {
    return apiClient.get<LoginResponse>("/api/Auth/me");
  }
}

// React Query hooks for authentication
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      // Store token in API client
      apiClient.setToken(data.token);

      // Store user data in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("roles", JSON.stringify(data.roles));
      }

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: AuthService.register,
    onSuccess: (data) => {
      // Store token in API client
      apiClient.setToken(data.token);

      // Store user data in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("roles", JSON.stringify(data.roles));
      }
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      // Clear token from API client
      apiClient.clearToken();

      // Clear user data from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("roles");
      }

      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);

      // Even if logout fails on server, clear local data
      apiClient.clearToken();
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("roles");
      }
      queryClient.clear();
    },
  });
};
