import { apiClient } from "../api-client";

// Venue types based on API specification
export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  createdAt: string;
  modifiedAt?: string;
  eventCount: number;
}

export interface CreateVenueRequest {
  name: string;
  location: string;
  capacity: number;
}

export interface VenueSearchParams {
  search?: string;
  location?: string;
  capacity?: number;
  page?: number;
  pageSize?: number;
}

export class VenuesService {
  // Get all venues with optional search parameters
  async getVenues(params?: VenueSearchParams): Promise<Venue[]> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.location) queryParams.append("location", params.location);
    if (params?.capacity)
      queryParams.append("capacity", params.capacity.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/api/venues?${queryString}` : "/api/venues";

    return apiClient.get<Venue[]>(url);
  }

  // Create a new venue
  async createVenue(venue: CreateVenueRequest): Promise<Venue> {
    return apiClient.post<Venue>("/api/venues", venue);
  }

  // Get specific venue by ID
  async getVenueById(id: string): Promise<Venue> {
    return apiClient.get<Venue>(`/api/venues/${id}`);
  }

  // Update venue
  async updateVenue(
    id: string,
    venue: Partial<CreateVenueRequest>
  ): Promise<Venue> {
    return apiClient.put<Venue>(`/api/venues/${id}`, venue);
  }

  // Delete venue
  async deleteVenue(id: string): Promise<void> {
    return apiClient.delete(`/api/venues/${id}`);
  }

  // Search venues (convenience method)
  async searchVenues(query: string): Promise<Venue[]> {
    return this.getVenues({ search: query });
  }
}

export const venuesService = new VenuesService();
