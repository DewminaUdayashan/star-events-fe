export type UserRole = "Admin" | "Organizer" | "Customer";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  fullName: string;
  createdAt: string;
  isActive: boolean;
  address: string | null;
  dateOfBirth: string | null;
  organizationName: string | null;
  organizationContact: string | null;
  lastLogin: string;
  tickets: any[] | null;
  organizedEvents: any[] | null;
  id: string;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface LoginResponse {
  message: string;
  user: User;
  roles: UserRole[];
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
}
