import { apiClient } from "../api-client"
import type { ProcessPaymentRequest, Payment, PaginatedApiResponse } from "../types/api"
import { loadStripe } from '@stripe/stripe-js'


export interface PaymentResponse {
  success: boolean
  transactionId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentIntentId?: string
  clientSecret?: string
}

export interface StripeConfig {
  publishableKey: string
  clientSecret?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'paypal'
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  isDefault: boolean
}

export class PaymentService {
  private stripe: any = null
  private stripePromise: Promise<any> | null = null

  constructor() {
    this.initializeStripe()
  }

  private async initializeStripe() {
    if (typeof window !== 'undefined' && !this.stripePromise) {
      this.stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) => {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        if (!publishableKey) {
          throw new Error('Stripe publishable key not found')
        }
        return loadStripe(publishableKey)
      })
    }
    return this.stripePromise
  }

  async getStripeInstance() {
    if (!this.stripe) {
      this.stripe = await this.initializeStripe()
    }
    return this.stripe
  }

  // This is the corrected method. It now correctly calls the backend endpoint
  // that creates a payment intent using the ticketId.
  async createPaymentIntent(ticketId: string): Promise<{ clientSecret: string }> {
    return apiClient.post('/api/Payment/create-payment-intent', { ticketId });
  }

  async processPayment(data: ProcessPaymentRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>("/api/Payment/process", data)
  }

  async processStripePayment(ticketId: string, paymentMethodId: string): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>("/api/Payment/process", {
      ticketId,
      paymentMethod: 'stripe',
      stripeToken: paymentMethodId
    })
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>("/api/Payment/confirm", { paymentIntentId })
  }

  async getPaymentHistory(params?: { page?: number; pageSize?: number }): Promise<PaginatedApiResponse<Payment>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    
    const queryString = queryParams.toString()
    const url = queryString ? `/api/Payment/history?${queryString}` : "/api/Payment/history"
    
    return apiClient.get<PaginatedApiResponse<Payment>>(url)
  }

  async getPayment(id: string): Promise<Payment> {
    return apiClient.get<Payment>(`/api/Payment/${id}`)
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(`/api/Payment/${paymentId}/refund`, { amount })
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>("/api/Payment/methods")
  }

  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    return apiClient.post<PaymentMethod>("/api/Payment/methods", { paymentMethodId })
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    return apiClient.delete(`/api/Payment/methods/${paymentMethodId}`)
  }

  async handleWebhook(data: any): Promise<void> {
    return apiClient.post("/api/Payment/webhook", data)
  }

  // Stripe-specific methods
  async createStripePaymentMethod(cardElement: any): Promise<{ paymentMethodId: string }> {
    const stripe = await this.getStripeInstance()
    if (!stripe) throw new Error('Stripe not initialized')

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { paymentMethodId: paymentMethod.id }
  }

  async confirmStripePayment(clientSecret: string, paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    const stripe = await this.getStripeInstance()
    if (!stripe) throw new Error('Stripe not initialized')

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  async setupStripePaymentMethod(cardElement: any): Promise<{ setupIntentId: string }> {
    const stripe = await this.getStripeInstance()
    if (!stripe) throw new Error('Stripe not initialized')

    const { error, setupIntent } = await stripe.confirmCardSetup(
      // This would come from your backend
      'seti_1234567890',
      {
        payment_method: {
          card: cardElement,
        },
      }
    )

    if (error) {
      throw new Error(error.message)
    }

    return { setupIntentId: setupIntent.id }
  }
}

export const paymentService = new PaymentService()
