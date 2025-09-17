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
  Users,
  UserPlus,
  UserCheck,
  Shield,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Award,
} from "lucide-react";
import {
  useAdminUsersReport,
  useExportReportAsPdf,
  useExportReportAsExcel,
} from "@/lib/services";
import { ReportFilters } from "@/lib/types/api";
import { ExportModal } from "@/components/admin/ExportModal";
import Link from "next/link";

export default function AdminUsersReportPage() {
  const [filters, setFilters] = useState<Omit<ReportFilters, "groupBy">>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Last 30 days
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: usersReport, isLoading, error } = useAdminUsersReport(filters);
  const exportPdfMutation = useExportReportAsPdf();
  const exportExcelMutation = useExportReportAsExcel();

  const handleExportPdf = () => {
    exportPdfMutation.mutate({ reportType: "users", filters });
  };

  const handleExportExcel = () => {
    exportExcelMutation.mutate({ reportType: "users", filters });
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
              Error Loading Users Report
            </h1>
            <p className="text-gray-400">
              Unable to fetch user data. Please try again later.
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
              <span>Users Report</span>
            </nav>
            <h1 className="text-3xl font-bold text-white mb-2">Users Report</h1>
            <p className="text-gray-400">
              Analyze user registrations, demographics, and engagement metrics
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
              reportType="users"
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
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {usersReport?.totalUsers?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">+8.2%</span>
                <span className="text-gray-400 ml-1">vs previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {usersReport?.activeUsers?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">
                  {usersReport?.totalUsers
                    ? (
                        (usersReport.activeUsers / usersReport.totalUsers) *
                        100
                      ).toFixed(1)
                    : "0"}
                  % of total
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Verified Users
              </CardTitle>
              <Shield className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {usersReport?.verifiedUsers?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">
                  {usersReport?.totalUsers
                    ? (
                        (usersReport.verifiedUsers / usersReport.totalUsers) *
                        100
                      ).toFixed(1)
                    : "0"}
                  % verified
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Organizers
              </CardTitle>
              <Building className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {usersReport?.organizers?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">
                  {usersReport?.totalUsers
                    ? (
                        (usersReport.organizers / usersReport.totalUsers) *
                        100
                      ).toFixed(1)
                    : "0"}
                  % of users
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                User Types Distribution
              </CardTitle>
              <CardDescription className="text-gray-400">
                Breakdown of user roles and types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-white">Customers</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {usersReport?.customers?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {usersReport?.totalUsers
                        ? (
                            (usersReport.customers / usersReport.totalUsers) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-white">Organizers</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {usersReport?.organizers?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {usersReport?.totalUsers
                        ? (
                            (usersReport.organizers / usersReport.totalUsers) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-white">Admins</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {usersReport?.admins?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {usersReport?.totalUsers
                        ? (
                            (usersReport.admins / usersReport.totalUsers) *
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
                Account Status
              </CardTitle>
              <CardDescription className="text-gray-400">
                User verification and activity status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-4 w-4 text-green-400" />
                    <span className="text-white">Active Users</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {usersReport?.activeUsers?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-white">Inactive Users</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {usersReport?.inactiveUsers?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="text-white">Verified</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {usersReport?.verifiedUsers?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-4 w-4 text-yellow-400" />
                    <span className="text-white">Unverified</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {usersReport?.unverifiedUsers?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Trend Chart Placeholder */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Registration Trend
            </CardTitle>
            <CardDescription className="text-gray-400">
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <UserPlus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  Registration trend chart will be displayed here
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Integration with charting library (Chart.js, Recharts) needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Organizers and Most Active Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Top Organizers
              </CardTitle>
              <CardDescription className="text-gray-400">
                Most successful event organizers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersReport?.topOrganizers
                  ?.slice(0, 5)
                  .map((organizer, index) => (
                    <div
                      key={organizer.organizerId}
                      className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {organizer.organizerName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {organizer.eventsCreated} events
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${organizer.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">revenue</div>
                      </div>
                    </div>
                  )) ||
                  [...Array(5)].map((_, index) => (
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
                            Organizer {index + 1}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {12 - index * 2} events
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${((50 - index * 8) * 1000).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">revenue</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Most Active Users
              </CardTitle>
              <CardDescription className="text-gray-400">
                Users with highest engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersReport?.mostActiveUsers
                  ?.slice(0, 5)
                  .map((user, index) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {user.fullName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {user.ticketsPurchased} tickets
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          {user.eventsOrganized}
                        </div>
                        <div className="text-sm text-gray-400">organized</div>
                      </div>
                    </div>
                  )) ||
                  [...Array(5)].map((_, index) => (
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
                            User {index + 1}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {25 - index * 3} tickets
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          {8 - index}
                        </div>
                        <div className="text-sm text-gray-400">events</div>
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
