"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MapPin,
  Users,
  Check,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVenues, useCreateVenue } from "@/lib/services/venues-hooks";
import { cn } from "@/lib/utils";
import type { Venue, CreateVenueRequest } from "@/lib/services/venues.service";

interface VenueSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function VenueSelect({
  value,
  onValueChange,
  error,
  className,
}: VenueSelectProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch venues with search
  const {
    data: venues = [],
    isLoading,
    error: venuesError,
  } = useVenues({ search: searchQuery });

  const createVenueMutation = useCreateVenue();

  // Form state for creating new venue
  const [newVenue, setNewVenue] = useState<CreateVenueRequest>({
    name: "",
    location: "",
    capacity: 100,
  });

  const [venueFormErrors, setVenueFormErrors] = useState<{
    name?: string;
    location?: string;
    capacity?: string;
  }>({});

  // Filter and sort venues
  const filteredVenues = useMemo(() => {
    if (!venues) return [];

    // Sort by name and then by event count (popular venues first)
    return venues.sort((a, b) => {
      // First, sort by name alphabetically
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });
  }, [venues]);

  // Find selected venue
  const selectedVenue = venues.find((venue) => venue.id === value);

  // Validate new venue form
  const validateVenueForm = () => {
    const errors: {
      name?: string;
      location?: string;
      capacity?: string;
    } = {};

    if (!newVenue.name.trim()) {
      errors.name = "Venue name is required";
    }

    if (!newVenue.location.trim()) {
      errors.location = "Location is required";
    }

    if (newVenue.capacity < 1) {
      errors.capacity = "Capacity must be at least 1";
    }

    setVenueFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create venue
  const handleCreateVenue = async () => {
    if (!validateVenueForm()) {
      return;
    }

    try {
      const createdVenue = await createVenueMutation.mutateAsync(newVenue);

      // Select the newly created venue
      onValueChange(createdVenue.id);

      // Close dialog and reset form
      setShowCreateDialog(false);
      setNewVenue({ name: "", location: "", capacity: 100 });
      setVenueFormErrors({});

      toast({
        title: "Success",
        description: `Venue "${createdVenue.name}" created successfully!`,
      });
    } catch (error: any) {
      console.error("Failed to create venue:", error);
      toast({
        title: "Error",
        description:
          error?.message || "Failed to create venue. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle search input changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      // The search query is automatically used by the useVenues hook
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  return (
    <div className={className}>
      <Label className="text-white">Venue *</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            {selectedVenue ? (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="truncate">{selectedVenue.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  <Users className="w-3 h-3 mr-1" />
                  {selectedVenue.capacity}
                </Badge>
              </div>
            ) : (
              "Select venue..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600">
          <Command className="bg-gray-800">
            <div className="flex items-center border-b border-gray-600">
              <Search className="w-4 h-4 mx-3 text-gray-400" />
              <input
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-3 px-1 bg-transparent text-white placeholder:text-gray-400 outline-none"
              />
            </div>
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-400">
                    Searching venues...
                  </span>
                </div>
              ) : filteredVenues.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="text-gray-400 mb-4">
                    {searchQuery
                      ? `No venues found for "${searchQuery}"`
                      : "No venues available"}
                  </div>
                  <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Venue
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                <CommandGroup>
                  {filteredVenues.map((venue) => (
                    <CommandItem
                      key={venue.id}
                      value={venue.id}
                      onSelect={() => {
                        onValueChange(venue.id === value ? "" : venue.id);
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 py-3 px-3 cursor-pointer hover:bg-gray-700 text-white"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === venue.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className="font-medium truncate">
                            {venue.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {venue.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-3 h-3" />
                        {venue.capacity}
                      </div>
                    </CommandItem>
                  ))}

                  {/* Add "Create New Venue" option */}
                  <div className="border-t border-gray-600 mt-2 pt-2">
                    <Dialog
                      open={showCreateDialog}
                      onOpenChange={setShowCreateDialog}
                    >
                      <DialogTrigger asChild>
                        <CommandItem
                          onSelect={() => setShowCreateDialog(true)}
                          className="flex items-center gap-2 py-3 px-3 cursor-pointer hover:bg-gray-700 text-purple-400"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create New Venue</span>
                        </CommandItem>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

      {/* Create Venue Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Create New Venue</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new venue to the system. This will be available for all
              events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="venue-name" className="text-white">
                Venue Name *
              </Label>
              <Input
                id="venue-name"
                type="text"
                value={newVenue.name}
                onChange={(e) => {
                  setNewVenue((prev) => ({ ...prev, name: e.target.value }));
                  if (venueFormErrors.name) {
                    setVenueFormErrors((prev) => ({
                      ...prev,
                      name: undefined,
                    }));
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter venue name"
              />
              {venueFormErrors.name && (
                <p className="text-red-400 text-sm mt-1">
                  {venueFormErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="venue-location" className="text-white">
                Location *
              </Label>
              <Input
                id="venue-location"
                type="text"
                value={newVenue.location}
                onChange={(e) => {
                  setNewVenue((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }));
                  if (venueFormErrors.location) {
                    setVenueFormErrors((prev) => ({
                      ...prev,
                      location: undefined,
                    }));
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter venue location"
              />
              {venueFormErrors.location && (
                <p className="text-red-400 text-sm mt-1">
                  {venueFormErrors.location}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="venue-capacity" className="text-white">
                Capacity *
              </Label>
              <Input
                id="venue-capacity"
                type="number"
                min="1"
                value={newVenue.capacity}
                onChange={(e) => {
                  setNewVenue((prev) => ({
                    ...prev,
                    capacity: parseInt(e.target.value) || 0,
                  }));
                  if (venueFormErrors.capacity) {
                    setVenueFormErrors((prev) => ({
                      ...prev,
                      capacity: undefined,
                    }));
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter venue capacity"
              />
              {venueFormErrors.capacity && (
                <p className="text-red-400 text-sm mt-1">
                  {venueFormErrors.capacity}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={createVenueMutation.isPending}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateVenue}
              disabled={createVenueMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createVenueMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </div>
              ) : (
                "Create Venue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
