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

  const generateQRCode = useCallback(async (ticketId: string) => {
    try {
      setLoading(true)
      setError(null)
      const blob = await ticketsService.getTicketQRCode(ticketId)
      const url = URL.createObjectURL(blob)
      setQrCodeUrl(url)
      return url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearQRCode = useCallback(() => {
    if (qrCodeUrl) {
      URL.revokeObjectURL(qrCodeUrl)
    }
    setQrCodeUrl(null)
    setError(null)
  }, [qrCodeUrl])

  return { qrCodeUrl, generateQRCode, clearQRCode, loading, error }
}
