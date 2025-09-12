"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useLogin, useLogout, useRegister } from "@/lib/services/auth";
import type {
  User,
  UserRole,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";

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

  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token");
          const userStr = localStorage.getItem("user");
          const rolesStr = localStorage.getItem("roles");

          if (token && userStr && rolesStr) {
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
          } else {
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
      const response = await loginMutation.mutateAsync(credentials);

      setAuthState({
        user: response.user,
        token: response.token,
        roles: response.roles,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await registerMutation.mutateAsync(data);

      setAuthState({
        user: response.user,
        token: response.token,
        roles: response.roles,
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
      await logoutMutation.mutateAsync();
    } finally {
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
