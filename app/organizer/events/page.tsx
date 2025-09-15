"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOrganizerEvents,
  useDeleteEvent,
  OrganizerEventsParams,
} from "@/lib/services/organizer-hooks";
import type { OrganizerEvent } from "@/lib/services/organizer.service";

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State for local filtering and UI
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  // API parameters for server-side filtering
  const eventsParams: OrganizerEventsParams = {
    keyword: searchQuery || undefined,
    category:
      categoryFilter === "all" ? undefined : categoryFilter || undefined,
    venue: venueFilter === "all" ? undefined : venueFilter || undefined,
    fromDate: dateFilter ? new Date(dateFilter).toISOString() : undefined,
  };

  // Fetch events with the parameters
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useOrganizerEvents(eventsParams);

  // Delete event mutation
  const deleteEventMutation = useDeleteEvent();

  // Filter events locally if needed (for additional client-side filtering)
  const filteredEvents = events || [];

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setEventToDelete(null);
          refetch();
        },
        onError: (error) => {
          console.error("Failed to delete event:", error);
        },
      });
    }
  };

  const getStatusBadge = (isPublished: boolean = false) => {
    if (isPublished) {
      return (
        <Badge className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Published
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
    }
  };

  // Calculate stats from actual data (simplified since we don't have all data)
  const totalEvents = events?.length || 0;
  const publishedEvents = 0; // API doesn't return isPublished field

  // For now, use mock data for tickets and revenue as these aren't in the OrganizerEvent type
  const totalTicketsSold = totalEvents * 150; // Mock calculation
  const totalRevenue = totalEvents * 75000; // Mock calculation

  if (error) {
    return (
      <ProtectedRoute requiredRole={["Organizer"]}>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-500 mb-2">
              Error Loading Events
            </h1>
            <p className="text-gray-400 mb-4">
              {error?.message || "An error occurred"}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={["Organizer"]}>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
              <p className="text-gray-400">
                Manage your events and track their performance
              </p>
            </div>
            <Link href="/organizer/events/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : totalEvents}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Published
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    publishedEvents
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Total Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    totalTicketsSold.toLocaleString()
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    `$${totalRevenue.toLocaleString()}`
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-medium text-white">Filter Events</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="arts">Arts & Culture</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="food">Food & Drink</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={venueFilter}
                onValueChange={(value) =>
                  setVenueFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Venue" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Venues</SelectItem>
                  <SelectItem value="venue1">Venue 1</SelectItem>
                  <SelectItem value="venue2">Venue 2</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Events Grid */}
          <div className="mb-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-0">
                      <Skeleton className="aspect-video w-full rounded-t-lg" />
                      <div className="p-6 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (events?.length ?? 0) === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  {(events?.length ?? 0) === 0 &&
                  (searchQuery ||
                    (categoryFilter && categoryFilter !== "all") ||
                    (venueFilter && venueFilter !== "all") ||
                    dateFilter)
                    ? "No matching events"
                    : "No events yet"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {(events?.length ?? 0) === 0 &&
                  !(
                    searchQuery ||
                    (categoryFilter && categoryFilter !== "all") ||
                    (venueFilter && venueFilter !== "all") ||
                    dateFilter
                  )
                    ? "You haven't created any events yet."
                    : "No events match your search criteria."}
                </p>
                <Link href="/organizer/events/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video relative rounded-t-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg"
                          alt={event.title || "Event"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(false)}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {event.title}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-600">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/organizer/events/${event.id}`)
                                }
                                className="text-blue-400"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/organizer/events/${event.id}/edit`
                                  )
                                }
                                className="text-green-400"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  console.log("Toggle status", event.id)
                                }
                                className="text-blue-400"
                              >
                                {false ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(event.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-300 text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-300 text-sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.venueName || "Venue TBD"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent className="bg-gray-800 border-gray-600">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Delete Event
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Are you sure you want to delete this event? This action cannot
                  be undone. All associated tickets and bookings will also be
                  deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  disabled={deleteEventMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteEventMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Event"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </ProtectedRoute>
  );
}
