"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Star, 
  Gift, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Coins
} from 'lucide-react'
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints'
import { loyaltyService } from '@/lib/services/loyaltyService'

interface LoyaltyPointsCardProps {
  purchaseAmount: number
  onPointsRedeemed: (points: number, discountValue: number) => void
  onPointsCleared: () => void
  disabled?: boolean
}

export function LoyaltyPointsCard({ 
  purchaseAmount, 
  onPointsRedeemed, 
  onPointsCleared,
  disabled = false 
}: LoyaltyPointsCardProps) {
  const { balance, isLoading, error } = useLoyaltyPoints()
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0)
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [hasRedeemed, setHasRedeemed] = useState(false)

  const maxRedeemablePoints = balance ? loyaltyService.getMaxRedeemablePoints(
    purchaseAmount, 
    balance.balance, 
    0.5 // Max 50% discount
  ) : 0

  const earnedPointsForPurchase = loyaltyService.calculateEarnedPoints(purchaseAmount)

  useEffect(() => {
    if (pointsToRedeem > 0 && balance) {
      const calculateDiscount = async () => {
        setIsCalculating(true)
        setRedeemError(null)

        try {
          const validation = loyaltyService.validateRedemption(
            pointsToRedeem, 
            balance.balance, 
            purchaseAmount
          )

          if (!validation.isValid) {
            setRedeemError(validation.error || 'Invalid redemption')
            setDiscountValue(0)
            return
          }

          const result = await loyaltyService.calculateDiscount(pointsToRedeem)
          if (result) {
            setDiscountValue(result.discountValue)
            setRedeemError(null)
          } else {
            setRedeemError('Failed to calculate discount')
            setDiscountValue(0)
          }
        } catch (err: any) {
          setRedeemError(err?.message || 'Failed to calculate discount')
          setDiscountValue(0)
        } finally {
          setIsCalculating(false)
        }
      }

      calculateDiscount()
    } else {
      setDiscountValue(0)
      setRedeemError(null)
    }
  }, [pointsToRedeem, balance?.balance, purchaseAmount])

  const handleRedeemPoints = () => {
    if (pointsToRedeem > 0 && discountValue > 0) {
      onPointsRedeemed(pointsToRedeem, discountValue)
      setHasRedeemed(true)
    }
  }

  const handleClearRedemption = () => {
    setPointsToRedeem(0)
    setDiscountValue(0)
    setRedeemError(null)
    setHasRedeemed(false)
    onPointsCleared()
  }

  const handleQuickSelect = (percentage: number) => {
    if (balance && maxRedeemablePoints > 0) {
      const points = Math.floor(maxRedeemablePoints * percentage)
      setPointsToRedeem(points)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
          <span className="text-gray-400">Loading loyalty points...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="py-6">
          <Alert className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Star className="h-5 w-5 text-yellow-400 mr-2" />
          Loyalty Points
        </CardTitle>
        <CardDescription className="text-gray-400">
          Use your loyalty points to get a discount on this purchase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center">
            <Coins className="h-4 w-4 text-yellow-400 mr-2" />
            <span className="text-gray-300">Available Points</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-400">
              {balance ? loyaltyService.formatPoints(balance.balance) : '0'}
            </div>
            <div className="text-sm text-gray-400">
              Worth {balance ? loyaltyService.formatCurrency(balance.discountValue) : 'LKR 0.00'}
            </div>
          </div>
        </div>

        {/* Points you'll earn */}
        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center">
            <Gift className="h-4 w-4 text-green-400 mr-2" />
            <span className="text-gray-300">Points you'll earn</span>
          </div>
          <div className="text-green-400 font-bold">
            +{loyaltyService.formatPoints(earnedPointsForPurchase)} points
          </div>
        </div>

        {balance && balance.balance > 0 && maxRedeemablePoints > 0 && !disabled && (
          <>
            <Separator className="bg-gray-600" />
            
            {/* Redemption Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="points-redeem" className="text-white">
                  Redeem Points for Discount
                </Label>
                <span className="text-sm text-gray-400">
                  Max: {loyaltyService.formatPoints(maxRedeemablePoints)}
                </span>
              </div>

              <div className="space-y-2">
                <Input
                  id="points-redeem"
                  type="number"
                  min="0"
                  max={maxRedeemablePoints}
                  value={pointsToRedeem || ''}
                  onChange={(e) => setPointsToRedeem(Number(e.target.value) || 0)}
                  placeholder="Enter points to redeem"
                  className="bg-gray-900 border-gray-600 text-white"
                  disabled={hasRedeemed}
                />

                {/* Quick select buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(0.25)}
                    disabled={hasRedeemed}
                    className="text-xs"
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(0.5)}
                    disabled={hasRedeemed}
                    className="text-xs"
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(1)}
                    disabled={hasRedeemed}
                    className="text-xs"
                  >
                    Max
                  </Button>
                </div>
              </div>

              {/* Error display */}
              {redeemError && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {redeemError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Discount preview */}
              {pointsToRedeem > 0 && discountValue > 0 && !redeemError && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Discount Value</span>
                    <span className="text-purple-400 font-bold">
                      -{loyaltyService.formatCurrency(discountValue)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {!hasRedeemed ? (
                  <Button
                    onClick={handleRedeemPoints}
                    disabled={
                      pointsToRedeem <= 0 || 
                      discountValue <= 0 || 
                      !!redeemError || 
                      isCalculating
                    }
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Gift className="mr-2 h-4 w-4" />
                        Apply {loyaltyService.formatPoints(pointsToRedeem)} Points
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <div className="flex-1 flex items-center justify-center p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-green-400 font-medium">
                        {loyaltyService.formatPoints(pointsToRedeem)} points applied
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleClearRedemption}
                      className="px-4"
                    >
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {balance && balance.balance === 0 && (
          <div className="text-center py-4 text-gray-400">
            <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No loyalty points available</p>
            <p className="text-sm">Start earning points with your purchases!</p>
          </div>
        )}

        {balance && balance.balance > 0 && maxRedeemablePoints === 0 && (
          <div className="text-center py-4 text-gray-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Points cannot be redeemed for this purchase</p>
            <p className="text-sm">Purchase amount too low for redemption</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
