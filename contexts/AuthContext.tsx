"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { ApplicationUser } from "@/lib/types/api"
import { authService as apiAuthService, type LoginRequest, type RegisterRequest } from "@/lib/services/auth.service"
import { apiClient } from "@/lib/api-client"

interface AuthContextType {
  user: ApplicationUser | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<ApplicationUser>) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApplicationUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = apiClient.getToken()
        
        if (token) {
          // Set token in API client
          apiClient.setToken(token)
          
          // Try to get current user with the token
          try {
            const currentUser = await apiAuthService.getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            // Token is invalid, clear it
            console.error("Invalid token, clearing auth:", error)
            apiClient.clearToken()
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      const authResponse = await apiAuthService.login(credentials)
      
      // Store token in localStorage and API client
      if (authResponse.token) {
        apiClient.setToken(authResponse.token)
      }
      
      setUser(authResponse.user)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true)
      const newUser = await apiAuthService.register(data)
      
      // If registration includes auto-login, store token
      if (newUser.token) {
        apiClient.setToken(newUser.token)
      }
      
      setUser(newUser)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await apiAuthService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear local state and token
      apiClient.clearToken()
      setUser(null)
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<ApplicationUser>) => {
    if (!user) throw new Error("No user logged in")

    try {
      // For now, we'll update locally and sync later
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      // TODO: Implement updateProfile in API service
    } catch (error) {
      throw error
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
