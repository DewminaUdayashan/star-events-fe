import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import type { Event, EventFilters } from "../types/api";

export class EventsService {
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    const params = new URLSearchParams();

    if (filters?.fromDate) params.append("fromDate", filters.fromDate);
    if (filters?.toDate) params.append("toDate", filters.toDate);
    if (filters?.venue) params.append("venue", filters.venue);
    if (filters?.keyword) params.append("keyword", filters.keyword);

    const queryString = params.toString();
    const url = "/api/Events";

    return apiClient.get<Event[]>(url);
  }

  async getEventById(id: string): Promise<Event> {
    return apiClient.get<Event>(`/api/Events/${id}`);
  }

  async searchEvents(
    keyword: string,
    filters?: EventFilters
  ): Promise<Event[]> {
    return this.getEvents({ ...filters, keyword });
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    return this.getEvents({ category });
  }

  async getTrendingEvents(): Promise<Event[]> {
    // This would typically be a separate endpoint, but using general events for now
    return this.getEvents();
  }

  async getFeaturedEvents(): Promise<Event[]> {
    // This would typically be a separate endpoint for featured events
    return this.getEvents();
  }
}

export const eventsService = new EventsService();

export const useEvents = (filters?: EventFilters) => {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventsService.getEvents(filters),
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsService.getEventById(id),
    enabled: !!id,
  });
};

export const useTrendingEvents = () => {
  return useQuery({
    queryKey: ["events", "trending"],
    queryFn: () => eventsService.getTrendingEvents(),
  });
};

export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: () => eventsService.getFeaturedEvents(),
  });
};
