// Enhanced QR service with comprehensive error handling and fixes
import { apiClient } from "../api-client"
import type { Ticket } from "../types/api"

export class QRFixService {
  // Enhanced QR code generation with better error handling
  async getQRCodeForTicket(ticketId: string): Promise<{ success: boolean; qrUrl?: string; ticketCode?: string; error?: string }> {
    try {
      console.log('🔍 Starting QR code generation for ticket:', ticketId)
      
      // Step 1: Verify ticket exists and user has access
      let ticket: any
      try {
        ticket = await apiClient.get(`/api/Tickets/${ticketId}`)
        console.log('✅ Ticket data:', ticket)
        ticket = ticket.data;
        // Handle both camelCase and PascalCase from API
        const isPaid = ticket.isPaid || ticket.IsPaid
        console.log('💳 Payment status check:', { 
          'ticket.isPaid': ticket.isPaid, 
          'ticket.IsPaid': ticket.IsPaid, 
          'computed isPaid': isPaid 
        })
        
        if (!isPaid) {
          console.warn('❌ Ticket payment check failed - ticket is not paid')
          return { success: false, error: 'Ticket is not paid yet. Please complete payment first.' }
        }
        
        console.log('✅ Ticket payment verified - proceeding with QR generation')
      } catch (ticketError: any) {
        console.error('❌ Failed to get ticket:', ticketError)
        if (ticketError.response?.status === 404) {
          return { success: false, error: 'Ticket not found' }
        }
        if (ticketError.response?.status === 403) {
          return { success: false, error: 'Access denied - you can only view your own tickets' }
        }
        if (ticketError.response?.status === 401) {
          return { success: false, error: 'Please log in to view your tickets' }
        }
        return { success: false, error: `Failed to get ticket: ${ticketError.message}` }
      }
      
      // Step 2: Check if ticket already has a QR code, if so, skip generation
      if (ticket.ticketCode && ticket.qrCodePath) {
        console.log('✅ Ticket already has QR code, using existing:', ticket.ticketCode)
        
        try {
          // Try to access the existing QR code directly with proper CORS handling
          const staticUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000'}/qrcodes/${ticket.ticketCode}.png`
          console.log('🔗 Using existing QR code URL:', staticUrl)
          
          const response = await fetch(staticUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Accept': 'image/png,image/*,*/*',
            }
          })
          
          if (response.ok) {
            const blob = await response.blob()
            const qrUrl = URL.createObjectURL(blob)
            console.log('✅ Existing QR code loaded successfully from static path')
            
            return { 
              success: true, 
              qrUrl, 
              ticketCode: ticket.ticketCode 
            }
          }
        } catch (existingError) {
          console.warn('⚠️ Existing QR code not accessible from static path, will try generation:', existingError)
        }
      }

      // Step 3: Try to generate/get QR code using the specific endpoint
      let qrResult: any
      try {
        qrResult = await apiClient.get(`/api/Tickets/${ticketId}/qrcode`)
        console.log('✅ QR result data:', qrResult)
        
        if (!qrResult.success) {
          console.warn('⚠️ QR generation returned success=false:', qrResult)
          return { success: false, error: qrResult.Message || 'QR code generation failed' }
        }
      } catch (qrError: any) {
        console.error('❌ QR generation failed:', qrError)
        if (qrError.response?.status === 403) {
          return { success: false, error: 'Access denied - you can only generate QR codes for your own tickets' }
        }
        return { success: false, error: `QR generation failed: ${qrError.message}` }
      }
      
      // Step 4: Get the actual QR image
      const ticketCode = qrResult.TicketCode || ticket.ticketCode
      if (!ticketCode) {
        return { success: false, error: 'No ticket code available for QR generation' }
      }
      
      try {
        console.log('🖼️ Fetching QR image for ticket code:', ticketCode)
        
        // Try multiple approaches to get the QR image
        let blob: any;
        
        // Approach 1: Try the QR controller endpoint
        try {
          blob = await apiClient.get(`/api/Qr/${ticketCode}`, {
            responseType: "blob",
          })
        } catch (qrApiError: any) {
          console.warn('QR API endpoint failed, trying direct static file access:', qrApiError)
          
          // Approach 2: Try direct static file access with proper CORS
          try {
            const staticUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000'}/qrcodes/${ticketCode}.png`
            console.log('🔗 Trying direct static file URL:', staticUrl)
            
            const response = await fetch(staticUrl, {
              method: 'GET',
              mode: 'cors',
              credentials: 'include',
              headers: {
                'Accept': 'image/png,image/*,*/*',
              }
            })
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            blob = await response.blob()
          } catch (staticError: any) {
            console.error('Static file access also failed:', staticError)
            throw qrApiError // Throw the original API error
          }
        }
        
        const qrUrl = URL.createObjectURL(blob)
        console.log('✅ QR code URL created successfully')
        
        return { 
          success: true, 
          qrUrl, 
          ticketCode 
        }
      } catch (imageError: any) {
        console.error('❌ Failed to get QR image:', imageError)
        if (imageError.response?.status === 404) {
          return { success: false, error: 'QR code image not found - it may not be generated yet' }
        }
        return { success: false, error: `Failed to get QR image: ${imageError.message}` }
      }
      
    } catch (error: any) {
      console.error('❌ Unexpected error in QR generation:', error)
      return { success: false, error: `Unexpected error: ${error.message}` }
    }
  }
  
  // Download QR code with proper error handling and CORS support
  async downloadQRCode(ticketId: string, ticketNumber?: string): Promise<void> {
    try {
      console.log('📥 Starting QR code download for ticket:', ticketId)
      
      // First, get the ticket data to find the QR code path
      let ticket: any
      try {
        ticket = await apiClient.get(`/api/Tickets/${ticketId}`)
        console.log('✅ Ticket data retrieved:', ticket)
      } catch (ticketError: any) {
        console.error('❌ Failed to get ticket data:', ticketError)
        throw new Error('Failed to retrieve ticket information')
      }
      
      // Handle both camelCase and PascalCase from API
      const isPaid = ticket.data.isPaid || ticket.dataIsPaid
      if (!isPaid) {
        throw new Error('Ticket is not paid yet. Please complete payment first.')
      }
      
      // Try to download QR code using multiple approaches
      let downloadSuccess = false
      let lastError: any = null
      
      // Approach 1: Use ticket's QR code path if available
      if (ticket.qrCodePath || ticket.ticketCode) {
        const ticketCode = ticket.ticketCode || ticket.qrCodePath?.split('/').pop()?.replace('.png', '')
        if (ticketCode) {
          try {
            console.log('🔗 Attempting direct download from /qrcodes/ path:', ticketCode)
            await this.downloadFromStaticPath(ticketCode, ticketNumber || ticketId.slice(0, 8))
            downloadSuccess = true
            console.log('✅ QR code downloaded successfully from static path')
          } catch (staticError: any) {
            console.warn('⚠️ Static path download failed:', staticError)
            lastError = staticError
          }
        }
      }
      
      // Approach 2: Use /api/Tickets/{id}/qrcode endpoint
      if (!downloadSuccess) {
        try {
          console.log('🔗 Attempting download from API endpoint')
          await this.downloadFromApiEndpoint(ticketId, ticketNumber || ticketId.slice(0, 8))
          downloadSuccess = true
          console.log('✅ QR code downloaded successfully from API endpoint')
        } catch (apiError: any) {
          console.warn('⚠️ API endpoint download failed:', apiError)
          lastError = apiError
        }
      }
      
      // Approach 3: Use /api/Qr/{ticketCode} endpoint
      if (!downloadSuccess && ticket.ticketCode) {
        try {
          console.log('🔗 Attempting download from QR API endpoint')
          await this.downloadFromQrApi(ticket.ticketCode, ticketNumber || ticketId.slice(0, 8))
          downloadSuccess = true
          console.log('✅ QR code downloaded successfully from QR API')
        } catch (qrApiError: any) {
          console.warn('⚠️ QR API download failed:', qrApiError)
          lastError = qrApiError
        }
      }
      
      if (!downloadSuccess) {
        throw new Error(`All download methods failed. Last error: ${lastError?.message || 'Unknown error'}`)
      }
      
    } catch (error: any) {
      console.error('❌ QR code download failed:', error)
      throw error
    }
  }

  // Download QR code from static /qrcodes/ path with CORS handling
  private async downloadFromStaticPath(ticketCode: string, filename: string): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000'
    const qrUrl = `${baseUrl}/qrcodes/${ticketCode}.png`
    
    console.log('🔗 Downloading from static URL:', qrUrl)
    
    try {
      // Use fetch with proper CORS headers
      const response = await fetch(qrUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'image/png,image/*,*/*',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Get the blob and create download
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      
      // Try to extract original filename from response headers
      const contentDisposition = response.headers.get('content-disposition')
      let originalFilename = `${ticketCode}.png`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          originalFilename = filenameMatch[1].replace(/['"]/g, '')
        }
      }
      
      // Use original filename if available, otherwise use provided filename
      const downloadFilename = originalFilename || (filename.endsWith('.png') ? filename : `${filename}.png`)
      
      // Create and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = downloadFilename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      
      console.log('✅ Download completed:', { originalFilename, downloadFilename, ticketCode })
      
    } catch (error: any) {
      console.error('❌ Static path download failed:', error)
      throw new Error(`Failed to download from static path: ${error.message}`)
    }
  }

  // Download QR code from /api/Tickets/{id}/qrcode endpoint
  private async downloadFromApiEndpoint(ticketId: string, filename: string): Promise<void> {
    try {
      console.log('🔗 Downloading from API endpoint:', `/api/Tickets/${ticketId}/qrcode`)
      
      const blob = await apiClient.get(`/api/Tickets/${ticketId}/qrcode`, {
        responseType: "blob",
      })
      
      // Create download
      const downloadUrl = URL.createObjectURL(blob as Blob)
      const downloadFilename = filename.endsWith('.png') ? filename : `${filename}.png`
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = downloadFilename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      
      console.log('✅ API endpoint download completed:', downloadFilename)
      
    } catch (error: any) {
      console.error('❌ API endpoint download failed:', error)
      throw new Error(`Failed to download from API endpoint: ${error.message}`)
    }
  }

  // Download QR code from /api/Qr/{ticketCode} endpoint
  private async downloadFromQrApi(ticketCode: string, filename: string): Promise<void> {
    try {
      console.log('🔗 Downloading from QR API:', `/api/Qr/${ticketCode}`)
      
      const blob = await apiClient.get(`/api/Qr/${ticketCode}`, {
        responseType: "blob",
      })
      
      // Create download
      const downloadUrl = URL.createObjectURL(blob as Blob)
      const downloadFilename = filename.endsWith('.png') ? filename : `${filename}.png`
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = downloadFilename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      
      console.log('✅ QR API download completed:', downloadFilename)
      
    } catch (error: any) {
      console.error('❌ QR API download failed:', error)
      throw new Error(`Failed to download from QR API: ${error.message}`)
    }
  }

  // Mark ticket as paid and automatically download QR code
  async markPaidAndDownloadQR(ticketId: string, ticketNumber?: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('💳 Marking ticket as paid:', ticketId)
      
      // Step 1: Mark ticket as paid
      const markPaidResponse = await apiClient.post('/api/Payment/mark-paid', {
        ticketId: ticketId
      })
      
      console.log('✅ Mark paid response:', markPaidResponse)
      
      // Check if the request was successful
      if (!markPaidResponse) {
        throw new Error('Failed to mark ticket as paid')
      }
      
      console.log('✅ Ticket marked as paid successfully')
      
      // Step 2: Wait a moment for the backend to process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 3: Automatically download the QR code
      console.log('📥 Auto-downloading QR code...')
      await this.downloadQRCode(ticketId, ticketNumber)
      
      return {
        success: true,
        message: 'Ticket marked as paid and QR code downloaded successfully!'
      }
      
    } catch (error: any) {
      console.error('❌ Failed to mark paid and download QR:', error)
      
      // If marking as paid succeeded but QR download failed, still report partial success
      if (error.message?.includes('Failed to generate QR code')) {
        return {
          success: false,
          message: 'Ticket marked as paid but QR code download failed. Please try downloading manually.'
        }
      }
      
      return {
        success: false,
        message: error.message || 'Failed to mark ticket as paid'
      }
    }
  }

  // Alternative method that fetches QR directly using the GET endpoint
  async markPaidAndDownloadQRDirect(ticketId: string, ticketNumber?: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('💳 Marking ticket as paid (direct method):', ticketId)
      
      // Step 1: Mark ticket as paid
      const markPaidResponse = await apiClient.post('/api/Payment/mark-paid', {
        ticketId: ticketId
      })
      
      console.log('✅ Mark paid response:', markPaidResponse)
      
      if (!markPaidResponse) {
        throw new Error('Failed to mark ticket as paid')
      }
      
      console.log('✅ Ticket marked as paid successfully')
      
      // Step 2: Wait a moment for the backend to process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Step 3: Download QR code using improved download method
      console.log('📥 Downloading QR code using improved method...')
      
      try {
        await this.downloadQRCode(ticketId, ticketNumber)
        
        console.log('✅ QR code downloaded successfully')
        
        return {
          success: true,
          message: 'Ticket marked as paid and QR code downloaded successfully!'
        }
        
      } catch (qrError: any) {
        console.error('❌ QR code download failed:', qrError)
        return {
          success: false,
          message: 'Ticket marked as paid but QR code download failed. Please try downloading manually.'
        }
      }
      
    } catch (error: any) {
      console.error('❌ Failed to mark paid:', error)
      return {
        success: false,
        message: error.message || 'Failed to mark ticket as paid'
      }
    }
  }

  // Public utility method to download QR code directly by ticket code
  async downloadQRCodeByTicketCode(ticketCode: string, filename?: string): Promise<void> {
    try {
      console.log('📥 Downloading QR code by ticket code:', ticketCode)
      
      const downloadFilename = filename || `qr-${ticketCode}`
      await this.downloadFromStaticPath(ticketCode, downloadFilename)
      
      console.log('✅ QR code download by ticket code completed')
      
    } catch (error: any) {
      console.error('❌ QR code download by ticket code failed:', error)
      throw new Error(`Failed to download QR code for ticket code ${ticketCode}: ${error.message}`)
    }
  }

  // Public utility method to check if QR code exists at static path
  async checkQRCodeExists(ticketCode: string): Promise<boolean> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000'
      const qrUrl = `${baseUrl}/qrcodes/${ticketCode}.png`
      
      const response = await fetch(qrUrl, {
        method: 'HEAD', // Only check headers, don't download
        mode: 'cors',
        credentials: 'include',
      })
      
      const exists = response.ok
      console.log(`🔍 QR code exists check for ${ticketCode}:`, exists)
      return exists
      
    } catch (error: any) {
      console.warn(`⚠️ QR code exists check failed for ${ticketCode}:`, error)
      return false
    }
  }
}

export const qrFixService = new QRFixService()
