"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ticketsService } from '@/lib/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Calendar, MapPin, User, QrCode } from 'lucide-react'
import Link from 'next/link'
import type { Ticket } from '@/lib/types/api'

export default function ValidateTicketPage() {
  const params = useParams()
  const ticketCode = params.code as string

  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateTicket = async () => {
      if (!ticketCode) {
        setError('No ticket code provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Call the validation service
        const validationResult = await ticketsService.validateTicket(ticketCode)
        
        if (validationResult.valid) {
          setIsValid(true)
          // If validation returns ticket data, set it
          if (validationResult.ticket) {
            setTicket(validationResult.ticket)
          }
        } else {
          setIsValid(false)
          setError('Invalid or expired ticket')
        }
      } catch (err) {
        console.error('Ticket validation error:', err)
        setIsValid(false)
        setError('Failed to validate ticket. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    validateTicket()
  }, [ticketCode])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Validating ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <QrCode className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Ticket Validation</h1>
            <p className="text-gray-400">Checking ticket: {ticketCode}</p>
          </div>

          <Card className="bg-gray-800 border-gray-700 rounded-3xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-2xl">
                {isValid === true ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                    <span className="text-green-400">Valid Ticket</span>
                  </>
                ) : isValid === false ? (
                  <>
                    <XCircle className="h-8 w-8 text-red-500 mr-3" />
                    <span className="text-red-400">Invalid Ticket</span>
                  </>
                ) : null}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isValid === true ? (
                <>
                  <Alert className="border-green-600 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      This ticket is valid and can be used for entry.
                    </AlertDescription>
                  </Alert>

                  {ticket && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-purple-400" />
                          <div>
                            <p className="text-sm text-gray-400">Ticket Number</p>
                            <p className="text-white font-medium">#{ticket.ticketNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <QrCode className="h-5 w-5 text-purple-400" />
                          <div>
                            <p className="text-sm text-gray-400">Quantity</p>
                            <p className="text-white font-medium">{ticket.quantity} ticket(s)</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-700 p-4 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-3">Event Details</h3>
                        <div className="space-y-2">
                          <p className="text-gray-300">
                            <span className="font-medium">Event ID:</span> {ticket.eventId}
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Purchase Date:</span>{' '}
                            {ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Total Amount:</span> Rs. {ticket.totalAmount?.toLocaleString() || '0'}
                          </p>
                          <p className="text-green-400">
                            <span className="font-medium">Status:</span> ✓ Paid
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : isValid === false ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error || 'This ticket is invalid, expired, or has already been used.'}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="text-center pt-6">
                <Link href="/events">
                  <Button className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
