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
import {
  ArrowLeft,
  Building,
  MapPin,
  Users,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useVenueEventsCount } from "@/lib/services";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { AdminVenue } from "@/lib/types/api";

export default function AdminVenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params?.id as string;

  // For this implementation, we'll use a mock venue since we don't have a specific venue detail API
  // In a real application, you would create a useVenue(id) hook that fetches individual venue details
  const [venue, setVenue] = useState<AdminVenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: eventsCount, isLoading: eventsCountLoading } =
    useVenueEventsCount(venueId);

  useEffect(() => {
    // Mock venue data - in a real app, this would come from an API call
    const mockVenue: AdminVenue = {
      id: venueId,
      name: "Convention Center",
      location: "Colombo",
      capacity: 1500,
      createdAt: "2024-01-15T10:00:00Z",
      modifiedAt: "2024-06-20T15:30:00Z",
      eventCount: eventsCount || 0,
    };

    setVenue(mockVenue);
    setIsLoading(false);
  }, [venueId, eventsCount]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCapacityBadge = (capacity: number) => {
    if (capacity < 100) {
      return <Badge className="bg-blue-600 text-white">Small Venue</Badge>;
    } else if (capacity < 500) {
      return <Badge className="bg-green-600 text-white">Medium Venue</Badge>;
    } else {
      return <Badge className="bg-purple-600 text-white">Large Venue</Badge>;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="Admin">
        <div className="min-h-screen bg-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-lg text-gray-300">
                Loading venue details...
              </span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!venue) {
    return (
      <ProtectedRoute requiredRole="Admin">
        <div className="min-h-screen bg-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="text-red-400 text-lg mb-4">Venue not found</div>
              <Button
                asChild
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Link href="/admin/venues">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Venues
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="Admin">
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              asChild
              variant="ghost"
              className="mb-4 text-gray-300 hover:bg-gray-800"
            >
              <Link href="/admin/venues">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Venues
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{venue.name}</h1>
                <p className="text-gray-400 mt-2">
                  Venue Details & Event Management
                </p>
              </div>
              <div className="flex items-center gap-4">
                {getCapacityBadge(venue.capacity)}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Venue
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-700 hover:text-white"
                    disabled={venue.eventCount > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Capacity
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {venue.capacity.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Maximum attendees</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Active Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {eventsCountLoading ? "..." : eventsCount || 0}
                </div>
                <p className="text-xs text-gray-500">
                  Current events scheduled
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Location
                </CardTitle>
                <MapPin className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">
                  {venue.location}
                </div>
                <p className="text-xs text-gray-500">City/Area</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Created
                </CardTitle>
                <Building className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">
                  {formatDate(venue.createdAt)}
                </div>
                <p className="text-xs text-gray-500">Added to system</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Venue Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Building className="h-5 w-5" />
                  Venue Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-300">Name:</span>
                    <span className="text-white">{venue.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-300">Location:</span>
                    <span className="text-white">{venue.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-300">Capacity:</span>
                    <span className="text-white">
                      {venue.capacity.toLocaleString()} people
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-600">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-300">
                        System Information:
                      </span>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Created:</span>
                          <span className="text-white">
                            {formatDateTime(venue.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Last Modified:</span>
                          <span className="text-white">
                            {formatDateTime(venue.modifiedAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Venue ID:</span>
                          <span className="text-gray-300 font-mono text-xs">
                            {venue.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Activity */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5" />
                  Event Activity
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Current events and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsCountLoading ? (
                  <div className="text-center py-8 text-gray-400">
                    Loading event information...
                  </div>
                ) : (eventsCount || 0) === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No Active Events
                    </h3>
                    <p className="text-gray-400">
                      This venue doesn't have any events scheduled at the
                      moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">
                            Active Events
                          </div>
                          <div className="text-sm text-gray-400">
                            Currently scheduled events
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          {eventsCount}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">
                            Capacity Utilization
                          </div>
                          <div className="text-sm text-gray-400">
                            Based on current bookings
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-400">
                          Available
                        </div>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Link href={`/admin/events?venue=${venue.id}`}>
                        View All Events
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Venue Actions */}
          {venue.eventCount > 0 && (
            <Card className="bg-gray-800 border-gray-700 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Venue Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-300">
                    This venue has {venue.eventCount} active events and cannot
                    be deleted until all events are completed or moved to other
                    venues.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
