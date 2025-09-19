"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { eventsService } from '@/lib/services/events.service'
import { ticketsService } from '@/lib/services'
import type { Event, BookTicketRequest, Ticket, EventPrice } from '@/lib/types/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle, Loader2, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { BookingPaymentForm } from '@/components/payment/BookingPaymentForm'

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingRequests, setBookingRequests] = useState<BookTicketRequest[]>([])
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [tempTickets, setTempTickets] = useState<Ticket[]>([])

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

  useEffect(() => {
    // Read booking requests from sessionStorage
    try {
      const storedRequests = sessionStorage.getItem("bookingRequests")
      if (storedRequests) {
        const requests: BookTicketRequest[] = JSON.parse(storedRequests)
        setBookingRequests(requests)
      } else {
        setError("No booking requests found. Please select tickets first.")
      }
    } catch (err) {
      console.error("Error reading booking requests:", err)
      setError("Invalid booking data. Please try again.")
    }
  }, [])

  const getTicketDetails = (request: BookTicketRequest) => {
    if (!event || !event.prices) return null
    const price = event.prices.find((p: EventPrice) => p.id === request.eventPriceId)
    return price
  }

  const getTotalAmount = () => {
    return bookingRequests.reduce((total, request) => {
      const price = getTicketDetails(request)
      return total + (price ? price.price * request.quantity : 0)
    }, 0)
  }

  const getTotalTickets = () => {
    return bookingRequests.reduce((total, request) => total + request.quantity, 0)
  }

  const handlePaymentSuccess = async () => {
    if (!event || bookingRequests.length === 0) return

    try {
      setProcessingPayment(true)
      setPaymentComplete(true)
      
      console.log('Payment successful, redirecting to success page')
      
      // Redirect to success page - let the success page handle ticket creation
      // Keep booking requests in sessionStorage for the success page to process
      setTimeout(() => {
        router.push(`/events/${eventId}/booking/success`)
      }, 1500)
    } catch (err) {
      console.error("Payment success handling error:", err)
      setError("Payment successful but redirection failed. Please contact support.")
    } finally {
      setProcessingPayment(false)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(`Payment failed: ${errorMessage}`)
    setProcessingPayment(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href={`/events/${eventId}/booking`}>
              <Button variant="ghost" className="text-gray-400 hover:text-white rounded-2xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Booking
              </Button>
            </Link>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">Event not found.</p>
        </div>
      </div>
    )
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-gray-300 mb-6">
              Your payment has been processed and tickets are being confirmed. 
              You will be redirected to your tickets shortly.
            </p>
            
            {processingPayment && (
              <div className="flex items-center justify-center mb-6">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
                <span className="text-gray-400">Confirming your booking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/events/${eventId}/booking`}>
            <Button variant="ghost" className="text-gray-400 hover:text-white rounded-2xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booking
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Complete Your Payment</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="border border-gray-700 rounded-2xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(event.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span>{' '}
                        {new Date(event.eventTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p>
                        <span className="font-medium">Venue:</span> {event.venue?.name}
                      </p>
                    </div>
                  </div>

                  {/* Tickets */}
                  {bookingRequests.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        <h4 className="font-medium text-white">Selected Tickets</h4>
                        {bookingRequests.map((request, index) => {
                          const ticketDetails = getTicketDetails(request)
                          if (!ticketDetails) return null
                          
                          return (
                            <div key={index} className="flex justify-between items-center py-2">
                              <div>
                                <p className="text-white font-medium">
                                  {ticketDetails.category || 'General Admission'}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Quantity: {request.quantity} × Rs. {ticketDetails.price.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-white">
                                  Rs. {(ticketDetails.price * request.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      <Separator className="bg-gray-700" />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-300">
                          <span>Total Tickets:</span>
                          <span>{getTotalTickets()}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-xl">
                          <span>Total Amount:</span>
                          <span>Rs. {getTotalAmount().toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No booking requests found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white">Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {getTotalAmount() > 0 ? (
                    <BookingPaymentForm
                      bookingRequests={bookingRequests}
                      totalAmount={getTotalAmount()}
                      currency="LKR"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={processingPayment}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No payment required</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
