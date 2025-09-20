// Utility functions for marking tickets as paid and downloading QR codes
import { qrFixService } from '@/lib/services/qr-fix.service'

/**
 * Programmatically mark a ticket as paid and automatically download its QR code
 * 
 * @param ticketId - The ID of the ticket to mark as paid
 * @param ticketNumber - Optional ticket number for better file naming
 * @returns Promise with success status and message
 * 
 * @example
 * ```typescript
 * import { markTicketPaidAndDownloadQR } from '@/lib/utils/mark-paid-utils'
 * 
 * // Basic usage
 * const result = await markTicketPaidAndDownloadQR('ticket-id-123')
 * 
 * // With ticket number for better file naming
 * const result = await markTicketPaidAndDownloadQR('ticket-id-123', 'TKT-2024-001')
 * 
 * if (result.success) {
 *   console.log('Success:', result.message)
 * } else {
 *   console.error('Failed:', result.message)
 * }
 * ```
 */
export async function markTicketPaidAndDownloadQR(
  ticketId: string, 
  ticketNumber?: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🎫 Starting mark-paid and download process for ticket:', ticketId)
    
    const result = await qrFixService.markPaidAndDownloadQRDirect(ticketId, ticketNumber)
    
    if (result.success) {
      console.log('✅ Mark-paid and download completed successfully')
    } else {
      console.warn('⚠️ Mark-paid and download completed with issues:', result.message)
    }
    
    return result
  } catch (error: any) {
    const errorMessage = `Failed to mark ticket as paid and download QR: ${error.message}`
    console.error('❌', errorMessage)
    
    return {
      success: false,
      message: errorMessage
    }
  }
}

/**
 * Mark multiple tickets as paid and download their QR codes
 * 
 * @param tickets - Array of ticket objects with id and optional ticketNumber
 * @returns Promise with results for each ticket
 * 
 * @example
 * ```typescript
 * const tickets = [
 *   { id: 'ticket-1', ticketNumber: 'TKT-001' },
 *   { id: 'ticket-2', ticketNumber: 'TKT-002' }
 * ]
 * 
 * const results = await markMultipleTicketsPaidAndDownloadQR(tickets)
 * results.forEach((result, index) => {
 *   console.log(`Ticket ${tickets[index].id}:`, result.message)
 * })
 * ```
 */
export async function markMultipleTicketsPaidAndDownloadQR(
  tickets: Array<{ id: string; ticketNumber?: string }>
): Promise<Array<{ success: boolean; message: string; ticketId: string }>> {
  console.log(`🎫 Processing ${tickets.length} tickets for mark-paid and download`)
  
  const results = []
  
  for (const ticket of tickets) {
    try {
      const result = await markTicketPaidAndDownloadQR(ticket.id, ticket.ticketNumber)
      results.push({
        ...result,
        ticketId: ticket.id
      })
      
      // Add a small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error: any) {
      results.push({
        success: false,
        message: `Failed to process ticket ${ticket.id}: ${error.message}`,
        ticketId: ticket.id
      })
    }
  }
  
  const successCount = results.filter(r => r.success).length
  console.log(`✅ Completed processing ${tickets.length} tickets. ${successCount} successful, ${tickets.length - successCount} failed.`)
  
  return results
}

/**
 * Just mark a ticket as paid without downloading QR code
 * 
 * @param ticketId - The ID of the ticket to mark as paid
 * @returns Promise with success status and message
 */
export async function markTicketPaidOnly(ticketId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('💳 Marking ticket as paid only:', ticketId)
    
    // Use the existing tickets service to mark as paid
    const { ticketsService } = await import('@/lib/services/tickets.service')
    const result = await ticketsService.markPaid(ticketId)
    
    if (result.success && result.isPaid) {
      return {
        success: true,
        message: 'Ticket marked as paid successfully'
      }
    } else {
      return {
        success: false,
        message: 'Failed to mark ticket as paid'
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to mark ticket as paid: ${error.message}`
    }
  }
}

// Export the service for direct access if needed
export { qrFixService }

