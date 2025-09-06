import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "./admin.service";
import type {
  EventFilters,
  AdminEvent,
  AdminEventStatistics,
  AdminOrganizer,
  AdminOrganizerDetail,
  AdminOrganizerStatistics,
  OrganizerFilters,
  AdminVenue,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueFilters,
} from "../types/api";

// Query Keys
export const adminKeys = {
  all: ["admin"] as const,
  events: () => [...adminKeys.all, "events"] as const,
  eventsList: (filters?: EventFilters) =>
    [...adminKeys.events(), "list", filters] as const,
  eventDetail: (id: string) => [...adminKeys.events(), "detail", id] as const,
  organizers: () => [...adminKeys.all, "organizers"] as const,
  organizersList: (filters?: OrganizerFilters) =>
    [...adminKeys.organizers(), "list", filters] as const,
  organizerDetail: (id: string) =>
    [...adminKeys.organizers(), "detail", id] as const,
  venues: () => [...adminKeys.all, "venues"] as const,
  venuesList: (filters?: VenueFilters) =>
    [...adminKeys.venues(), "list", filters] as const,
  venueDetail: (id: string) => [...adminKeys.venues(), "detail", id] as const,
  venueEventsCount: (id: string) =>
    [...adminKeys.venues(), "events-count", id] as const,
  statistics: () => [...adminKeys.all, "statistics"] as const,
  eventStatistics: () => [...adminKeys.statistics(), "events"] as const,
  organizerStatistics: () => [...adminKeys.statistics(), "organizers"] as const,
};

// Admin Events Hooks
export function useAdminEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: adminKeys.eventsList(filters),
    queryFn: () => adminService.getAdminEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminEventStatistics() {
  return useQuery({
    queryKey: adminKeys.eventStatistics(),
    queryFn: () => adminService.getAdminEventStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAdminEvent(id: string) {
  return useQuery({
    queryKey: adminKeys.eventDetail(id),
    queryFn: () => adminService.getAdminEventById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      adminService.publishEvent(id, publish),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch event details
      queryClient.invalidateQueries({ queryKey: adminKeys.eventDetail(id) });
      // Invalidate events list to update the dashboard
      queryClient.invalidateQueries({ queryKey: adminKeys.events() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: adminKeys.eventStatistics() });
    },
  });
}

export function useAdminEventForEdit(id: string) {
  return useQuery({
    queryKey: adminKeys.eventDetail(id),
    queryFn: () => adminService.getEventById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute - edit data should be fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      event,
      eventData,
      ...data
    }: {
      id: string;
      event?: Partial<Event>;
      eventData?: FormData;
      [key: string]: any;
    }) => {
      // If eventData is provided, use it (FormData), otherwise use event or spread data
      const updateData = eventData || event || data;
      return adminService.updateEvent(id, updateData);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch event details
      queryClient.invalidateQueries({ queryKey: adminKeys.eventDetail(id) });
      // Invalidate events list to update the dashboard
      queryClient.invalidateQueries({ queryKey: adminKeys.events() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: adminKeys.eventStatistics() });
    },
  });
}

export function useAdminDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteEvent(id),
    onSuccess: () => {
      // Invalidate events list to update the dashboard
      queryClient.invalidateQueries({ queryKey: adminKeys.events() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: adminKeys.eventStatistics() });
    },
  });
}

// Admin Organizers Hooks
export function useAdminOrganizers(filters?: OrganizerFilters) {
  return useQuery({
    queryKey: adminKeys.organizersList(filters),
    queryFn: () => adminService.getAdminOrganizers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminOrganizer(id: string) {
  return useQuery({
    queryKey: adminKeys.organizerDetail(id),
    queryFn: () => adminService.getAdminOrganizerById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminOrganizerStatistics() {
  return useQuery({
    queryKey: adminKeys.organizerStatistics(),
    queryFn: () => adminService.getAdminOrganizerStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Admin Venues Hooks
export function useVenues(filters?: VenueFilters) {
  return useQuery({
    queryKey: adminKeys.venuesList(filters),
    queryFn: () => adminService.getVenues(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAllVenues() {
  return useQuery({
    queryKey: adminKeys.venues(),
    queryFn: () => adminService.getAllVenues(),
    staleTime: 5 * 60 * 1000, // 5 minutes - venues don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useVenueEventsCount(id: string) {
  return useQuery({
    queryKey: adminKeys.venueEventsCount(id),
    queryFn: () => adminService.getVenueEventsCount(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute - event counts may change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venue: CreateVenueRequest) => adminService.createVenue(venue),
    onSuccess: () => {
      // Invalidate and refetch venues list
      queryClient.invalidateQueries({ queryKey: adminKeys.venues() });
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, venue }: { id: string; venue: UpdateVenueRequest }) =>
      adminService.updateVenue(id, venue),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch venue details
      queryClient.invalidateQueries({ queryKey: adminKeys.venueDetail(id) });
      // Invalidate venues list to update the list view
      queryClient.invalidateQueries({ queryKey: adminKeys.venues() });
    },
  });
}

export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteVenue(id),
    onSuccess: () => {
      // Invalidate and refetch venues list
      queryClient.invalidateQueries({ queryKey: adminKeys.venues() });
    },
  });
}
