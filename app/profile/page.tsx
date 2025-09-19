"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Shield, Calendar, Clock, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
    enabled: !!user,
  });

  if (!user) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">
              Error Loading Profile
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              Failed to load your profile information. Please try refreshing the
              page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileData = data?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic account details and information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="text-sm">
                {profileData?.fullName || "Not provided"}
              </p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <p className="text-sm">{profileData?.email}</p>
              <div className="flex gap-2">
                <Badge
                  variant={
                    profileData?.emailConfirmed ? "default" : "secondary"
                  }
                >
                  {profileData?.emailConfirmed ? "Confirmed" : "Unconfirmed"}
                </Badge>
                <Badge
                  variant={
                    profileData?.isEmailVerified ? "default" : "destructive"
                  }
                >
                  {profileData?.isEmailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
            <CardDescription>
              Your account security and role information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Account Status
              </label>
              <Badge
                variant={profileData?.isActive ? "default" : "destructive"}
              >
                {profileData?.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {profileData?.roles && profileData.roles.length > 0 ? (
                  profileData.roles.map((role: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No roles assigned
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Account ID
              </label>
              <p className="text-sm font-mono">{profileData?.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity Information
            </CardTitle>
            <CardDescription>
              Your account creation and last login details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Account Created
              </label>
              <p className="text-sm">
                {profileData?.createdAt
                  ? formatDate(profileData.createdAt)
                  : "Unknown"}
              </p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last Login
              </label>
              <p className="text-sm">
                {profileData?.lastLogin
                  ? formatDate(profileData.lastLogin)
                  : "No recent activity"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
        <Button variant="outline">Change Password</Button>
      </div>
    </div>
  );
}
