"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { eventsService } from '@/lib/services/events.service'
import type { Event } from '@/lib/types/api'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const searchParams = useSearchParams();

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);

  useEffect(() => {
    const successParam = searchParams.get('success');
    const canceledParam = searchParams.get('canceled');
    const sessionIdParam = searchParams.get('session_id');
    const ticketIdParam = searchParams.get('ticketId'); // Assuming ticketId is also passed back

    if (successParam === 'true' && sessionIdParam) {
      setPaymentSuccess(true);
      setSessionId(sessionIdParam);
      if (ticketIdParam) setCurrentTicketId(ticketIdParam);
      // Optionally, you might want to call an API to verify the session server-side
      // router.replace(`/events/${eventId}/booking`); // Clean up URL
    } else if (canceledParam === 'true') {
      setPaymentSuccess(false);
      setError('Payment was canceled. Please try again.');
      // router.replace(`/events/${eventId}/booking`); // Clean up URL
    }
  }, [searchParams, eventId]);

  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        try {
          setLoading(true)
          // Fetches event details to pass to the BookingFlow component
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

  // This function is called when the payment is successful in the BookingFlow component
  const handleBookingSuccess = (ticketId: string) => {
    // In the new flow, this is triggered by PaymentWrapper's redirection
    // The actual navigation to /my-tickets will happen after Stripe redirect verification
    setCurrentTicketId(ticketId);
    // The booking flow component will eventually move to confirmation step itself
  }

  // This function is called if the user cancels the booking process
  const handleBookingCancel = () => {
    router.push(`/events/${eventId}`)
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Event not found.</p>
      </div>
    )
  }

  if (paymentSuccess === true) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Your booking has been confirmed.</p>
        {currentTicketId && (
          <p className="text-gray-500 mt-2">Ticket ID: {currentTicketId}</p>
        )}
        <Button onClick={() => router.push(`/my-tickets?ticketId=${currentTicketId}`)} className="mt-4">
          View My Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* The BookingFlow component encapsulates the entire booking process.
        This includes ticket selection, applying promotions, and handling the Stripe payment.
      */}
      <BookingFlow
        event={event}
        onSuccess={handleBookingSuccess}
        onCancel={handleBookingCancel}
      />
    </div>
  )
}