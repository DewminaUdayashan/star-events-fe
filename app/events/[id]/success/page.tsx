"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { eventsService } from '@/lib/services/events.service'
import type { Event, Ticket } from '@/lib/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface TicketWithQR extends Ticket {
  qrData?: string
}

export default function SuccessPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tickets, setTickets] = useState<TicketWithQR[]>([])
  const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventAndTickets = async () => {
      try {
        setLoading(true)
        
        // Get event details
        const eventData = await eventsService.getEventById(eventId)
        setEvent(eventData)

        // Get confirmed tickets from sessionStorage
        const storedTickets = sessionStorage.getItem("confirmedTickets")
        if (storedTickets) {
          const confirmedTickets: Ticket[] = JSON.parse(storedTickets)
          
          // Generate QR data for each ticket
          const ticketsWithQR: TicketWithQR[] = confirmedTickets.map(ticket => ({
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
              validationUrl: `${window.location.origin}/validate/${ticket.ticketCode}`
            })
          }))
          
          setTickets(ticketsWithQR)
          
          // Clear the stored tickets after loading
          sessionStorage.removeItem("confirmedTickets")
        } else {
          setError("No confirmed tickets found. Please check your booking history.")
        }
      } catch (err) {
        console.error("Error loading success page:", err)
        setError("Failed to load ticket details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventAndTickets()
    }
  }, [eventId])

  const downloadTicketAsPDF = async (ticket: TicketWithQR, index: number) => {
    if (!event || !ticket.qrData) return

    try {
      setDownloadingTicket(ticket.id)
      
      // Get the ticket card element
      const ticketElement = document.getElementById(`ticket-${index}`)
      if (!ticketElement) throw new Error('Ticket element not found')

      // Convert to canvas
      const canvas = await html2canvas(ticketElement, {
        backgroundColor: '#1f2937',
        scale: 2,
        logging: false,
        useCORS: true
      })

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 190
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      
      // Add some text information
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Event: ${event.title}`, 10, imgHeight + 25)
      pdf.text(`Ticket ID: ${ticket.id}`, 10, imgHeight + 35)
      pdf.text(`Date: ${new Date(event.eventDate).toLocaleDateString()}`, 10, imgHeight + 45)
      pdf.text(`Venue: ${event.venue?.name || 'TBA'}`, 10, imgHeight + 55)

      // Download the PDF
      pdf.save(`${event.title.replace(/[^a-z0-9]/gi, '_')}_ticket_${ticket.ticketNumber}.pdf`)
    } catch (error) {
      console.error('Error downloading ticket:', error)
      alert('Failed to download ticket. Please try again.')
    } finally {
      setDownloadingTicket(null)
    }
  }

  const shareTicket = async (ticket: TicketWithQR) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event?.title} - Ticket`,
          text: `I got tickets for ${event?.title}!`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading your tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Link href="/my-tickets">
              <Button className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
                View My Tickets
              </Button>
            </Link>
          </div>
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
          <h1 className="text-4xl font-bold text-white mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-gray-300 mb-6">
            Your tickets have been successfully booked and are ready to download.
          </p>
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
                  🎫 E-Ticket
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
                          <p className="text-white font-medium">#{ticket.ticketNumber}</p>
                          <p className="text-gray-400">Quantity: {ticket.quantity}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <QrCode className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Total Amount</p>
                          <p className="text-white font-medium">Rs. {ticket.totalAmount?.toLocaleString()}</p>
                          <p className="text-green-400 text-sm">✓ Paid</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="flex flex-col sm:flex-row gap-3">
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
                        onClick={() => shareTicket(ticket)}
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
                        value={ticket.qrData || ticket.id}
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                    </div>
                    <p className="text-gray-800 text-sm text-center font-medium">
                      Scan this QR code at the venue
                    </p>
                    <p className="text-gray-600 text-xs text-center mt-1">
                      Code: {ticket.ticketCode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              onClick={() => router.push('/my-tickets')} 
              className="bg-purple-600 hover:bg-purple-700 rounded-2xl"
              size="lg"
            >
              View All My Tickets
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
        </div>
      </div>
    </div>
  )
}
