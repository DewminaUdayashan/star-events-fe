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
  Plus
} from 'lucide-react'
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints'
import { loyaltyService } from '@/lib/services/loyaltyService'
import { PaymentWrapper } from '@/components/payment/PaymentWrapper'

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

/**
 * Fixed Booking Page with Correct Total Calculation
 * Formula: Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
 */
export default function FixedBookingPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const searchParams = useSearchParams()
  
  // State management
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<EventPrice | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0)
  const [currentStep, setCurrentStep] = useState<'select' | 'payment' | 'confirmation'>('select')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)
  
  const { balance, redeemPoints, isLoading: loyaltyLoading } = useLoyaltyPoints()
  
  // ✅ CORRECT CALCULATION: Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
  const unitPrice = selectedPrice?.price || 0
  const subtotal = quantity * unitPrice                    // Quantity × UnitPrice
  const loyaltyDiscount = loyaltyPointsToRedeem           // LoyaltyPointsRedeemed (1 point = 1 LKR)
  const finalTotal = Math.max(0, subtotal - loyaltyDiscount) // Total = Subtotal - Discount
  
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

  const handleBookTicket = async () => {
    if (!selectedPrice) return
    
    try {
      setLoading(true)
      
      // Step 1: Create ticket booking
      // Replace with actual API call
      const mockTicketId = `ticket-${Date.now()}`
      setTicketId(mockTicketId)
      
      // Step 2: Redeem loyalty points if selected
      if (loyaltyPointsToRedeem > 0) {
        const redeemSuccess = await redeemPoints({
          Points: loyaltyPointsToRedeem,
          Description: `Redeemed for ${event?.title} booking`
        })
        
        if (!redeemSuccess) {
          throw new Error('Failed to redeem loyalty points')
        }
      }
      
      setCurrentStep('payment')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book ticket')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setCurrentStep('confirmation')
    // In real implementation, this would trigger points award on backend
    console.log('Payment successful, points to be awarded:', pointsToEarn)
  }

  const handlePaymentError = (error: string) => {
    setError(error)
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

        {currentStep === 'select' && (
          <div className="space-y-6">
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

            {/* ✅ CORRECT PRICE CALCULATION DISPLAY */}
            {selectedPrice && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Price Breakdown</CardTitle>
                  <CardDescription className="text-gray-400">
                    <code className="text-purple-400">Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed</code>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Unit Price ({selectedPrice.category})
                    </span>
                    <span className="text-white">LKR {unitPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Quantity × Unit Price ({quantity} × LKR {unitPrice.toLocaleString()})
                    </span>
                    <span className="text-white">LKR {subtotal.toLocaleString()}</span>
                  </div>
                  
                  {loyaltyPointsToRedeem > 0 && (
                    <div className="flex justify-between text-purple-400">
                      <span>
                        Loyalty Points Discount ({loyaltyService.formatPoints(loyaltyPointsToRedeem)} pts)
                      </span>
                      <span>-LKR {loyaltyDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Final Total</span>
                    <span className="text-green-400">LKR {finalTotal.toLocaleString()}</span>
                  </div>

                  {/* Points to earn after purchase */}
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Gift className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-300">Points you'll earn (10% of amount paid)</span>
                      </div>
                      <span className="text-green-400 font-bold">
                        +{loyaltyService.formatPoints(pointsToEarn)} points
                      </span>
                    </div>
                  </div>

                  {/* Calculation Summary */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-center">
                      <h4 className="text-blue-400 font-medium mb-2">Calculation Verification</h4>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><strong>Formula:</strong> Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed</p>
                        <p><strong>Calculation:</strong> {finalTotal.toLocaleString()} = ({quantity} × {unitPrice.toLocaleString()}) – {loyaltyDiscount.toLocaleString()}</p>
                        <p><strong>Verification:</strong> {finalTotal.toLocaleString()} = {subtotal.toLocaleString()} – {loyaltyDiscount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Book Button */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>
                Cancel
              </Button>
              <Button
                onClick={handleBookTicket}
                disabled={!selectedPrice || loading || loyaltyLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    Continue to Payment - LKR {finalTotal.toLocaleString()}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {currentStep === 'payment' && selectedPrice && ticketId && (
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Event</span>
                  <span className="text-white">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white">{selectedPrice.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Unit Price</span>
                  <span className="text-white">LKR {unitPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">LKR {subtotal.toLocaleString()}</span>
                </div>
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-purple-400">
                    <span>Loyalty Discount</span>
                    <span>-LKR {loyaltyDiscount.toLocaleString()}</span>
                  </div>
                )}
                <Separator className="bg-gray-600" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total to Pay</span>
                  <span className="text-green-400">LKR {finalTotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* ✅ FIXED PAYMENT WRAPPER - Passes correct values */}
            <PaymentWrapper
              ticketId={ticketId}
              unitPrice={unitPrice}           // Original unit price
              quantity={quantity}             // Actual quantity
              totalAmount={finalTotal}        // Final total after discount
              eventTitle={event.title}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        )}

        {/* Confirmation Step */}
        {currentStep === 'confirmation' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
              <p className="text-gray-400 mb-6">
                Your tickets have been booked successfully. You will receive a confirmation email shortly.
              </p>
              
              {/* Final Summary */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-2">Final Summary</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Amount Charged: LKR {finalTotal.toLocaleString()}</p>
                  <p>Loyalty Points Used: {loyaltyPointsToRedeem.toLocaleString()}</p>
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
        )}
      </div>
    </div>
  )
}
