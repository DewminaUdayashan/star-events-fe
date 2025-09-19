import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Here you can:
        // 1. Update your database
        // 2. Send confirmation emails
        // 3. Create tickets automatically
        // 4. Update booking status
        
        // Example: Extract metadata
        const eventId = paymentIntent.metadata.eventId
        const bookingRequests = paymentIntent.metadata.bookingRequests
        
        if (eventId && bookingRequests) {
          console.log('Processing booking for event:', eventId)
          // Process the booking here
          // await processBookingFromPayment(paymentIntent)
        }
        
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id)
        
        // Handle failed payment
        // - Send notification to user
        // - Log the failure
        // - Clean up any pending reservations
        
        break

      case 'payment_method.attached':
        const paymentMethod = event.data.object as Stripe.PaymentMethod
        console.log('Payment method attached:', paymentMethod.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Optional: Function to process booking from payment
async function processBookingFromPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { eventId, bookingRequests } = paymentIntent.metadata
    
    if (!bookingRequests) return
    
    const requests = JSON.parse(bookingRequests)
    
    // Here you would:
    // 1. Create tickets in your database
    // 2. Generate QR codes
    // 3. Send confirmation email
    // 4. Update inventory
    
    console.log('Processing', requests.length, 'booking requests for event', eventId)
    
    // Example implementation:
    // for (const request of requests) {
    //   await ticketsService.bookTicket(request)
    // }
    
  } catch (error) {
    console.error('Error processing booking from payment:', error)
  }
}
