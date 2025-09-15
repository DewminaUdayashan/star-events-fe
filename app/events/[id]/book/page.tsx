'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PaymentWrapper } from '@/components/payment/PaymentWrapper';
import { QRCodeDisplay } from '@/components/tickets/QRCodeDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar, MapPin, Users, Loader2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  image?: string;
}

interface EventPrice {
  id: string;
  ticketType: string;
  price: number;
  availableQuantity: number;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  ticketCode: string;
  eventId: string;
  totalAmount: number;
  isPaid: boolean;
}

export default function BookEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [eventPrices, setEventPrices] = useState<EventPrice[]>([]);
  const [selectedPriceId, setSelectedPriceId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentStep, setCurrentStep] = useState<'booking' | 'payment' | 'confirmation'>('booking');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch event details
        const eventResponse = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!eventResponse.ok) {
          throw new Error('Event not found');
        }
        
        const eventData = await eventResponse.json();
        setEvent(eventData);
        
        // For now, create a default price structure
        // In a real app, this would come from the API
        setEventPrices([
          {
            id: '1',
            ticketType: 'General Admission',
            price: 2500, // LKR 25.00
            availableQuantity: 100
          },
          {
            id: '2',
            ticketType: 'VIP',
            price: 5000, // LKR 50.00
            availableQuantity: 50
          }
        ]);
        
        setSelectedPriceId('1'); // Default to first option
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const selectedPrice = eventPrices.find(p => p.id === selectedPriceId);
  const totalAmount = selectedPrice ? selectedPrice.price * quantity : 0;

  const handleBookTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/tickets/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: eventId,
          eventPriceId: selectedPriceId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book ticket');
      }

      const ticketData = await response.json();
      setTicket(ticketData.data);
      setCurrentStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book ticket');
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setCurrentStep('confirmation');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading event details...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && currentStep === 'booking') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => router.back()} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => {
            if (currentStep === 'booking') {
              router.back();
            } else if (currentStep === 'payment') {
              setCurrentStep('booking');
            }
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 'booking' ? 'Back to Events' : 'Back'}
        </Button>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(event.eventDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location || 'TBA'}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Available tickets
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        {currentStep === 'booking' && (
          <Card>
            <CardHeader>
              <CardTitle>Book Your Tickets</CardTitle>
              <CardDescription>Select ticket type and quantity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ticket Type Selection */}
              <div className="space-y-2">
                <Label>Ticket Type</Label>
                <div className="space-y-2">
                  {eventPrices.map((price) => (
                    <div key={price.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`price-${price.id}`}
                        name="ticketType"
                        value={price.id}
                        checked={selectedPriceId === price.id}
                        onChange={(e) => setSelectedPriceId(e.target.value)}
                        className="radio"
                      />
                      <label htmlFor={`price-${price.id}`} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{price.ticketType}</span>
                            <p className="text-sm text-gray-500">
                              {price.availableQuantity} available
                            </p>
                          </div>
                          <span className="font-bold">LKR {(price.price / 100).toFixed(2)}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedPrice?.availableQuantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              
              {/* Total */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-lg">
                    LKR {(totalAmount / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleBookTicket}
                disabled={!selectedPrice || quantity < 1}
                className="w-full"
              >
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {currentStep === 'payment' && ticket && (
          <PaymentWrapper
            ticketId={ticket.id}
            totalAmount={totalAmount}
            eventTitle={event.title}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        )}

        {/* Confirmation and QR Code */}
        {currentStep === 'confirmation' && ticket && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Payment Successful!</CardTitle>
                <CardDescription>
                  Your ticket has been confirmed. Here is your QR code:
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="flex justify-center">
              <QRCodeDisplay
                ticketId={ticket.id}
                eventTitle={event.title}
                ticketCode={ticket.ticketCode}
              />
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    A confirmation email has been sent to you with your ticket details.
                  </p>
                  <Button onClick={() => router.push('/my-tickets')} className="w-full">
                    View All My Tickets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
