"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { eventsService } from '@/lib/services/events.service'
import { ticketsService } from '@/lib/services'
import type { Event, Ticket, BookTicketRequest } from '@/lib/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Download, 
  Loader2, 
  QrCode, 
  Calendar, 
  MapPin, 
  User,
  Share2,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface TicketWithQR extends Ticket {
  qrData?: string
}

export default function BookingSuccessPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tickets, setTickets] = useState<TicketWithQR[]>([])
  const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null)
  const [bookingComplete, setBookingComplete] = useState(false)

  // Get payment intent details from URL params (if redirected from Stripe)
  const paymentIntent = searchParams.get('payment_intent')
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')

  useEffect(() => {
    const handleBookingSuccess = async () => {
      if (!eventId) {
        setError('Event ID not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Get event details
        const eventData = await eventsService.getEventById(eventId)
        setEvent(eventData)

        // Check if we have booking requests in sessionStorage
        const storedRequests = sessionStorage.getItem("bookingRequests")
        if (!storedRequests) {
          // If no session data, check if we already have confirmed tickets
          const storedTickets = sessionStorage.getItem("confirmedTickets")
          if (storedTickets) {
            const confirmedTickets: Ticket[] = JSON.parse(storedTickets)
            const ticketsWithQR = generateQRDataForTickets(confirmedTickets, eventData)
            setTickets(ticketsWithQR)
            setBookingComplete(true)
            sessionStorage.removeItem("confirmedTickets")
          } else {
            setError('No booking data found. Please start a new booking.')
          }
          setLoading(false)
          return
        }

        // If we have booking requests and payment was successful, create the tickets
        const bookingRequests: BookTicketRequest[] = JSON.parse(storedRequests)
        
        // Verify payment was successful (if we have payment intent info)
        if (paymentIntent && paymentIntentClientSecret) {
          console.log('Payment successful, creating tickets for requests:', bookingRequests)
          await createTicketsFromBookingRequests(bookingRequests, eventData)
        } else {
          // If no payment info but we have requests, assume payment was handled elsewhere
          console.log('No payment intent found, but creating tickets anyway')
          await createTicketsFromBookingRequests(bookingRequests, eventData)
        }

      } catch (err) {
        console.error('Error handling booking success:', err)
        setError('Failed to process your booking. Please contact support.')
      } finally {
        setLoading(false)
      }
    }

    handleBookingSuccess()
  }, [eventId, paymentIntent, paymentIntentClientSecret])

  const createTicketsFromBookingRequests = async (bookingRequests: BookTicketRequest[], eventData: Event) => {
    try {
      setBookingLoading(true)
      const createdTickets: Ticket[] = []

      // Create tickets for each booking request
      for (const request of bookingRequests) {
        console.log('Creating ticket for request:', request)
        const ticket = await ticketsService.bookTicket(request)
        createdTickets.push(ticket)
      }

      // Generate QR codes for tickets
      const ticketsWithQR = generateQRDataForTickets(createdTickets, eventData)
      setTickets(ticketsWithQR)
      setBookingComplete(true)

      // Clear session storage
      sessionStorage.removeItem("bookingRequests")
      
      console.log('Successfully created', createdTickets.length, 'tickets')
    } catch (err) {
      console.error('Error creating tickets:', err)
      setError('Payment successful, but failed to create tickets. Please contact support with your payment confirmation.')
    } finally {
      setBookingLoading(false)
    }
  }

  const generateQRDataForTickets = (ticketList: Ticket[], eventData: Event): TicketWithQR[] => {
    return ticketList.map(ticket => ({
      ...ticket,
      qrData: JSON.stringify({
        ticketId: ticket.id,
        eventId: ticket.eventId,
        ticketNumber: ticket.ticketNumber,
        ticketCode: ticket.ticketCode,
        eventTitle: eventData.title,
        eventDate: eventData.eventDate,
        eventTime: eventData.eventTime,
        venue: eventData.venue?.name,
        quantity: ticket.quantity,
        totalAmount: ticket.totalAmount,
        validationUrl: `${window.location.origin}/validate/${ticket.ticketCode}`
      })
    }))
  }

  const downloadTicketAsPDF = async (ticket: TicketWithQR, index: number) => {
    if (!event || !ticket.qrData) return

    try {
      setDownloadingTicket(ticket.id)
      
      const ticketElement = document.getElementById(`ticket-${index}`)
      if (!ticketElement) throw new Error('Ticket element not found')

      const canvas = await html2canvas(ticketElement, {
        backgroundColor: '#1f2937',
        scale: 2,
        logging: false,
        useCORS: true
      })

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 190
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      
      // Add ticket information
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`${event.title}`, 10, imgHeight + 30)
      pdf.setFontSize(10)
      pdf.text(`Ticket: ${ticket.ticketNumber}`, 10, imgHeight + 40)
      pdf.text(`Date: ${new Date(event.eventDate).toLocaleDateString()}`, 10, imgHeight + 50)
      pdf.text(`Time: ${new Date(event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 10, imgHeight + 60)
      pdf.text(`Venue: ${event.venue?.name || 'TBA'}`, 10, imgHeight + 70)
      pdf.text(`Amount: Rs. ${ticket.totalAmount?.toLocaleString() || '0'}`, 10, imgHeight + 80)

      pdf.save(`${event.title.replace(/[^a-z0-9]/gi, '_')}_ticket_${ticket.ticketNumber}.pdf`)
    } catch (error) {
      console.error('Error downloading ticket:', error)
      alert('Failed to download ticket. Please try again.')
    } finally {
      setDownloadingTicket(null)
    }
  }

  const shareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event?.title} - My Tickets`,
          text: `I got tickets for ${event?.title}!`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Processing your booking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="text-center space-y-4">
              <Link href="/my-tickets">
                <Button className="bg-purple-600 hover:bg-purple-700 rounded-2xl mr-4">
                  View My Tickets
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="border-gray-600 text-gray-400 hover:text-white rounded-2xl">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Creating your tickets...</p>
          <p className="text-sm text-gray-500 mt-2">Please don't close this page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-300 mb-6">
            Your tickets have been confirmed and are ready to download.
          </p>
          {paymentIntent && (
            <p className="text-sm text-gray-400">
              Payment ID: {paymentIntent}
            </p>
          )}
        </div>

        {/* Tickets */}
        <div className="max-w-6xl mx-auto space-y-6">
          {tickets.map((ticket, index) => (
            <Card 
              key={ticket.id} 
              id={`ticket-${index}`}
              className="bg-gray-800 border-gray-700 rounded-3xl overflow-hidden"
            >
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600">
                <CardTitle className="text-white text-center text-2xl">
                  🎫 E-Ticket #{ticket.ticketNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Event Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{event?.title}</h3>
                      <p className="text-gray-400">{event?.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Date & Time</p>
                          <p className="text-white font-medium">
                            {event && new Date(event.eventDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-gray-400">
                            {event && new Date(event.eventTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Venue</p>
                          <p className="text-white font-medium">{event?.venue?.name}</p>
                          <p className="text-gray-400">{event?.venue?.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Ticket Details</p>
                          <p className="text-white font-medium">Qty: {ticket.quantity}</p>
                          <p className="text-gray-400">ID: {ticket.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <QrCode className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Amount Paid</p>
                          <p className="text-white font-medium">Rs. {ticket.totalAmount?.toLocaleString() || '0'}</p>
                          <p className="text-green-400 text-sm">✓ Confirmed</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        onClick={() => downloadTicketAsPDF(ticket, index)}
                        disabled={downloadingTicket === ticket.id}
                        className="bg-purple-600 hover:bg-purple-700 rounded-2xl flex-1"
                      >
                        {downloadingTicket === ticket.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Ticket
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={shareTicket}
                        variant="outline"
                        className="border-gray-600 text-gray-400 hover:text-white rounded-2xl"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-6">
                    <div className="mb-4">
                      <QRCode
                        value={ticket.qrData || `ticket-${ticket.id}`}
                        size={180}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                    </div>
                    <p className="text-gray-800 text-sm text-center font-medium">
                      Scan at venue entrance
                    </p>
                    <p className="text-gray-600 text-xs text-center mt-1">
                      {ticket.ticketCode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Action Buttons */}
          {bookingComplete && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                onClick={() => router.push('/my-tickets')} 
                className="bg-purple-600 hover:bg-purple-700 rounded-2xl"
                size="lg"
              >
                View All My Tickets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => router.push('/events')} 
                variant="outline"
                className="border-gray-600 text-gray-400 hover:text-white rounded-2xl"
                size="lg"
              >
                Browse More Events
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
