'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface PaymentWrapperProps {
  ticketId: string;
  unitPrice: number;
  quantity: number;
  eventTitle: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentWrapper({
  ticketId,
  unitPrice,
  quantity,
  eventTitle,
  onPaymentSuccess,
  onPaymentError
}: PaymentWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter(); // Initialize useRouter
  const hasCalledRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    const createCheckoutSession = async () => {
      // Prevent duplicate calls
      if (hasCalledRef.current) {
        return;
      }
      hasCalledRef.current = true;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setError("User not authenticated. Please log in to proceed with payment.");
          onPaymentError("User not authenticated");
          setIsLoading(false);
          return;
        }

        console.log("=== STRIPE CHECKOUT SESSION DEBUG ===");
        console.log("Ticket ID:", ticketId);
        console.log("Event Title:", eventTitle);
        console.log("Unit Price:", unitPrice, "LKR (type:", typeof unitPrice, ")");
        console.log("Unit Amount (cents):", Math.round(Number(unitPrice) * 100), "cents");
        console.log("Quantity:", quantity, "(type:", typeof quantity, ")");
        console.log("Expected Stripe Total:", unitPrice * quantity, "LKR");
        console.log("✅  Stripe will calculate:", Math.round(Number(unitPrice) * 100), "cents ×", quantity, "=", Math.round(Number(unitPrice) * 100) * quantity, "cents");

        // Validation checks
        if (unitPrice <= 0) {
          throw new Error(`Invalid unit price: ${unitPrice}`);
        }
        if (quantity <= 0) {
          throw new Error(`Invalid quantity: ${quantity}`);
        }

        const requestBody = {
          ticketId: ticketId,
          ticketType: eventTitle || "Event Ticket",
          unitPrice: Math.round(Number(unitPrice) * 100), // Convert LKR to cents (smallest currency unit)
          quantity: Number(quantity)
        };

        console.log("Request body being sent:", JSON.stringify(requestBody, null, 2));

        const response = await fetch('http://localhost:5000/api/Payment/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
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
  }, [ticketId, unitPrice, quantity, eventTitle, onPaymentError, router]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-white">Processing Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting to payment...</span>
            </div>
          </div>
          <div className="text-sm text-gray-400 space-y-2">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-white font-medium">Payment Request Data:</p>
              <p>• Ticket Type: {eventTitle}</p>
              <p>• Unit Price: {Math.round(Number(unitPrice) * 100)} cents</p>
              <p>• Quantity: {quantity}</p>
              <p>• Currency: LKR</p>
            </div>
            <div className="bg-green-900/20 p-3 rounded border border-green-700">
              <p className="text-green-400 font-medium">Expected Stripe Checkout Total:</p>
              <p className="text-green-300">{Math.round(Number(unitPrice) * 100)} cents × {quantity} = {Math.round(Number(unitPrice) * 100) * quantity} cents</p>
              <p className="text-green-300">= LKR {(unitPrice * quantity).toFixed(2)}</p>
            </div>
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
