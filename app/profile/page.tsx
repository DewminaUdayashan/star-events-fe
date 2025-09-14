"use client";

import { Navigation } from "@/components/layout/Navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, MapPin, Building, Phone } from "lucide-react";

export default function ProfilePage() {
  const { user, roles } = useAuth();

  if (!user) return null;

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "organizer":
        return "Event Organizer";
      case "customer":
        return "Customer";
      default:
        return "User";
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-600";
      case "organizer":
        return "bg-blue-600";
      case "customer":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">
                    {user.fullName || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">
                    {user.email || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Role:</span>
                  <Badge className={`${getRoleColor(roles[0])} text-white`}>
                    {getRoleDisplayName(roles[0])}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last login:</span>
                    <span className="text-white">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your contact details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <span className="text-gray-400 block">Address:</span>
                      <span className="text-white">{user.address}</span>
                    </div>
                  </div>
                )}
                {user.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block">Phone:</span>
                      <span className="text-white">{user.phoneNumber}</span>
                    </div>
                  </div>
                )}
                {user.dateOfBirth && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block">
                        Date of Birth:
                      </span>
                      <span className="text-white">
                        {new Date(user.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {user.organizationName && (
                  <div className="flex items-start space-x-2">
                    <Building className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <span className="text-gray-400 block">Organization:</span>
                      <span className="text-white">
                        {user.organizationName}
                      </span>
                      {user.organizationContact && (
                        <span className="text-gray-400 block text-sm">
                          Contact: {user.organizationContact}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Status */}
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Account Status</CardTitle>
              <CardDescription className="text-gray-400">
                Your account status and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email Verified:</span>
                  <Badge
                    variant={user.emailConfirmed ? "default" : "destructive"}
                  >
                    {user.emailConfirmed ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phone Verified:</span>
                  <Badge
                    variant={
                      user.phoneNumberConfirmed ? "default" : "destructive"
                    }
                  >
                    {user.phoneNumberConfirmed ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Status:</span>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Edit Profile
            </Button>
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Privacy Settings</Button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
