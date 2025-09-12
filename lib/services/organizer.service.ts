import { apiClient } from "../api-client"
import type { Event } from "../types/api"

export class OrganizerService {
  async getMyEvents(): Promise<Event[]> {
    return apiClient.get<Event[]>("/api/organizer/events")
  }

  async createEvent(event: Partial<Event>): Promise<Event> {
    return apiClient.post<Event>("/api/organizer/events", event)
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    return apiClient.put<Event>(`/api/organizer/events/${id}`, event)
  }

  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete(`/api/organizer/events/${id}`)
  }

  async getEventAnalytics(eventId: string): Promise<any> {
    // This would be a custom endpoint for event analytics
    return apiClient.get(`/api/organizer/events/${eventId}/analytics`)
  }
}

export const organizerService = new OrganizerService()
