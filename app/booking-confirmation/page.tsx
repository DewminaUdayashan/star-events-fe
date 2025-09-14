"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Calendar, MapPin, Mail, Smartphone } from "lucide-react"
import { useSearchParams } from 'next/navigation';
import { useTicketQRCode } from '@/hooks/useTickets';

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  let ticketId = searchParams.get('ticketId');
  console.log("BookingConfirmationPage - Initial ticketId from URL:", ticketId);
  
  // Fallback to localStorage if ticketId is not in URL
  if (!ticketId && typeof window !== 'undefined') {
    console.log("BookingConfirmationPage - ticketId not in URL, checking localStorage.");
    ticketId = localStorage.getItem('currentBookingTicketId');
    console.log("BookingConfirmationPage - ticketId from localStorage:", ticketId);
    // Clear from localStorage after retrieval to prevent stale data
    localStorage.removeItem('currentBookingTicketId');
  }
  const { qrCodeUrl, generateQRCode, loading, error } = useTicketQRCode();

  // Mock booking data - in real app this would come from the booking API
  const bookingId = "SE-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const bookingDate = new Date().toLocaleDateString()

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400">
              Your tickets have been successfully booked. Check your email for confirmation details.
            </p>
          </div>

          {/* Booking Details */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Booking ID</p>
                  <p className="text-white font-mono">{ticketId || bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Booking Date</p>
                  <p className="text-white">{bookingDate}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge className="bg-green-600 hover:bg-green-700">Confirmed</Badge>
                <Badge variant="outline" className="border-purple-500 text-purple-400">
                  Payment Successful
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Check Your Email</h3>
                  <p className="text-gray-400 text-sm">We've sent your tickets and QR codes to your email address.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Smartphone className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Save to Mobile</h3>
                  <p className="text-gray-400 text-sm">
                    Download the tickets to your mobile device for easy access at the venue.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Arrive Early</h3>
                  <p className="text-gray-400 text-sm">
                    Please arrive at least 30 minutes before the event starts for smooth entry.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={async () => {
                if (ticketId) {
                  const url = await generateQRCode(ticketId);
                  if (url) {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `ticket-qrcode-${ticketId}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                } else {
                  console.error("Ticket ID not available for QR code generation.");
                  // Optionally, display a user-friendly error message
                }
              }}
              disabled={!ticketId || loading}
            >
              {loading ? 'Generating QR...' : 'Download Tickets'}
              <Download className="h-4 w-4 ml-2" />
            </Button>
            <Link href="/my-tickets" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:text-white bg-transparent"
              >
                View My Tickets
              </Button>
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@starevents.lk" className="text-purple-400 hover:underline">
                support@starevents.lk
              </a>
            </p>
            <Link href="/events">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Browse More Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
