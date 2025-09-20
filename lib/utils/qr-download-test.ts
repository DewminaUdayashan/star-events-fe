// Test utility for QR code download functionality
import { qrFixService } from '@/lib/services/qr-fix.service'

/**
 * Test QR code download functionality
 * This utility can be used in browser console or called programmatically
 */
export class QRDownloadTester {
  
  /**
   * Test downloading QR code by ticket ID
   * @param ticketId - The ticket ID to test
   * @param ticketNumber - Optional ticket number for filename
   */
  static async testDownloadByTicketId(ticketId: string, ticketNumber?: string): Promise<void> {
    console.log('🧪 Testing QR download by ticket ID:', ticketId)
    
    try {
      await qrFixService.downloadQRCode(ticketId, ticketNumber)
      console.log('✅ Test passed: QR code downloaded successfully')
    } catch (error: any) {
      console.error('❌ Test failed:', error.message)
      throw error
    }
  }

  /**
   * Test downloading QR code by ticket code (direct static path)
   * @param ticketCode - The ticket code (e.g., "SSZM1EGC")
   * @param filename - Optional custom filename
   */
  static async testDownloadByTicketCode(ticketCode: string, filename?: string): Promise<void> {
    console.log('🧪 Testing QR download by ticket code:', ticketCode)
    
    try {
      await qrFixService.downloadQRCodeByTicketCode(ticketCode, filename)
      console.log('✅ Test passed: QR code downloaded successfully via ticket code')
    } catch (error: any) {
      console.error('❌ Test failed:', error.message)
      throw error
    }
  }

  /**
   * Test if QR code exists at static path
   * @param ticketCode - The ticket code to check
   */
  static async testQRCodeExists(ticketCode: string): Promise<boolean> {
    console.log('🧪 Testing QR code existence:', ticketCode)
    
    try {
      const exists = await qrFixService.checkQRCodeExists(ticketCode)
      console.log(`✅ Test result: QR code ${exists ? 'exists' : 'does not exist'}`)
      return exists
    } catch (error: any) {
      console.error('❌ Test failed:', error.message)
      return false
    }
  }

  /**
   * Test mark as paid and download flow
   * @param ticketId - The ticket ID to test
   * @param ticketNumber - Optional ticket number
   */
  static async testMarkPaidAndDownload(ticketId: string, ticketNumber?: string): Promise<void> {
    console.log('🧪 Testing mark paid and download flow:', ticketId)
    
    try {
      const result = await qrFixService.markPaidAndDownloadQRDirect(ticketId, ticketNumber)
      
      if (result.success) {
        console.log('✅ Test passed: Mark paid and download completed successfully')
        console.log('📄 Result:', result.message)
      } else {
        console.warn('⚠️ Test completed with issues:', result.message)
      }
      
      return result
    } catch (error: any) {
      console.error('❌ Test failed:', error.message)
      throw error
    }
  }

  /**
   * Run comprehensive tests on a ticket
   * @param ticketId - The ticket ID to test
   * @param ticketCode - The ticket code (if known)
   * @param ticketNumber - The ticket number (if available)
   */
  static async runComprehensiveTest(ticketId: string, ticketCode?: string, ticketNumber?: string): Promise<void> {
    console.log('🧪 Running comprehensive QR download tests...')
    console.log('📋 Test parameters:', { ticketId, ticketCode, ticketNumber })
    
    const results = {
      downloadById: false,
      downloadByCode: false,
      existsCheck: false,
      markPaidAndDownload: false
    }
    
    // Test 1: Check if QR exists (if ticket code provided)
    if (ticketCode) {
      try {
        results.existsCheck = await this.testQRCodeExists(ticketCode)
      } catch (error) {
        console.warn('⚠️ Exists check failed:', error)
      }
    }
    
    // Test 2: Download by ticket ID
    try {
      await this.testDownloadByTicketId(ticketId, ticketNumber)
      results.downloadById = true
    } catch (error) {
      console.warn('⚠️ Download by ID failed:', error)
    }
    
    // Test 3: Download by ticket code (if available and exists)
    if (ticketCode && results.existsCheck) {
      try {
        await this.testDownloadByTicketCode(ticketCode, ticketNumber)
        results.downloadByCode = true
      } catch (error) {
        console.warn('⚠️ Download by code failed:', error)
      }
    }
    
    // Test 4: Mark paid and download (be careful with this in production!)
    // Uncomment only for testing with unpaid tickets
    /*
    try {
      await this.testMarkPaidAndDownload(ticketId, ticketNumber)
      results.markPaidAndDownload = true
    } catch (error) {
      console.warn('⚠️ Mark paid and download failed:', error)
    }
    */
    
    // Summary
    console.log('📊 Test Results Summary:')
    console.table(results)
    
    const successCount = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length - 1 // Exclude mark paid test
    
    console.log(`✅ Tests passed: ${successCount}/${totalTests}`)
    
    if (successCount === totalTests) {
      console.log('🎉 All tests passed! QR download functionality is working correctly.')
    } else {
      console.warn('⚠️ Some tests failed. Check the logs above for details.')
    }
  }
}

// Export convenience functions for direct use
export const testQRDownload = QRDownloadTester.testDownloadByTicketId
export const testQRDownloadByCode = QRDownloadTester.testDownloadByTicketCode
export const testQRExists = QRDownloadTester.testQRCodeExists
export const testMarkPaidAndDownload = QRDownloadTester.testMarkPaidAndDownload
export const runComprehensiveQRTest = QRDownloadTester.runComprehensiveTest

// Example usage in browser console:
/*
// Import in a React component or use in browser console:
import { testQRDownload, testQRDownloadByCode, runComprehensiveQRTest } from '@/lib/utils/qr-download-test'

// Test specific ticket
await testQRDownload('ticket-id-123', 'TKT-001')

// Test with known ticket code
await testQRDownloadByCode('SSZM1EGC', 'my-ticket')

// Run all tests
await runComprehensiveQRTest('ticket-id-123', 'SSZM1EGC', 'TKT-001')
*/
