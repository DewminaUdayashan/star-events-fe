"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  MapPin,
  Download,
  QrCode,
  Search,
  Ticket,
  Clock,
  Star,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTicketHistory, useTicketQRCode } from "@/hooks/useTickets";
import { getImageUrl } from "@/lib/utils";
import { qrFixService } from "@/lib/services/qr-fix.service";
import type { Ticket as BaseTicketType } from "@/lib/types/api";

// Extended ticket type to handle both camelCase and PascalCase from API
type TicketType = BaseTicketType & {
  IsPaid?: boolean; // Handle PascalCase from some API endpoints
};

export default function MyTicketsPage() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [localQrUrl, setLocalQrUrl] = useState<string | null>(null);
  const [localTicketCode, setLocalTicketCode] = useState<string | null>(null);
  const [localQrError, setLocalQrError] = useState<string | null>(null);
  const [localQrLoading, setLocalQrLoading] = useState(false);

  // Fetch user's ticket history
  const { tickets, loading, error, refetch } = useTicketHistory();
  const { qrCodeUrl, downloadQRCode, clearQRCode, loading: qrLoading, error: qrError } = useTicketQRCode();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Please log in to view your tickets.
          </p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Tickets</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button 
            onClick={refetch} 
            className="bg-purple-600 hover:bg-purple-700 rounded-2xl"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.event?.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.event?.venue?.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.eventPrice?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate upcoming and past tickets
  const upcomingTickets = filteredTickets.filter(
    (ticket) => ticket.event && new Date(ticket.event.eventDate) > new Date()
  );

  const pastTickets = filteredTickets.filter(
    (ticket) => ticket.event && new Date(ticket.event.eventDate) <= new Date()
  );

  // Calculate loyalty points (example: 1 point per 100 Rs spent)
  const calculateLoyaltyPoints = (totalAmount: number) => {
    return Math.floor(totalAmount / 100);
  };

  const handleViewQRCode = async (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setQrDialogOpen(true);
    setLocalQrUrl(null);
    setLocalQrError(null);
    setLocalQrLoading(true);
    
    try {
      console.log('🎫 Generating QR code for ticket:', ticket.id);
      const result = await qrFixService.getQRCodeForTicket(ticket.id);
      
      if (result.success && result.qrUrl) {
        setLocalQrUrl(result.qrUrl);
        setLocalTicketCode(result.ticketCode || null);
      } else {
        setLocalQrError(result.error || 'Failed to generate QR code');
      }
    } catch (err: any) {
      console.error("Failed to load QR code:", err);
      setLocalQrError(err.message || 'Failed to load QR code');
    } finally {
      setLocalQrLoading(false);
    }
  };

  const handleDownloadQRCode = async (ticket: TicketType) => {
    try {
      console.log('📥 Downloading QR code for ticket:', ticket.id);
      await qrFixService.downloadQRCode(ticket.id, ticket.ticketNumber);
    } catch (err: any) {
      console.error("Failed to download QR code:", err);
      alert(`Failed to download QR code: ${err.message}`);
    }
  };

  const handleMarkPaidAndDownload = async (ticket: TicketType) => {
    try {
      console.log('💳 Marking ticket as paid and downloading QR:', ticket.id);
      
      // Show loading toast
      toast({
        title: "Processing...",
        description: "Marking ticket as paid and generating QR code...",
      });
      
      const result = await qrFixService.markPaidAndDownloadQRDirect(ticket.id, ticket.ticketNumber);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
          variant: "default",
        });
        // Refresh the tickets to show updated status
        refetch();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to mark paid and download:", err);
      toast({
        title: "Error",
        description: `Failed to mark ticket as paid: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (isPaid: boolean | undefined, eventDate: string) => {
    if (!isPaid) return "bg-yellow-600";
    if (new Date(eventDate) < new Date()) return "bg-gray-600";
    return "bg-green-600";
  };

  const getStatusText = (isPaid: boolean | undefined, eventDate: string) => {
    if (!isPaid) return "Pending Payment";
    if (new Date(eventDate) < new Date()) return "Completed";
    return "Confirmed";
  };

  const TicketCard = ({ ticket, isPast = false }: { ticket: TicketType; isPast?: boolean }) => {
    const loyaltyPoints = calculateLoyaltyPoints(ticket.totalAmount);
    
    return (
      <Card className={`bg-gray-800 border-gray-700 ${isPast ? 'opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Event Image */}
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={getImageUrl(ticket.event?.imageUrl || ticket.event?.image)}
                alt={ticket.event?.title || "Event"}
                fill
                className={`object-cover ${isPast ? 'grayscale' : ''}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {ticket.event?.title || "Event"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Ticket #{ticket.ticketNumber || ticket.id.slice(0, 8)}
                  </p>
                </div>
                <Badge className={getStatusColor(ticket.isPaid ?? ticket.IsPaid, ticket.event?.eventDate || "")}>
                  {getStatusText(ticket.isPaid ?? ticket.IsPaid, ticket.event?.eventDate || "")}
                </Badge>
              </div>

              {/* Event Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {ticket.event?.eventDate ? formatDate(ticket.event.eventDate) : "TBD"}
                    {ticket.event?.eventTime && ` at ${formatTime(ticket.event.eventTime)}`}
                  </span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {ticket.event?.venue?.name && ticket.event?.venue?.location 
                      ? `${ticket.event.venue.name}, ${ticket.event.venue.location}`
                      : "Venue TBD"
                    }
                  </span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Ticket className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {ticket.eventPrice?.category || "General Admission"} × {ticket.quantity}
                  </span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    Purchased on {new Date(ticket.purchaseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm">
                    <p className="text-gray-400">Total Paid</p>
                    <p className="text-white font-semibold">
                      Rs. {ticket.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  {loyaltyPoints > 0 && (
                    <div className="flex items-center text-xs text-yellow-400">
                      <Star className="h-3 w-3 mr-1" />
                      <span>{loyaltyPoints} loyalty points earned</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {(ticket.isPaid ?? ticket.IsPaid) && !isPast && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 bg-transparent hover:bg-gray-700 rounded-xl"
                        onClick={() => handleViewQRCode(ticket)}
                        disabled={qrLoading}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View QR
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 rounded-xl"
                        onClick={() => handleDownloadQRCode(ticket)}
                        disabled={qrLoading}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </>
                  )}
                  {isPast && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 bg-transparent hover:bg-gray-700 rounded-xl"
                      onClick={() => handleDownloadQRCode(ticket)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                  )}
                  {!(ticket.isPaid ?? ticket.IsPaid) && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 rounded-xl"
                        asChild
                      >
                        <Link href={`/checkout?ticket=${ticket.id}`}>
                          Complete Payment
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white rounded-xl"
                        onClick={() => handleMarkPaidAndDownload(ticket)}
                        title="Mark as paid and download QR code"
                      >
                        Mark Paid & Download
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: "upcoming" | "past" }) => (
    <div className="text-center py-12">
      {type === "upcoming" ? (
        <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      ) : (
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      )}
      <h3 className="text-xl font-semibold text-white mb-2">
        {type === "upcoming" ? "No upcoming tickets" : "No past events"}
      </h3>
      <p className="text-gray-400 mb-6">
        {type === "upcoming" 
          ? "You don't have any tickets for upcoming events."
          : "Your event history will appear here."
        }
      </p>
      {type === "upcoming" && (
        <Link href="/events">
          <Button className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
            Browse Events
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-900">
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
                className="border-purple-500 text-purple-400 rounded-2xl"
              >
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
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
                  className="pl-10 bg-gray-800 border-gray-600 text-white rounded-2xl"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="bg-gray-800 border-gray-700 rounded-2xl">
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-purple-600 rounded-xl"
                >
                  Upcoming ({upcomingTickets.length})
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="data-[state=active]:bg-purple-600 rounded-xl"
                >
                  Past Events ({pastTickets.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {upcomingTickets.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {upcomingTickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="upcoming" />
                )}
              </TabsContent>

              <TabsContent value="past">
                {pastTickets.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pastTickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} isPast />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="past" />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              QR Code - {selectedTicket?.event?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {localQrLoading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-4" />
                <p className="text-gray-400">Generating QR code...</p>
              </div>
            ) : localQrError ? (
              <div className="flex flex-col items-center py-8">
                <AlertCircle className="h-8 w-8 text-red-400 mb-4" />
                <p className="text-red-400 text-center">{localQrError}</p>
                <Button
                  className="mt-4 bg-purple-600 hover:bg-purple-700 rounded-xl"
                  onClick={() => selectedTicket && handleViewQRCode(selectedTicket)}
                >
                  Try Again
                </Button>
              </div>
            ) : localQrUrl ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <Image
                    src={localQrUrl}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">QR Code Ready</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Show this QR code at the event entrance
                  </p>
                  {selectedTicket && (
                    <p className="text-xs text-gray-500">
                      Ticket: {selectedTicket.ticketNumber || selectedTicket.id.slice(0, 8)}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl"
                  onClick={() => selectedTicket && handleDownloadQRCode(selectedTicket)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}