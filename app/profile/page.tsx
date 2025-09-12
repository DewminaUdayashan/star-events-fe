"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Mail, Phone, Star, Shield, Calendar, Award } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await updateProfile(formData)
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
                Profile Information
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-purple-600">
                Account Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Personal Information</CardTitle>
                      <CardDescription className="text-gray-400">
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {success && (
                          <Alert className="border-green-500 bg-green-500/10">
                            <AlertDescription className="text-green-400">{success}</AlertDescription>
                          </Alert>
                        )}

                        {error && (
                          <Alert className="border-red-500 bg-red-500/10">
                            <AlertDescription className="text-red-400">{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium text-gray-300">
                              First Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                className="pl-10 bg-gray-900 border-gray-600 text-white focus:border-purple-500"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium text-gray-300">
                              Last Name
                            </label>
                            <Input
                              id="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className="bg-gray-900 border-gray-600 text-white focus:border-purple-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-gray-300">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className="pl-10 bg-gray-900 border-gray-600 text-white focus:border-purple-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium text-gray-300">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="pl-10 bg-gray-900 border-gray-600 text-white focus:border-purple-500"
                              placeholder="+94 77 123 4567"
                            />
                          </div>
                        </div>

                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Profile"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Summary */}
                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge
                          className={`mb-4 ${
                            user.role === "admin"
                              ? "bg-red-600"
                              : user.role === "organizer"
                                ? "bg-blue-600"
                                : "bg-green-600"
                          }`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {user.role === "customer" && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">Loyalty Points</h4>
                          <Award className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-yellow-400 mb-2">{user.loyaltyPoints}</div>
                          <p className="text-gray-400 text-sm">Points Available</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    View your account details and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Account Status</p>
                          <p className="text-green-400 text-sm">Active</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Member Since</p>
                          <p className="text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">Account Type</p>
                          <p className="text-gray-400 text-sm capitalize">{user.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:text-white bg-transparent"
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:text-white bg-transparent"
                      >
                        Download Data
                      </Button>
                      <Button variant="destructive" className="w-full">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
