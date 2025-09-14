'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface PaymentWrapperProps {
  ticketId: string;
  totalAmount: number;
  eventTitle: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentWrapper({
  ticketId,
  totalAmount,
  eventTitle,
  onPaymentSuccess,
  onPaymentError
}: PaymentWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setError("User not authenticated. Please log in to proceed with payment.");
          onPaymentError("User not authenticated");
          setIsLoading(false);
          return;
        }

        console.log("Creating checkout session for Ticket ID:", ticketId);

        const response = await fetch('http://localhost:5000/api/Payment/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticketId: ticketId
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error response:", errorData);
          throw new Error(errorData.message || 'Failed to create checkout session');
        }

        const data = await response.json();
        console.log("Checkout session created, redirecting to:", data.url);
        console.log("Attempting to save ticketId to localStorage:", ticketId);
        localStorage.setItem('currentBookingTicketId', ticketId);
        console.log("TicketId saved to localStorage. Value:", localStorage.getItem('currentBookingTicketId'));
        router.push(data.url); // Redirect to Stripe Checkout page

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize payment';
        console.error("Checkout session creation failed:", errorMsg);
        setError(errorMsg);
        onPaymentError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    createCheckoutSession();
  }, [ticketId, onPaymentError, router]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to payment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // This component will now only handle the redirection, no embedded form.
  return null;
}
