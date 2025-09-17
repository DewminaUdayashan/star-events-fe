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
  Users,
  CheckCircle,
  Calendar,
  UserPlus,
  TrendingUp,
  Activity,
  Building,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useAdminOrganizerStatistics } from "@/lib/services";

export function OrganizerStatistics() {
  const { data: statistics, isLoading, error } = useAdminOrganizerStatistics();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-600 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-600 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            Failed to load organizer statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organizer Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">
                  Total Organizers
                </p>
                <p className="text-lg font-bold text-white">
                  {statistics.totalOrganizers}
                </p>
                <p className="text-xs text-gray-500">
                  {statistics.activeOrganizers} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Verified</p>
                <p className="text-lg font-bold text-white">
                  {statistics.verifiedOrganizers}
                </p>
                <p className="text-xs text-gray-500">
                  {statistics.unverifiedOrganizers} unverified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-purple-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">With Events</p>
                <p className="text-lg font-bold text-white">
                  {statistics.organizersWithEvents}
                </p>
                <p className="text-xs text-gray-500">
                  {statistics.organizersWithoutEvents} without
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserPlus className="h-6 w-6 text-orange-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-400">Recent</p>
                <p className="text-lg font-bold text-white">
                  {statistics.recentRegistrations.length}
                </p>
                <p className="text-xs text-gray-500">new this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Organizers */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Organizers
              </CardTitle>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-400"
              >
                <Link href="/admin/organizers">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </Button>
            </div>
            <CardDescription className="text-gray-400">
              Organizers by event count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.topOrganizers.slice(0, 5).map((organizer, index) => (
                <div
                  key={organizer.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-gray-300 font-medium">
                        {organizer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {organizer.organizationName || "Individual"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className="text-blue-300 border-blue-500"
                    >
                      {organizer.eventCount} events
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {organizer.publishedEvents} published
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Recent Registrations
              </CardTitle>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-400"
              >
                <Link href="/admin/organizers">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </Button>
            </div>
            <CardDescription className="text-gray-400">
              Latest organizer registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.recentRegistrations.slice(0, 5).map((organizer) => (
                <div
                  key={organizer.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-300" />
                    </div>
                    <div>
                      <div className="text-gray-300 font-medium">
                        {organizer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {organizer.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {formatDate(organizer.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {organizer.isActive ? (
                        <Activity className="h-3 w-3 text-green-500" />
                      ) : (
                        <Activity className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {organizer.eventCount} events
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Organizer Management</CardTitle>
          <CardDescription className="text-gray-400">
            Quick access to organizer management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/admin/organizers">
                <Users className="h-4 w-4 mr-2" />
                View All Organizers
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              <Link href="/admin/organizers?hasEvents=false">
                <UserPlus className="h-4 w-4 mr-2" />
                Organizers Without Events
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              <Link href="/admin/organizers?hasEvents=true">
                <Calendar className="h-4 w-4 mr-2" />
                Active Organizers
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { User } from "lucide-react";
