"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  BarChart3,
  Settings,
  Eye,
  UserCheck,
  Ban,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { adminService } from "@/lib/services"
import type { Event, ApplicationUser } from "@/lib/types/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

interface AdminStats {
  totalUsers: number
  totalEvents: number
  totalTicketsSold: number
  totalRevenue: number
  activeEvents: number
  pendingEvents: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<ApplicationUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.id && user.id.includes("admin")) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch admin statistics
      const adminStats = await adminService.getAdminStats()
      setStats(adminStats)

      // Fetch recent events
      const allEvents = await adminService.getAllEvents()
      setEvents(allEvents.slice(0, 5)) // Show only recent 5 events

      // Fetch recent users
      const allUsers = await adminService.getAllUsers()
      setUsers(allUsers.slice(0, 5)) // Show only recent 5 users
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Failed to load dashboard data")

      // Set mock data as fallback
      setStats({
        totalUsers: 1250,
        totalEvents: 45,
        totalTicketsSold: 3420,
        totalRevenue: 450000,
        activeEvents: 12,
        pendingEvents: 3,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: "approve" | "suspend") => {
    try {
      if (action === "approve") {
        await adminService.updateUser(userId, { isActive: true })
      } else {
        await adminService.updateUser(userId, { isActive: false })
      }

      // Refresh user list
      fetchDashboardData()
    } catch (err) {
      console.error(`Failed to ${action} user:`, err)
      alert(`Failed to ${action} user. Please try again.`)
    }
  }

  if (!user || !user.id?.includes("admin")) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Please log in as an admin to access this dashboard.</p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-2xl">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">System overview and management controls</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-gray-600 bg-transparent rounded-2xl"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Link href="/admin/settings">
                <Button variant="outline" className="border-gray-600 bg-transparent rounded-2xl">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button className="bg-red-600 hover:bg-red-700 rounded-2xl">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500 bg-red-500/10 mb-6 rounded-2xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <span className="ml-2 text-gray-400">Loading dashboard data...</span>
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                    <span className="text-blue-400 text-sm">+15% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Events</p>
                      <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-purple-400 mr-1" />
                    <span className="text-purple-400 text-sm">{stats.activeEvents} active</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Platform Revenue</p>
                      <p className="text-2xl font-bold text-white">Rs. {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-green-400 text-sm">{stats.totalTicketsSold} tickets sold</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pending Approvals</p>
                      <p className="text-2xl font-bold text-white">{stats.pendingEvents}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-orange-400 text-sm">Requires attention</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700 rounded-2xl">
              <TabsTrigger value="users" className="data-[state=active]:bg-purple-600 rounded-xl">
                User Management
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 rounded-xl">
                Event Oversight
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-purple-600 rounded-xl">
                Reports & Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Recent Users</CardTitle>
                    <Link href="/admin/users">
                      <Button variant="outline" size="sm" className="border-gray-600 bg-transparent rounded-2xl">
                        View All Users
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 border border-gray-700 rounded-2xl"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-700 rounded-2xl flex items-center justify-center">
                              <Users className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{user.fullName || "Unknown User"}</h3>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className="bg-green-600 rounded-xl">Customer</Badge>
                                <Badge
                                  variant="outline"
                                  className={`rounded-xl ${
                                    user.isActive ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                                  }`}
                                >
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="border-gray-600 bg-transparent rounded-xl">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {!user.isActive && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 rounded-xl"
                                onClick={() => handleUserAction(user.id, "approve")}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent rounded-xl"
                              onClick={() => handleUserAction(user.id, "suspend")}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No users found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Recent Events</CardTitle>
                    <Link href="/admin/events">
                      <Button variant="outline" size="sm" className="border-gray-600 bg-transparent rounded-2xl">
                        View All Events
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 border border-gray-700 rounded-2xl"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-700 rounded-2xl flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{event.title}</h3>
                              <p className="text-gray-400 text-sm">
                                by {event.organizer?.fullName || "Unknown Organizer"}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-400">
                                  {new Date(event.eventDate).toLocaleDateString()}
                                </span>
                                <Badge className={`rounded-xl ${event.isPublished ? "bg-green-600" : "bg-orange-600"}`}>
                                  {event.isPublished ? "Published" : "Draft"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="border-gray-600 bg-transparent rounded-xl">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Analytics
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No events found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">This Month</span>
                        <span className="text-white font-semibold">
                          Rs. {stats ? (stats.totalRevenue * 0.3).toLocaleString() : "125,000"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Last Month</span>
                        <span className="text-white font-semibold">
                          Rs. {stats ? (stats.totalRevenue * 0.25).toLocaleString() : "98,000"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Growth Rate</span>
                        <span className="text-green-400 font-semibold">+27.5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-white">User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Users</span>
                        <span className="text-white font-semibold">
                          {stats ? (stats.totalUsers * 0.85).toFixed(0) : "1,180"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">New Signups</span>
                        <span className="text-white font-semibold">45</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Retention Rate</span>
                        <span className="text-green-400 font-semibold">94.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
