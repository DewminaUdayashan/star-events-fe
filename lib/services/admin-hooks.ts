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
