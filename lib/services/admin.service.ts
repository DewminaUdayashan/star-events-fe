import { apiClient } from "../api-client"
import type { Event, ApplicationUser } from "../types/api"

export interface AdminStats {
  totalUsers: number
  totalEvents: number
  totalTicketsSold: number
  totalRevenue: number
  activeEvents: number
  pendingEvents: number
}

export class AdminService {
  async getAllEvents(): Promise<Event[]> {
    return apiClient.get<Event[]>("/api/admin/events")
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    return apiClient.put<Event>(`/api/admin/events/${id}`, event)
  }

  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/events/${id}`)
  }

  async getAllUsers(): Promise<ApplicationUser[]> {
    return apiClient.get<ApplicationUser[]>("/api/admin/users")
  }

  async updateUser(id: string, user: Partial<ApplicationUser>): Promise<ApplicationUser> {
    return apiClient.put<ApplicationUser>(`/api/admin/users/${id}`, user)
  }

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/users/${id}`)
  }

  async getAdminStats(): Promise<AdminStats> {
    return apiClient.get<AdminStats>("/api/admin/stats")
  }

  async getSalesReport(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    const queryString = params.toString()
    const url = queryString ? `/api/Reports/admin/sales?${queryString}` : "/api/Reports/admin/sales"

    return apiClient.get(url)
  }

  async getUsersReport(): Promise<any> {
    return apiClient.get("/api/Reports/admin/users")
  }

  async getEventsReport(): Promise<any> {
    return apiClient.get("/api/Reports/admin/events")
  }

  async getMonitoringReport(): Promise<any> {
    return apiClient.get("/api/Reports/admin/monitoring")
  }
}

export const adminService = new AdminService()
