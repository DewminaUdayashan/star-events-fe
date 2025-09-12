"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, Calendar, MapPin, ArrowLeft, Tag } from "lucide-react"
import { useCart } from "@/contexts/CartContext"

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [promoDiscount, setPromoDiscount] = useState(0)

  const applyPromoCode = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === "save10") {
      setPromoDiscount(total * 0.1)
      alert("Promo code applied! 10% discount")
    } else if (promoCode.toLowerCase() === "welcome") {
      setPromoDiscount(500)
      alert("Welcome discount applied! Rs. 500 off")
    } else {
      alert("Invalid promo code")
    }
  }

  const finalTotal = total - promoDiscount

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Link href="/events">
              <Button variant="ghost" className="text-gray-400 hover:text-white mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          </div>

          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Discover amazing events and add tickets to your cart</p>
            <Link href="/events">
              <Button className="bg-purple-600 hover:bg-purple-700">Browse Events</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/events">
              <Button variant="ghost" className="text-gray-400 hover:text-white mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          </div>
          <Badge variant="outline" className="border-purple-500 text-purple-400">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.eventId}-${item.ticketTypeId}`} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Event Image */}
                    <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.event.image || "/placeholder.svg"}
                        alt={item.event.title}
                        fill
                        className="object-cover"
                      />
                      {item.event.trending && (
                        <Badge className="absolute top-2 left-2 bg-red-600 text-xs">Trending</Badge>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{item.event.title}</h3>
                          <p className="text-purple-400 font-medium">{item.ticketType.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.eventId, item.ticketTypeId)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(item.event.date).toLocaleDateString()} at {item.event.time}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>
                            {item.event.venue}, {item.event.location}
                          </span>
                        </div>
                      </div>

                      {/* Ticket Benefits */}
                      {item.ticketType.benefits.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-1">Includes:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.ticketType.benefits.slice(0, 2).map((benefit, index) => (
                              <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {benefit}
                              </Badge>
                            ))}
                            {item.ticketType.benefits.length > 2 && (
                              <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                +{item.ticketType.benefits.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-600 bg-transparent"
                            onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-white">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-600 bg-transparent"
                            onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            Rs. {item.ticketType.price.toLocaleString()} × {item.quantity}
                          </p>
                          <p className="text-lg font-semibold text-white">
                            Rs. {(item.ticketType.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearCart}
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Promo Code */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Promo Code</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      className="border-gray-600 text-gray-400 hover:text-white bg-transparent"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({itemCount} items):</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount:</span>
                      <span>-Rs. {promoDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300">
                    <span>Service Fee:</span>
                    <span>Rs. 100</span>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total:</span>
                  <span>Rs. {(finalTotal + 100).toLocaleString()}</span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-xs text-gray-400 text-center">Secure checkout powered by SSL encryption</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
