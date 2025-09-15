import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  organizerService,
  type OrganizerEventsParams,
} from "./organizer.service";
import { useAuth } from "@/contexts/AuthContext";

// Re-export types for easier access
export type { OrganizerEventsParams } from "./organizer.service";

// Query Keys
export const organizerKeys = {
  all: ["organizer"] as const,
  events: () => [...organizerKeys.all, "events"] as const,
  event: (id: string) => [...organizerKeys.events(), id] as const,
  dashboard: () => [...organizerKeys.all, "dashboard"] as const,
  analytics: (eventId: string) =>
    [...organizerKeys.all, "analytics", eventId] as const,
  profile: () => [...organizerKeys.all, "profile"] as const,
};

// Dashboard Hook
export function useOrganizerDashboard() {
  const { user, roles } = useAuth();

  console.log("useOrganizerDashboard - User:", !!user);
  console.log("useOrganizerDashboard - Roles:", roles);
  console.log(
    "useOrganizerDashboard - Has Organizer role:",
    roles.includes("Organizer")
  );

  return useQuery({
    queryKey: organizerKeys.dashboard(),
    queryFn: () => organizerService.getDashboard(),
    enabled: !!user && roles.includes("Organizer"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Events Hooks
export function useOrganizerEvents(params?: OrganizerEventsParams) {
  const { user, roles } = useAuth();

  console.log("useOrganizerEvents - User:", !!user);
  console.log("useOrganizerEvents - Roles:", roles);
  console.log(
    "useOrganizerEvents - Has Organizer role:",
    roles.includes("Organizer")
  );
  console.log("useOrganizerEvents - Params:", params);

  return useQuery({
    queryKey: [...organizerKeys.events(), params],
    queryFn: () => organizerService.getMyEvents(params),
    enabled: !!user && roles.includes("Organizer"),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOrganizerEvent(id: string) {
  const { user, roles } = useAuth();

  return useQuery({
    queryKey: organizerKeys.event(id),
    queryFn: () => organizerService.getEventById(id),
    enabled: !!user && roles.includes("Organizer" as any) && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Event Analytics Hook
export function useEventAnalytics(eventId: string) {
  const { user, roles } = useAuth();

  return useQuery({
    queryKey: organizerKeys.analytics(eventId),
    queryFn: () => organizerService.getEventAnalytics(eventId),
    enabled: !!user && roles.includes("Organizer" as any) && !!eventId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Profile Hook
export function useOrganizerProfile() {
  const { user, roles } = useAuth();

  return useQuery({
    queryKey: organizerKeys.profile(),
    queryFn: () => organizerService.getOrganizerProfile(),
    enabled: !!user && roles.includes("Organizer" as any),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Mutation Hooks
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizerService.createEvent,
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: organizerKeys.events() });
      queryClient.invalidateQueries({ queryKey: organizerKeys.dashboard() });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      organizerService.updateEvent(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific event and events list
      queryClient.invalidateQueries({
        queryKey: organizerKeys.event(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: organizerKeys.events() });
      queryClient.invalidateQueries({ queryKey: organizerKeys.dashboard() });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizerService.deleteEvent,
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: organizerKeys.events() });
      queryClient.invalidateQueries({ queryKey: organizerKeys.dashboard() });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizerService.publishEvent,
    onSuccess: (data) => {
      // Update specific event in cache
      queryClient.setQueryData(organizerKeys.event(data.id), data);
      // Invalidate events list to refresh status
      queryClient.invalidateQueries({ queryKey: organizerKeys.events() });
    },
  });
}

export function useUnpublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizerService.unpublishEvent,
    onSuccess: (data) => {
      // Update specific event in cache
      queryClient.setQueryData(organizerKeys.event(data.id), data);
      // Invalidate events list to refresh status
      queryClient.invalidateQueries({ queryKey: organizerKeys.events() });
    },
  });
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizerService.duplicateEvent,
    onSuccess: () => {
      // Invalidate events list to show new duplicated event
      queryClient.invalidateQueries({ queryKey: organizerKeys.events() });
      queryClient.invalidateQueries({ queryKey: organizerKeys.dashboard() });
    },
  });
}

// Additional mutations for profile management
export function useUpdateOrganizerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizerService.updateOrganizerProfile,
    onSuccess: (data) => {
      // Update profile in cache
      queryClient.setQueryData(organizerKeys.profile(), data);
    },
  });
}

// Event-specific mutations
export function useUpdateEventPrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, prices }: { eventId: string; prices: any[] }) =>
      organizerService.updateEventPrices(eventId, prices),
    onSuccess: (_, variables) => {
      // Invalidate specific event
      queryClient.invalidateQueries({
        queryKey: organizerKeys.event(variables.eventId),
      });
    },
  });
}

export function useCheckInTicket() {
  return useMutation({
    mutationFn: organizerService.checkInTicket,
    // Note: You might want to invalidate check-in related queries here
  });
}

// Promotion mutations
export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, promotion }: { eventId: string; promotion: any }) =>
      organizerService.createPromotion(eventId, promotion),
    onSuccess: (_, variables) => {
      // Invalidate promotions for this event
      queryClient.invalidateQueries({
        queryKey: [...organizerKeys.event(variables.eventId), "promotions"],
      });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      promotionId,
    }: {
      eventId: string;
      promotionId: string;
    }) => organizerService.deletePromotion(eventId, promotionId),
    onSuccess: (_, variables) => {
      // Invalidate promotions for this event
      queryClient.invalidateQueries({
        queryKey: [...organizerKeys.event(variables.eventId), "promotions"],
      });
    },
  });
}
