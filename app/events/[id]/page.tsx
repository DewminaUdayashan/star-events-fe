"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Heart,
  TrendingUp,
  Tag,
  User,
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { useEvent, ticketsService } from "@/lib/services";
import { CartProvider } from "@/contexts/CartContext";
import { getImageUrl } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { EventPrice, BookTicketRequest } from "@/lib/types/api";
import { useCart } from '@/contexts/CartContext'


export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { addItem } = useCart();
  const { user } = useAuth();

  const { data: event, isLoading: loading, error } = useEvent(eventId);

  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const [isLiked, setIsLiked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            {error?.message || "The event you're looking for doesn't exist."}
          </p>
          <Link href="/events">
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
              Browse All Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const updateTicketQuantity = (priceId: string, change: number) => {
    const price = event.prices?.find((p) => p.id === priceId);
    if (!price) return;

    const currentQuantity = selectedTickets[priceId] || 0;
    const newQuantity = Math.max(
      0,
      Math.min(price.stock, currentQuantity + change)
    );

    setSelectedTickets((prev) => ({
      ...prev,
      [priceId]: newQuantity,
    }));
  };

  const getTotalAmount = () => {
    return Object.entries(selectedTickets).reduce(
      (total, [priceId, quantity]) => {
        const price = event.prices?.find((p) => p.id === priceId);
        return total + (price ? price.price * quantity : 0);
      },
      0
    );
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce(
      (total, quantity) => total + quantity,
      0
    );
  };

  const handleBookTickets = async () => {
    if (!user) {
      alert("Please login to book tickets");
      return;
    }

    if (getTotalTickets() === 0) {
      alert("Please select at least one ticket");
      return;
    }

    try {
      setBookingLoading(true);

      // Book each ticket type separately
      for (const [priceId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const bookingRequest: BookTicketRequest = {
            eventId: event.id,
            eventPriceId: priceId,
            quantity,
            useLoyaltyPoints: false,
          };

          await ticketsService.bookTicket(bookingRequest);
        }
      }

      // Reset selected tickets after successful booking
      setSelectedTickets({});
      alert("Tickets booked successfully!");
      window.location.href = `/events/${event.id}/booking`;
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book tickets. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/events">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white rounded-2xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <Image
          src={getImageUrl(event.imageUrl || event.image)}
          alt={event.title || "Event"}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  {event.isPublished && (
                    <Badge className="bg-green-600 hover:bg-green-700 flex items-center rounded-2xl">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Published
                    </Badge>
                  )}
                  {event.category && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 rounded-2xl">
                      {event.category}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {event.title}
                </h1>
                <p className="text-xl text-gray-200 max-w-2xl">
                  {event.description}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`border-gray-600 rounded-2xl ${
                    isLiked
                      ? "bg-red-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-600 text-gray-400 hover:text-white bg-transparent rounded-2xl"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Details */}
            <Card className="bg-gray-800 border-gray-700 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Date & Time</p>
                      <p className="text-white font-medium">
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-gray-400">
                        {new Date(event.eventTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Venue</p>
                      <p className="text-white font-medium">
                        {event.venue?.name}
                      </p>
                      <p className="text-gray-400">{event.venue?.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Capacity</p>
                      <p className="text-white font-medium">
                        {event.venue?.capacity} people
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Organizer</p>
                      <p className="text-white font-medium">
                        {event.organizer?.fullName || "Event Organizer"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    About This Event
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {event.category && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Category
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-gray-600 text-gray-400 rounded-2xl"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {event.category}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ticket Selection Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 sticky top-4 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white">Select Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.prices && event.prices.length > 0 ? (
                  event.prices.map((price: EventPrice) => (
                    <div
                      key={price.id}
                      className="border border-gray-700 rounded-2xl p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">
                            {price.category || "General Admission"}
                          </h4>
                          <p className="text-sm text-gray-400">
                            Standard ticket
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            Rs. {price.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {price.stock} left
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-600 bg-transparent rounded-xl"
                            onClick={() => updateTicketQuantity(price.id, -1)}
                            disabled={!selectedTickets[price.id]}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-white">
                            {selectedTickets[price.id] || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-600 bg-transparent rounded-xl"
                            onClick={() => updateTicketQuantity(price.id, 1)}
                            disabled={
                              price.stock === 0 ||
                              (selectedTickets[price.id] || 0) >= price.stock
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">
                      No tickets available for this event
                    </p>
                  </div>
                )}

                {getTotalTickets() > 0 && (
                  <>
                    <Separator className="bg-gray-700" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-300">
                        <span>Total Tickets:</span>
                        <span>{getTotalTickets()}</span>
                      </div>
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total Amount:</span>
                        <span>Rs. {getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 rounded-2xl"
                      size="lg"
                      onClick={handleBookTickets}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        "Book Tickets"
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
