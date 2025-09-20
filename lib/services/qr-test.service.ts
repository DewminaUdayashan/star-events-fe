// Temporary test service to debug QR code issues
import { apiClient } from "../api-client"

export class QRTestService {
  // Test the ticket QR endpoint with detailed logging
  async testTicketQRCode(ticketId: string) {
    try {
      console.log('Testing QR endpoint with ticket ID:', ticketId)
      
      // First check if we can get the ticket details
      try {
        const ticketResponse = await apiClient.get(`/api/Tickets/${ticketId}`)
        console.log('Ticket details response:', ticketResponse)
      } catch (ticketError) {
        console.error('Failed to get ticket details:', ticketError)
      }
      
      // Test the QR code generation endpoint
      const qrResponse = await apiClient.get(`/api/Tickets/${ticketId}/qrcode`)
      console.log('QR generation response:', qrResponse)
      
      return qrResponse
    } catch (error: any) {
      console.error('QR test failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      })
      throw error
    }
  }
  
  // Test QR image retrieval
  async testQRImage(ticketCode: string) {
    try {
      console.log('Testing QR image endpoint with ticket code:', ticketCode)
      
      const imageResponse = await apiClient.get(`/api/Qr/${ticketCode}`, {
        responseType: "blob",
      })
      
      console.log('QR image response:', {
        size: imageResponse.size,
        type: imageResponse.type
      })
      
      return imageResponse
    } catch (error: any) {
      console.error('QR image test failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      throw error
    }
  }
}

export const qrTestService = new QRTestService()
