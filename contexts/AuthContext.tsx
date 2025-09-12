"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { ApplicationUser } from "@/lib/types/api"
import { authService as apiAuthService, type LoginRequest, type RegisterRequest } from "@/lib/services/auth.service"

interface AuthContextType {
  user: ApplicationUser | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<ApplicationUser>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApplicationUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await apiAuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to initialize auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const authResponse = await apiAuthService.login(credentials)
      setUser(authResponse.user)
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const newUser = await apiAuthService.register(data)
      setUser(newUser)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiAuthService.logout()
    } finally {
      setUser(null)
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
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
