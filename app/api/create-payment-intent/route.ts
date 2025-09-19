import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const { eventId, eventPriceId, quantity, amount, bookingRequests } = await request.json()

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Convert amount to cents for Stripe (LKR requires multiplication by 100)
    const amountInCents = Math.round(amount * 100)

    console.log('Creating payment intent:', {
      amount: amountInCents,
      currency: 'lkr',
      eventId,
      bookingRequestsCount: bookingRequests?.length || 0
    })

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'lkr', // Sri Lankan Rupees
      metadata: {
        eventId: eventId,
        eventPriceId: eventPriceId || '',
        quantity: quantity?.toString() || '1',
        bookingRequests: JSON.stringify(bookingRequests || []),
        source: 'event-booking'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('Payment intent created:', paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
