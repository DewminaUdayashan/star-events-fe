"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth.service";
import AdminCreateForm from "./AdminCreateForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Users,
  Mail,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminUserManagement = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    data: adminData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => authService.getAllAdminUsers(),
  });

  // Safely access the admin users array
  const adminUsers = useMemo(() => {
    if (!adminData?.adminUsers) return [];

    // Handle both direct array and nested $values structure
    if (Array.isArray(adminData.adminUsers)) {
      return adminData.adminUsers;
    }

    // Handle .NET API response structure with $values
    const adminUsersData = adminData.adminUsers as any;
    if (adminUsersData?.$values && Array.isArray(adminUsersData.$values)) {
      return adminUsersData.$values;
    }

    return [];
  }, [adminData]);

  const totalCount = adminData?.totalCount || 0;

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-gray-300">Loading admin users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-700">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-300">
          Failed to load admin users. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Admin User Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage administrator accounts and permissions
          </p>
        </div>
        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Admin User
          </Button>
        )}
      </div>

      {/* Stats Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
              <p className="text-gray-400">Total Admin Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <AdminCreateForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Admin Users List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Admin Users ({adminUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-4 text-lg text-gray-300">No admin users found</p>
              <p className="text-sm text-gray-400">
                Create your first admin user to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {adminUsers.map((admin: any, index: number) => {
                // Get initials for avatar
                const initials =
                  admin.fullName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() ||
                  admin.email?.[0]?.toUpperCase() ||
                  "A";

                return (
                  <div
                    key={admin.id || index}
                    className="p-4 border border-gray-600 rounded-lg bg-gray-700/50"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-white">
                            {admin.fullName || "Unknown User"}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-purple-600/20 text-purple-300"
                          >
                            Admin
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                          {admin.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{admin.email}</span>
                            </div>
                          )}

                          {admin.dateOfBirth && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>
                                {new Date(
                                  admin.dateOfBirth
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {admin.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{admin.address}</span>
                            </div>
                          )}
                        </div>

                        {admin.createdAt && (
                          <div className="mt-2 text-xs text-gray-400">
                            Created:{" "}
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
