"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, TrendingUp, Plus, Eye, Edit, BarChart3, Ticket, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { mockEvents } from "@/data/mockEvents"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function OrganizerDashboard() {
  const { user } = useAuth()

  if (!user || user.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Please log in as an organizer to access this dashboard.</p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Mock organizer events (filter by organizerId in real app)
  const organizerEvents = mockEvents.slice(0, 3)
  const totalRevenue = 125000
  const totalTicketsSold = 450
  const activeEvents = organizerEvents.filter((event) => event.status === "upcoming").length

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Organizer Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.firstName}! Here's your event overview.</p>
            </div>
            <Link href="/organizer/events/create">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">Rs. {totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tickets Sold</p>
                    <p className="text-2xl font-bold text-white">{totalTicketsSold}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-sm">+8% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Events</p>
                    <p className="text-2xl font-bold text-white">{activeEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-purple-400 mr-1" />
                  <span className="text-purple-400 text-sm">2 upcoming this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Events</p>
                    <p className="text-2xl font-bold text-white">{organizerEvents.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-orange-400 mr-1" />
                  <span className="text-orange-400 text-sm">Avg 150 attendees</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recent Events</CardTitle>
                <Link href="/organizer/events">
                  <Button variant="outline" size="sm" className="border-gray-600 bg-transparent">
                    View All Events
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizerEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{event.title}</h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(event.date).toLocaleDateString()} • {event.venue}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-400">
                            {event.ticketsAvailable}/{event.totalTickets} tickets left
                          </span>
                          <Badge
                            className={
                              event.status === "upcoming"
                                ? "bg-green-600"
                                : event.status === "ongoing"
                                  ? "bg-blue-600"
                                  : "bg-gray-600"
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="border-gray-600 bg-transparent">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 bg-transparent">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
