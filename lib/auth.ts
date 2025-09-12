import type { User } from "@/types/event"

// Mock JWT token handling - in a real app, this would integrate with your backend
export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "customer" | "organizer"
  phone?: string
}

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "customer",
    loyaltyPoints: 150,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    email: "organizer@example.com",
    firstName: "Sarah",
    lastName: "Smith",
    role: "organizer",
    loyaltyPoints: 0,
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "3",
    email: "admin@starevents.lk",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    loyaltyPoints: 0,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

// Mock authentication functions
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === credentials.email)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    // In a real app, you'd verify the password hash
    if (credentials.password !== "password123") {
      throw new Error("Invalid email or password")
    }

    const token = `mock-jwt-token-${user.id}-${Date.now()}`
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`

    return { user, token, refreshToken }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === data.email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Create new user
    const newUser: User = {
      id: `${mockUsers.length + 1}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`
    const refreshToken = `mock-refresh-token-${newUser.id}-${Date.now()}`

    return { user: newUser, token, refreshToken }
  },

  async forgotPassword(email: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("No user found with this email address")
    }

    // In a real app, this would send a password reset email
    console.log(`Password reset email sent to ${email}`)
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error("User not found")
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
    return mockUsers[userIndex]
  },

  logout(): void {
    // In a real app, this would invalidate the token on the server
    localStorage.removeItem("auth-token")
    localStorage.removeItem("refresh-token")
    localStorage.removeItem("user-data")
  },

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem("user-data")
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  },

  getToken(): string | null {
    return localStorage.getItem("auth-token")
  },

  setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem("auth-token", authResponse.token)
    localStorage.setItem("refresh-token", authResponse.refreshToken)
    localStorage.setItem("user-data", JSON.stringify(authResponse.user))
  },
}
