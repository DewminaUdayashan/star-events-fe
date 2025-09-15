import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  venuesService,
  type VenueSearchParams,
  type CreateVenueRequest,
} from "./venues.service";

// Query Keys
export const venuesKeys = {
  all: ["venues"] as const,
  lists: () => [...venuesKeys.all, "list"] as const,
  list: (params?: VenueSearchParams) =>
    [...venuesKeys.lists(), params] as const,
  details: () => [...venuesKeys.all, "detail"] as const,
  detail: (id: string) => [...venuesKeys.details(), id] as const,
};

// Hooks
export function useVenues(params?: VenueSearchParams) {
  return useQuery({
    queryKey: venuesKeys.list(params),
    queryFn: () => venuesService.getVenues(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useVenue(id: string, enabled = true) {
  return useQuery({
    queryKey: venuesKeys.detail(id),
    queryFn: () => venuesService.getVenueById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venue: CreateVenueRequest) => venuesService.createVenue(venue),
    onSuccess: () => {
      // Invalidate all venue lists
      queryClient.invalidateQueries({ queryKey: venuesKeys.lists() });
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...venue
    }: { id: string } & Partial<CreateVenueRequest>) =>
      venuesService.updateVenue(id, venue),
    onSuccess: (data, variables) => {
      // Update the specific venue in cache
      queryClient.setQueryData(venuesKeys.detail(variables.id), data);
      // Invalidate venue lists
      queryClient.invalidateQueries({ queryKey: venuesKeys.lists() });
    },
  });
}

export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venuesService.deleteVenue(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: venuesKeys.detail(id) });
      // Invalidate venue lists
      queryClient.invalidateQueries({ queryKey: venuesKeys.lists() });
    },
  });
}

export function useSearchVenues(query: string, enabled = true) {
  return useQuery({
    queryKey: venuesKeys.list({ search: query }),
    queryFn: () => venuesService.searchVenues(query),
    enabled: enabled && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute for search results
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}
