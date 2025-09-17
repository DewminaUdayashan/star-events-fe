"use client";

import { Navigation } from "@/components/layout/Navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Building,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  useAdminVenues,
  useCreateAdminVenue,
  useUpdateAdminVenue,
  useDeleteAdminVenue,
} from "@/lib/services";
import type {
  AdminVenue,
  CreateVenueRequest,
  UpdateVenueRequest,
} from "@/lib/types/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminVenuesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<AdminVenue | null>(null);

  // Form states
  const [venueForm, setVenueForm] = useState<CreateVenueRequest>({
    name: "",
    location: "",
    capacity: 0,
  });

  const filters = useMemo(
    () => ({
      search: searchTerm || undefined,
      location: locationFilter !== "all" ? locationFilter : undefined,
      minCapacity:
        capacityFilter === "small"
          ? undefined
          : capacityFilter === "medium"
          ? 100
          : capacityFilter === "large"
          ? 500
          : undefined,
      maxCapacity:
        capacityFilter === "small"
          ? 100
          : capacityFilter === "medium"
          ? 500
          : capacityFilter === "large"
          ? undefined
          : undefined,
    }),
    [searchTerm, locationFilter, capacityFilter]
  );

  const { data: venues = [], isLoading, error } = useAdminVenues(filters);
  const createMutation = useCreateAdminVenue();
  const updateMutation = useUpdateAdminVenue();
  const deleteMutation = useDeleteAdminVenue();

  const filteredVenues = venues;

  const uniqueLocations = Array.from(
    new Set(venues.map((venue: AdminVenue) => venue.location))
  ).sort();

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("all");
    setCapacityFilter("all");
  };

  const resetForm = () => {
    setVenueForm({
      name: "",
      location: "",
      capacity: 0,
    });
  };

  const handleCreateVenue = async () => {
    if (!venueForm.name || !venueForm.location || venueForm.capacity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync(venueForm);
      toast({
        title: "Success",
        description: "Venue created successfully.",
      });
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create venue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditVenue = async () => {
    if (
      !selectedVenue ||
      !venueForm.name ||
      !venueForm.location ||
      venueForm.capacity <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedVenue.id,
        venue: venueForm as UpdateVenueRequest,
      });
      toast({
        title: "Success",
        description: "Venue updated successfully.",
      });
      setEditDialogOpen(false);
      setSelectedVenue(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update venue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (venue: AdminVenue) => {
    setSelectedVenue(venue);
    setVenueForm({
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
    });
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCapacityBadge = (capacity: number) => {
    if (capacity < 100) {
      return (
        <Badge variant="outline" className="border-blue-600 text-blue-300">
          Small
        </Badge>
      );
    } else if (capacity < 500) {
      return (
        <Badge variant="outline" className="border-green-600 text-green-300">
          Medium
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-purple-600 text-purple-300">
          Large
        </Badge>
      );
    }
  };

  return (
    <ProtectedRoute requiredRole="Admin">
      <div className="min-h-screen bg-gray-900">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Venue Management
                </h1>
                <p className="text-gray-400 mt-2">
                  Manage event venues, their locations, and capacities
                </p>
              </div>

              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Venue
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Venue</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add a new venue to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="create-name"
                        className="text-right text-gray-300"
                      >
                        Name
                      </Label>
                      <Input
                        id="create-name"
                        value={venueForm.name}
                        onChange={(e) =>
                          setVenueForm({ ...venueForm, name: e.target.value })
                        }
                        className="col-span-3 bg-gray-700 border-gray-600 text-white"
                        placeholder="Venue name..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="create-location"
                        className="text-right text-gray-300"
                      >
                        Location
                      </Label>
                      <Input
                        id="create-location"
                        value={venueForm.location}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            location: e.target.value,
                          })
                        }
                        className="col-span-3 bg-gray-700 border-gray-600 text-white"
                        placeholder="City or area..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="create-capacity"
                        className="text-right text-gray-300"
                      >
                        Capacity
                      </Label>
                      <Input
                        id="create-capacity"
                        type="number"
                        min="1"
                        value={venueForm.capacity || ""}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            capacity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="col-span-3 bg-gray-700 border-gray-600 text-white"
                        placeholder="Maximum capacity..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleCreateVenue}
                      disabled={createMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {createMutation.isPending
                        ? "Creating..."
                        : "Create Venue"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Venues
                </CardTitle>
                <Building className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {venues.length}
                </div>
                <p className="text-xs text-gray-500">Active venues in system</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Capacity
                </CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {venues
                    .reduce(
                      (sum: number, venue: AdminVenue) => sum + venue.capacity,
                      0
                    )
                    .toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  Combined seating capacity
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Active Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {venues.reduce(
                    (sum: number, venue: AdminVenue) => sum + venue.eventCount,
                    0
                  )}
                </div>
                <p className="text-xs text-gray-500">Events using venues</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Locations
                </CardTitle>
                <MapPin className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {uniqueLocations.length}
                </div>
                <p className="text-xs text-gray-500">Different cities/areas</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location: string) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={capacityFilter}
                  onValueChange={setCapacityFilter}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Capacity" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small (&lt; 100)</SelectItem>
                    <SelectItem value="medium">Medium (100-500)</SelectItem>
                    <SelectItem value="large">Large (500+)</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Venues Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Building className="h-5 w-5" />
                Venues ({filteredVenues.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage venue information and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-300">Loading venues...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">
                  Failed to load venues. Please try again.
                </div>
              ) : filteredVenues.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No venues found matching your criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Venue</TableHead>
                        <TableHead className="text-gray-300">
                          Location
                        </TableHead>
                        <TableHead className="text-gray-300">
                          Capacity
                        </TableHead>
                        <TableHead className="text-gray-300">Events</TableHead>
                        <TableHead className="text-gray-300">Created</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVenues.map((venue: AdminVenue) => (
                        <TableRow key={venue.id} className="border-gray-700">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-white">
                                {venue.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-white">
                                {venue.location}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                {venue.capacity.toLocaleString()}
                              </span>
                              {getCapacityBadge(venue.capacity)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-white">
                              {venue.eventCount} events
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-300">
                              {formatDate(venue.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openEditDialog(venue as AdminVenue)
                                }
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Edit Venue</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update venue information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-name"
                    className="text-right text-gray-300"
                  >
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={venueForm.name}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, name: e.target.value })
                    }
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-location"
                    className="text-right text-gray-300"
                  >
                    Location
                  </Label>
                  <Input
                    id="edit-location"
                    value={venueForm.location}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, location: e.target.value })
                    }
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-capacity"
                    className="text-right text-gray-300"
                  >
                    Capacity
                  </Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min="1"
                    value={venueForm.capacity || ""}
                    onChange={(e) =>
                      setVenueForm({
                        ...venueForm,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleEditVenue}
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Venue"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  );
}
