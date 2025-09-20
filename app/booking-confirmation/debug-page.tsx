"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Calendar, MapPin, Mail, Smartphone, Star, Gift, Coins, Receipt, AlertCircle, Loader2 } from "lucide-react"
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTicketQRCode } from '@/hooks/useTickets';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

export default function DebugBookingConfirmationPage() {
  const searchParams = useSearchParams();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loyaltyData, setLoyaltyData] = useState<any>({});
  const [isLoadingSessionData, setIsLoadingSessionData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { qrCodeUrl, generateQRCode, downloadQRCode, loading, ticketCode, paymentStatus } = useTicketQRCode();

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    const successParam = searchParams.get('success');
    
    setSessionId(sessionIdParam);
    
    const debugData = {
      urlParams: {
        sessionId: sessionIdParam,
        success: successParam,
        allParams: Object.fromEntries(searchParams.entries())
      },
      localStorage: {
        authToken: !!localStorage.getItem('auth_token'),
        currentBookingData: localStorage.getItem('currentBookingData'),
        currentBookingTicketId: localStorage.getItem('currentBookingTicketId'),
        currentBooking: localStorage.getItem('currentBooking')
      },
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(debugData);
    console.log("=== DEBUG INFO ===", debugData);
  }, [searchParams]);

  // Load actual booking data
  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setIsLoadingSessionData(true);
        console.log('=== LOADING BOOKING DATA ===');
        
        // Check localStorage first
        const storedBookingData = localStorage.getItem('currentBookingData');
        console.log('Stored booking data:', storedBookingData);
        
        if (storedBookingData) {
          try {
            const bookingInfo = JSON.parse(storedBookingData);
            console.log('Parsed booking data:', bookingInfo);
            
            setTicketId(bookingInfo.ticketId);
            setLoyaltyData(bookingInfo);
            
            setIsLoadingSessionData(false);
            return;
          } catch (parseErr) {
            console.error('Failed to parse stored booking data:', parseErr);
          }
        }

        // Fallback: Try to get data from session if available
        if (sessionId) {
          console.log('Fetching session data for:', sessionId);
          
          const token = localStorage.getItem('auth_token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          const response = await fetch(`http://localhost:5000/api/Payment/session-status/${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch session data: ${response.status}`);
          }

          const sessionData = await response.json();
          console.log('Session data received:', sessionData);

          if (sessionData.ticketId) {
            setTicketId(sessionData.ticketId);
            
            // For demo purposes, set some default data
            setLoyaltyData({
              ticketId: sessionData.ticketId,
              eventTitle: "Sample Event",
              category: "General",
              quantity: 1,
              unitPrice: 7500,
              subtotal: 7500,
              loyaltyPointsRedeemed: 0,
              loyaltyDiscount: 0,
              finalTotal: 7500,
              pointsToEarn: 750
            });
          }
        }
      } catch (err) {
        console.error('Failed to load booking data:', err);
        setError(`Failed to load booking details: ${err.message}`);
      } finally {
        setIsLoadingSessionData(false);
      }
    };

    loadBookingData();
  }, [sessionId]);

  // Generate QR code when ticketId is available
  useEffect(() => {
    if (ticketId && !loading) {
      generateQRCode(ticketId, sessionId || undefined).catch(console.error);
    }
  }, [ticketId, sessionId, generateQRCode, loading]);

  if (isLoadingSessionData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400">
              Your tickets have been successfully booked. Check your email for confirmation details.
            </p>
          </div>

          {error && (
            <Alert className="border-red-500 bg-red-500/10 mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Booking Details with REAL VALUES */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Booking Information */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Ticket Code</p>
                    <p className="text-white font-mono text-lg">{ticketCode || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Payment Status</p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-medium">Confirmed</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Event</p>
                    <p className="text-white">{loyaltyData.eventTitle || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="text-white">{loyaltyData.category || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Quantity</p>
                    <p className="text-white text-lg font-medium">{loyaltyData.quantity || '—'}</p>
                  </div>
                </div>

                {/* Financial Breakdown Section */}
                {loyaltyData.finalTotal > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-white font-medium mb-4 flex items-center">
                      <Coins className="h-4 w-4 mr-2 text-yellow-400" />
                      Financial Breakdown
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Subtotal */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white font-medium">
                          LKR {loyaltyData.subtotal ? loyaltyData.subtotal.toLocaleString() : '0'}.00
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 text-right -mt-1">
                        {loyaltyData.quantity || 0} tickets × LKR {loyaltyData.unitPrice ? loyaltyData.unitPrice.toLocaleString() : '0'}.00 each
                      </div>

                      {/* Redeemed Loyalty Points (only show if > 0) */}
                      {loyaltyData.loyaltyPointsRedeemed > 0 && (
                        <>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-2 text-purple-400" />
                              <span className="text-gray-400">Points Redeemed</span>
                            </div>
                            <span className="text-purple-400 font-medium">
                              - LKR {loyaltyData.loyaltyPointsRedeemed.toLocaleString()}.00
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 text-right -mt-1">
                            {loyaltyData.loyaltyPointsRedeemed.toLocaleString()} loyalty points used
                          </div>
                        </>
                      )}

                      <div className="border-t border-gray-600 pt-3">
                        {/* Final Total Amount */}
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-white">Total Amount</span>
                          <span className="text-xl font-bold text-green-400">
                            LKR {loyaltyData.finalTotal.toLocaleString()}.00
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 text-right mt-1">
                          Amount charged to your card
                        </div>
                      </div>

                      {/* Earned Loyalty Points */}
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Gift className="h-4 w-4 mr-2 text-green-400" />
                            <span className="text-green-300 font-medium">Points Earned</span>
                          </div>
                          <span className="text-green-400 font-bold text-lg">
                            +{loyaltyData.pointsToEarn ? loyaltyData.pointsToEarn.toLocaleString() : '0'} Points
                          </span>
                        </div>
                        <div className="text-xs text-green-300/80 text-right mt-1">
                          10% of LKR {loyaltyData.finalTotal.toLocaleString()}.00 paid
                        </div>
                      </div>

                      {/* Calculation Verification */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
                        <h4 className="text-blue-400 font-medium mb-2 text-sm">Calculation Verification</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                          <p><strong>Formula:</strong> Total = (Quantity × UnitPrice) – LoyaltyPointsRedeemed</p>
                          <p><strong>Values:</strong> {loyaltyData.finalTotal} = ({loyaltyData.quantity} × {loyaltyData.unitPrice}) – {loyaltyData.loyaltyPointsRedeemed}</p>
                          <p><strong>Result:</strong> {loyaltyData.finalTotal} = {loyaltyData.subtotal} – {loyaltyData.loyaltyPointsRedeemed}</p>
                          <p className="text-blue-400">
                            <strong>✅ Correct:</strong> {loyaltyData.finalTotal === (loyaltyData.subtotal - loyaltyData.loyaltyPointsRedeemed) ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-700">
                  <Badge className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Confirmed
                  </Badge>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    Payment Successful
                  </Badge>
                  {loyaltyData.pointsToEarn > 0 && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                      <Star className="h-3 w-3 mr-1" />
                      Points Awarded
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Debug Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Debug Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">URL Parameters</h4>
                  <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-auto">
                    {JSON.stringify(debugInfo.urlParams, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">localStorage Status</h4>
                  <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-auto">
                    {JSON.stringify(debugInfo.localStorage, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Loyalty Data</h4>
                  <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-auto">
                    {JSON.stringify(loyaltyData, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">QR Code Status</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Loading: {loading ? 'Yes' : 'No'}</p>
                    <p>Ticket Code: {ticketCode || 'None'}</p>
                    <p>Payment Status: {paymentStatus || 'Unknown'}</p>
                    <p>QR URL: {qrCodeUrl ? 'Generated' : 'None'}</p>
                    <p>Error: {error || 'None'}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    // Test data for development
                    const testData = {
                      ticketId: "test-123",
                      eventTitle: "Rock Concert 2024",
                      category: "VIP",
                      quantity: 2,
                      unitPrice: 4465,
                      subtotal: 8930,
                      loyaltyPointsRedeemed: 2000,
                      loyaltyDiscount: 2000,
                      finalTotal: 6930,
                      pointsToEarn: 693
                    };
                    setLoyaltyData(testData);
                    setTicketId(testData.ticketId);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Load Test Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* QR Code Display */}
          {qrCodeUrl && (
            <Card className="bg-gray-800 border-gray-700 mb-6 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Your Ticket QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                <div className="bg-white p-2 rounded-lg">
                  <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={async () => {
                if (ticketId) {
                  try {
                    const url = await downloadQRCode(ticketId);
                    if (url) {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `ticket-qrcode-${ticketCode || ticketId}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  } catch (err) {
                    console.error('Download failed:', err);
                    alert('Failed to download QR code. Please try again or contact support.');
                  }
                }
              }}
              disabled={!ticketId || loading}
            >
              {loading ? 'Downloading QR...' : 'Download Tickets'}
              <Download className="h-4 w-4 ml-2" />
            </Button>
            <Link href="/my-tickets" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:text-white bg-transparent"
              >
                View My Tickets
              </Button>
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@starevents.lk" className="text-purple-400 hover:underline">
                support@starevents.lk
              </a>
            </p>
            <Link href="/events">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Browse More Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
