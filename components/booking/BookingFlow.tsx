"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Ticket, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Tag,
  Gift,
  Star,
  Loader2,
  AlertCircle,
  Minus,
  Plus
} from 'lucide-react'
import { useTicketBooking } from '@/hooks/useTickets'
import { StripePaymentForm } from '@/components/payment/StripePaymentForm'
import type { Event, EventPrice, CartItem, BookingSummary } from '@/lib/types/api'

interface BookingFlowProps {
  event: Event
  onSuccess: (ticketId: string) => void
  onCancel: () => void
}

type BookingStep = 'select' | 'promotions' | 'payment' | 'confirmation'

export function BookingFlow({ event, onSuccess, onCancel }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('select')
  const [selectedPrice, setSelectedPrice] = useState<EventPrice | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [discountCode, setDiscountCode] = useState('')
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false)
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending')
  const [error, setError] = useState<string | null>(null)

  const { bookTicket, applyPromotion, useLoyaltyPoints: useLoyaltyPointsAPI, loading } = useTicketBooking()

  // Calculate pricing
  const subtotal = selectedPrice ? selectedPrice.price * quantity : 0
  const discount = bookingSummary?.discount || 0
  const loyaltyDiscount = bookingSummary?.loyaltyPointsUsed || 0
  const total = subtotal - discount - loyaltyDiscount

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (selectedPrice?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  const handleSelectPrice = (price: EventPrice) => {
    setSelectedPrice(price)
    setQuantity(1)
  }

  const handleApplyPromotion = async () => {
    if (!ticketId || !discountCode) return

    try {
      const updatedTicket = await applyPromotion({
        ticketId,
        discountCode
      })
      
      // Update booking summary with new discount
      setBookingSummary(prev => prev ? {
        ...prev,
        discount: prev.discount + (subtotal - updatedTicket.totalAmount),
        appliedPromotion: {
          code: discountCode,
          discount: subtotal - updatedTicket.totalAmount,
          type: 'percentage' as const
        }
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply promotion')
    }
  }

  const handleUseLoyaltyPoints = async () => {
    if (!ticketId || loyaltyPoints <= 0) return

    try {
      const updatedTicket = await useLoyaltyPointsAPI({
        ticketId,
        points: loyaltyPoints
      })
      
      // Update booking summary with loyalty points used
      setBookingSummary(prev => prev ? {
        ...prev,
        loyaltyPointsUsed: loyaltyPoints,
        total: updatedTicket.totalAmount
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use loyalty points')
    }
  }

  const handleBookTicket = async () => {
    if (!selectedPrice) return

    try {
      const ticket = await bookTicket({
        eventId: event.id,
        eventPriceId: selectedPrice.id,
        quantity,
        discountCode: discountCode || undefined,
        useLoyaltyPoints
      })

      setTicketId(ticket.id)
      setBookingSummary({
        items: [{
          eventId: event.id,
          eventPriceId: selectedPrice.id,
          quantity,
          price: selectedPrice.price,
          eventTitle: event.title || '',
          eventDate: event.eventDate,
          venueName: event.venue?.name || '',
          category: selectedPrice.category || 'General'
        }],
        subtotal,
        discount: 0,
        loyaltyPointsUsed: 0,
        loyaltyPointsEarned: Math.floor(subtotal * 0.01), // 1% of subtotal
        total: subtotal
      })

      setCurrentStep('promotions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book ticket')
    }
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentStatus('success')
    setCurrentStep('confirmation')
    setTimeout(() => {
      onSuccess(ticketId!)
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error')
    setError(error)
  }

  const renderStepIndicator = () => {
    const steps = [
      { key: 'select', label: 'Select Tickets', icon: Ticket },
      { key: 'promotions', label: 'Promotions', icon: Gift },
      { key: 'payment', label: 'Payment', icon: CreditCard },
      { key: 'confirmation', label: 'Confirmation', icon: CheckCircle }
    ]

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.key
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index

          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isCompleted 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : isActive 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-gray-800 border-gray-600 text-gray-400'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-600 mx-4" />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderSelectStep = () => (
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
              <span className="text-gray-300">{formatDate(event.eventDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{event.venue?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{event.category}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Select Ticket Type</CardTitle>
          <CardDescription className="text-gray-400">
            Choose your preferred ticket category
          </CardDescription>
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
              onClick={() => handleSelectPrice(price)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{price.category}</h3>
                  <p className="text-gray-400 text-sm">
                    {price.stock} tickets available
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    LKR {price.price.toFixed(2)}
                  </p>
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
            <CardTitle className="text-white">Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-white text-lg font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= selectedPrice.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right">
                <p className="text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">
                  LKR {(selectedPrice.price * quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleBookTicket}
          disabled={!selectedPrice || loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              Continue to Promotions
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderPromotionsStep = () => (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Promotions & Loyalty Points</CardTitle>
          <CardDescription className="text-gray-400">
            Apply discount codes or use loyalty points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Discount Code */}
          <div className="space-y-2">
            <Label className="text-gray-300">Discount Code</Label>
            <div className="flex space-x-2">
              <Input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter discount code"
                className="bg-gray-900 border-gray-600 text-white"
              />
              <Button
                onClick={handleApplyPromotion}
                disabled={!discountCode || loading}
                variant="outline"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Loyalty Points */}
          <div className="space-y-2">
            <Label className="text-gray-300">Loyalty Points</Label>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-300">Available: 1,250 points</span>
            </div>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={loyaltyPoints}
                onChange={(e) => setLoyaltyPoints(Number(e.target.value))}
                placeholder="Enter points to use"
                className="bg-gray-900 border-gray-600 text-white"
                max={1250}
              />
              <Button
                onClick={handleUseLoyaltyPoints}
                disabled={loyaltyPoints <= 0 || loading}
                variant="outline"
              >
                Use Points
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Summary */}
      {bookingSummary && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">LKR {bookingSummary.subtotal.toFixed(2)}</span>
              </div>
              {bookingSummary.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-green-400">-LKR {bookingSummary.discount.toFixed(2)}</span>
                </div>
              )}
              {bookingSummary.loyaltyPointsUsed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Loyalty Points</span>
                  <span className="text-green-400">-LKR {bookingSummary.loyaltyPointsUsed.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">LKR {bookingSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('select')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep('payment')}
          disabled={!bookingSummary}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue to Payment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Payment</CardTitle>
          <CardDescription className="text-gray-400">
            Complete your purchase securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookingSummary && ticketId && (
            <StripePaymentForm
              amount={bookingSummary.total}
              currency="LKR"
              ticketId={ticketId}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('promotions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-gray-400">
          Your tickets have been successfully booked. You will receive a confirmation email shortly.
        </p>
      </div>

      {ticketId && (
        <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-gray-400">Ticket ID</p>
              <p className="text-white font-mono">{ticketId}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <Alert className="border-red-500 bg-red-500/10 mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {renderStepIndicator()}

      {currentStep === 'select' && renderSelectStep()}
      {currentStep === 'promotions' && renderPromotionsStep()}
      {currentStep === 'payment' && renderPaymentStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </div>
  )
}
