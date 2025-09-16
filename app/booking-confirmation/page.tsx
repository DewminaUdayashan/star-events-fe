"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Calendar, MapPin, Mail, Smartphone } from "lucide-react"
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTicketQRCode } from '@/hooks/useTickets';
import Image from "next/image";

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { qrCodeUrl, generateQRCode, downloadQRCode, loading, error, ticketCode, paymentStatus } = useTicketQRCode();

  // Initialize ticketId and booking data from URL or localStorage
  useEffect(() => {
    const fromUrl = searchParams.get('ticketId');
    const sessionIdParam = searchParams.get('session_id');
    
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
    
    if (fromUrl) {
      setTicketId(fromUrl);
      return;
    }
    
    if (typeof window !== 'undefined') {
      const fromStorage = localStorage.getItem('currentBookingTicketId');
      const storedBooking = localStorage.getItem('currentBooking');
      
      if (fromStorage) {
        setTicketId(fromStorage);
      }
      
      if (storedBooking) {
        try {
          const parsed = JSON.parse(storedBooking);
          setBookingData(parsed);
        } catch (err) {
          console.warn('Failed to parse stored booking data:', err);
        }
      }
    }
  }, [searchParams]);

  // Automatically generate QR when ticketId is known, then clear localStorage
  useEffect(() => {
    const run = async () => {
      if (!ticketId) return;
      try {
        const url = await generateQRCode(ticketId, sessionId || undefined);
        if (url && typeof window !== 'undefined') {
          localStorage.removeItem('currentBookingTicketId');
          localStorage.removeItem('currentBooking');
        }
      } catch {
        // swallow; error state is handled by hook
      }
    };
    run();
  }, [ticketId, sessionId, generateQRCode]);

  // Debugging logs
  console.log("BookingConfirmationPage - ticketId:", ticketId);
  console.log("BookingConfirmationPage - loading:", loading);
  console.log("BookingConfirmationPage - error:", error);
  console.log("BookingConfirmationPage - ticketCode (from hook):", ticketCode);

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

          {/* Booking Details from stored data */}
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
                  <p className="text-sm text-gray-400">Ticket Code</p>
                  <p className="text-white font-mono text-xl">{ticketCode || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Status</p>
                  <p className="text-white">{paymentStatus || 'Pending'}</p>
                </div>
                {bookingData && (
                  <>
                    <div>
                      <p className="text-sm text-gray-400">Quantity</p>
                      <p className="text-white">{bookingData.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Amount</p>
                      <p className="text-white">LKR {bookingData.totalAmount?.toFixed(2) || '—'}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-600 hover:bg-green-700">Confirmed</Badge>
                <Badge variant="outline" className="border-purple-500 text-purple-400">
                  Payment Successful
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Display */}
          {qrCodeUrl && (
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Your Ticket QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                <div className="bg-white p-2 rounded-lg">
                  <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} />
                </div>
              </CardContent>
            </Card>
          )}

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
                  try {
                    const url = await downloadQRCode(ticketId);
                    if (url) {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `ticket-qrcode-${ticketCode || ticketId}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  } catch (err) {
                    console.error('Download failed:', err);
                    // Show user-friendly error message
                    alert('Failed to download QR code. Please try again or contact support.');
                  }
                } else {
                  alert('No ticket ID available for download.');
                }
              }}
              disabled={!ticketId || loading}
            >
              {loading ? 'Downloading QR...' : 'Download Tickets'}
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
