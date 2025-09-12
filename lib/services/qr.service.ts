import { apiClient } from "../api-client"
import type { GenerateQrRequest } from "../types/api"

export interface QRCodeResponse {
  qrCodeUrl: string
  ticketCode: string
}

export class QRService {
  async generateQRCode(data: GenerateQrRequest): Promise<QRCodeResponse> {
    return apiClient.post<QRCodeResponse>("/api/Qr/generate", data)
  }

  async getQRCode(ticketCode: string): Promise<Blob> {
    return apiClient.get(`/api/Qr/${ticketCode}`, {
      responseType: "blob",
    })
  }

  async validateQRCode(ticketCode: string): Promise<{ valid: boolean; message: string }> {
    return apiClient.get(`/api/Qr/validate/${ticketCode}`)
  }
}

export const qrService = new QRService()
