import { apiClient } from "../api-client";
import type {
  Event,
  ApplicationUser,
  SalesReport,
  UserReport,
  EventReport,
  MonitoringReport,
  PaginatedApiResponse,
  AdminEvent,
  AdminEventStatistics,
  EventFilters,
  AdminOrganizer,
  AdminOrganizerDetail,
  AdminOrganizerStatistics,
  OrganizerFilters,
  AdminVenue,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueFilters,
  VenueEventsCount,
} from "../types/api";

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  activeEvents: number;
  pendingEvents: number;
  monthlyGrowth: {
    users: number;
    events: number;
    revenue: number;
  };
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export interface AdminDashboard {
  stats: AdminStats;
  recentEvents: Event[];
  recentUsers: ApplicationUser[];
  systemHealth: MonitoringReport;
  salesChart: Array<{
    date: string;
    revenue: number;
    tickets: number;
  }>;
}

export class AdminService {
  // Admin Events Management
  async getAdminEvents(filters?: EventFilters): Promise<AdminEvent[]> {
    const params = new URLSearchParams();

    if (filters?.fromDate) params.append("fromDate", filters.fromDate);
    if (filters?.toDate) params.append("toDate", filters.toDate);
    if (filters?.venueId) params.append("venueId", filters.venueId);
    if (filters?.keyword) params.append("keyword", filters.keyword);
    if (filters?.category) params.append("category", filters.category);

    const queryString = params.toString();
    const url = queryString
      ? `/api/admin/events?${queryString}`
      : "/api/admin/events";

    return apiClient.get<AdminEvent[]>(url);
  }

  async getAdminEventStatistics(): Promise<AdminEventStatistics> {
    return apiClient.get<AdminEventStatistics>("/api/admin/events/statistics");
  }

  async getAdminEventById(id: string): Promise<AdminEvent> {
    return apiClient.get<AdminEvent>(`/api/admin/events/${id}`);
  }

  async publishEvent(id: string, publish: boolean): Promise<void> {
    return apiClient.put(`/api/admin/events/${id}/publish`, publish);
  }

  // Legacy Events Management (keeping for backward compatibility)
  async getAllEvents(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<PaginatedApiResponse<Event>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/admin/events?${queryString}`
      : "/api/admin/events";

    return apiClient.get<PaginatedApiResponse<Event>>(url);
  }

  async getEventById(id: string): Promise<Event> {
    return apiClient.get<Event>(`/api/admin/events/${id}`);
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    return apiClient.put<Event>(`/api/admin/events/${id}`, event);
  }

  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/events/${id}`);
  }

  async approveEvent(id: string): Promise<Event> {
    return apiClient.post<Event>(`/api/admin/events/${id}/approve`);
  }

  async rejectEvent(id: string, reason: string): Promise<Event> {
    return apiClient.post<Event>(`/api/admin/events/${id}/reject`, { reason });
  }

  // Users Management
  async getAllUsers(params?: {
    page?: number;
    pageSize?: number;
    role?: string;
  }): Promise<PaginatedApiResponse<ApplicationUser>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.role) queryParams.append("role", params.role);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/admin/users?${queryString}`
      : "/api/admin/users";

    return apiClient.get<PaginatedApiResponse<ApplicationUser>>(url);
  }

  async getUserById(id: string): Promise<ApplicationUser> {
    return apiClient.get<ApplicationUser>(`/api/admin/users/${id}`);
  }

  async updateUser(
    id: string,
    user: Partial<ApplicationUser>
  ): Promise<ApplicationUser> {
    return apiClient.put<ApplicationUser>(`/api/admin/users/${id}`, user);
  }

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/api/admin/users/${id}`);
  }

  async suspendUser(id: string, reason: string): Promise<ApplicationUser> {
    return apiClient.post<ApplicationUser>(`/api/admin/users/${id}/suspend`, {
      reason,
    });
  }

  async activateUser(id: string): Promise<ApplicationUser> {
    return apiClient.post<ApplicationUser>(`/api/admin/users/${id}/activate`);
  }

  // Dashboard and Stats
  async getDashboard(): Promise<AdminDashboard> {
    return apiClient.get<AdminDashboard>("/api/admin/dashboard");
  }

  async getAdminStats(): Promise<AdminStats> {
    return apiClient.get<AdminStats>("/api/admin/stats");
  }

  // Reports
  async getSalesReport(
    startDate?: string,
    endDate?: string
  ): Promise<SalesReport> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = queryString
      ? `/api/Reports/admin/sales?${queryString}`
      : "/api/Reports/admin/sales";

    return apiClient.get<SalesReport>(url);
  }

  async getUsersReport(): Promise<UserReport> {
    return apiClient.get<UserReport>("/api/Reports/admin/users");
  }

  async getEventsReport(): Promise<EventReport> {
    return apiClient.get<EventReport>("/api/Reports/admin/events");
  }

  async getMonitoringReport(): Promise<MonitoringReport> {
    return apiClient.get<MonitoringReport>("/api/Reports/admin/monitoring");
  }

  // Venues Management
  // Venues Management
  async getAllVenues(): Promise<AdminVenue[]> {
    return apiClient.get<AdminVenue[]>("/api/venues");
  }

  async getVenues(filters?: VenueFilters): Promise<AdminVenue[]> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.location) {
      params.append("location", filters.location);
    }
    if (filters?.minCapacity) {
      params.append("minCapacity", filters.minCapacity.toString());
    }
    if (filters?.maxCapacity) {
      params.append("maxCapacity", filters.maxCapacity.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/api/venues?${queryString}` : "/api/venues";

    return apiClient.get<AdminVenue[]>(url);
  }

  async createVenue(venue: CreateVenueRequest): Promise<AdminVenue> {
    return apiClient.post<AdminVenue>("/api/venues", venue);
  }

  async updateVenue(
    id: string,
    venue: UpdateVenueRequest
  ): Promise<AdminVenue> {
    return apiClient.put<AdminVenue>(`/api/venues/${id}`, venue);
  }

  async deleteVenue(id: string): Promise<void> {
    return apiClient.delete(`/api/venues/${id}`);
  }

  async getVenueEventsCount(id: string): Promise<number> {
    const response = await apiClient.get<VenueEventsCount>(
      `/api/venues/${id}/events-count`
    );
    return response.eventCount;
  }

  // Organizers Management
  async getAdminOrganizers(
    filters?: OrganizerFilters
  ): Promise<AdminOrganizer[]> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.organizationName) {
      params.append("organizationName", filters.organizationName);
    }
    if (filters?.hasEvents !== undefined) {
      params.append("hasEvents", filters.hasEvents.toString());
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/admin/organizers?${queryString}`
      : "/api/admin/organizers";

    return apiClient.get<AdminOrganizer[]>(url);
  }

  async getAdminOrganizerById(id: string): Promise<AdminOrganizerDetail> {
    return apiClient.get<AdminOrganizerDetail>(`/api/admin/organizers/${id}`);
  }

  async getAdminOrganizerStatistics(): Promise<AdminOrganizerStatistics> {
    return apiClient.get<AdminOrganizerStatistics>(
      "/api/admin/organizers/statistics"
    );
  }

  // System Management
  async getSystemLogs(params?: {
    page?: number;
    pageSize?: number;
    level?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.level) queryParams.append("level", params.level);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/admin/logs?${queryString}`
      : "/api/admin/logs";

    return apiClient.get(url);
  }

  async getSystemSettings(): Promise<any> {
    return apiClient.get("/api/admin/settings");
  }

  async updateSystemSettings(settings: any): Promise<any> {
    return apiClient.put("/api/admin/settings", settings);
  }

  // Backup and Maintenance
  async createBackup(): Promise<{ backupId: string; downloadUrl: string }> {
    return apiClient.post("/api/admin/backup");
  }

  async getBackups(): Promise<
    Array<{ id: string; createdAt: string; size: number }>
  > {
    return apiClient.get("/api/admin/backups");
  }

  async restoreBackup(backupId: string): Promise<void> {
    return apiClient.post(`/api/admin/backup/${backupId}/restore`);
  }
}

export const adminService = new AdminService();
