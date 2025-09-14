"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Download,
  QrCode,
  Search,
  Ticket,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockEvents } from "@/data/mockEvents";
import type { Booking } from "@/types/event";

// Mock booking data
const mockBookings: Booking[] = [
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
];

export default function MyTicketsPage() {
  const { user, hasRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  if (!user || !hasRole("Customer")) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Please log in as a customer to view your tickets.
          </p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredBookings = mockBookings.filter(
    (booking) =>
      booking.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingBookings = filteredBookings.filter(
    (booking) => new Date(booking.event.date) > new Date()
  );

  const pastBookings = filteredBookings.filter(
    (booking) => new Date(booking.event.date) <= new Date()
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
              <p className="text-gray-400">
                Manage your event tickets and bookings
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-purple-500 text-purple-400"
            >
              {filteredBookings.length} ticket
              {filteredBookings.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-purple-600"
              >
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-purple-600"
              >
                Past Events ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="bg-gray-800 border-gray-700"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={booking.event.image || "/placeholder.svg"}
                              alt={booking.event.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-white truncate">
                                {booking.event.title}
                              </h3>
                              <Badge className="bg-green-600 ml-2">
                                {booking.status}
                              </Badge>
                            </div>

                            <div className="space-y-1 mb-4">
                              <div className="flex items-center text-gray-400 text-sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                  {new Date(
                                    booking.event.date
                                  ).toLocaleDateString()}{" "}
                                  at {booking.event.time}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-400 text-sm">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>
                                  {booking.event.venue},{" "}
                                  {booking.event.location}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-400 text-sm">
                                <Ticket className="h-4 w-4 mr-2" />
                                <span>
                                  {booking.ticketType.name} × {booking.quantity}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <p className="text-gray-400">Total Paid</p>
                                <p className="text-white font-semibold">
                                  Rs. {booking.totalAmount.toLocaleString()}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 bg-transparent"
                                >
                                  <QrCode className="h-4 w-4 mr-1" />
                                  QR Code
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
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
                  <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No upcoming tickets
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You don't have any tickets for upcoming events.
                  </p>
                  <Link href="/events">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastBookings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pastBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="bg-gray-800 border-gray-700 opacity-75"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={booking.event.image || "/placeholder.svg"}
                              alt={booking.event.title}
                              fill
                              className="object-cover grayscale"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-white truncate">
                                {booking.event.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className="border-gray-600 text-gray-400 ml-2"
                              >
                                Completed
                              </Badge>
                            </div>

                            <div className="space-y-1 mb-4">
                              <div className="flex items-center text-gray-400 text-sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                  {new Date(
                                    booking.event.date
                                  ).toLocaleDateString()}{" "}
                                  at {booking.event.time}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-400 text-sm">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>
                                  {booking.event.venue},{" "}
                                  {booking.event.location}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-400 text-sm">
                                <Ticket className="h-4 w-4 mr-2" />
                                <span>
                                  {booking.ticketType.name} × {booking.quantity}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <p className="text-gray-400">Total Paid</p>
                                <p className="text-white font-semibold">
                                  Rs. {booking.totalAmount.toLocaleString()}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-600 bg-transparent"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Receipt
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No past events
                  </h3>
                  <p className="text-gray-400">
                    Your event history will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
