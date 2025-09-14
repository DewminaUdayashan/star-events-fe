"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { useStripePayment } from '@/hooks/usePayments'
import { paymentService } from '@/lib/services/payment.service'

// Initialize Stripe with the publishable key from environment variables.
// Make sure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your .env.local file.
console.log("Stripe Publishable Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripePaymentFormProps {
  amount: number
  currency?: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  ticketId: string
  disabled?: boolean
}

function PaymentForm({ amount, currency = 'LKR', onSuccess, onError, ticketId, disabled }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { createPaymentMethod, confirmPayment, error: paymentHookError } = useStripePayment()
  
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If there is no ticketId, do not proceed.
    if (!ticketId) {
      console.warn("StripePaymentForm: ticketId is missing.");
      return;
    }

    // This function fetches the client_secret from your backend.
    // The client_secret is essential for Stripe to securely process the payment on the frontend.
    const createIntent = async () => {
      try {
        console.log(`Creating payment intent for ticketId: ${ticketId}`);
        // Use the centralized paymentService to make the API call to your C# backend.
        const response = await paymentService.createPaymentIntent(ticketId);
        if (response.clientSecret) {
          setClientSecret(response.clientSecret);
        } else {
          throw new Error("clientSecret was not received from the server.");
        }
      } catch (err) {
        console.error('Failed to initialize payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
        onError('Failed to initialize payment. Please try again.');
      }
    }

    createIntent()
  }, [ticketId, onError]) // Dependency array ensures this runs when ticketId is available.

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null);

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js has not yet loaded or clientSecret is not available.
      // Make sure to disable the form submission button until Stripe.js has loaded.
      setError("Payment system is not ready. Please wait a moment and try again.");
      return
    }

    setProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create a payment method using the card details entered by the user.
      const { paymentMethodId, error: createError } = await createPaymentMethod(cardElement);
      if(createError) throw new Error(createError);


      // Confirm the payment on the client side with the clientSecret.
      const { success, error: confirmError } = await confirmPayment(clientSecret, paymentMethodId);

      if (success) {
        console.log("Payment successful!");
        onSuccess({ paymentMethodId, clientSecret });
      } else {
        throw new Error(confirmError || 'Payment failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown payment error occurred.';
      console.error("Payment failed:", errorMessage);
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: '#1f2937',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Card Details</label>
        {/* The CardElement will not render if the clientSecret is not set, 
            which happens if the API call fails or the Stripe key is invalid. */}
        {clientSecret ? (
           <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
             <CardElement options={cardElementOptions} />
           </div>
        ) : (
          <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 flex items-center">
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             Initializing Secure Payment Form...
          </div>
        )}
      </div>

      {(error || paymentHookError) && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error || paymentHookError}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div>
          <p className="text-sm text-gray-400">Total Amount</p>
          <p className="text-2xl font-bold text-white">
            {currency} {amount.toFixed(2)}
          </p>
        </div>
        <CreditCard className="h-8 w-8 text-gray-400" />
      </div>

      <Button
        type="submit"
        disabled={!stripe || !clientSecret || processing || disabled}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {currency} {amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  )
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  // Options for the Stripe Elements provider
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(props.amount * 100), // Stripe expects the amount in the smallest currency unit (cents)
    currency: props.currency?.toLowerCase() || 'lkr',
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#7c3aed',
        colorBackground: '#1f2937',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  // The Elements provider wraps the payment form, giving it access to Stripe.
  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  )
}

// A helper component to display payment status
interface PaymentStatusProps {
  status: 'pending' | 'processing' | 'success' | 'error'
  message?: string
}

export function PaymentStatus({ status, message }: PaymentStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />
      case 'processing':
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      default:
        return <CreditCard className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-500/10'
      case 'error':
        return 'border-red-500 bg-red-500/10'
      case 'processing':
        return 'border-blue-500 bg-blue-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  return (
    <Alert className={getStatusColor()}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <AlertDescription className="text-white">
            {message || `Payment ${status}`}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
