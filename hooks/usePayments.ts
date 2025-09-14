import { useState, useEffect, useCallback } from 'react'
import { paymentService } from '@/lib/services/payment.service'
import type { Payment, ProcessPaymentRequest, PaginationParams } from '@/lib/types/api'

export function usePaymentHistory(params?: PaginationParams) {
  const [payments, setPayments] = useState<Payment[]>([])
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

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await paymentService.getPaymentHistory(params)
      setPayments(data.data)
      setPagination({
        totalCount: data.totalCount,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const refetch = useCallback(() => {
    fetchPayments()
  }, [fetchPayments])

  return { payments, loading, error, pagination, refetch }
}

export function usePayment(id: string) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayment = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await paymentService.getPayment(id)
      setPayment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPayment()
  }, [fetchPayment])

  const refetch = useCallback(() => {
    fetchPayment()
  }, [fetchPayment])

  return { payment, loading, error, refetch }
}

export function usePaymentProcessing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processPayment = useCallback(async (data: ProcessPaymentRequest) => {
    try {
      setLoading(true)
      setError(null)
      const result = await paymentService.processPayment(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const processStripePayment = useCallback(async (ticketId: string, paymentMethodId: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await paymentService.processStripePayment(ticketId, paymentMethodId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Stripe payment failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createPaymentIntent = useCallback(async (amount: number, currency: string = 'LKR') => {
    try {
      setLoading(true)
      setError(null)
      const result = await paymentService.createPaymentIntent(amount, currency)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmPayment = useCallback(async (paymentIntentId: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await paymentService.confirmPayment(paymentIntentId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment confirmation failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const refundPayment = useCallback(async (paymentId: string, amount?: number) => {
    try {
      setLoading(true)
      setError(null)
      const result = await paymentService.refundPayment(paymentId, amount)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Refund failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    processPayment,
    processStripePayment,
    createPaymentIntent,
    confirmPayment,
    refundPayment,
    loading,
    error
  }
}

export function useStripePayment() {
  const [stripe, setStripe] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await paymentService.getStripeInstance()
        setStripe(stripeInstance)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Stripe')
      }
    }

    initializeStripe()
  }, [])

  const createPaymentMethod = useCallback(async (cardElement: any) => {
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    try {
      setLoading(true)
      setError(null)
      const result = await paymentService.createStripePaymentMethod(cardElement)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment method'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [stripe])

  const confirmPayment = useCallback(async (clientSecret: string, paymentMethodId: string) => {
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    try {
      setLoading(true)
      setError(null)
      const result = await paymentService.confirmStripePayment(clientSecret, paymentMethodId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment confirmation failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [stripe])

  return {
    stripe,
    createPaymentMethod,
    confirmPayment,
    loading,
    error
  }
}
