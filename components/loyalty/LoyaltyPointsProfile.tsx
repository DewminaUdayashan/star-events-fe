"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Star, 
  Gift, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  History,
  Coins,
  Award
} from 'lucide-react'
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints'
import { loyaltyService } from '@/lib/services/loyaltyService'

export function LoyaltyPointsProfile() {
  const { balance, history, isLoading, error } = useLoyaltyPoints()

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 rounded-3xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
          <span className="text-gray-400">Loading loyalty points...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700 rounded-3xl">
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

  const recentTransactions = history?.history?.slice(0, 5) || []
  const totalEarned = history?.history?.filter(h => h.points > 0).reduce((sum, h) => sum + h.points, 0) || 0
  const totalRedeemed = history?.history?.filter(h => h.points < 0).reduce((sum, h) => sum + Math.abs(h.points), 0) || 0

  return (
    <div className="space-y-6">
      {/* Loyalty Points Overview */}
      <Card className="bg-gray-800 border-gray-700 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Star className="h-5 w-5 text-yellow-400 mr-2" />
            Loyalty Points
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your loyalty rewards and points history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="text-center p-6 bg-gradient-to-r from-purple-500/10 to-yellow-500/10 rounded-2xl border border-purple-500/20">
            <div className="flex items-center justify-center mb-2">
              <Coins className="h-8 w-8 text-yellow-400 mr-2" />
              <span className="text-3xl font-bold text-yellow-400">
                {balance ? loyaltyService.formatPoints(balance.balance) : '0'}
              </span>
            </div>
            <p className="text-gray-300 font-medium">Available Points</p>
            <p className="text-sm text-gray-400 mt-1">
              Worth {balance ? loyaltyService.formatCurrency(balance.discountValue) : 'LKR 0.00'} in discounts
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Earned</p>
                  <p className="text-xl font-bold text-green-400">
                    {loyaltyService.formatPoints(totalEarned)}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Redeemed</p>
                  <p className="text-xl font-bold text-purple-400">
                    {loyaltyService.formatPoints(totalRedeemed)}
                  </p>
                </div>
                <Gift className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Loyalty Tier (Future Enhancement) */}
          <div className="p-4 bg-gray-900 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <p className="text-white font-medium">Loyalty Status</p>
                  <p className="text-sm text-gray-400">
                    {balance && balance.balance >= 10000 ? 'Gold Member' : 
                     balance && balance.balance >= 5000 ? 'Silver Member' : 
                     balance && balance.balance >= 1000 ? 'Bronze Member' : 'New Member'}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                {balance && balance.balance >= 10000 ? 'GOLD' : 
                 balance && balance.balance >= 5000 ? 'SILVER' : 
                 balance && balance.balance >= 1000 ? 'BRONZE' : 'NEW'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-gray-800 border-gray-700 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <History className="h-5 w-5 text-gray-400 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your latest loyalty points transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.points > 0 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {transaction.points > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <Gift className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {transaction.type} {Math.abs(transaction.points)} points
                        </p>
                        <p className="text-sm text-gray-400 max-w-xs truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.earnedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.points > 0 ? 'text-green-400' : 'text-purple-400'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          transaction.points > 0 
                            ? 'border-green-500/20 text-green-400' 
                            : 'border-purple-500/20 text-purple-400'
                        }`}
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                  {index < recentTransactions.length - 1 && (
                    <Separator className="bg-gray-600" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-1">No loyalty points activity yet</p>
              <p className="text-sm text-gray-500">
                Start booking events to earn loyalty points!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="bg-gray-800 border-gray-700 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white">How Loyalty Points Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Earn Points</h4>
                  <p className="text-sm text-gray-400">
                    Get 10% of your ticket purchase as loyalty points (e.g., LKR 5000 ticket = 500 points)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Gift className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Redeem Points</h4>
                  <p className="text-sm text-gray-400">
                    Use points for discounts on future purchases (1 point = LKR 1 discount)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Award className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-1">Pro Tip</h4>
                <p className="text-sm text-gray-300">
                  Points can be redeemed for up to 50% of your ticket purchase value. Save up for bigger discounts!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
