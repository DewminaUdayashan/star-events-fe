"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "@/lib/api-client";
import { authService } from "@/lib/services/auth.service";
import type {
  ApplicationUser,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
} from "@/lib/types/api";
import { UserRole } from "@/types/auth";

interface AuthState {
  user: ApplicationUser | null;
  token: string | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: ApplicationUser) => void;
  hasRole: (role: UserRole) => boolean;
  isRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  clearAuthData: () => void; // Add utility to clear corrupted data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    roles: [],
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token");
          const userStr = localStorage.getItem("user");
          const rolesStr = localStorage.getItem("roles");

          console.log(
            "Initializing auth - Token:",
            !!token,
            "User:",
            !!userStr,
            "Roles:",
            !!rolesStr
          );

          if (token && userStr && rolesStr) {
            try {
              const user = JSON.parse(userStr);
              const parsedRoles = JSON.parse(rolesStr);

              // Ensure roles is always an array
              const roles: UserRole[] = Array.isArray(parsedRoles)
                ? parsedRoles
                : ["Customer"];

              // Set token in API client
              apiClient.setToken(token);

              setAuthState({
                user,
                token,
                roles,
                isAuthenticated: true,
                isLoading: false,
              });

              console.log("Auth restored from localStorage:", {
                user: user.fullName,
                roles,
              });
            } catch (parseError) {
              console.error("Error parsing stored auth data:", parseError);
              // Clear corrupted data
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user");
              localStorage.removeItem("roles");
              setAuthState((prev) => ({ ...prev, isLoading: false }));
            }
          } else {
            console.log("No auth data found in localStorage");
            setAuthState((prev) => ({ ...prev, isLoading: false }));
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);

      // Handle the actual API response structure which differs from TypeScript types
      // API returns nested structure: { data: { user, roles: { $values: [] }, token } }
      const apiResponse = response as any;

      // Extract roles from the correct API response structure
      let roles: UserRole[] = ["Customer"]; // Default fallback

      if (apiResponse.data?.roles?.$values) {
        // Handle nested structure: response.data.roles.$values
        roles = Array.isArray(apiResponse.data.roles.$values)
          ? apiResponse.data.roles.$values
          : ["Customer"];
      } else if (apiResponse.roles?.$values) {
        // Handle direct structure: response.roles.$values
        roles = Array.isArray(apiResponse.roles.$values)
          ? apiResponse.roles.$values
          : ["Customer"];
      } else if (Array.isArray(apiResponse.roles)) {
        // Handle flat array: response.roles
        roles = apiResponse.roles;
      } else if (Array.isArray(response.roles)) {
        // Handle TypeScript expected structure
        roles = response.roles;
      }

      // Extract user and token from the correct structure
      const user = apiResponse.data?.user || response.user;
      const token = apiResponse.data?.token || response.token;

      console.log("Login response:", response);
      console.log("Extracted roles:", roles);
      console.log("Extracted user:", user);
      console.log("Extracted token:", !!token);

      // Store everything in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("roles", JSON.stringify(roles));
        // Token is already stored by authService.login
      }

      setAuthState({
        user,
        token,
        roles,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log("Auth state updated:", {
        user: user?.fullName,
        roles,
      });
    } catch (error) {
      console.error("Login failed:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register({
        request: data,
      });

      // Don't auto-authenticate - user needs to verify email first
      console.log(
        "Registration successful - email verification required:",
        response
      );

      return response; // Return the response for the component to handle
    } catch (error: any) {
      console.error("Registration failed:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      console.log("Logging out user");

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("roles");
        // Token is cleared by authService.logout
      }

      setAuthState({
        user: null,
        token: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const updateUser = (updatedUser: ApplicationUser) => {
    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    // Update auth state
    setAuthState((prev) => ({
      ...prev,
      user: updatedUser,
    }));
  };

  // Role checking utilities
  const hasRole = (role: UserRole): boolean => {
    if (!Array.isArray(authState.roles)) {
      console.warn("authState.roles is not an array:", authState.roles);
      return false;
    }
    return authState.roles.includes(role);
  };

  const isRole = (role: UserRole): boolean => {
    if (!Array.isArray(authState.roles)) {
      console.warn("authState.roles is not an array:", authState.roles);
      return false;
    }
    return authState.roles.length === 1 && authState.roles[0] === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!Array.isArray(authState.roles)) {
      console.warn("authState.roles is not an array:", authState.roles);
      return false;
    }
    return roles.some((role) => authState.roles.includes(role));
  };

  const clearAuthData = () => {
    console.log("Clearing corrupted auth data");
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("roles");
    }

    setAuthState({
      user: null,
      token: null,
      roles: [],
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isRole,
    hasAnyRole,
    clearAuthData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
