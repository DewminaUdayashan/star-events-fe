"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Users,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  BarChart3,
  Search,
  Filter,
  MapPin,
  User,
  Mail,
  Building,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useAdminEvents,
  useAdminEventStatistics,
  useCategories,
} from "@/lib/services";
import { useVenues } from "@/lib/services/venues-hooks";
import type { EventFilters, AdminEvent } from "@/lib/types/api";
import { getImageUrl } from "@/lib/utils";

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch data
  const { data: venuesData = [] } = useVenues();
  const { data: categoriesData = [] } = useCategories();
  const { data: statistics, isLoading: statsLoading } =
    useAdminEventStatistics();

  // Handle API response structures for venues and categories
  const venues = useMemo(() => {
    console.log("AdminDashboard - Raw venues data:", venuesData);

    if (!venuesData) return [];

    let venuesArray = venuesData;
    const data = venuesData as any;

    // Handle nested structures
    if (typeof data === "object" && !Array.isArray(data) && data.data) {
      venuesArray = data.data;
    }
    if (typeof data === "object" && !Array.isArray(data) && data.$values) {
      venuesArray = data.$values;
    }

    return Array.isArray(venuesArray) ? venuesArray : [];
  }, [venuesData]);

  const categories = useMemo(() => {
    console.log("AdminDashboard - Raw categories data:", categoriesData);

    if (!categoriesData) return [];

    let categoriesArray = categoriesData;
    const data = categoriesData as any;

    // Handle nested structures
    if (typeof data === "object" && !Array.isArray(data) && data.data) {
      categoriesArray = data.data;
    }
    if (typeof data === "object" && !Array.isArray(data) && data.$values) {
      categoriesArray = data.$values;
    }

    return Array.isArray(categoriesArray) ? categoriesArray : [];
  }, [categoriesData]);

  // Prepare filters
  const filters = useMemo<EventFilters>(() => {
    const f: EventFilters = {};
    if (searchQuery.trim()) f.keyword = searchQuery.trim();
    if (selectedVenueId !== "all") f.venueId = selectedVenueId;
    if (selectedCategory !== "all") f.category = selectedCategory;
    if (fromDate) f.fromDate = fromDate;
    if (toDate) f.toDate = toDate;
    return f;
  }, [searchQuery, selectedVenueId, selectedCategory, fromDate, toDate]);

  // Fetch events with filters
  const { data: events = [], isLoading: eventsLoading } =
    useAdminEvents(filters);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute requiredRole={["Admin"]}>
      <div className="min-h-screen bg-gray-900">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-gray-400">
              Manage all events and view system-wide statistics
            </p>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Manage different aspects of the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/events">
                  <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-6 w-6 text-blue-400" />
                        <div>
                          <p className="font-medium text-white">Events</p>
                          <p className="text-sm text-gray-400">
                            Manage all events
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/organizers">
                  <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Users className="h-6 w-6 text-green-400" />
                        <div>
                          <p className="font-medium text-white">Organizers</p>
                          <p className="text-sm text-gray-400">
                            Manage organizers
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/venues">
                  <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-6 w-6 text-purple-400" />
                        <div>
                          <p className="font-medium text-white">Venues</p>
                          <p className="text-sm text-gray-400">Manage venues</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/reports">
                  <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-6 w-6 text-orange-400" />
                        <div>
                          <p className="font-medium text-white">Reports</p>
                          <p className="text-sm text-gray-400">
                            Analytics & reports
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">
                      Total Events
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {statsLoading ? "..." : statistics?.totalEvents || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">
                      Published
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {statsLoading ? "..." : statistics?.publishedEvents || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">
                      Upcoming
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {statsLoading ? "..." : statistics?.upcomingEvents || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">
                      Unpublished
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {statsLoading
                        ? "..."
                        : statistics?.unpublishedEvents || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                {/* Venue Filter */}
                <Select
                  value={selectedVenueId}
                  onValueChange={setSelectedVenueId}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select Venue" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Venues</SelectItem>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date From */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="From Date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {/* Date To */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="To Date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Active Filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-600/20 text-purple-300"
                  >
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {selectedVenueId !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-300"
                  >
                    Venue: {venues.find((v) => v.id === selectedVenueId)?.name}
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-green-600/20 text-green-300"
                  >
                    Category: {selectedCategory}
                  </Badge>
                )}
                {fromDate && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-600/20 text-orange-300"
                  >
                    From: {formatDate(fromDate)}
                  </Badge>
                )}
                {toDate && (
                  <Badge
                    variant="secondary"
                    className="bg-red-600/20 text-red-300"
                  >
                    To: {formatDate(toDate)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>All Events</span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-600/20 text-purple-300"
                >
                  {eventsLoading ? "Loading..." : `${events.length} events`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    No events found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters to see more events.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Link key={event.id} href={`/admin/events/${event.id}`}>
                      <Card className="bg-gray-700 border-gray-600 hover:border-purple-500 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          {/* Event Image */}
                          {event.imageUrl && (
                            <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                              <img
                                src={getImageUrl(event.imageUrl)}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder.jpg";
                                }}
                              />
                              <div className="absolute top-2 right-2">
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
                                  {event.isPublished ? (
                                    <Eye className="h-3 w-3 mr-1" />
                                  ) : (
                                    <EyeOff className="h-3 w-3 mr-1" />
                                  )}
                                  {event.isPublished ? "Published" : "Draft"}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Event Details */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-white text-lg mb-1">
                                {event.title}
                              </h3>
                              {event.category && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-purple-500 text-purple-300"
                                >
                                  {event.category}
                                </Badge>
                              )}
                            </div>

                            {event.description && (
                              <p className="text-gray-300 text-sm line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            {/* Event Date & Time */}
                            <div className="flex items-center text-sm text-gray-400">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(event.eventDate)}</span>
                              <Clock className="h-4 w-4 ml-4 mr-2" />
                              <span>{formatTime(event.eventTime)}</span>
                            </div>

                            {/* Venue */}
                            <div className="flex items-center text-sm text-gray-400">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{event.venueName}</span>
                            </div>

                            {/* Organizer Information */}
                            <div className="bg-gray-600 rounded-lg p-3 space-y-2">
                              <h4 className="text-sm font-medium text-white mb-2">
                                Organizer
                              </h4>

                              <div className="flex items-center text-sm text-gray-300">
                                <User className="h-4 w-4 mr-2 text-blue-400" />
                                <span>{event.organizerName}</span>
                              </div>

                              <div className="flex items-center text-sm text-gray-300">
                                <Mail className="h-4 w-4 mr-2 text-green-400" />
                                <span>{event.organizerEmail}</span>
                              </div>

                              {event.organizationName && (
                                <div className="flex items-center text-sm text-gray-300">
                                  <Building className="h-4 w-4 mr-2 text-purple-400" />
                                  <span>{event.organizationName}</span>
                                </div>
                              )}
                            </div>

                            {/* Timestamps */}
                            <div className="text-xs text-gray-500 pt-2 border-t border-gray-600">
                              <div>Created: {formatDate(event.createdAt)}</div>
                              {event.modifiedAt && (
                                <div>
                                  Modified: {formatDate(event.modifiedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Summary */}
          {statistics && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Events by Category */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Events by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.eventsByCategory.map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-300">{item.category}</span>
                        <Badge
                          variant="outline"
                          className="text-purple-300 border-purple-500"
                        >
                          {item.count} events
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Organizers */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Organizers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.topOrganizers.map((organizer) => (
                      <div
                        key={organizer.organizerId}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-300">
                          {organizer.organizerName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-blue-300 border-blue-500"
                        >
                          {organizer.eventCount} events
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
