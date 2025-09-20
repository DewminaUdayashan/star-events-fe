"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  ShoppingCart
} from 'lucide-react'
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints'
import { loyaltyService } from '@/lib/services/loyaltyService'

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  eventTime: string
  venue: {
    name: string
    location: string
  }
  prices: EventPrice[]
}

interface EventPrice {
  id: string
  category: string
  price: number
  stock: number
  isActive: boolean
}

interface StripeCheckoutSession {
  url: string
  sessionId: string
}

/**
 * Complete Stripe Booking Page with Correct Total Calculation
 * Formula: Final Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
 * Only passes FINAL TOTAL to Stripe, not individual quantities
 */
export default function CompleteStripeBookingPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  
  // State management
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<EventPrice | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0)
  const [currentStep, setCurrentStep] = useState<'select' | 'payment' | 'processing'>('select')
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

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        // Replace with actual API call
        const mockEvent: Event = {
          id: eventId,
          title: "Rock Concert 2024",
          description: "Amazing rock concert with top artists",
          eventDate: "2024-12-31",
          eventTime: "20:00",
          venue: {
            name: "Main Stadium",
            location: "Colombo, Sri Lanka"
          },
          prices: [
            {
              id: "price-1",
              category: "VIP",
              price: 4465,
              stock: 100,
              isActive: true
            },
            {
              id: "price-2", 
              category: "General",
              price: 2500,
              stock: 500,
              isActive: true
            }
          ]
        }
        setEvent(mockEvent)
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
   * ✅ STRIPE INTEGRATION - Creates checkout session with FINAL TOTAL only
   */
  const createStripeCheckoutSession = async (): Promise<StripeCheckoutSession> => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('User not authenticated')
    }

    console.log("=== STRIPE CHECKOUT SESSION CREATION ===")
    console.log("Event:", event?.title)
    console.log("Category:", selectedPrice?.category)
    console.log("Quantity:", quantity)
    console.log("Unit Price:", unitPrice, "LKR")
    console.log("Subtotal:", subtotal, "LKR")
    console.log("Loyalty Discount:", loyaltyDiscount, "LKR")
    console.log("Final Total:", finalTotal, "LKR")
    console.log("Final Total (cents):", finalTotal * 100)

    // ✅ Stripe Checkout Session - Only pass FINAL TOTAL
    const requestBody = {
      // Pass final total as single line item
      ticketId: `temp-${Date.now()}`, // Temporary ID for session
      eventTitle: event?.title || 'Event Ticket',
      description: `${quantity} × ${selectedPrice?.category} tickets`,
      finalAmount: finalTotal, // ✅ ONLY FINAL TOTAL
      currency: 'lkr',
      
      // Metadata for order tracking
      metadata: {
        eventId: eventId,
        priceId: selectedPrice?.id || '',
        quantity: quantity.toString(),
        unitPrice: unitPrice.toString(),
        loyaltyPointsUsed: loyaltyPointsToRedeem.toString(),
        subtotal: subtotal.toString(),
        discount: loyaltyDiscount.toString()
      }
    }

    console.log("Stripe request body:", JSON.stringify(requestBody, null, 2))

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
      throw new Error(errorData.message || 'Failed to create checkout session')
    }

    return await response.json()
  }

  /**
   * Handle booking and payment process
   */
  const handleProceedToPayment = async () => {
    if (!selectedPrice || !event) return
    
    try {
      setIsProcessingPayment(true)
      setError(null)
      
      // Step 1: Validate and redeem loyalty points if selected
      if (loyaltyPointsToRedeem > 0) {
        console.log("Redeeming loyalty points:", loyaltyPointsToRedeem)
        const redeemSuccess = await redeemPoints({
          Points: loyaltyPointsToRedeem,
          Description: `Redeemed for ${event.title} booking`
        })
        
        if (!redeemSuccess) {
          throw new Error('Failed to redeem loyalty points')
        }
      }
      
      // Step 2: Create Stripe checkout session with FINAL TOTAL
      console.log("Creating Stripe checkout session...")
      const session = await createStripeCheckoutSession()
      
      // Step 3: Redirect to Stripe Checkout
      console.log("Redirecting to Stripe:", session.url)
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

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 text-center">
        <p className="text-white">Event not found.</p>
        <Button onClick={() => router.push('/events')} className="mt-4">
          Browse Events
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
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

      <div className="max-w-4xl mx-auto px-4 py-8">
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
                    <span className="text-gray-300">{formatDate(event.eventDate)} at {event.eventTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{event.venue.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{event.venue.location}</span>
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
                {event.prices.map((price) => (
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
                    <span className="text-white text-xl font-medium px-4">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= selectedPrice.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loyalty Points Section */}
            {selectedPrice && balance && balance.balance > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    Loyalty Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available Points</span>
                    <span className="text-yellow-400 font-bold">
                      {loyaltyService.formatPoints(balance.balance)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Redeem Points (Max: {loyaltyService.formatPoints(maxRedeemablePoints)})
                    </Label>
                    <Input
                      type="number"
                      value={loyaltyPointsToRedeem}
                      onChange={(e) => handleLoyaltyPointsChange(Number(e.target.value))}
                      placeholder="Enter points to redeem"
                      className="bg-gray-900 border-gray-600 text-white"
                      min={0}
                      max={maxRedeemablePoints}
                    />
                    
                    {/* Quick select buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoyaltyPointsChange(Math.floor(maxRedeemablePoints * 0.25))}
                        className="text-xs"
                      >
                        25%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoyaltyPointsChange(Math.floor(maxRedeemablePoints * 0.5))}
                        className="text-xs"
                      >
                        50%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoyaltyPointsChange(maxRedeemablePoints)}
                        className="text-xs"
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {selectedPrice && (
            <div className="lg:col-span-1">
              <Card className="bg-gray-800 border-gray-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    <code className="text-purple-400">Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed</code>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Unit Price ({selectedPrice.category})
                      </span>
                      <span className="text-white">LKR {unitPrice.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity</span>
                      <span className="text-white">{quantity}</span>
                    </div>
                    
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-400">
                        Subtotal ({quantity} × {unitPrice.toLocaleString()})
                      </span>
                      <span className="text-white">LKR {subtotal.toLocaleString()}</span>
                    </div>
                    
                    {loyaltyPointsToRedeem > 0 && (
                      <div className="flex justify-between text-purple-400">
                        <span>
                          Loyalty Discount ({loyaltyService.formatPoints(loyaltyPointsToRedeem)} pts)
                        </span>
                        <span>-LKR {loyaltyDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <Separator className="bg-gray-600" />
                    
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">Total to Pay</span>
                      <span className="text-green-400">LKR {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Points to earn after purchase */}
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Gift className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-300 text-sm">Points you'll earn</span>
                      </div>
                      <span className="text-green-400 font-bold">
                        +{loyaltyService.formatPoints(pointsToEarn)}
                      </span>
                    </div>
                  </div>

                  {/* Calculation Verification */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-center">
                      <h4 className="text-blue-400 font-medium mb-2 text-sm">Calculation Check</h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        <p><strong>Formula:</strong> Total = (Q × UP) – LP</p>
                        <p><strong>Values:</strong> {finalTotal.toLocaleString()} = ({quantity} × {unitPrice.toLocaleString()}) – {loyaltyDiscount.toLocaleString()}</p>
                        <p><strong>Result:</strong> {finalTotal.toLocaleString()} = {subtotal.toLocaleString()} – {loyaltyDiscount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Payment Button */}
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={isProcessingPayment || loyaltyLoading || finalTotal <= 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 py-3"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay LKR {finalTotal.toLocaleString()} with Stripe
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-2">
                    Secure payment powered by Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
