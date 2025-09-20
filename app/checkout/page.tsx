"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useTicketBooking } from '@/hooks/useTickets'
import { usePaymentProcessing } from '@/hooks/usePayments'
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints'
import { loyaltyService } from '@/lib/services/loyaltyService'
import { StripePaymentForm } from '@/components/payment/StripePaymentForm'
import { LoyaltyPointsCard } from '@/components/loyalty/LoyaltyPointsCard'
import type { CartItem } from '@/types/event'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const { bookTicket, applyPromotion, useLoyaltyPoints: applyLoyaltyPoints, loading: bookingLoading } = useTicketBooking()
  const { processPayment, loading: paymentLoading } = usePaymentProcessing()
  const { redeemPoints } = useLoyaltyPoints()

  const [currentStep, setCurrentStep] = useState<'review' | 'payment' | 'confirmation'>('review')
  const [discountCode, setDiscountCode] = useState('')
  const [loyaltyPointsRedeemed, setLoyaltyPointsRedeemed] = useState(0)
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0)
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null)
  const [billingInfo, setBillingInfo] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
    city: '',
    postalCode: '',
    country: 'Sri Lanka'
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ticketIds, setTicketIds] = useState<string[]>([])

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/events')
    }
  }, [cartItems, router])

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout')
    }
  }, [user, router])

  const calculateSubtotal = () => {
    // Subtotal = Quantity × UnitPrice for each item
    return cartItems.reduce((total, item) => total + (item.ticketType.price * item.quantity), 0)
  }

  const calculateDiscount = () => {
    return appliedDiscount ? appliedDiscount.amount : 0
  }

  const calculateTotal = () => {
    // Final calculation rule: Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
    const subtotal = calculateSubtotal() // (Quantity × UnitPrice)
    const discount = calculateDiscount() // Other promotional discounts
    return Math.max(0, subtotal - discount - loyaltyDiscount) // – LoyaltyPointsRedeemed
  }

  const calculateTotalDiscount = () => {
    return calculateDiscount() + loyaltyDiscount
  }

  const calculatePointsToEarn = () => {
    const paidAmount = calculateTotal()
    return loyaltyService.calculateEarnedPoints(paidAmount)
  }

  const handleLoyaltyPointsRedeemed = (points: number, discountValue: number) => {
    setLoyaltyPointsRedeemed(points)
    setLoyaltyDiscount(discountValue)
  }

  const handleLoyaltyPointsCleared = () => {
    setLoyaltyPointsRedeemed(0)
    setLoyaltyDiscount(0)
  }

  const handleQuantityChange = (itemKey: string, newQuantity: number) => {
    const [eventId, ticketTypeId] = itemKey.split('-')
    if (newQuantity <= 0) {
      removeItem(eventId, ticketTypeId)
    } else {
      updateQuantity(eventId, ticketTypeId, newQuantity)
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return

    try {
      // This would typically call an API to validate the discount code
      // For now, we'll simulate a 10% discount
      const discountAmount = calculateSubtotal() * 0.1
      setAppliedDiscount({ code: discountCode, amount: discountAmount })
      setError(null)
    } catch (err) {
      setError('Invalid discount code')
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
  }

  const handleProceedToPayment = () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }
    setCurrentStep('payment')
  }

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Calculate all the booking details
      const subtotal = calculateSubtotal()
      const totalDiscount = calculateTotalDiscount()
      const finalTotal = calculateTotal()
      const pointsToEarn = calculatePointsToEarn()
      
      // Get the first cart item for display (could be enhanced for multiple items)
      const firstItem = cartItems[0]
      
      // Store booking data in localStorage for the confirmation page
      const bookingData = {
        ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        subtotal: subtotal,
        totalDiscount: totalDiscount,
        finalTotal: finalTotal,
        pointsToEarn: pointsToEarn,
        loyaltyPointsRedeemed: loyaltyPointsRedeemed,
        loyaltyDiscount: loyaltyDiscount,
        appliedDiscount: appliedDiscount,
        quantity: cartItems.reduce((total, item) => total + item.quantity, 0),
        unitPrice: firstItem ? firstItem.ticketType.price : 0,
        eventTitle: firstItem ? firstItem.event.title : 'Event',
        category: firstItem ? firstItem.ticketType.name : 'General',
        eventDate: firstItem ? firstItem.event.eventDate : new Date().toISOString(),
        venueName: firstItem ? firstItem.event.venue?.name : 'Venue',
        paymentIntentId: paymentIntent.id || paymentIntent.payment_intent?.id,
        sessionId: paymentIntent.id || 'unknown',
        bookingDate: new Date().toISOString()
      }
      
      console.log('Storing booking data:', bookingData)
      localStorage.setItem('currentBookingData', JSON.stringify(bookingData))
      
      setCurrentStep('confirmation')
      setSuccess('Payment successful! Your tickets have been booked.')
      
      // Clear cart and redirect to booking confirmation
      setTimeout(() => {
        clearCart()
        router.push(`/booking-confirmation?success=true&session_id=${bookingData.sessionId}&ticketId=${bookingData.ticketId}`)
      }, 2000)
    } catch (err) {
      setError('Payment successful but failed to process tickets. Please contact support.')
    }
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some events to your cart to proceed with checkout</p>
          <Link href="/events">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/cart">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Checkout</h1>
                <p className="text-gray-400">Complete your ticket purchase</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Step {currentStep === 'review' ? '1' : currentStep === 'payment' ? '2' : '3'} of 3</p>
              <p className="text-white font-medium capitalize">{currentStep}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-400">{success}</AlertDescription>
              </Alert>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <>
                {/* Financial Summary Card */}
                <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Original Price</p>
                        <p className="text-white text-lg font-semibold">LKR {calculateSubtotal().toFixed(2)}</p>
                      </div>
                      {calculateTotalDiscount() > 0 && (
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Total Savings</p>
                          <p className="text-green-400 text-lg font-semibold">-LKR {calculateTotalDiscount().toFixed(2)}</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">You Pay</p>
                        <p className="text-purple-400 text-xl font-bold">LKR {calculateTotal().toFixed(2)}</p>
                      </div>
                    </div>
                    {calculatePointsToEarn() > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-gray-300 text-sm">
                            You'll earn <span className="font-semibold text-yellow-400">{calculatePointsToEarn().toLocaleString()} loyalty points</span> worth LKR {loyaltyService.calculateDiscountValue(calculatePointsToEarn()).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                    <CardDescription className="text-gray-400">
                      Review your selected events and tickets
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={`${item.eventId}-${item.ticketTypeId}`} className="flex items-center space-x-4 p-4 bg-gray-900 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{item.event.title}</h3>
                          <p className="text-gray-400 text-sm">{item.event.category}</p>
                          <p className="text-gray-400 text-sm">{formatDate(item.event.eventDate)}</p>
                          <p className="text-gray-400 text-sm">{item.event.venue?.name}</p>
                          <p className="text-gray-400 text-sm font-medium">{item.ticketType.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(`${item.eventId}-${item.ticketTypeId}`, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(`${item.eventId}-${item.ticketTypeId}`, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">LKR {(item.ticketType.price * item.quantity).toFixed(2)}</p>
                          <p className="text-gray-400 text-sm">LKR {item.ticketType.price.toFixed(2)} each</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.eventId, item.ticketTypeId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Promotions */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Gift className="h-5 w-5 mr-2" />
                      Promotions & Discounts
                    </CardTitle>
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
                          disabled={!!appliedDiscount}
                        />
                        {appliedDiscount ? (
                          <Button onClick={handleRemoveDiscount} variant="outline">
                            Remove
                          </Button>
                        ) : (
                          <Button onClick={handleApplyDiscount} variant="outline">
                            Apply
                          </Button>
                        )}
                      </div>
                      {appliedDiscount && (
                        <p className="text-green-400 text-sm">
                          Discount "{appliedDiscount.code}" applied: -LKR {appliedDiscount.amount.toFixed(2)}
                        </p>
                      )}
                    </div>

                  </CardContent>
                </Card>

                {/* Loyalty Points */}
                <LoyaltyPointsCard
                  purchaseAmount={calculateSubtotal()}
                  onPointsRedeemed={handleLoyaltyPointsRedeemed}
                  onPointsCleared={handleLoyaltyPointsCleared}
                  disabled={bookingLoading || paymentLoading}
                />

                {/* Billing Information */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Billing Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your contact and billing details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-300">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={billingInfo.fullName}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                          className="bg-gray-900 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={billingInfo.email}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-gray-900 border-gray-600 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                        <Input
                          id="phone"
                          value={billingInfo.phone}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-gray-900 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-300">City</Label>
                        <Input
                          id="city"
                          value={billingInfo.city}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, city: e.target.value }))}
                          className="bg-gray-900 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-300">Address</Label>
                      <Textarea
                        id="address"
                        value={billingInfo.address}
                        onChange={(e) => setBillingInfo(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-gray-900 border-gray-600 text-white"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Terms and Conditions */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                        className="mt-1"
                      />
                      <Label htmlFor="terms" className="text-gray-300 text-sm">
                        I agree to the{' '}
                        <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                          Privacy Policy
                        </Link>
                        . I understand that all sales are final and tickets are non-refundable.
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Complete your purchase securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StripePaymentForm
                    amount={calculateTotal()}
                    currency="LKR"
                    ticketId="checkout-session" // This would be generated after booking
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </CardContent>
              </Card>
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
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                  <p className="text-gray-400 mb-6">
                    Your tickets have been booked successfully. You will receive a confirmation email shortly.
                  </p>
                  <div className="space-y-2">
                    <Link href="/my-tickets">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        View My Tickets
                      </Button>
                    </Link>
                    <Link href="/events">
                      <Button variant="outline">
                        Browse More Events
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">LKR {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {/* Discounts Section */}
                  {(appliedDiscount || loyaltyDiscount > 0) && (
                    <>
                      {appliedDiscount && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Discount ({appliedDiscount.code})</span>
                          <span className="text-green-400">-LKR {appliedDiscount.amount.toFixed(2)}</span>
                        </div>
                      )}
                      {loyaltyDiscount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Loyalty Points ({loyaltyPointsRedeemed.toLocaleString()} pts)</span>
                          <span className="text-purple-400">-LKR {loyaltyDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Total Discount */}
                      {calculateTotalDiscount() > 0 && (
                        <div className="flex justify-between text-sm bg-green-900/20 px-2 py-1 rounded">
                          <span className="text-green-300 font-medium">Total Savings</span>
                          <span className="text-green-300 font-medium">-LKR {calculateTotalDiscount().toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <Separator className="bg-gray-700" />
                  
                  {/* Final Amount to Pay */}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">You Pay</span>
                    <span className="text-white">LKR {calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  {/* Loyalty Points to Earn */}
                  {calculatePointsToEarn() > 0 && (
                    <div className="bg-purple-900/20 px-3 py-2 rounded-lg border border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-300 text-sm font-medium">Points You'll Earn</span>
                        </div>
                        <span className="text-purple-300 font-bold">+{calculatePointsToEarn().toLocaleString()}</span>
                      </div>
                      <p className="text-purple-400 text-xs mt-1">
                        Worth LKR {loyaltyService.calculateDiscountValue(calculatePointsToEarn()).toFixed(2)} for future purchases
                      </p>
                    </div>
                  )}
                </div>

                {currentStep === 'review' && (
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!agreedToTerms || bookingLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <CreditCard className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}

                {currentStep === 'payment' && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => setCurrentStep('review')}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}