"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Ticket,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizerEvents } from "@/lib/services";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OrganizerDashboard() {
  const { user, roles } = useAuth();
  const { data: organizerEvents, isLoading, error } = useOrganizerEvents();
  
  console.log("OrganizerDashboard - User:", user);
  console.log("OrganizerDashboard - Roles:", roles);

  if (!user || !roles.includes("Organizer")) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Please log in as an organizer to access this dashboard.
          </p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const recentEvents = organizerEvents?.slice(0, 3) || [];
  const totalRevenue = 125000; // This should come from dashboard API
  const totalTicketsSold = 450; // This should come from dashboard API
  const activeEvents = organizerEvents?.filter(
    (event) => {
      const eventDate = new Date(event.eventDate);
      const now = new Date();
      return eventDate > now && event.isPublished;
    }
  ).length || 0;

  // Helper function to get event status
  const getEventStatus = (event: any) => {
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    
    if (eventDate < now) return "completed";
    if (eventDate.toDateString() === now.toDateString()) return "ongoing";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Organizer Dashboard
              </h1>
              <p className="text-gray-400">
                Welcome back, {user.fullName}! Here's your event overview.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      Rs. {totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">
                    +12% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tickets Sold</p>
                    <p className="text-2xl font-bold text-white">
                      {totalTicketsSold}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-sm">
                    +8% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Events</p>
                    <p className="text-2xl font-bold text-white">
                      {activeEvents}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-purple-400 mr-1" />
                  <span className="text-purple-400 text-sm">
                    2 upcoming this week
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Events</p>
                    <p className="text-2xl font-bold text-white">
                      {organizerEvents?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-orange-400 mr-1" />
                  <span className="text-orange-400 text-sm">
                    Avg 150 attendees
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Section */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/organizer/reports/sales">
                  <Card className="bg-gray-900 border-gray-600 hover:border-purple-500 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">
                            Sales Report
                          </h4>
                          <p className="text-gray-400 text-xs">
                            Track revenue & bookings
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/organizer/reports/events">
                  <Card className="bg-gray-900 border-gray-600 hover:border-purple-500 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">
                            Events Performance
                          </h4>
                          <p className="text-gray-400 text-xs">
                            Analyze event metrics
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/organizer/reports/revenue">
                  <Card className="bg-gray-900 border-gray-600 hover:border-purple-500 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">
                            Revenue Analysis
                          </h4>
                          <p className="text-gray-400 text-xs">
                            Monthly trends
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/organizer/reports">
                  <Card className="bg-gray-900 border-gray-600 hover:border-purple-500 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">
                            All Reports
                          </h4>
                          <p className="text-gray-400 text-xs">
                            View all analytics
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recent Events</CardTitle>
                <Link href="/organizer/events">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 bg-transparent"
                  >
                    View All Events
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  <span className="ml-2 text-gray-400">Loading events...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <span className="ml-2 text-gray-400">Failed to load events</span>
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No events found</p>
                  <Link href="/organizer/events/create">
                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event) => {
                    const eventStatus = getEventStatus(event);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">
                              {event.title}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {new Date(event.eventDate).toLocaleDateString()} •{" "}
                              {event.venueName}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-400">
                                {event.isPublished ? "Published" : "Draft"}
                              </span>
                              <Badge
                                className={
                                  eventStatus === "upcoming"
                                    ? "bg-green-600"
                                    : eventStatus === "ongoing"
                                    ? "bg-blue-600"
                                    : "bg-gray-600"
                                }
                              >
                                {eventStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/events/${event.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/organizer/events/${event.id}/edit`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 bg-transparent"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/organizer/analytics/${event.id}`}>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Analytics
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
