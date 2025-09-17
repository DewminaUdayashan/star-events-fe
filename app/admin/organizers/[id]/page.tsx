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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  TrendingUp,
  Users,
  Ticket,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useAdminOrganizer } from "@/lib/services";
import { useParams } from "next/navigation";

export default function AdminOrganizerDetailPage() {
  const params = useParams();
  const organizerId = params?.id as string;

  const { data: organizer, isLoading, error } = useAdminOrganizer(organizerId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEventDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const time = new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} at ${time}`;
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
                Loading organizer details...
              </span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !organizer) {
    return (
      <ProtectedRoute requiredRole="Admin">
        <div className="min-h-screen bg-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="text-red-400 text-lg mb-4">
                Failed to load organizer details
              </div>
              <Button
                asChild
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Link href="/admin/organizers">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Organizers
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
              <Link href="/admin/organizers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Organizers
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {organizer.fullName}
                </h1>
                <p className="text-gray-400 mt-2">
                  Organizer Profile & Event Management
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge
                  variant={organizer.isActive ? "default" : "secondary"}
                  className={`w-fit ${
                    organizer.isActive
                      ? "bg-green-600 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {organizer.isActive ? (
                    <Activity className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {organizer.isActive ? "Active" : "Inactive"}
                </Badge>
                {organizer.emailConfirmed && (
                  <Badge
                    variant="outline"
                    className="w-fit border-gray-600 text-gray-300"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Email Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {organizer.totalEvents}
                </div>
                <p className="text-xs text-gray-500">
                  {organizer.publishedEvents} published
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Upcoming Events
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {organizer.upcomingEvents}
                </div>
                <p className="text-xs text-gray-500">
                  {organizer.pastEvents} past events
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Published Events
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {organizer.publishedEvents}
                </div>
                <p className="text-xs text-gray-500">
                  {organizer.unpublishedEvents} unpublished
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Member Since
                </CardTitle>
                <User className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">
                  {formatDate(organizer.createdAt)}
                </div>
                <p className="text-xs text-gray-500">
                  Last login: {formatDateTime(organizer.lastLogin)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-300">
                        Full Name:
                      </span>
                      <span className="text-white">{organizer.fullName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-300">Email:</span>
                      <span className="text-white">{organizer.email}</span>
                    </div>

                    {organizer.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-300">
                          Phone:
                        </span>
                        <span className="text-white">
                          {organizer.phoneNumber}
                        </span>
                      </div>
                    )}

                    {organizer.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-300">
                          Address:
                        </span>
                        <span className="text-white">{organizer.address}</span>
                      </div>
                    )}

                    {organizer.organizationName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-300">
                          Organization:
                        </span>
                        <span className="text-white">
                          {organizer.organizationName}
                        </span>
                      </div>
                    )}

                    {organizer.organizationContact && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-300">
                          Org Contact:
                        </span>
                        <span className="text-white">
                          {organizer.organizationContact}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-600">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-300">
                          Account Status:
                        </span>
                        <div className="mt-1 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {organizer.isActive ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs text-gray-300">
                              {organizer.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {organizer.emailConfirmed ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs text-gray-300">
                              Email{" "}
                              {organizer.emailConfirmed
                                ? "Verified"
                                : "Unverified"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {organizer.phoneNumberConfirmed ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs text-gray-300">
                              Phone{" "}
                              {organizer.phoneNumberConfirmed
                                ? "Verified"
                                : "Unverified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5" />
                    Recent Events ({organizer.recentEvents.length})
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Latest events created by this organizer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {organizer.recentEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No events found for this organizer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-gray-300">
                              Event
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Category
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Date & Time
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Venue
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Status
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {organizer.recentEvents.map((event) => (
                            <TableRow
                              key={event.id}
                              className="border-gray-700"
                            >
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-white">
                                    {event.title}
                                  </div>
                                  <div className="text-sm text-gray-400 line-clamp-2">
                                    {event.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="border-gray-600 text-gray-300"
                                >
                                  {event.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-300">
                                  {formatEventDateTime(
                                    event.eventDate,
                                    event.eventTime
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-300">
                                  {event.venueName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    event.isPublished ? "default" : "secondary"
                                  }
                                  className={
                                    event.isPublished
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-600 text-gray-300"
                                  }
                                >
                                  {event.isPublished ? "Published" : "Draft"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  asChild
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  <Link href={`/admin/events/${event.id}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Event Timeline */}
              {organizer.firstEventDate && (
                <Card className="mt-6 bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Clock className="h-5 w-5" />
                      Event Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">First Event:</span>
                        <span className="font-medium text-white">
                          {formatDate(organizer.firstEventDate)}
                        </span>
                      </div>
                      {organizer.lastEventDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Latest Event:</span>
                          <span className="font-medium text-white">
                            {formatDate(organizer.lastEventDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
