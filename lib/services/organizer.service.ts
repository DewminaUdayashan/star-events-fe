import { apiClient } from "../api-client";
import type {
  Event,
  OrganizerReport,
  PaginatedApiResponse,
} from "../types/api";

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  totalTicketsSold: number;
  totalRevenue: number;
  conversionRate: number;
  averageTicketPrice: number;
  salesByDate: Array<{
    date: string;
    ticketsSold: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    ticketsSold: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    ticketsPurchased: number;
    totalSpent: number;
  }>;
}

export interface OrganizerDashboard {
  stats: {
    totalEvents: number;
    activeEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    monthlyGrowth: number;
  };
  recentEvents: Event[];
  upcomingEvents: Event[];
  salesChart: Array<{
    date: string;
    revenue: number;
    tickets: number;
  }>;
  topEvents: Array<{
    eventId: string;
    eventTitle: string;
    ticketsSold: number;
    revenue: number;
  }>;
}

// Interface for the actual organizer events API response
export interface OrganizerEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venueId: string;
  venueName: string;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
}

// Parameters for filtering organizer events
export interface OrganizerEventsParams {
  fromDate?: string; // date-time string
  toDate?: string; // date-time string
  category?: string;
  venue?: string;
  keyword?: string;
}

export class OrganizerService {
  // Events Management - Returns simple array of events
  async getMyEvents(params?: OrganizerEventsParams): Promise<OrganizerEvent[]> {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params?.toDate) queryParams.append("toDate", params.toDate);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.venue) queryParams.append("venue", params.venue);
    if (params?.keyword) queryParams.append("keyword", params.keyword);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/organizer/events?${queryString}`
      : "/api/organizer/events";

    return apiClient.get<OrganizerEvent[]>(url);
  }

  async getEventById(id: string): Promise<Event> {
    return apiClient.get<Event>(`/api/events/${id}`);
  }

  async createEvent(eventData: FormData | Partial<Event>): Promise<Event> {
    if (eventData instanceof FormData) {
      // Handle FormData for multipart/form-data requests
      return apiClient.post<Event>("/api/organizer/events", eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // Handle regular JSON data (fallback)
      return apiClient.post<Event>("/api/organizer/events", eventData);
    }
  }

  async updateEvent(
    id: string,
    eventData: FormData | Partial<Event>
  ): Promise<Event> {
    if (eventData instanceof FormData) {
      // Handle FormData for multipart/form-data requests
      return apiClient.put<Event>(`/api/organizer/events/${id}`, eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // Handle regular JSON data (fallback)
      return apiClient.put<Event>(`/api/organizer/events/${id}`, eventData);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete(`/api/organizer/events/${id}`);
  }

  async publishEvent(id: string): Promise<Event> {
    return apiClient.post<Event>(`/api/organizer/events/${id}/publish`);
  }

  async unpublishEvent(id: string): Promise<Event> {
    return apiClient.post<Event>(`/api/organizer/events/${id}/unpublish`);
  }

  async duplicateEvent(id: string): Promise<Event> {
    return apiClient.post<Event>(`/api/organizer/events/${id}/duplicate`);
  }

  // Analytics and Reports
  async getDashboard(): Promise<OrganizerDashboard> {
    return apiClient.get<OrganizerDashboard>("/api/organizer/dashboard");
  }

  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    return apiClient.get<EventAnalytics>(
      `/api/organizer/events/${eventId}/analytics`
    );
  }

  async getOrganizerReport(
    startDate?: string,
    endDate?: string
  ): Promise<OrganizerReport> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = queryString
      ? `/api/Reports/organizer?${queryString}`
      : "/api/Reports/organizer";

    return apiClient.get<OrganizerReport>(url);
  }

  async getSalesReport(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = queryString
      ? `/api/organizer/sales?${queryString}`
      : "/api/organizer/sales";

    return apiClient.get(url);
  }

  async getTicketSales(eventId: string): Promise<any> {
    return apiClient.get(`/api/organizer/events/${eventId}/tickets`);
  }

  async getCustomerInsights(): Promise<any> {
    return apiClient.get("/api/organizer/customers/insights");
  }

  // Event Management
  async getEventTickets(
    eventId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/organizer/events/${eventId}/tickets?${queryString}`
      : `/api/organizer/events/${eventId}/tickets`;

    return apiClient.get(url);
  }

  async updateEventPrices(eventId: string, prices: any[]): Promise<any> {
    return apiClient.put(`/api/organizer/events/${eventId}/prices`, { prices });
  }

  async getEventCheckIns(eventId: string): Promise<any> {
    return apiClient.get(`/api/organizer/events/${eventId}/checkins`);
  }

  async checkInTicket(ticketCode: string): Promise<any> {
    return apiClient.post(`/api/organizer/tickets/${ticketCode}/checkin`);
  }

  // Promotions and Discounts
  async createPromotion(eventId: string, promotion: any): Promise<any> {
    return apiClient.post(
      `/api/organizer/events/${eventId}/promotions`,
      promotion
    );
  }

  async getPromotions(eventId: string): Promise<any[]> {
    return apiClient.get(`/api/organizer/events/${eventId}/promotions`);
  }

  async updatePromotion(
    eventId: string,
    promotionId: string,
    promotion: any
  ): Promise<any> {
    return apiClient.put(
      `/api/organizer/events/${eventId}/promotions/${promotionId}`,
      promotion
    );
  }

  async deletePromotion(eventId: string, promotionId: string): Promise<void> {
    return apiClient.delete(
      `/api/organizer/events/${eventId}/promotions/${promotionId}`
    );
  }

  // Settings and Profile
  async getOrganizerProfile(): Promise<any> {
    return apiClient.get("/api/organizer/profile");
  }

  async updateOrganizerProfile(profile: any): Promise<any> {
    return apiClient.put("/api/organizer/profile", profile);
  }

  async getOrganizerSettings(): Promise<any> {
    return apiClient.get("/api/organizer/settings");
  }

  async updateOrganizerSettings(settings: any): Promise<any> {
    return apiClient.put("/api/organizer/settings", settings);
  }
}

export const organizerService = new OrganizerService();
