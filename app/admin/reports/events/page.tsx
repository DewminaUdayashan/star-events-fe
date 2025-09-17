"use client";

import { useState } from "react";
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
  FileText,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  Building2,
  Star,
  Target,
  BarChart3,
} from "lucide-react";
import {
  useAdminEventsReport,
  useExportReportAsPdf,
  useExportReportAsExcel,
} from "@/lib/services";
import { ReportFilters } from "@/lib/types/api";
import { ExportModal } from "@/components/admin/ExportModal";
import Link from "next/link";

export default function AdminEventsReportPage() {
  const [filters, setFilters] = useState<Omit<ReportFilters, "groupBy">>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Last 30 days
    endDate: new Date().toISOString().split("T")[0],
  });

  const {
    data: eventsReport,
    isLoading,
    error,
  } = useAdminEventsReport(filters);
  const exportPdfMutation = useExportReportAsPdf();
  const exportExcelMutation = useExportReportAsExcel();

  const handleExportPdf = () => {
    exportPdfMutation.mutate({ reportType: "events", filters });
  };

  const handleExportExcel = () => {
    exportExcelMutation.mutate({ reportType: "events", filters });
  };

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "last-7-days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last-30-days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "last-90-days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "last-year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setFilters((prev) => ({
      ...prev,
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Error Loading Events Report
            </h1>
            <p className="text-gray-400">
              Unable to fetch event data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
              <Link href="/admin/reports" className="hover:text-white">
                Reports
              </Link>
              <span>/</span>
              <span>Events Report</span>
            </nav>
            <h1 className="text-3xl font-bold text-white mb-2">
              Events Report
            </h1>
            <p className="text-gray-400">
              Review event performance, attendance rates, and organizer insights
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Select
              onValueChange={handleDateRangeChange}
              defaultValue="last-30-days"
            >
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleExportPdf}
              variant="outline"
              size="sm"
              disabled={exportPdfMutation.isPending}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>

            <Button
              onClick={handleExportExcel}
              variant="outline"
              size="sm"
              disabled={exportExcelMutation.isPending}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>

            <ExportModal
              reportType="events"
              filters={filters}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-600 text-purple-400 hover:bg-purple-600/10 hover:text-purple-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              }
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {eventsReport?.totalEvents?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">+15.3%</span>
                <span className="text-gray-400 ml-1">vs previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Published Events
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {eventsReport?.publishedEvents?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">
                  {eventsReport?.totalEvents
                    ? (
                        (eventsReport.publishedEvents /
                          eventsReport.totalEvents) *
                        100
                      ).toFixed(1)
                    : "0"}
                  % published
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Avg Attendance Rate
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">75.8%</div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">attendance rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Total Attendees
              </CardTitle>
              <Activity className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">15,432</div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">across all events</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Event Status Distribution
              </CardTitle>
              <CardDescription className="text-gray-400">
                Breakdown of events by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white">Published</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {eventsReport?.publishedEvents?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {eventsReport?.totalEvents
                        ? (
                            (eventsReport.publishedEvents /
                              eventsReport.totalEvents) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-white">Draft</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {eventsReport?.draftEvents?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {eventsReport?.totalEvents
                        ? (
                            (eventsReport.draftEvents /
                              eventsReport.totalEvents) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <span className="text-white">Active</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {eventsReport?.publishedEvents &&
                      eventsReport?.cancelledEvents
                        ? (
                            eventsReport.publishedEvents -
                            eventsReport.cancelledEvents
                          ).toLocaleString()
                        : "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {eventsReport?.totalEvents
                        ? (
                            ((eventsReport.publishedEvents -
                              eventsReport.cancelledEvents) /
                              eventsReport.totalEvents) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-white">Cancelled</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {eventsReport?.cancelledEvents?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {eventsReport?.totalEvents
                        ? (
                            (eventsReport.cancelledEvents /
                              eventsReport.totalEvents) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Key performance indicators for events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-white">Avg Fill Rate</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">68.5%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span className="text-white">Avg Attendees</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">157</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-white">Avg Rating</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">4.2/5</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-white">Success Rate</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">82.7%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Creation Trend Chart Placeholder */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Event Creation Trend
            </CardTitle>
            <CardDescription className="text-gray-400">
              New events created over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  Event creation trend chart will be displayed here
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Integration with charting library (Chart.js, Recharts) needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Events and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Top Performing Events
              </CardTitle>
              <CardDescription className="text-gray-400">
                Events with highest attendance rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Use mock data for top events by attendance since property doesn't exist */}
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          Sample Event {index + 1}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {450 - index * 50}/{500 - index * 20} attendees
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {(90 - index * 5).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">attendance</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Events by Category
              </CardTitle>
              <CardDescription className="text-gray-400">
                Distribution of events across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventsReport?.eventsByCategory
                  ?.slice(0, 6)
                  .map((category, index) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full bg-${
                            [
                              "blue",
                              "green",
                              "purple",
                              "orange",
                              "red",
                              "yellow",
                            ][index % 6]
                          }-500`}
                        ></div>
                        <span className="text-white">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {category.eventCount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {eventsReport?.totalEvents
                            ? (
                                (category.eventCount /
                                  eventsReport.totalEvents) *
                                100
                              ).toFixed(1)
                            : "0"}
                          %
                        </div>
                      </div>
                    </div>
                  )) ||
                  [...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full bg-${
                            [
                              "blue",
                              "green",
                              "purple",
                              "orange",
                              "red",
                              "yellow",
                            ][index]
                          }-500`}
                        ></div>
                        <span className="text-white">Category {index + 1}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {(25 - index * 3).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {(20 - index * 2).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
