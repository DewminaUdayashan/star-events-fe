import { apiClient } from "../api-client"
import type { ProcessPaymentRequest } from "../types/api"

export interface PaymentResponse {
  success: boolean
  transactionId: string
  amount: number
  currency: string
  status: string
}

export interface PaymentHistory {
  id: string
  ticketId: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  transactionId: string
  createdAt: string
}

export class PaymentService {
  async processPayment(data: ProcessPaymentRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>("/api/Payment/process", data)
  }

  async getPaymentHistory(): Promise<PaymentHistory[]> {
    return apiClient.get<PaymentHistory[]>("/api/Payment/history")
  }

  async getPayment(id: string): Promise<PaymentHistory> {
    return apiClient.get<PaymentHistory>(`/api/Payment/${id}`)
  }

  async handleWebhook(data: any): Promise<void> {
    return apiClient.post("/api/Payment/webhook", data)
  }
}

export const paymentService = new PaymentService()
