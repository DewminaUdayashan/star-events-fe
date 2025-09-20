"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Gift, Loader2 } from 'lucide-react'
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints'
import { loyaltyService } from '@/lib/services/loyaltyService'

interface Event {
  id: string
  title: string
  price: number
  availableTickets: number
}

interface SimplifiedBookingProps {
  event: Event
}

/**
 * Simplified booking component demonstrating the exact calculation rule:
 * Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
 */
export function SimplifiedBookingWithLoyalty({ event }: SimplifiedBookingProps) {
  const { balance, redeemPoints, isLoading } = useLoyaltyPoints()
  
  // Booking state
  const [quantity, setQuantity] = useState(1)
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Calculations following the exact rule: Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed
  const unitPrice = event.price
  const subtotal = quantity * unitPrice // (Quantity × UnitPrice)
  const loyaltyDiscount = loyaltyPointsToRedeem // LoyaltyPointsRedeemed (1 point = LKR 1)
  const finalTotal = Math.max(0, subtotal - loyaltyDiscount) // Final calculation
  
  // Points user will earn after purchase (10% of final amount paid)
  const pointsToEarn = Math.floor(finalTotal * 0.10)
  
  // Maximum points that can be redeemed (up to 50% of subtotal)
  const maxRedeemablePoints = balance ? Math.min(
    balance.balance,
    Math.floor(subtotal * 0.5)
  ) : 0

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= event.availableTickets) {
      setQuantity(newQuantity)
      // Reset loyalty points when quantity changes
      setLoyaltyPointsToRedeem(0)
    }
  }

  const handleLoyaltyPointsChange = (points: number) => {
    const validPoints = Math.min(Math.max(0, points), maxRedeemablePoints)
    setLoyaltyPointsToRedeem(validPoints)
  }

  const handleBooking = async () => {
    setIsProcessing(true)
    try {
      // Step 1: Redeem loyalty points if any
      if (loyaltyPointsToRedeem > 0) {
        const redeemSuccess = await redeemPoints({
          points: loyaltyPointsToRedeem,
          description: `Redeemed for ${event.title} booking`
        })
        
        if (!redeemSuccess) {
          throw new Error('Failed to redeem loyalty points')
        }
      }

      // Step 2: Process payment for final total
      // In real implementation, this would integrate with payment processor
      console.log('Processing payment for final total:', finalTotal)
      
      // Step 3: Award new points after successful payment
      // This would be handled by the backend after payment confirmation
      console.log('Points to be awarded after payment:', pointsToEarn)
      
      alert(`Booking successful! Total paid: LKR ${finalTotal.toFixed(2)}`)
      
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
          <span className="text-gray-400">Loading...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Event Information */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Unit Price</span>
            <span className="text-white font-bold">LKR {unitPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Available Tickets</span>
            <span className="text-white">{event.availableTickets}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quantity Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Select Quantity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label className="text-gray-300">Quantity:</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-20 text-center bg-gray-900 border-gray-600 text-white"
                min={1}
                max={event.availableTickets}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= event.availableTickets}
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Points Section */}
      {balance && balance.balance > 0 && (
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

      {/* Price Calculation - Following Exact Rule */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Price Calculation</CardTitle>
          <p className="text-gray-400 text-sm">
            Formula: <code>Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed</code>
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">
                Quantity × UnitPrice ({quantity} × LKR {unitPrice.toFixed(2)})
              </span>
              <span className="text-white">LKR {subtotal.toFixed(2)}</span>
            </div>
            
            {loyaltyPointsToRedeem > 0 && (
              <div className="flex justify-between text-purple-400">
                <span>
                  Loyalty Points Redeemed ({loyaltyService.formatPoints(loyaltyPointsToRedeem)} pts)
                </span>
                <span>-LKR {loyaltyDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator className="bg-gray-600" />
            
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Final Total</span>
              <span className="text-green-400">LKR {finalTotal.toFixed(2)}</span>
            </div>
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
        </CardContent>
      </Card>

      {/* Book Button */}
      <Button
        onClick={handleBooking}
        disabled={isProcessing || quantity <= 0}
        className="w-full bg-purple-600 hover:bg-purple-700 py-3 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Book {quantity} Ticket{quantity > 1 ? 's' : ''} for LKR {finalTotal.toFixed(2)}
          </>
        )}
      </Button>

      {/* Calculation Summary */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="text-blue-400 font-medium mb-2">Calculation Summary</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>Formula:</strong> Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed</p>
              <p><strong>Calculation:</strong> {finalTotal.toFixed(2)} = ({quantity} × {unitPrice.toFixed(2)}) – {loyaltyDiscount.toFixed(2)}</p>
              <p><strong>Result:</strong> LKR {finalTotal.toFixed(2)} to pay</p>
              <p><strong>Points to earn:</strong> {pointsToEarn} points (10% of {finalTotal.toFixed(2)})</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Example usage component
export default function BookingPageExample() {
  const sampleEvent = {
    id: "event-1",
    title: "Rock Concert 2024",
    price: 5000,
    availableTickets: 100
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Event Booking with Loyalty Points
        </h1>
        <SimplifiedBookingWithLoyalty event={sampleEvent} />
      </div>
    </div>
  )
}
