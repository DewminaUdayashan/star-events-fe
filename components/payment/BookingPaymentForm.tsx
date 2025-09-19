"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import type { BookTicketRequest } from '@/lib/types/api'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BookingPaymentFormProps {
  bookingRequests: BookTicketRequest[]
  totalAmount: number
  currency?: string
  onSuccess: () => void
  onError: (error: string) => void
  disabled?: boolean
}

function PaymentForm({ 
  bookingRequests, 
  totalAmount, 
  currency = 'LKR', 
  onSuccess, 
  onError, 
  disabled 
}: BookingPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!bookingRequests.length || totalAmount <= 0) {
        setError('Invalid booking data')
        setIsLoading(false)
        return
      }

      try {
        console.log('Creating payment intent with data:', {
          bookingRequests,
          totalAmount,
          currency
        })

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: bookingRequests[0]?.eventId,
            eventPriceId: bookingRequests[0]?.eventPriceId,
            quantity: bookingRequests.reduce((sum, req) => sum + req.quantity, 0),
            amount: totalAmount,
            bookingRequests: bookingRequests
          }),
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent')
        }

        if (!data.clientSecret) {
          throw new Error('No client secret received from server')
        }

        console.log('Payment intent created successfully:', data.paymentIntentId)
        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
        setError(null)
      } catch (err) {
        console.error('Failed to create payment intent:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment'
        setError(errorMessage)
        onError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [bookingRequests, totalAmount, currency, onError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setError('Stripe not loaded. Please refresh the page.')
      return
    }

    if (!clientSecret) {
      setError('Payment not initialized. Please refresh the page.')
      return
    }

    if (processing || disabled) return

    try {
      setProcessing(true)
      setError(null)

      console.log('Submitting payment elements...')
      
      // STEP 1: Submit the payment elements first (required by Stripe)
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        console.error('Elements submit error:', submitError)
        setError(submitError.message || 'Payment form validation failed')
        onError(submitError.message || 'Payment form validation failed')
        return
      }

      console.log('Elements submitted successfully, confirming payment with clientSecret:', clientSecret)

      // STEP 2: Confirm the payment with Stripe (after successful submit)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/events/${bookingRequests[0]?.eventId}/booking/success`,
        },
        redirect: 'if_required' // This prevents automatic redirect for successful payments
      })

      if (error) {
        console.error('Payment confirmation error:', error)
        setError(error.message || 'Payment failed')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent) {
        console.log('Payment confirmed:', paymentIntent)
        
        if (paymentIntent.status === 'succeeded') {
          console.log('Payment succeeded, calling onSuccess')
          onSuccess()
        } else {
          console.log('Payment status:', paymentIntent.status)
          setError(`Payment status: ${paymentIntent.status}`)
          onError(`Payment status: ${paymentIntent.status}`)
        }
      } else {
        setError('Payment confirmation failed')
        onError('Payment confirmation failed')
      }
    } catch (err) {
      console.error('Payment processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Preparing payment...</p>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to initialize payment. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-gray-700 p-6 rounded-2xl">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }}
        />
      </div>

      <div className="bg-gray-700 p-4 rounded-2xl">
        <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
          <span>Subtotal:</span>
          <span>Rs. {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
          <span>Processing Fee:</span>
          <span>Rs. 0</span>
        </div>
        <div className="border-t border-gray-600 pt-2">
          <div className="flex justify-between items-center text-white font-bold text-lg">
            <span>Total:</span>
            <span>Rs. {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 rounded-2xl"
        size="lg"
        disabled={!stripe || !elements || processing || disabled || isLoading}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Rs. {totalAmount.toLocaleString()}
          </>
        )}
      </Button>

      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>Powered by Stripe • Supports Apple Pay, Google Pay, and all major cards</p>
      </div>
    </form>
  )
}

export function BookingPaymentForm(props: BookingPaymentFormProps) {
  // Only create Elements options after we have the amount
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(props.totalAmount * 100), // Convert to cents
    currency: props.currency?.toLowerCase() || 'lkr',
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#7c3aed',
        colorBackground: '#374151',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '6px',
        borderRadius: '12px',
      },
    },
    // Remove paymentMethodCreation: 'manual' for the new flow
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  )
}