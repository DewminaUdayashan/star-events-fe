import { NextRequest, NextResponse } from 'next/server'

interface CreateStripeSessionRequest {
  eventTitle: string
  description?: string
  finalAmount: number
  currency: string
  metadata?: {
    eventId?: string
    priceId?: string
    quantity?: string
    unitPrice?: string
    loyaltyPointsUsed?: string
    subtotal?: string
    discount?: string
  }
}

interface CreateStripeSessionResponse {
  url: string
  sessionId: string
  success: boolean
  message: string
}

/**
 * API Route: Create Stripe Checkout Session
 * Forwards request to backend with FINAL TOTAL only
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateStripeSessionRequest = await request.json()
    
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    console.log('=== FRONTEND API ROUTE ===')
    console.log('Creating Stripe session for:', body.eventTitle)
    console.log('Final Amount:', body.finalAmount, body.currency)
    console.log('Metadata:', body.metadata)

    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/payment/create-stripe-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        eventTitle: body.eventTitle,
        description: body.description,
        finalAmount: body.finalAmount,
        currency: body.currency,
        metadata: body.metadata
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'Failed to create payment session' },
        { status: response.status }
      )
    }

    const sessionData: CreateStripeSessionResponse = await response.json()
    
    console.log('Stripe session created successfully:', sessionData.sessionId)
    console.log('Redirect URL:', sessionData.url)

    return NextResponse.json({
      url: sessionData.url,
      sessionId: sessionData.sessionId
    })

  } catch (error) {
    console.error('Frontend API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
