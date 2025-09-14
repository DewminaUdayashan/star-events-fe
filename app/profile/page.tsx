"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Star,
  ArrowLeft,
  Edit,
  Shield,
  Calendar,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, type ApiResponse } from "@/lib/api-client";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  memberSince: string;
  address: string;
  dateOfBirth: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountStatus: string;
}

interface ChangeUsernameRequest {
  newUsername: string;
}

interface ChangeEmailRequest {
  newEmail: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] =
    useState<"profile" | "password" | "privacy">("profile");

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initialize profile state with default values
  const [profile, setProfile] = useState<UserProfile>({
    name: "Not provided",
    email: "Not provided",
    role: "User",
    memberSince: "Not available",
    address: "Not provided",
    dateOfBirth: "Not provided",
    emailVerified: false,
    phoneVerified: false,
    accountStatus: "Inactive"
  });

  // Load user data from auth context when component mounts or user changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.fullName || user.userName || "Not provided",
        email: user.email || "Not provided",
        role: "User", // ApplicationUser doesn't have role property, use default
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available",
        address: user.address || "Not provided",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided",
        emailVerified: user.emailConfirmed || false,
        phoneVerified: user.phoneNumberConfirmed || false,
        accountStatus: user.isActive ? "Active" : "Inactive"
      });
      
      // Set form initial values
      setNewUsername(user.fullName || user.userName || "");
      setNewEmail(user.email || "");
    }
  }, [user]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const response = await apiClient.post<ApiResponse>(
        "/api/User/change-username",
        {
          newUsername,
        } as ChangeUsernameRequest
      );

      if (response.success !== false) {
        setSuccess("Username updated successfully");
        setProfile((prev) => ({ ...prev, name: newUsername }));
        
        // Update user in context and localStorage
        if (user) {
          const updatedUser = {
            ...user,
            fullName: newUsername,
            userName: newUsername
          };
          updateUser(updatedUser);
          console.log("Username updated in localStorage and context:", newUsername);
        }
      } else {
        throw new Error(response.message || "Failed to update username");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        "Failed to update username";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const response = await apiClient.post<ApiResponse>(
        "/api/User/change-email",
        {
          newEmail,
        } as ChangeEmailRequest
      );

      if (response.success !== false) {
        setSuccess("Email updated successfully");
        setProfile((prev) => ({ ...prev, email: newEmail }));
        
        // Update user in context and localStorage
        if (user) {
          const updatedUser = {
            ...user,
            email: newEmail,
            normalizedEmail: newEmail.toUpperCase()
          };
          updateUser(updatedUser);
          console.log("Email updated in localStorage and context:", newEmail);
        }
      } else {
        throw new Error(response.message || "Failed to update email");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        "Failed to update email";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post<ApiResponse>(
        "/api/User/change-password",
        {
          oldPassword,
          newPassword,
        } as ChangePasswordRequest
      );

      if (response.success !== false) {
        setSuccess("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        "Failed to change password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear messages when switching sections
  useEffect(() => {
    clearMessages();
  }, [activeSection]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <p className="text-white mb-4">Please log in to view your profile</p>
            <Link href="/login">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <p className="text-gray-400">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setActiveSection("profile")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeSection === "profile"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Edit className="h-4 w-4 mr-2 inline" />
            Edit Profile
          </button>
          <button
            onClick={() => setActiveSection("password")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeSection === "password"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Lock className="h-4 w-4 mr-2 inline" />
            Change Password
          </button>
          <button
            onClick={() => setActiveSection("privacy")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeSection === "privacy"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4 mr-2 inline" />
            Privacy Settings
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-500 bg-red-500/10 rounded-2xl mb-6">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-500/10 rounded-2xl mb-6">
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white font-medium">{profile.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Role</p>
                    <p className="text-white font-medium">{profile.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Member since</p>
                    <p className="text-white font-medium">
                      {profile.memberSince}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-white font-medium">{profile.address}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Account Status
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Email Verified</span>
                      {profile.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Phone Verified</span>
                      {profile.phoneVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Account Status</span>
                      <span
                        className={`text-sm font-medium ${
                          profile.accountStatus === "Active"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {profile.accountStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeSection === "profile" && (
              <div className="space-y-6">
                {/* Change Username */}
                <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-white">Change Username</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your display name
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangeUsername} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          New Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                            className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                            required
                            minLength={3}
                            maxLength={50}
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 rounded-2xl"
                        disabled={loading || !newUsername.trim() || newUsername === profile.name}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Username"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Change Email */}
                <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-white">Change Email</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your email address
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangeEmail} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          New Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email"
                            className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 rounded-2xl"
                        disabled={loading || !newEmail.trim() || newEmail === profile.email}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Email"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "password" && (
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white">Change Password</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-sm text-red-400">Passwords don't match</p>
                    )}

                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 rounded-2xl"
                      disabled={loading || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeSection === "privacy" && (
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white">Privacy Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your privacy preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-400">
                      Privacy settings will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
