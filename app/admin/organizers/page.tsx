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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Filter,
  Eye,
  Mail,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  UserPlus,
} from "lucide-react";
import {
  useAdminOrganizers,
  useAdminOrganizerStatistics,
} from "@/lib/services";
import type { AdminOrganizer, OrganizerFilters } from "@/lib/types/api";

export default function AdminOrganizersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [hasEventsFilter, setHasEventsFilter] = useState<string>("all");

  // Build filters object
  const filters: OrganizerFilters = useMemo(() => {
    const filterObj: OrganizerFilters = {};
    if (searchTerm.trim()) filterObj.search = searchTerm.trim();
    if (organizationFilter.trim())
      filterObj.organizationName = organizationFilter.trim();
    if (hasEventsFilter !== "all")
      filterObj.hasEvents = hasEventsFilter === "true";
    return filterObj;
  }, [searchTerm, organizationFilter, hasEventsFilter]);

  const {
    data: organizers = [],
    isLoading,
    error,
  } = useAdminOrganizers(filters);
  const { data: statistics } = useAdminOrganizerStatistics();

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

  const clearFilters = () => {
    setSearchTerm("");
    setOrganizationFilter("");
    setHasEventsFilter("all");
  };

  return (
    <ProtectedRoute requiredRole="Admin">
      <div className="min-h-screen bg-gray-900">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-8 w-8 text-green-500" />
              <h1 className="text-3xl font-bold text-white">
                Organizer Management
              </h1>
            </div>
            <p className="text-gray-400">Manage and monitor event organizers</p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total Organizers
                  </CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {statistics.totalOrganizers}
                  </div>
                  <p className="text-xs text-gray-500">
                    {statistics.activeOrganizers} active,{" "}
                    {statistics.inactiveOrganizers} inactive
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Verified Organizers
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {statistics.verifiedOrganizers}
                  </div>
                  <p className="text-xs text-gray-500">
                    {statistics.unverifiedOrganizers} unverified
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    With Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {statistics.organizersWithEvents}
                  </div>
                  <p className="text-xs text-gray-500">
                    {statistics.organizersWithoutEvents} without events
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Recent Registrations
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {statistics.recentRegistrations.length}
                  </div>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search organizers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                <Input
                  placeholder="Organization name..."
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />

                <Select
                  value={hasEventsFilter}
                  onValueChange={setHasEventsFilter}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Events status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Organizers</SelectItem>
                    <SelectItem value="true">With Events</SelectItem>
                    <SelectItem value="false">Without Events</SelectItem>
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

          {/* Organizers Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Organizers ({organizers.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage event organizers and their profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-300">
                    Loading organizers...
                  </span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">
                  Failed to load organizers. Please try again.
                </div>
              ) : organizers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No organizers found matching your criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">
                          Organizer
                        </TableHead>
                        <TableHead className="text-gray-300">
                          Organization
                        </TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Events</TableHead>
                        <TableHead className="text-gray-300">
                          Last Login
                        </TableHead>
                        <TableHead className="text-gray-300">Created</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizers.map((organizer) => (
                        <TableRow
                          key={organizer.id}
                          className="border-gray-700"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-white">
                                {organizer.fullName}
                              </div>
                              <div className="text-sm text-gray-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {organizer.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {organizer.organizationName ? (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-white">
                                  {organizer.organizationName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Individual
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={
                                  organizer.isActive ? "default" : "secondary"
                                }
                                className={
                                  organizer.isActive
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-600 text-gray-300"
                                }
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
                                  className="text-xs border-gray-600 text-gray-300"
                                >
                                  <CheckCircle className="h-2 w-2 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-white">
                                {organizer.totalEvents} total
                              </div>
                              <div className="text-xs text-gray-400">
                                {organizer.publishedEvents} published,{" "}
                                {organizer.upcomingEvents} upcoming
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm flex items-center gap-1 text-gray-300">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {formatDateTime(organizer.lastLogin)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-300">
                              {formatDate(organizer.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Link
                                  href={`/admin/organizers/${organizer.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
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
        </main>
      </div>
    </ProtectedRoute>
  );
}
