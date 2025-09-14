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

export type UserRole = "Admin" | "Organizer" | "Customer";

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
  hasRole: (role: UserRole) => boolean;
  isRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
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
              const roles = JSON.parse(rolesStr);

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
      console.log("Attempting login with:", credentials.email);

      const response = (await authService.login(
        credentials
      )) as LoginResponse & { roles?: UserRole[] };

      // Extract roles from response or default to Customer
      const roles: UserRole[] = response.roles || ["Customer"];

      // Store everything in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("roles", JSON.stringify(roles));
        // Token is already stored by authService.login
      }

      setAuthState({
        user: response.user,
        token: response.token,
        roles,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log("Auth state updated:", {
        user: response.user?.fullName,
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
      const response = await authService.register(data);

      // For register, we might not get roles in response, so default to Customer
      const roles: UserRole[] = ["Customer"];

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response));
        localStorage.setItem("roles", JSON.stringify(roles));
      }

      setAuthState({
        user: response,
        token: apiClient.getToken(),
        roles,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
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

  // Role checking utilities
  const hasRole = (role: UserRole): boolean => {
    return authState.roles.includes(role);
  };

  const isRole = (role: UserRole): boolean => {
    return authState.roles.length === 1 && authState.roles[0] === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((role) => authState.roles.includes(role));
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    hasRole,
    isRole,
    hasAnyRole,
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
