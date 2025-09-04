import { useState, useEffect, useCallback } from 'react'
import { ticketsService } from '@/lib/services/tickets.service'
import type { Ticket, BookTicketRequest, ApplyPromotionRequest, UseLoyaltyPointsRequest, PaginationParams } from '@/lib/types/api'


export function useTicketHistory(params?: PaginationParams) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ticketsService.getTicketHistory(params)
      setTickets(data.data)
      setPagination({
        totalCount: data.totalCount,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const refetch = useCallback(() => {
    fetchTickets()
  }, [fetchTickets])

  return { tickets, loading, error, pagination, refetch }
}

export function useTicket(id: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTicket = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await ticketsService.getTicket(id)
      setTicket(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  const refetch = useCallback(() => {
    fetchTicket()
  }, [fetchTicket])

  return { ticket, loading, error, refetch }
}

export function useTicketBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bookTicket = useCallback(async (data: BookTicketRequest) => {
    try {
      setLoading(true)
      setError(null)
      const ticket = await ticketsService.bookTicket(data)
      return ticket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book ticket'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const applyPromotion = useCallback(async (data: ApplyPromotionRequest) => {
    try {
      setLoading(true)
      setError(null)
      const ticket = await ticketsService.applyPromotion(data)
      return ticket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply promotion'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const useLoyaltyPoints = useCallback(async (data: UseLoyaltyPointsRequest) => {
    try {
      setLoading(true)
      setError(null)
      const ticket = await ticketsService.useLoyaltyPoints(data)
      return ticket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use loyalty points'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return { bookTicket, applyPromotion, useLoyaltyPoints, loading, error }
}

export function useTicketValidation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<{ valid: boolean; ticket?: Ticket } | null>(null)

  const validateTicket = useCallback(async (ticketCode: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await ticketsService.validateTicket(ticketCode)
      setValidationResult(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate ticket'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearValidation = useCallback(() => {
    setValidationResult(null)
    setError(null)
  }, [])

  return { validateTicket, validationResult, loading, error, clearValidation }
}

export function useTicketQRCode() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketCode, setTicketCode] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string>('pending')

  // Helper function to safely create blob URL
  const createBlobUrl = useCallback((data: any): string => {
    try {
      console.log('Creating blob URL from data:', {
        type: typeof data,
        isBlob: data instanceof Blob,
        isArrayBuffer: data instanceof ArrayBuffer,
        isUint8Array: data instanceof Uint8Array,
        constructor: data?.constructor?.name,
        size: data instanceof Blob ? data.size : (data instanceof ArrayBuffer ? data.byteLength : 'unknown'),
        keys: typeof data === 'object' && data !== null ? Object.keys(data) : 'not object'
      })
      
      // Check if data is already a Blob
      if (data instanceof Blob) {
        console.log('Data is already a Blob with size:', data.size, 'and type:', data.type)
        if (data.size === 0) {
          throw new Error('Received empty blob')
        }
        return URL.createObjectURL(data)
      }
      
      // If data is ArrayBuffer or Uint8Array, create blob
      if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        const size = data instanceof ArrayBuffer ? data.byteLength : data.length
        console.log('Data is ArrayBuffer/Uint8Array with size:', size)
        if (size === 0) {
          throw new Error('Received empty ArrayBuffer/Uint8Array')
        }
        const blob = new Blob([data], { type: 'image/png' })
        return URL.createObjectURL(blob)
      }
      
      // If data is base64 string, convert to blob
      if (typeof data === 'string') {
        console.log('Data is string with length:', data.length)
        if (data.length === 0) {
          throw new Error('Received empty string')
        }
        
        // Remove data URL prefix if present
        const base64Data = data.replace(/^data:image\/[a-z]+;base64,/, '')
        if (base64Data.length === 0) {
          throw new Error('Empty base64 data after prefix removal')
        }
        
        try {
          const binaryString = atob(base64Data)
          if (binaryString.length === 0) {
            throw new Error('Empty binary string after base64 decode')
          }
          
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const blob = new Blob([bytes], { type: 'image/png' })
          console.log('Created blob from base64 with size:', blob.size)
          return URL.createObjectURL(blob)
        } catch (base64Error) {
          console.warn('Failed to decode base64:', base64Error)
          throw new Error('Invalid base64 data: ' + (base64Error instanceof Error ? base64Error.message : 'Unknown error'))
        }
      }
      
      // If data has arrayBuffer method (like Response), it needs to be awaited first
      if (data && typeof data.arrayBuffer === 'function') {
        console.log('Data has arrayBuffer method - this should be awaited before calling createBlobUrl')
        throw new Error('Data with arrayBuffer method must be converted to ArrayBuffer first using await data.arrayBuffer()')
      }
      
      // Check if data is a JSON object that might contain blob data
      if (data && typeof data === 'object' && data !== null) {
        console.log('Data is object, checking for blob-related properties:', Object.keys(data))
        
        // Check for common blob-related properties
        if (data.data || data.blob || data.buffer || data.content) {
          const blobData = data.data || data.blob || data.buffer || data.content
          console.log('Found nested blob data, recursing with:', typeof blobData)
          return createBlobUrl(blobData)
        }
      }
      
      console.error('Unsupported data format:', {
        type: typeof data,
        constructor: data?.constructor?.name,
        isNull: data === null,
        isUndefined: data === undefined,
        sample: typeof data === 'string' ? data.substring(0, 100) : data
      })
      throw new Error(`Unsupported data format for blob creation: ${typeof data} (${data?.constructor?.name || 'unknown'})`)
    } catch (err) {
      console.error('Failed to create blob URL:', err)
      throw new Error('Failed to process QR code image data: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }, [])

  // Poll payment status until ticket is paid, with fallback to mark as paid
  const pollPaymentStatus = useCallback(async (ticketId: string, maxAttempts = 1): Promise<boolean> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await ticketsService.getPaymentStatus(ticketId)
        setPaymentStatus(status.paymentStatus)
        
        if (status.isPaid) {
          return true
        }
        
        // Wait 2 seconds before next poll
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (err) {
        console.warn(`Payment status poll attempt ${attempt + 1} failed:`, err)
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }
    
    // If polling failed, try to manually mark as paid as fallback
    try {
      console.log('Payment polling timed out, attempting to mark ticket as paid...')
      const markResult = await ticketsService.markPaid(ticketId)
      if (markResult.success && markResult.isPaid) {
        setPaymentStatus('Completed')
        return true
      }
    } catch (markError) {
      console.warn('Failed to mark ticket as paid:', markError)
    }
    
    return false
  }, [])

  const generateQRCode = useCallback(async (ticketId: string, sessionId?: string) => {
    try {
      setLoading(true)
      setError(null)

      // First, check if we have a session ID and poll payment status
      if (sessionId) {
        try {
          const sessionStatus = await ticketsService.getSessionStatus(sessionId)
          console.log('Session status:', sessionStatus)
        } catch (err) {
          console.warn('Failed to get session status:', err)
        }
      }

      // Poll payment status until ticket is paid
      const isPaid = await pollPaymentStatus(ticketId)
      if (!isPaid) {
        throw new Error("Payment not completed. Please try again.")
      }

      const ticketDetails = await ticketsService.getTicket(ticketId);
      if (!ticketDetails) {
        throw new Error("Ticket details not found.");
      }

      // Ensure QR is generated in backend first
      let genResult;
      try {
        genResult = await ticketsService.generateTicketQr(ticketId)
        console.log('QR generation result:', genResult)
      } catch (qrError) {
        console.warn('QR generation failed, trying force QR generation:', qrError)
        // Try force QR generation as fallback
        try {
          const forceResult = await ticketsService.forceQrGeneration(ticketId)
          console.log('Force QR generation result:', forceResult)
          if (forceResult.success) {
            genResult = { success: true, ticketCode: forceResult.ticketCode, qrCodePath: forceResult.qrCodePath }
          } else {
            throw new Error("Force QR generation also failed")
          }
        } catch (forceError) {
          console.warn('Force QR generation failed:', forceError)
          throw new Error("QR generation failed, but your payment is confirmed. Please contact support for your ticket.")
        }
      }
      
      const code = genResult.ticketCode || ticketDetails.ticketCode
      setTicketCode(code || null)

      if (code) {
        try {
          const imageData = await ticketsService.getQrImageByTicketCode(code)
          console.log('QR image data received:', typeof imageData, imageData instanceof Blob)
          const url = createBlobUrl(imageData)
          setQrCodeUrl(url)
          return url
        } catch (imageError) {
          console.warn('QR image fetch failed:', imageError)
          throw new Error("Payment confirmed, but QR code image unavailable. Please contact support.")
        }
      }

      throw new Error("Ticket code unavailable for QR generation.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pollPaymentStatus, createBlobUrl])

  const clearQRCode = useCallback(() => {
    if (qrCodeUrl) {
      try {
        URL.revokeObjectURL(qrCodeUrl)
      } catch (err) {
        console.warn('Failed to revoke object URL:', err)
      }
    }
    setQrCodeUrl(null)
    setError(null)
    setTicketCode(null)
  }, [qrCodeUrl])

  // Direct QR download using the specific endpoint (for manual download button)
  const downloadQRCode = useCallback(async (ticketId: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Attempting to download QR code for ticket:', ticketId)

      // Strategy 1: Try the specific QR endpoint first
      try {
        console.log('Trying specific QR endpoint...')
        const qrResult = await ticketsService.getTicketQRCode(ticketId)
        console.log('QR code result:', qrResult)
        
        // Handle different possible response formats
        const success = qrResult.success || qrResult.Success
        const ticketCodeFromResult = qrResult.ticketCode || qrResult.TicketCode
        
        if (success && ticketCodeFromResult) {
          console.log('Getting QR image for ticket code:', ticketCodeFromResult)
          try {
            const imageData = await ticketsService.getQrImageByTicketCode(ticketCodeFromResult)
            console.log('QR image data received:', typeof imageData, imageData instanceof Blob)
            const url = createBlobUrl(imageData)
            setQrCodeUrl(url)
            setTicketCode(ticketCodeFromResult)
            console.log('QR code URL created successfully')
            return url
          } catch (imageError) {
            console.warn('Failed to fetch QR image by ticket code:', imageError)
          }
        } else {
          console.warn('QR result missing success flag or ticket code:', qrResult)
        }
      } catch (specificError) {
        console.warn('Specific QR endpoint failed:', specificError)
      }

      // Strategy 2: Get ticket details and try direct download
      console.log('Trying to get ticket details...')
      const ticketDetails = await ticketsService.getTicket(ticketId);
      if (!ticketDetails) {
        throw new Error("Ticket details not found.");
      }

      // If ticket has a ticketCode, try to download QR directly
      if (ticketDetails.ticketCode) {
        console.log('Found ticket code in details:', ticketDetails.ticketCode)
        try {
          const imageData = await ticketsService.getQrImageByTicketCode(ticketDetails.ticketCode)
          console.log('Direct QR image data received:', typeof imageData, imageData instanceof Blob)
          const url = createBlobUrl(imageData)
          setQrCodeUrl(url)
          setTicketCode(ticketDetails.ticketCode)
          return url
        } catch (imageError) {
          console.warn('Direct QR download failed:', imageError)
        }
      }

      // Strategy 3: Try force QR generation
      console.log('Trying force QR generation...')
      try {
        const forceResult = await ticketsService.forceQrGeneration(ticketId)
        console.log('Force QR result:', forceResult)
        if (forceResult.success && forceResult.ticketCode) {
          const imageData = await ticketsService.getQrImageByTicketCode(forceResult.ticketCode)
          console.log('Force generated QR image data received:', typeof imageData, imageData instanceof Blob)
          const url = createBlobUrl(imageData)
          setQrCodeUrl(url)
          setTicketCode(forceResult.ticketCode)
          return url
        }
      } catch (forceError) {
        console.warn('Force QR generation failed:', forceError)
      }

      // Strategy 4: If all else fails, try normal generation flow
      console.log('Trying normal generation flow...')
      return await generateQRCode(ticketId)
    } catch (err) {
      console.error('All QR download strategies failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to download QR code'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [generateQRCode, createBlobUrl])

  // Additional helper function to retry QR download with exponential backoff
  const retryDownloadQRCode = useCallback(async (ticketId: string, maxRetries = 3) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`QR download attempt ${attempt + 1}/${maxRetries}`)
        return await downloadQRCode(ticketId)
      } catch (err) {
        console.warn(`QR download attempt ${attempt + 1} failed:`, err)
        if (attempt < maxRetries - 1) {
          // Exponential backoff: wait 2^attempt seconds
          const waitTime = Math.pow(2, attempt) * 1000
          console.log(`Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else {
          throw err
        }
      }
    }
  }, [downloadQRCode])

  return { 
    qrCodeUrl, 
    generateQRCode, 
    downloadQRCode, 
    retryDownloadQRCode,
    clearQRCode, 
    loading, 
    error, 
    ticketCode, 
    paymentStatus 
  }
}