"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Copy,
  Trash2,
  Share2,
  Download,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  useOrganizerEvent,
  useEventAnalytics,
  useDeleteEvent,
  useUpdateEvent,
} from "@/lib/services/organizer-hooks";
import { useToast } from "@/hooks/use-toast";

export default function OrganizerEventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  // TanStack Query hooks
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
    refetch: refetchEvent,
  } = useOrganizerEvent(eventId);

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useEventAnalytics(eventId);

  // Mutations
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  const handleDelete = () => {
    deleteEventMutation.mutate(eventId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        router.push("/organizer/events");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        });
        console.error("Delete error:", error);
      },
    });
  };

  const handlePublishToggle = () => {
    if (!event) return;

    const newStatus = !event.isPublished;
    updateEventMutation.mutate(
      {
        id: eventId,
        isPublished: newStatus,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `Event ${
              newStatus ? "published" : "unpublished"
            } successfully`,
          });
          refetchEvent();
          setPublishDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to ${
              newStatus ? "publish" : "unpublish"
            } event`,
            variant: "destructive",
          });
          console.error("Publish toggle error:", error);
        },
      }
    );
  };

  const handleCopyEventLink = () => {
    if (!event) return;
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(eventUrl);
    toast({
      title: "Success",
      description: "Event link copied to clipboard",
    });
  };

  const getStatusBadge = (isPublished: boolean) => {
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

  // Loading state
  if (eventLoading) {
    return (
      <ProtectedRoute requiredRole={["Organizer"]}>
        <div className="min-h-screen bg-black text-white">
          <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 mb-8">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>

            {/* Event Details Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-video w-full rounded-t-lg" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (eventError) {
    return (
      <ProtectedRoute requiredRole={["Organizer"]}>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-500 mb-2">
              Error Loading Event
            </h1>
            <p className="text-gray-400 mb-4">
              {eventError?.message || "Failed to load event details"}
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => refetchEvent()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/organizer/events")}
                className="border-gray-600 hover:bg-gray-800"
              >
                Back to Events
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!event) {
    return (
      <ProtectedRoute requiredRole={["Organizer"]}>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-300 mb-2">
              Event Not Found
            </h1>
            <p className="text-gray-400 mb-4">
              The event you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button
              onClick={() => router.push("/organizer/events")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Events
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/organizer/events")}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center gap-4">
                  {getStatusBadge(event.isPublished || false)}
                  <span className="text-gray-400">Event ID: {event.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEventLink}
                className="border-gray-600 hover:bg-gray-800"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-600">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/organizer/events/${event.id}/edit`)
                    }
                    className="text-blue-400"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPublishDialogOpen(true)}
                    className="text-green-400"
                  >
                    {event.isPublished ? (
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
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="text-purple-400"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Public Page
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Image and Basic Info */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-0">
                  <div className="aspect-video relative rounded-t-lg overflow-hidden">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title || "Event"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-medium">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {event.eventTime && (
                        <div className="flex items-center text-gray-300">
                          <Clock className="h-4 w-4 mr-2" />
                          <div>
                            <p className="text-sm text-gray-400">Time</p>
                            <p className="font-medium">{event.eventTime}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <p className="text-sm text-gray-400">Venue</p>
                          <p className="font-medium">
                            {event.venue?.name || "TBD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-300">
                        <Ticket className="h-4 w-4 mr-2" />
                        <div>
                          <p className="text-sm text-gray-400">Category</p>
                          <p className="font-medium capitalize">
                            {event.category || "General"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Description
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {event.description || "No description available."}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Tiers */}
              {event.prices && event.prices.length > 0 && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Ticket className="h-5 w-5 mr-2" />
                      Ticket Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.prices.map((price, index) => (
                        <div
                          key={price.id || index}
                          className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                        >
                          <div>
                            <h4 className="text-white font-medium">
                              {price.category}
                            </h4>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">
                              ${price.price.toFixed(2)}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {price.stock} available
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Statistics */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Tickets</span>
                    <span className="text-white font-medium">
                      {analyticsLoading ? (
                        <Skeleton className="h-5 w-12" />
                      ) : (
                        analytics?.totalTicketsSold || 0
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Revenue</span>
                    <span className="text-white font-medium">
                      {analyticsLoading ? (
                        <Skeleton className="h-5 w-16" />
                      ) : (
                        `$${analytics?.totalRevenue?.toLocaleString() || 0}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg. Ticket Price</span>
                    <span className="text-white font-medium">
                      {analyticsLoading ? (
                        <Skeleton className="h-5 w-12" />
                      ) : (
                        `$${analytics?.averageTicketPrice?.toFixed(2) || 0}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-white font-medium">
                      {analyticsLoading ? (
                        <Skeleton className="h-5 w-12" />
                      ) : (
                        `${analytics?.conversionRate?.toFixed(1) || 0}%`
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-600 hover:bg-gray-800"
                    onClick={() =>
                      router.push(`/organizer/events/${event.id}/edit`)
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event Details
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-600 hover:bg-gray-800"
                    onClick={() =>
                      router.push(`/organizer/events/${event.id}/analytics`)
                    }
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-600 hover:bg-gray-800"
                    onClick={handleCopyEventLink}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Event Link
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-600 hover:bg-gray-800"
                    onClick={() =>
                      router.push(`/organizer/events/${event.id}/tickets`)
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Tickets
                  </Button>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Event Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Visibility</span>
                      {getStatusBadge(event.isPublished || false)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white text-sm">
                        {event.createdAt
                          ? new Date(event.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-white text-sm">
                        {event.modifiedAt
                          ? new Date(event.modifiedAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <Button
                      variant={event.isPublished ? "destructive" : "default"}
                      className="w-full mt-4"
                      onClick={() => setPublishDialogOpen(true)}
                      disabled={updateEventMutation.isPending}
                    >
                      {updateEventMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : event.isPublished ? (
                        <XCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {event.isPublished ? "Unpublish Event" : "Publish Event"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  Are you sure you want to delete "{event.title}"? This action
                  cannot be undone. All associated tickets and bookings will
                  also be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
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

          {/* Publish/Unpublish Confirmation Dialog */}
          <AlertDialog
            open={publishDialogOpen}
            onOpenChange={setPublishDialogOpen}
          >
            <AlertDialogContent className="bg-gray-800 border-gray-600">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  {event.isPublished ? "Unpublish" : "Publish"} Event
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  {event.isPublished
                    ? `Are you sure you want to unpublish "${event.title}"? The event will no longer be visible to customers.`
                    : `Are you sure you want to publish "${event.title}"? The event will become visible to customers and they can start booking tickets.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handlePublishToggle}
                  disabled={updateEventMutation.isPending}
                  className={
                    event.isPublished
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }
                >
                  {updateEventMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {event.isPublished ? "Unpublishing..." : "Publishing..."}
                    </>
                  ) : (
                    <>{event.isPublished ? "Unpublish" : "Publish"} Event</>
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
