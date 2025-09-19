"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { eventsService } from '@/lib/services/events.service'
import { ticketsService } from '@/lib/services'
import type { Event, Ticket } from '@/lib/types/api'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  CheckCircle, 
  QrCode, 
  Download, 
  Mail, 
  Calendar,
  MapPin,
  User,
  Loader2
} from 'lucide-react'

// QR Code generation utility
const generateQRCode = (ticketData: any) => {
  // Using a simple SVG QR code placeholder
  // In production, use libraries like 'qrcode' or 'react-qr-code'
  const qrData = JSON.stringify({
    ticketId: ticketData.id,
    eventId: ticketData.eventId,
    userId: ticketData.userId,
    verification: `${ticketData.id}-${Date.now()}`
  });

  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white" stroke="#000" stroke-width="2"/>
      <!-- QR Pattern Simulation -->
      <rect x="20" y="20" width="160" height="160" fill="none" stroke="#000" stroke-width="1"/>
      <rect x="30" y="30" width="20" height="20" fill="#000"/>
      <rect x="60" y="30" width="20" height="20" fill="#000"/>
      <rect x="120" y="30" width="20" height="20" fill="#000"/>
      <rect x="150" y="30" width="20" height="20" fill="#000"/>
      <rect x="30" y="60" width="20" height="20" fill="#000"/>
      <rect x="90" y="60" width="20" height="20" fill="#000"/>
      <rect x="150" y="60" width="20" height="20" fill="#000"/>
      <rect x="60" y="90" width="20" height="20" fill="#000"/>
      <rect x="120" y="90" width="20" height="20" fill="#000"/>
      <rect x="30" y="120" width="20" height="20" fill="#000"/>
      <rect x="90" y="120" width="20" height="20" fill="#000"/>
      <rect x="150" y="120" width="20" height="20" fill="#000"/>
      <rect x="60" y="150" width="20" height="20" fill="#000"/>
      <rect x="120" y="150" width="20" height="20" fill="#000"/>
      <text x="100" y="195" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">
        Ticket: ${ticketData.id?.substring(0, 8)}...
      </text>
    </svg>
  `)}`;
};

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const searchParams = useSearchParams()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null)
  const [ticketData, setTicketData] = useState<Ticket | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [fetchingTicket, setFetchingTicket] = useState(false)

  // Handle URL parameters for payment success/failure
  useEffect(() => {
    const successParam = searchParams.get('success')
    const canceledParam = searchParams.get('canceled')
    const sessionIdParam = searchParams.get('session_id')
    const ticketIdParam = searchParams.get('ticketId')

    if (successParam === 'true' && sessionIdParam) {
      setPaymentSuccess(true)
      setSessionId(sessionIdParam)
      if (ticketIdParam) {
        setCurrentTicketId(ticketIdParam)
        fetchTicketData(ticketIdParam)
      }
    } else if (canceledParam === 'true') {
      setPaymentSuccess(false)
      setError('Payment was canceled. Please try again.')
    }
  }, [searchParams, eventId])

  // Fetch event details
  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        try {
          setLoading(true)
          const eventData = await eventsService.getEventById(eventId)
          setEvent(eventData)
          setError(null)
        } catch (err) {
          setError('Failed to load event details. Please try again.')
        } finally {
          setLoading(false)
        }
      }
      fetchEvent()
    }
  }, [eventId])

  // Fetch ticket data after successful payment
  const fetchTicketData = async (ticketId: string) => {
    try {
      setFetchingTicket(true)
      
      // Fetch ticket details - replace with your actual API call
      const ticket = await ticketsService.getTicketById(ticketId)
      
      // Verify payment status
      if (ticket.isPaid) {
        setTicketData(ticket)
        // Generate QR code
        const qrCodeData = generateQRCode(ticket)
        setQrCode(qrCodeData)
      } else {
        setError('Payment verification failed. Please contact support.')
      }
    } catch (err) {
      console.error('Error fetching ticket:', err)
      setError('Failed to load ticket details. Please try again.')
    } finally {
      setFetchingTicket(false)
    }
  }

  const handleBookingSuccess = (ticketId: string) => {
    setCurrentTicketId(ticketId)
    fetchTicketData(ticketId)
  }

  const handleBookingCancel = () => {
    router.push(`/events/${eventId}`)
  }

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement('a')
      link.href = qrCode
      link.download = `ticket-${currentTicketId}.svg`
      link.click()
    }
  }

  const sendQRByEmail = async () => {
    try {
      // Replace with actual email service call
      // await emailService.sendTicketQR(ticketData.userEmail, qrCode)
      alert('QR code sent to your email!')
    } catch (err) {
      alert('Failed to send email. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error && paymentSuccess !== true) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push(`/events/${eventId}`)} variant="outline">
            Back to Event
          </Button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Event not found.</p>
        <Button onClick={() => router.push('/events')} className="mt-4">
          Browse Events
        </Button>
      </div>
    )
  }

  // Payment Success Page with QR Code
  if (paymentSuccess === true) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {fetchingTicket ? (
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-400">Loading your ticket...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Payment Successful!</CardTitle>
                  <p className="text-gray-400">Your booking has been confirmed</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Details */}
                  <div className="bg-gray-900 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-3 text-purple-400" />
                        <span>{formatDate(event.eventDate)} at {formatTime(event.eventTime)}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-4 w-4 mr-3 text-purple-400" />
                        <span>{event.venue?.name}, {event.venue?.location}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <User className="h-4 w-4 mr-3 text-purple-400" />
                        <span>{event.organizer?.fullName || 'Event Organizer'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  {ticketData && (
                    <div className="bg-gray-900 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Booking Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ticket ID:</span>
                          <span className="text-white font-mono">{ticketData.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Event:</span>
                          <span className="text-white">{event.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quantity:</span>
                          <span className="text-white">{ticketData.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Amount:</span>
                          <span className="text-white font-bold">
                            Rs. {ticketData.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <Badge className="bg-green-600">
                            {ticketData.isPaid ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QR Code Section */}
                  {qrCode && (
                    <div className="bg-gray-900 rounded-2xl p-6 text-center">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
                        <QrCode className="h-5 w-5 mr-2" />
                        Your Ticket QR Code
                      </h3>
                      <div className="bg-white p-4 rounded-xl inline-block mb-4">
                        <img src={qrCode} alt="Ticket QR Code" className="w-48 h-48" />
                      </div>
                      <p className="text-gray-400 mb-4">
                        Present this QR code at the event entrance
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={downloadQRCode} variant="outline" className="rounded-2xl">
                          <Download className="h-4 w-4 mr-2" />
                          Download QR
                        </Button>
                        <Button onClick={sendQRByEmail} variant="outline" className="rounded-2xl">
                          <Mail className="h-4 w-4 mr-2" />
                          Email QR
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => router.push('/events')} 
                      variant="outline" 
                      className="flex-1 rounded-2xl"
                    >
                      Browse More Events
                    </Button>
                    <Button 
                      onClick={() => router.push(`/my-tickets?ticketId=${currentTicketId}`)} 
                      className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-2xl"
                    >
                      View My Tickets
                    </Button>
                  </div>

                  {/* Session Info for Debug */}
                  {sessionId && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Session: {sessionId.substring(0, 20)}...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Regular Booking Flow
  return (
    <div className="container mx-auto px-4 py-8">
      <BookingFlow
        event={event}
        onSuccess={handleBookingSuccess}
        onCancel={handleBookingCancel}
      />
    </div>
  )
}