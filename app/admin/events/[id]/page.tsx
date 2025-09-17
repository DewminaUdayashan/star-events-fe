"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Building,
  Eye,
  EyeOff,
  Edit,
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAdminEvent, usePublishEvent } from "@/lib/services";
import { getImageUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AdminEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishAction, setPublishAction] = useState<boolean>(false);

  const { data: event, isLoading, error } = useAdminEvent(eventId);
  const publishMutation = usePublishEvent();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePublishClick = (publish: boolean) => {
    setPublishAction(publish);
    setShowPublishDialog(true);
  };

  const handleConfirmPublish = async () => {
    if (!event) return;

    try {
      await publishMutation.mutateAsync({
        id: event.id,
        publish: publishAction,
      });
      toast({
        title: "Success",
        description: `Event ${
          publishAction ? "published" : "unpublished"
        } successfully`,
        variant: "default",
      });
      setShowPublishDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          publishAction ? "publish" : "unpublish"
        } event`,
        variant: "destructive",
      });
      console.error("Publish error:", error);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={["Admin"]}>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading event details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !event) {
    return (
      <ProtectedRoute requiredRole={["Admin"]}>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Event not found
            </h2>
            <p className="text-gray-400 mb-4">
              The event you're looking for doesn't exist.
            </p>
            <Link href="/admin/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={["Admin"]}>
      <div className="min-h-screen bg-gray-900">
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-red-500" />
                <h1 className="text-2xl font-bold text-white">Event Details</h1>
                <Badge
                  variant={event.isPublished ? "default" : "secondary"}
                  className={
                    event.isPublished
                      ? "bg-green-600 text-white"
                      : "bg-gray-600 text-gray-300"
                  }
                >
                  {event.isPublished ? (
                    <Eye className="h-3 w-3 mr-1" />
                  ) : (
                    <EyeOff className="h-3 w-3 mr-1" />
                  )}
                  {event.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link href={`/admin/events/${event.id}/edit`}>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              </Link>

              {event.isPublished ? (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
                  onClick={() => handlePublishClick(false)}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <EyeOff className="h-4 w-4 mr-2" />
                  )}
                  Unpublish
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handlePublishClick(true)}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Publish
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Event Info */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  {/* Event Image */}
                  {event.imageUrl && (
                    <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(event.imageUrl)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.jpg";
                        }}
                      />
                    </div>
                  )}

                  {/* Title and Category */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {event.title}
                    </h2>
                    {event.category && (
                      <Badge
                        variant="outline"
                        className="border-purple-500 text-purple-300"
                      >
                        {event.category}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Description
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  )}

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-medium">
                            {formatDate(event.eventDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-300">
                        <Clock className="h-5 w-5 mr-3 text-green-400" />
                        <div>
                          <p className="text-sm text-gray-400">Time</p>
                          <p className="font-medium">
                            {formatTime(event.eventTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-5 w-5 mr-3 text-orange-400" />
                        <div>
                          <p className="text-sm text-gray-400">Venue</p>
                          <p className="font-medium">{event.venueName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Organizer Information */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Organizer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <User className="h-4 w-4 mr-3 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-medium">{event.organizerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <Mail className="h-4 w-4 mr-3 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">{event.organizerEmail}</p>
                    </div>
                  </div>

                  {event.organizationName && (
                    <div className="flex items-center text-gray-300">
                      <Building className="h-4 w-4 mr-3 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Organization</p>
                        <p className="font-medium">{event.organizationName}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Event ID</p>
                    <p className="font-mono text-xs text-gray-300">
                      {event.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Created</p>
                    <p className="text-sm text-gray-300">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>

                  {event.modifiedAt && (
                    <div>
                      <p className="text-sm text-gray-400">Last Modified</p>
                      <p className="text-sm text-gray-300">
                        {formatDate(event.modifiedAt)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-400">Venue ID</p>
                    <p className="font-mono text-xs text-gray-300">
                      {event.venueId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Organizer ID</p>
                    <p className="font-mono text-xs text-gray-300">
                      {event.organizerId}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Confirmation Dialog */}
          <AlertDialog
            open={showPublishDialog}
            onOpenChange={setShowPublishDialog}
          >
            <AlertDialogContent className="bg-gray-800 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  {publishAction ? "Publish Event" : "Unpublish Event"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  {publishAction ? (
                    <>
                      Are you sure you want to publish "{event.title}"? This
                      will make the event visible to users and allow them to
                      purchase tickets.
                    </>
                  ) : (
                    <>
                      Are you sure you want to unpublish "{event.title}"? This
                      will hide the event from users and prevent new ticket
                      purchases.
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmPublish}
                  className={
                    publishAction
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : publishAction ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {publishAction ? "Publish" : "Unpublish"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </ProtectedRoute>
  );
}
