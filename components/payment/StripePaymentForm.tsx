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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { useStripePayment } from '@/hooks/usePayments'

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
  const { createPaymentMethod, confirmPayment, loading, error } = useStripePayment()
  
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent when component mounts
    const createIntent = async () => {
      try {
        const { clientSecret } = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency, ticketId })
        }).then(res => res.json())
        
        setClientSecret(clientSecret)
      } catch (err) {
        onError('Failed to initialize payment')
      }
    }

    createIntent()
  }, [amount, currency, ticketId, onError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create payment method
      const { paymentMethodId } = await createPaymentMethod(cardElement)

      // Confirm payment
      const { success, error: confirmError } = await confirmPayment(clientSecret, paymentMethodId)

      if (success) {
        onSuccess({ paymentMethodId, clientSecret })
      } else {
        onError(confirmError || 'Payment failed')
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed')
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
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '12px',
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
        <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <Alert className="border-red-500 bg-red-500/10">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
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
        disabled={!stripe || processing || disabled}
        className="w-full bg-purple-600 hover:bg-purple-700"
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
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(props.amount * 100), // Convert to cents
    currency: props.currency.toLowerCase(),
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

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  )
}

// Payment Status Component
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
