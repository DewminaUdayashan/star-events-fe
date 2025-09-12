import { apiClient } from "../api-client"
import type {
  Ticket,
  BookTicketRequest,
  ApplyPromotionRequest,
  UseLoyaltyPointsRequest,
  PaginatedResponse,
  PaginationParams,
} from "../types/api"

export class TicketsService {
  async bookTicket(data: BookTicketRequest): Promise<Ticket> {
    return apiClient.post<Ticket>("/api/Tickets/book", data)
  }

  async getTicket(id: string): Promise<Ticket> {
    return apiClient.get<Ticket>(`/api/Tickets/${id}`)
  }

  async getTicketHistory(params?: PaginationParams): Promise<PaginatedResponse<Ticket>> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `/api/Tickets/history?${queryString}` : "/api/Tickets/history"

    return apiClient.get<PaginatedResponse<Ticket>>(url)
  }

  async applyPromotion(data: ApplyPromotionRequest): Promise<Ticket> {
    return apiClient.post<Ticket>("/api/Tickets/promotions", data)
  }

  async useLoyaltyPoints(data: UseLoyaltyPointsRequest): Promise<Ticket> {
    return apiClient.post<Ticket>("/api/Tickets/loyalty-points", data)
  }

  async getTicketQRCode(id: string): Promise<Blob> {
    return apiClient.get(`/api/Tickets/${id}/qrcode`, {
      responseType: "blob",
    })
  }

  async validateTicket(ticketCode: string): Promise<{ valid: boolean; ticket?: Ticket }> {
    return apiClient.get(`/api/Tickets/validate/${ticketCode}`)
  }
}

export const ticketsService = new TicketsService()
