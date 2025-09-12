"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CreditCard, Smartphone, Building, Shield, Calendar, Loader2 } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { paymentService, ticketsService } from "@/lib/services"
import type { ProcessPaymentRequest } from "@/lib/types/api"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, itemCount, clearCart } = useCart()
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.fullName?.split(" ")[0] || "",
    lastName: user?.fullName?.split(" ").slice(1).join(" ") || "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    agreeTerms: false,
  })

  const serviceFee = 100
  const finalTotal = total + serviceFee

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Pre-fill form with user data
    setFormData((prev) => ({
      ...prev,
      email: user.email || "",
      firstName: user.fullName?.split(" ")[0] || "",
      lastName: user.fullName?.split(" ").slice(1).join(" ") || "",
    }))
  }, [user, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.agreeTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    if (!user) {
      setError("Please login to complete the purchase")
      return
    }

    setIsProcessing(true)

    try {
      // Process each cart item
      for (const item of items) {
        // First, book the ticket
        const bookingRequest = {
          eventId: item.eventId,
          eventPriceId: item.ticketTypeId,
          quantity: item.quantity,
          useLoyaltyPoints: false,
        }

        const ticket = await ticketsService.bookTicket(bookingRequest)

        // Then process payment for the ticket
        const paymentRequest: ProcessPaymentRequest = {
          ticketId: ticket.id,
          paymentMethod: paymentMethod,
          stripeToken: paymentMethod === "card" ? `tok_${Date.now()}` : undefined, // Mock token
        }

        await paymentService.processPayment(paymentRequest)
      }

      // Clear cart and redirect to confirmation
      clearCart()
      router.push("/booking-confirmation")
    } catch (err) {
      console.error("Payment processing error:", err)
      setError("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Items to Checkout</h1>
          <p className="text-gray-400 mb-6">Your cart is empty. Add some tickets first.</p>
          <Link href="/events">
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-2xl">Browse Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/cart">
            <Button variant="ghost" className="text-gray-400 hover:text-white mr-4 rounded-2xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-500 bg-red-500/10 rounded-2xl">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {/* Contact Information */}
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white rounded-2xl"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white rounded-2xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white rounded-2xl"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-2xl">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <Label htmlFor="card" className="text-white flex-1">
                        Credit/Debit Card
                      </Label>
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="border-gray-600 text-gray-400 rounded-xl">
                          Visa
                        </Badge>
                        <Badge variant="outline" className="border-gray-600 text-gray-400 rounded-xl">
                          Mastercard
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-2xl opacity-50">
                      <RadioGroupItem value="mobile" id="mobile" disabled />
                      <Smartphone className="h-5 w-5 text-gray-400" />
                      <Label htmlFor="mobile" className="text-gray-400 flex-1">
                        Mobile Payment (eZCash, mCash)
                      </Label>
                      <Badge variant="outline" className="border-gray-600 text-gray-400 rounded-xl">
                        Coming Soon
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-2xl opacity-50">
                      <RadioGroupItem value="bank" id="bank" disabled />
                      <Building className="h-5 w-5 text-gray-400" />
                      <Label htmlFor="bank" className="text-gray-400 flex-1">
                        Bank Transfer
                      </Label>
                      <Badge variant="outline" className="border-gray-600 text-gray-400 rounded-xl">
                        Coming Soon
                      </Badge>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="cardNumber" className="text-gray-300">
                          Card Number
                        </Label>
                        <Input
                          id="cardNumber"
                          required
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white rounded-2xl"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-gray-300">
                            Expiry Date
                          </Label>
                          <Input
                            id="expiryDate"
                            required
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white rounded-2xl"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-gray-300">
                            CVV
                          </Label>
                          <Input
                            id="cvv"
                            required
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white rounded-2xl"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName" className="text-gray-300">
                          Name on Card
                        </Label>
                        <Input
                          id="cardName"
                          required
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white rounded-2xl"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card className="bg-gray-800 border-gray-700 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                      className="rounded-lg"
                    />
                    <div className="text-sm text-gray-300">
                      <Label htmlFor="terms" className="cursor-pointer">
                        I agree to the{" "}
                        <Link href="/terms" className="text-purple-400 hover:underline">
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-purple-400 hover:underline">
                          Privacy Policy
                        </Link>
                        . I understand that all ticket sales are final and non-refundable.
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700 sticky top-4 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.eventId}-${item.ticketTypeId}`} className="flex space-x-3">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                          <Image
                            src={item.event.image || "/placeholder.svg?height=64&width=64&query=event"}
                            alt={item.event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{item.event.title}</h4>
                          <p className="text-xs text-purple-400">{item.ticketType.name}</p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(item.event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                            <span className="text-sm font-medium text-white">
                              Rs. {(item.ticketType.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal ({itemCount} items):</span>
                      <span>Rs. {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Service Fee:</span>
                      <span>Rs. {serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Processing Fee:</span>
                      <span>Included</span>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span>Rs. {finalTotal.toLocaleString()}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 rounded-2xl"
                    size="lg"
                    disabled={isProcessing || !formData.agreeTerms}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      `Pay Rs. ${finalTotal.toLocaleString()}`
                    )}
                  </Button>

                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Secure SSL encrypted payment</span>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    <p>Your payment is processed securely through our payment gateway.</p>
                    <p className="mt-1">You will receive an email confirmation after successful payment.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
