"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  ArrowLeft,
  Loader2,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  organizerReportsService,
  type OrganizerReportFilters,
} from "@/lib/services/organizer-reports.service";
import { ExportModal } from "@/components/organizer/ExportModal";

export default function OrganizerEventsReportPage() {
  const { user, roles } = useAuth();
  const [filters, setFilters] = useState<OrganizerReportFilters>({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const {
    data: eventsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizer-events-report", filters],
    queryFn: () => organizerReportsService.getEventPerformance(filters),
    enabled: !!user && roles.includes("Organizer"),
  });

  if (!user || !roles.includes("Organizer")) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Please log in as an organizer to access events reports.
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

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "last-30-days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "last-90-days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "last-6-months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "this-year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(now.getDate() - 90);
    }

    setFilters({
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    });
  };

  const report = eventsData?.data;

  const getStatusColor = (eventDate: string) => {
    const date = new Date(eventDate);
    const now = new Date();

    if (date > now) return "bg-blue-600";
    if (date.toDateString() === now.toDateString()) return "bg-green-600";
    return "bg-gray-600";
  };

  const getStatusText = (eventDate: string) => {
    const date = new Date(eventDate);
    const now = new Date();

    if (date > now) return "Upcoming";
    if (date.toDateString() === now.toDateString()) return "Today";
    return "Past";
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/organizer/reports">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Events Performance
                </h1>
                <p className="text-gray-400">
                  Analyze event performance and attendance metrics
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Select
                defaultValue="last-90-days"
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                  <SelectItem value="last-6-months">Last 6 months</SelectItem>
                  <SelectItem value="this-year">This year</SelectItem>
                </SelectContent>
              </Select>
              <ExportModal
                reportType="events"
                trigger={
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                }
              />
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-2 text-white">Loading events report...</span>
            </div>
          )}

          {error && (
            <Card className="bg-red-500/10 border-red-500/20 mb-8">
              <CardContent className="p-6">
                <p className="text-red-400">
                  Failed to load events report. Please try again.
                </p>
              </CardContent>
            </Card>
          )}

          {report && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Events</p>
                        <p className="text-2xl font-bold text-white">
                          {report.totalEvents}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">
                          LKR {report.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Tickets Sold</p>
                        <p className="text-2xl font-bold text-white">
                          {report.totalTicketsSold.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">
                          Avg. Revenue/Event
                        </p>
                        <p className="text-2xl font-bold text-white">
                          LKR{" "}
                          {report.totalEvents > 0
                            ? (
                                report.totalRevenue / report.totalEvents
                              ).toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })
                            : 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Events Performance Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Event Performance Details
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Detailed performance metrics for all events in the selected
                    period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Event
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Category
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Revenue
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Tickets
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Transactions
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.events.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center">
                              <div className="text-gray-400">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg mb-2">No events found</p>
                                <p className="text-sm">
                                  Try adjusting your date range or create your
                                  first event.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          report.events.map((event) => (
                            <tr
                              key={event.eventId}
                              className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div>
                                  <p className="text-white font-medium">
                                    {event.eventTitle}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    ID: {event.eventId}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-600/20 text-purple-400"
                                >
                                  {event.eventCategory}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 text-gray-300">
                                <div>
                                  <p>
                                    {new Date(
                                      event.eventDate
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      event.eventDate
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${getStatusColor(
                                      event.eventDate
                                    )}`}
                                  ></div>
                                  <span className="text-gray-300 text-sm">
                                    {getStatusText(event.eventDate)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right text-white font-medium">
                                LKR {event.revenue.toLocaleString()}
                              </td>
                              <td className="py-4 px-4 text-right text-gray-300">
                                {event.ticketsSold}
                              </td>
                              <td className="py-4 px-4 text-right text-gray-300">
                                {event.transactions}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:text-white"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Event Categories Breakdown */}
              {report.events.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Events by Category
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Distribution of events across categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const categoryStats = report.events.reduce(
                            (
                              acc: Record<
                                string,
                                {
                                  count: number;
                                  revenue: number;
                                  tickets: number;
                                }
                              >,
                              event
                            ) => {
                              if (!acc[event.eventCategory]) {
                                acc[event.eventCategory] = {
                                  count: 0,
                                  revenue: 0,
                                  tickets: 0,
                                };
                              }
                              acc[event.eventCategory].count++;
                              acc[event.eventCategory].revenue += event.revenue;
                              acc[event.eventCategory].tickets +=
                                event.ticketsSold;
                              return acc;
                            },
                            {}
                          );

                          return Object.entries(categoryStats).map(
                            ([category, stats]) => {
                              const maxCount = Math.max(
                                ...Object.values(categoryStats).map(
                                  (s) => s.count
                                )
                              );
                              const percentage = (stats.count / maxCount) * 100;

                              return (
                                <div
                                  key={category}
                                  className="flex items-center space-x-4"
                                >
                                  <div className="w-20 text-right">
                                    <span className="text-white font-medium text-sm">
                                      {category}
                                    </span>
                                  </div>
                                  <div className="flex-1 relative">
                                    <div className="w-full bg-gray-700 rounded-full h-6">
                                      <div
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                                        style={{ width: `${percentage}%` }}
                                      >
                                        <span className="text-white text-xs font-medium">
                                          {stats.count} events
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-32 text-right">
                                    <p className="text-white text-sm font-medium">
                                      LKR {stats.revenue.toLocaleString()}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      {stats.tickets} tickets
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Performance Insights
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Key performance indicators for your events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="text-center p-4 bg-gray-900 rounded-lg">
                          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-white font-medium mb-1">
                            Best Performer
                          </h3>
                          <p className="text-green-400 font-bold">
                            {report.events.length > 0
                              ? report.events.reduce((best, event) =>
                                  event.revenue > best.revenue ? event : best
                                ).eventTitle
                              : "No events"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {report.events.length > 0
                              ? `LKR ${report.events
                                  .reduce((best, event) =>
                                    event.revenue > best.revenue ? event : best
                                  )
                                  .revenue.toLocaleString()}`
                              : ""}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-900 rounded-lg">
                            <p className="text-gray-400 text-sm">
                              Avg Tickets/Event
                            </p>
                            <p className="text-white font-bold text-lg">
                              {report.totalEvents > 0
                                ? Math.round(
                                    report.totalTicketsSold / report.totalEvents
                                  )
                                : 0}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-900 rounded-lg">
                            <p className="text-gray-400 text-sm">Categories</p>
                            <p className="text-white font-bold text-lg">
                              {
                                new Set(
                                  report.events.map((e) => e.eventCategory)
                                ).size
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
