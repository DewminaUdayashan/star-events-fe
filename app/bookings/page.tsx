"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Search, Filter, Receipt, Download, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { mockEvents } from "@/data/mockEvents"
import type { Booking } from "@/types/event"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

// Extended mock booking data with more history
const mockBookingHistory: Booking[] = [
  {
    id: "BK001",
    userId: "user1",
    eventId: "1",
    ticketTypeId: "t1",
    quantity: 2,
    totalAmount: 5000,
    status: "confirmed",
    qrCode: "QR123456789",
    bookingDate: "2024-12-01",
    event: mockEvents[0],
    ticketType: mockEvents[0].ticketTypes[0],
  },
  {
    id: "BK002",
    userId: "user1",
    eventId: "2",
    ticketTypeId: "t3",
    quantity: 1,
    totalAmount: 1500,
    status: "confirmed",
    qrCode: "QR987654321",
    bookingDate: "2024-11-28",
    event: mockEvents[1],
    ticketType: mockEvents[1].ticketTypes[0],
  },
  {
    id: "BK003",
    userId: "user1",
    eventId: "3",
    ticketTypeId: "t5",
    quantity: 3,
    totalAmount: 3600,
    status: "cancelled",
    qrCode: "QR456789123",
    bookingDate: "2024-11-15",
    event: mockEvents[2],
    ticketType: mockEvents[2].ticketTypes[0],
  },
]

export default function BookingHistoryPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  if (!user || user.role !== "customer") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Please log in as a customer to view your booking history.</p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Filter and sort bookings
  const filteredBookings = mockBookingHistory
    .filter((booking) => {
      const matchesSearch =
        booking.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        case "date-asc":
          return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
        case "amount-desc":
          return b.totalAmount - a.totalAmount
        case "amount-asc":
          return a.totalAmount - b.totalAmount
        default:
          return 0
      }
    })

  const totalSpent = mockBookingHistory
    .filter((booking) => booking.status === "confirmed")
    .reduce((sum, booking) => sum + booking.totalAmount, 0)

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Booking History</h1>
              <p className="text-gray-400">View and manage your past event bookings</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-white">Rs. {totalSpent.toLocaleString()}</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="amount-desc">Highest Amount</SelectItem>
                    <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="border-gray-600 bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400">
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>

          {/* Booking List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Event Image */}
                      <div className="relative w-full lg:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={booking.event.image || "/placeholder.svg"}
                          alt={booking.event.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">{booking.event.title}</h3>
                            <p className="text-purple-400 font-medium">{booking.ticketType.name}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                            <Badge
                              className={
                                booking.status === "confirmed"
                                  ? "bg-green-600"
                                  : booking.status === "pending"
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                              }
                            >
                              {booking.status}
                            </Badge>
                            <span className="text-gray-400 text-sm">#{booking.id}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-gray-400 text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            <div>
                              <p className="text-white">{new Date(booking.event.date).toLocaleDateString()}</p>
                              <p>{booking.event.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            <div>
                              <p className="text-white">{booking.event.venue}</p>
                              <p>{booking.event.location}</p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-400">Quantity</p>
                            <p className="text-white">
                              {booking.quantity} ticket{booking.quantity !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-400">Booking Date</p>
                            <p className="text-white">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-4 sm:mb-0">
                            <p className="text-gray-400 text-sm">Total Amount</p>
                            <p className="text-2xl font-bold text-white">Rs. {booking.totalAmount.toLocaleString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="border-gray-600 bg-transparent">
                              <Receipt className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                            <Button size="sm" variant="outline" className="border-gray-600 bg-transparent">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            {booking.status === "confirmed" && (
                              <Link href={`/events/${booking.eventId}`}>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                  View Event
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search criteria or browse events to make your first booking.
              </p>
              <Link href="/events">
                <Button className="bg-purple-600 hover:bg-purple-700">Browse Events</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
