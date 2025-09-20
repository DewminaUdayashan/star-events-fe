"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  CreditCard, 
  Ticket, 
  Calendar, 
  MapPin, 
  Users, 
  Gift, 
  Star,
  Loader2,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  ShoppingCart,
  Calculator
} from 'lucide-react'
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints'
import { loyaltyService } from '@/lib/services/loyaltyService'
import { eventsService } from '@/lib/services/events.service'
import type { Event, EventPrice } from '@/lib/types/api'

/**
 * ✅ STRIPE BOOKING PAGE - FINAL TOTAL ONLY
 * 
 * Formula: Final Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
 * Stripe Integration: Always quantity: 1, unit_amount: finalTotal * 100
 */
export default function StripeBookingPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const searchParams = useSearchParams()
  
  // State management
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<EventPrice | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  
  const { balance, redeemPoints, isLoading: loyaltyLoading } = useLoyaltyPoints()
  
  // ✅ CORRECT CALCULATION: Final Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
  const unitPrice = selectedPrice?.price || 0
  const subtotal = quantity * unitPrice                    // Quantity × UnitPrice
  const loyaltyDiscount = loyaltyPointsToRedeem           // LoyaltyPointsRedeemed (1 point = 1 LKR)
  const finalTotal = Math.max(0, subtotal - loyaltyDiscount) // Final Total = Subtotal - Discount
  
  // Points user will earn after purchase (10% of final amount paid)
  const pointsToEarn = Math.floor(finalTotal * 0.10)
  
  // Maximum points that can be redeemed (up to 50% of subtotal)
  const maxRedeemablePoints = balance ? Math.min(
    balance.balance,
    Math.floor(subtotal * 0.5)
  ) : 0

  // Handle URL parameters for payment success/failure
  useEffect(() => {
    const successParam = searchParams.get('success')
    const sessionId = searchParams.get('session_id')
    
    if (successParam === 'true' && sessionId) {
      // Payment successful - show confirmation
      setError(null)
      // You could fetch session details here if needed
    } else if (searchParams.get('canceled') === 'true') {
      setError('Payment was canceled. Please try again.')
    }
  }, [searchParams])

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        const eventData = await eventsService.getEventById(eventId)
        setEvent(eventData)
        setError(null)
      } catch (err) {
        setError('Failed to load event details')
      } finally {
        setLoading(false)
      }
    }
    
    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (selectedPrice?.stock || 0)) {
      setQuantity(newQuantity)
      // Reset loyalty points when quantity changes to recalculate limits
      setLoyaltyPointsToRedeem(0)
    }
  }

  const handleLoyaltyPointsChange = (points: number) => {
    const validPoints = Math.min(Math.max(0, points), maxRedeemablePoints)
    setLoyaltyPointsToRedeem(validPoints)
  }

  /**
   * ✅ STRIPE INTEGRATION - Create checkout session with FINAL TOTAL only
   */
  const createStripeCheckoutSession = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Please log in to continue')
    }

    console.log("=== STRIPE CHECKOUT SESSION CREATION ===")
    console.log("Event:", event?.title)
    console.log("Category:", selectedPrice?.category)
    console.log("Quantity:", quantity)
    console.log("Unit Price:", unitPrice, "LKR")
    console.log("Subtotal (Qty × Unit):", subtotal, "LKR")
    console.log("Loyalty Discount:", loyaltyDiscount, "LKR")
    console.log("Final Total:", finalTotal, "LKR")
    console.log("✅ Stripe will charge:", finalTotal, "LKR with quantity: 1")

    // Create request body with FINAL TOTAL only
    const requestBody = {
      eventTitle: event?.title || 'Event Ticket',
      description: `${quantity} × ${selectedPrice?.category} tickets for ${event?.title}`,
      finalAmount: finalTotal, // ✅ ONLY FINAL TOTAL - no individual quantities
      currency: 'lkr',
      
      // Store original order details in metadata for backend processing
      metadata: {
        eventId: eventId,
        priceId: selectedPrice?.id || '',
        quantity: quantity.toString(),
        unitPrice: unitPrice.toString(),
        loyaltyPointsUsed: loyaltyPointsToRedeem.toString(),
        subtotal: subtotal.toString(),
        discount: loyaltyDiscount.toString(),
        calculationFormula: `(${quantity} × ${unitPrice}) - ${loyaltyDiscount} = ${finalTotal}`
      }
    }

    console.log("Request body to backend:", JSON.stringify(requestBody, null, 2))

    // Call backend to create Stripe session
    const response = await fetch('/api/payment/create-stripe-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create payment session')
    }

    return await response.json()
  }

  /**
   * Handle the complete booking and payment process
   */
  const handleProceedToPayment = async () => {
    if (!selectedPrice || !event) return
    
    try {
      setIsProcessingPayment(true)
      setError(null)
      
      console.log("=== STARTING PAYMENT PROCESS ===")
      console.log("Final calculation check:")
      console.log(`  Subtotal: ${quantity} × ${unitPrice} = ${subtotal}`)
      console.log(`  Discount: ${loyaltyPointsToRedeem} points = ${loyaltyDiscount} LKR`)
      console.log(`  Final Total: ${subtotal} - ${loyaltyDiscount} = ${finalTotal}`)
      
      // Step 1: Redeem loyalty points if selected
      if (loyaltyPointsToRedeem > 0) {
        console.log("Step 1: Redeeming loyalty points...")
        const redeemSuccess = await redeemPoints({
          Points: loyaltyPointsToRedeem,
          Description: `Redeemed for ${event.title} booking (${quantity} tickets)`
        })
        
        if (!redeemSuccess) {
          throw new Error('Failed to redeem loyalty points. Please try again.')
        }
        console.log("✅ Loyalty points redeemed successfully")
      }
      
      // Step 2: Create Stripe checkout session with FINAL TOTAL
      console.log("Step 2: Creating Stripe checkout session...")
      const session = await createStripeCheckoutSession()
      
      console.log("✅ Stripe session created:", session.sessionId)
      console.log("Redirecting to Stripe Checkout...")
      
      // Step 3: Redirect to Stripe Checkout
      window.location.href = session.url
      
    } catch (err) {
      console.error('Payment process failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to process payment')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Loading state
  if (loading && !event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading event details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push('/events')} variant="outline">
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Event not found
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 text-center">
        <div className="max-w-md mx-auto">
          <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Event not found</h2>
          <p className="text-gray-400 mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/events')} className="bg-purple-600 hover:bg-purple-700">
            Browse Events
          </Button>
        </div>
      </div>
    )
  }

  // Payment success state
  if (searchParams.get('success') === 'true') {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-6">
                Your tickets have been booked successfully. You will receive a confirmation email shortly.
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-2">Order Summary</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Event: {event.title}</p>
                  <p>Amount Paid: LKR {finalTotal.toLocaleString()}</p>
                  <p>Loyalty Points Earned: {pointsToEarn.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/my-tickets')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  View My Tickets
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/events')}
                >
                  Browse More Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main booking interface
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push(`/events/${eventId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Book Tickets</h1>
              <p className="text-gray-400">{event.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <Alert className="border-red-500 bg-red-500/10 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{event.title}</CardTitle>
                <CardDescription className="text-gray-400">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {event.eventTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{event.venue?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{event.venue?.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Selection */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Select Ticket Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.prices?.map((price) => (
                  <div
                    key={price.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPrice?.id === price.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-600 bg-gray-900 hover:border-gray-500'
                    }`}
                    onClick={() => {
                      setSelectedPrice(price)
                      setQuantity(1)
                      setLoyaltyPointsToRedeem(0)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{price.category}</h3>
                        <p className="text-gray-400 text-sm">{price.stock} tickets available</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">LKR {price.price.toLocaleString()}</p>
                        <Badge variant={price.isActive ? "default" : "secondary"}>
                          {price.isActive ? 'Available' : 'Sold Out'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quantity Selection */}
            {selectedPrice && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Select Quantity</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose how many tickets you want to purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{quantity}</div>
                      <div className="text-sm text-gray-400">tickets</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= selectedPrice.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-900 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Subtotal</p>
                    <p className="text-xl font-bold text-white">
                      LKR {subtotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {quantity} × LKR {unitPrice.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loyalty Points Section */}
            {selectedPrice && balance && balance.balance > 0 && maxRedeemablePoints > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    Loyalty Points Discount
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Use your loyalty points to reduce the total cost
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-900 rounded-lg">
                    <span className="text-gray-400">Available Points</span>
                    <span className="text-yellow-400 font-bold">
                      {loyaltyService.formatPoints(balance.balance)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Points to Redeem (Max: {loyaltyService.formatPoints(maxRedeemablePoints)})
                    </Label>
                    <Input
                      type="number"
                      value={loyaltyPointsToRedeem || ''}
                      onChange={(e) => handleLoyaltyPointsChange(Number(e.target.value) || 0)}
                      placeholder="Enter points to redeem"
                      className="bg-gray-900 border-gray-600 text-white"
                      min={0}
                      max={maxRedeemablePoints}
                    />
                    
                    {/* Quick select buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoyaltyPointsChange(Math.floor(maxRedeemablePoints * 0.25))}
                        className="text-xs"
                      >
                        25% ({Math.floor(maxRedeemablePoints * 0.25).toLocaleString()})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoyaltyPointsChange(Math.floor(maxRedeemablePoints * 0.5))}
                        className="text-xs"
                      >
                        50% ({Math.floor(maxRedeemablePoints * 0.5).toLocaleString()})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoyaltyPointsChange(maxRedeemablePoints)}
                        className="text-xs"
                      >
                        Max ({maxRedeemablePoints.toLocaleString()})
                      </Button>
                    </div>
                  </div>

                  {loyaltyPointsToRedeem > 0 && (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300">Discount Value</span>
                        <span className="text-purple-400 font-bold">
                          -LKR {loyaltyDiscount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ✅ ORDER SUMMARY SIDEBAR - Shows correct calculation */}
          {selectedPrice && (
            <div className="lg:col-span-1">
              <Card className="bg-gray-800 border-gray-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    <code className="text-purple-400 text-xs">
                      Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
                    </code>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Detailed Price Breakdown */}
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900 rounded-lg">
                      <div className="text-center mb-2">
                        <h4 className="text-white font-medium">{selectedPrice.category} Tickets</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Unit Price</span>
                          <span className="text-white">LKR {unitPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quantity</span>
                          <span className="text-white">{quantity}</span>
                        </div>
                        <Separator className="bg-gray-600" />
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-300">Subtotal</span>
                          <span className="text-white">LKR {subtotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {loyaltyPointsToRedeem > 0 && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-300">Loyalty Points Used</span>
                            <span className="text-purple-400">{loyaltyService.formatPoints(loyaltyPointsToRedeem)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-purple-300">Discount Value</span>
                            <span className="text-purple-400">-LKR {loyaltyDiscount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Separator className="bg-gray-600" />
                    
                    {/* ✅ FINAL TOTAL - This is what Stripe will charge */}
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Total to Pay</span>
                        <span className="text-2xl font-bold text-green-400">
                          LKR {finalTotal.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-center">
                        This exact amount will be charged by Stripe
                      </p>
                    </div>
                  </div>

                  {/* Points to earn after purchase */}
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Gift className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-300 text-sm">You'll earn</span>
                      </div>
                      <span className="text-green-400 font-bold">
                        +{loyaltyService.formatPoints(pointsToEarn)} points
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      10% of amount paid (LKR {finalTotal.toLocaleString()})
                    </p>
                  </div>

                  {/* ✅ CALCULATION VERIFICATION */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calculator className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-blue-400 font-medium text-sm">Calculation Check</span>
                    </div>
                    <div className="text-xs text-gray-300 space-y-1">
                      <p><strong>Formula:</strong> Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed</p>
                      <p><strong>Calculation:</strong> {finalTotal.toLocaleString()} = ({quantity} × {unitPrice.toLocaleString()}) – {loyaltyDiscount.toLocaleString()}</p>
                      <p><strong>Verification:</strong> {finalTotal.toLocaleString()} = {subtotal.toLocaleString()} – {loyaltyDiscount.toLocaleString()}</p>
                      <p className="text-blue-400"><strong>✅ Stripe will charge: LKR {finalTotal.toLocaleString()}</strong></p>
                    </div>
                  </div>

                  {/* ✅ STRIPE PAYMENT BUTTON */}
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={
                      isProcessingPayment || 
                      loyaltyLoading || 
                      finalTotal <= 0 ||
                      !selectedPrice
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700 py-4 text-lg"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Payment Session...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay LKR {finalTotal.toLocaleString()} with Stripe
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      🔒 Secure payment powered by Stripe
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      You will be redirected to Stripe Checkout
                    </p>
                  </div>

                  {/* Payment Method Info */}
                  <div className="p-3 bg-gray-900 rounded-lg">
                    <h4 className="text-white font-medium text-sm mb-2">Payment Details</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Credit/Debit cards accepted</p>
                      <p>• Secure SSL encryption</p>
                      <p>• Instant confirmation</p>
                      <p>• Email receipt provided</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
