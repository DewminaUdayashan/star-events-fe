"use client"

import React, { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  QrCode, 
  Ticket, 
  Calendar, 
  MapPin, 
  User, 
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { useTicketQRCode } from '@/hooks/useTickets'
import type { Ticket as TicketType } from '@/lib/types/api'

interface QRCodeDisplayProps {
  ticket: TicketType
  showDetails?: boolean
  onValidate?: (isValid: boolean) => void
}

export function QRCodeDisplay({ ticket, showDetails = true, onValidate }: QRCodeDisplayProps) {
  const { qrCodeUrl, generateQRCode, clearQRCode, loading, error } = useTicketQRCode()
  const [qrData, setQrData] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (ticket.ticketCode) {
      setQrData(ticket.ticketCode)
    }
  }, [ticket.ticketCode])

  const handleGenerateQR = async () => {
    try {
      await generateQRCode(ticket.id)
    } catch (err) {
      console.error('Failed to generate QR code:', err)
    }
  }

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `ticket-${ticket.ticketNumber || ticket.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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

  const getStatusBadge = () => {
    if (ticket.isPaid) {
      return <Badge className="bg-green-600 text-white">Paid</Badge>
    }
    return <Badge variant="destructive">Unpaid</Badge>
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Ticket QR Code</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-gray-400">
          Show this QR code at the event entrance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex flex-col items-center space-y-4">
          {qrData ? (
            <div className="p-4 bg-white rounded-lg">
              <QRCode
                value={qrData}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-700 rounded-lg flex items-center justify-center">
              <QrCode className="h-12 w-12 text-gray-500" />
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleGenerateQR}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Generate QR
            </Button>
            
            {qrCodeUrl && (
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert className="border-red-500 bg-red-500/10">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Ticket Details */}
        {showDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Ticket className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Ticket Number:</span>
                  <span className="text-white font-mono">{ticket.ticketNumber || 'N/A'}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Customer:</span>
                  <span className="text-white">{ticket.customer?.fullName || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Event Date:</span>
                  <span className="text-white">{formatDate(ticket.event.eventDate)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Venue:</span>
                  <span className="text-white">{ticket.event.venue?.name || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Quantity:</span>
                  <span className="text-white ml-2">{ticket.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="text-white ml-2 font-semibold">
                    LKR {ticket.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Purchase Date:</span>
                  <span className="text-white ml-2">{formatDate(ticket.purchaseDate)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white ml-2">{ticket.eventPrice?.category || 'General'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Status */}
        {isValid !== null && (
          <Alert className={isValid ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}>
            {isValid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription className={isValid ? "text-green-400" : "text-red-400"}>
              {isValid ? 'Ticket is valid' : 'Ticket is invalid or expired'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// QR Code Scanner Component (for validation)
interface QRCodeScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function QRCodeScanner({ onScan, onError }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startScanning = () => {
    setIsScanning(true)
    setError(null)
    
    // This would integrate with a QR code scanner library
    // For now, we'll simulate the scanning process
    console.log('Starting QR code scan...')
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <QrCode className="h-5 w-5 text-purple-400" />
          <span>QR Code Scanner</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Scan a ticket QR code to validate entry
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
          {isScanning ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-white">Scanning for QR code...</p>
            </div>
          ) : (
            <div className="text-center">
              <QrCode className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Click to start scanning</p>
            </div>
          )}
        </div>

        {error && (
          <Alert className="border-red-500 bg-red-500/10">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={isScanning ? stopScanning : startScanning}
            className="flex-1"
            variant={isScanning ? "destructive" : "default"}
          >
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
