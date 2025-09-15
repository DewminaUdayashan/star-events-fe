"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Copy,
  Trash2,
  Share2,
  Download,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

interface EventPrice {
  id: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  description: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueLocation: string;
  venueCapacity: number;
  image: string;
  prices: EventPrice[];
  isPublished: boolean;
  totalTicketsSold: number;
  totalRevenue: number;
  views: number;
}

export default function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        // Mock data for now - replace with actual API call
        const mockEvent: Event = {
          id: params.id,
          title: "Electronic Music Festival 2024",
          description:
            "Join us for an unforgettable night of electronic music featuring top DJs from around the world. Experience cutting-edge sound and lighting in an incredible atmosphere that will keep you dancing until dawn.",
          category: "music",
          eventDate: "2024-03-15",
          eventTime: "19:00",
          venueName: "Colombo Convention Centre",
          venueLocation: "Colombo, Western Province",
          venueCapacity: 2000,
          image:
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070",
          prices: [
            {
              id: "1",
              category: "General Admission",
              price: 5000,
              stock: 800,
              sold: 450,
              description: "Standard entry ticket with access to main floor",
            },
            {
              id: "2",
              category: "VIP",
              price: 12000,
              stock: 200,
              sold: 120,
              description:
                "VIP access with exclusive areas and complimentary drinks",
            },
            {
              id: "3",
              category: "Early Bird",
              price: 3500,
              stock: 100,
              sold: 100,
              description: "Limited early bird pricing (SOLD OUT)",
            },
          ],
          isPublished: true,
          totalTicketsSold: 670,
          totalRevenue: 3665000, // Rs. 3,665,000
          views: 2840,
        };

        // Simulate API loading
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setEvent(mockEvent);
      } catch (error) {
        console.error("Error loading event:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [params.id]);

  const handleTogglePublish = async () => {
    if (!event) return;

    setActionLoading("publish");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEvent((prev) =>
        prev ? { ...prev, isPublished: !prev.isPublished } : null
      );
    } catch (error) {
      console.error("Error toggling publish status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async () => {
    if (!event) return;

    setActionLoading("duplicate");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to create page with pre-filled data
      router.push("/organizer/events/create");
    } catch (error) {
      console.error("Error duplicating event:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    setActionLoading("delete");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to events list
      router.push("/organizer/events");
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="Organizer">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-32 bg-gray-700" />
              <Skeleton className="h-8 w-64 bg-gray-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <Skeleton className="h-64 w-full bg-gray-700 rounded-lg mb-4" />
                    <Skeleton className="h-8 w-3/4 bg-gray-700 mb-2" />
                    <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
                    <Skeleton className="h-4 w-2/3 bg-gray-700" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <Skeleton className="h-6 w-32 bg-gray-700" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 bg-gray-700" />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!event) {
    return (
      <ProtectedRoute requiredRole="Organizer">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Event Not Found
            </h1>
            <p className="text-gray-400 mb-8">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/organizer/events">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const eventDate = new Date(`${event.eventDate}T${event.eventTime}`);
  const isUpcoming = eventDate > new Date();
  const availableTickets = event.prices.reduce(
    (total, price) => total + (price.stock - price.sold),
    0
  );
  const soldOutCategories = event.prices.filter(
    (price) => price.sold >= price.stock
  ).length;

  return (
    <ProtectedRoute requiredRole="Organizer">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/organizer/events">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center space-x-4">
                  <Badge variant={event.isPublished ? "default" : "secondary"}>
                    {event.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant={isUpcoming ? "default" : "outline"}>
                    {isUpcoming ? "Upcoming" : "Past Event"}
                  </Badge>
                  <span className="text-gray-400 text-sm flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {event.views.toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-gray-600"
                disabled={actionLoading === "duplicate"}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={handleDuplicate}
                disabled={!!actionLoading}
                className="border-gray-600"
              >
                {actionLoading === "duplicate" ? (
                  "Duplicating..."
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleTogglePublish}
                disabled={!!actionLoading}
                className="border-gray-600"
              >
                {actionLoading === "publish" ? (
                  "Updating..."
                ) : (
                  <>
                    {event.isPublished ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {event.isPublished ? "Unpublish" : "Publish"}
                  </>
                )}
              </Button>
              <Link href={`/organizer/events/${event.id}/edit`}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Image & Details */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="aspect-video relative mb-6 rounded-lg overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-medium">
                            {eventDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-300">
                        <Clock className="h-4 w-4" />
                        <div>
                          <p className="text-sm text-gray-400">Time</p>
                          <p className="font-medium">
                            {eventDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPin className="h-4 w-4" />
                        <div>
                          <p className="text-sm text-gray-400">Venue</p>
                          <p className="font-medium">{event.venueName}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-300">
                        <Users className="h-4 w-4" />
                        <div>
                          <p className="text-sm text-gray-400">Capacity</p>
                          <p className="font-medium">
                            {event.venueCapacity.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        About This Event
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-1">Location</p>
                      <p className="text-white">{event.venueLocation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Categories */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Ticket className="h-5 w-5 mr-2" />
                    Ticket Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.prices.map((price) => {
                    const soldPercentage = (price.sold / price.stock) * 100;
                    const isSoldOut = price.sold >= price.stock;

                    return (
                      <div
                        key={price.id}
                        className="border border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-white font-medium">
                              {price.category}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {price.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">
                              Rs. {price.price.toLocaleString()}
                            </p>
                            <Badge
                              variant={isSoldOut ? "destructive" : "outline"}
                            >
                              {isSoldOut
                                ? "SOLD OUT"
                                : `${price.stock - price.sold} left`}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                          <span>
                            Sold: {price.sold} / {price.stock}
                          </span>
                          <span>{soldPercentage.toFixed(1)}%</span>
                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isSoldOut
                                ? "bg-red-600"
                                : soldPercentage > 75
                                ? "bg-yellow-500"
                                : "bg-green-600"
                            }`}
                            style={{
                              width: `${Math.min(soldPercentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Revenue</span>
                    <span className="text-white font-bold">
                      Rs. {event.totalRevenue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tickets Sold</span>
                    <span className="text-white font-bold">
                      {event.totalTicketsSold}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Available</span>
                    <span className="text-white font-bold">
                      {availableTickets}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sold Out Categories</span>
                    <span className="text-white font-bold">
                      {soldOutCategories}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Sales Progress</span>
                      <span className="text-white font-bold">
                        {(
                          (event.totalTicketsSold / event.venueCapacity) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (event.totalTicketsSold / event.venueCapacity) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-gray-600 justify-start"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-red-600 text-red-400 hover:bg-red-600 justify-start"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Event
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          This action cannot be undone. This will permanently
                          delete the event "{event.title}" and all associated
                          data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-600">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={actionLoading === "delete"}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {actionLoading === "delete"
                            ? "Deleting..."
                            : "Delete Event"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
