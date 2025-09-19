"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Star,
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Phone,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    dateOfBirth: "",
    isOrganizer: false,
    organizationName: undefined as string | undefined,
    organizationContact: undefined as string | undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrganizerChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isOrganizer: checked,
      // Reset organization fields when unchecking
      organizationName: checked ? prev.organizationName : undefined,
      organizationContact: checked ? prev.organizationContact : undefined,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!formData.address.trim()) {
      setError("Address is required");
      return false;
    }

    // Validate date of birth - should not be in the future
    const dobDate = new Date(formData.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dobDate >= today) {
      setError("Date of birth cannot be today or in the future");
      return false;
    }

    // Validate organizer fields if organizer is selected
    if (formData.isOrganizer) {
      if (!formData.organizationName?.trim()) {
        setError("Organization name is required for organizer accounts");
        return false;
      }
      if (!formData.organizationContact?.trim()) {
        setError("Organization contact is required for organizer accounts");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare the registration data
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        isOrganizer: formData.isOrganizer,
        ...(formData.isOrganizer && {
          organizationName: formData.organizationName,
          organizationContact: formData.organizationContact,
        }),
      };

      await register(registrationData);

      // Redirect to email verification page
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
      );
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600">
              <Star className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StarEvents</span>
          </Link>
        </div>

        <Card className="bg-gray-800 border-gray-700 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Join StarEvents and start booking amazing events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-500 bg-red-500/10 rounded-2xl">
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-300"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-300"
                >
                  Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, City, State"
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium text-gray-300"
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              {/* Organizer Checkbox */}
              <div className="flex items-center space-x-2 p-4 bg-gray-900 rounded-2xl border border-gray-700">
                <Checkbox
                  id="isOrganizer"
                  checked={formData.isOrganizer}
                  onCheckedChange={(checked) =>
                    handleOrganizerChange(checked === true)
                  }
                  className="border-gray-600"
                />
                <label htmlFor="isOrganizer" className="text-sm text-gray-300">
                  Register as an event organizer
                </label>
              </div>

              {/* Conditional Organization Fields */}
              {formData.isOrganizer && (
                <div className="space-y-4 p-4 bg-gray-900 rounded-2xl border border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-300">
                    Organization Details
                  </h4>

                  {/* Organization Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="organizationName"
                      className="text-sm font-medium text-gray-300"
                    >
                      Organization Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="organizationName"
                        name="organizationName"
                        type="text"
                        value={formData.organizationName || ""}
                        onChange={handleChange}
                        placeholder="Your organization name"
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                        required={formData.isOrganizer}
                      />
                    </div>
                  </div>

                  {/* Organization Contact */}
                  <div className="space-y-2">
                    <label
                      htmlFor="organizationContact"
                      className="text-sm font-medium text-gray-300"
                    >
                      Organization Contact{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="organizationContact"
                        name="organizationContact"
                        type="text"
                        value={formData.organizationContact || ""}
                        onChange={handleChange}
                        placeholder="Phone number or email"
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                        required={formData.isOrganizer}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
