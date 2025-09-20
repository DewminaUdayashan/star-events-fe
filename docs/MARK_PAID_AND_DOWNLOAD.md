# Mark Ticket as Paid and Download QR Code

This document explains how to use the new functionality that marks tickets as paid and automatically downloads their QR codes.

## Overview

The system now provides multiple ways to mark a ticket as paid and download its QR code:

1. **UI Button**: Manual button in the My Tickets page for users
2. **Programmatic Functions**: Utility functions for developers
3. **Service Methods**: Low-level service methods for advanced use

## 🎯 API Endpoints Used

- **POST** `/api/Payment/mark-paid` - Marks a ticket as paid
- **GET** `/api/Tickets/{id}/qrcode` - Downloads the QR code image

## 🖱️ User Interface

### My Tickets Page

For unpaid tickets, users will now see two buttons:
- **Complete Payment** - Redirects to checkout page
- **Mark Paid & Download** - Marks ticket as paid and downloads QR code

The "Mark Paid & Download" button will:
1. Send a POST request to mark the ticket as paid
2. Wait for the backend to process the payment
3. Automatically download the QR code as a PNG file
4. Refresh the ticket list to show updated status
5. Show toast notifications for success/error states

## 💻 Programmatic Usage

### Simple Usage

```typescript
import { markTicketPaidAndDownloadQR } from '@/lib/utils/mark-paid-utils'

// Basic usage
const result = await markTicketPaidAndDownloadQR('ticket-id-123')

if (result.success) {
  console.log('Success:', result.message)
} else {
  console.error('Failed:', result.message)
}
```

### With Ticket Number

```typescript
// Better file naming with ticket number
const result = await markTicketPaidAndDownloadQR('ticket-id-123', 'TKT-2024-001')
```

### Multiple Tickets

```typescript
import { markMultipleTicketsPaidAndDownloadQR } from '@/lib/utils/mark-paid-utils'

const tickets = [
  { id: 'ticket-1', ticketNumber: 'TKT-001' },
  { id: 'ticket-2', ticketNumber: 'TKT-002' }
]

const results = await markMultipleTicketsPaidAndDownloadQR(tickets)
results.forEach((result, index) => {
  console.log(`Ticket ${tickets[index].id}:`, result.success ? 'Success' : 'Failed')
})
```

### Mark Paid Only (No Download)

```typescript
import { markTicketPaidOnly } from '@/lib/utils/mark-paid-utils'

const result = await markTicketPaidOnly('ticket-id-123')
```

## 🔧 Service Methods

### Direct Service Access

```typescript
import { qrFixService } from '@/lib/services/qr-fix.service'

// Method 1: Using existing QR generation logic
const result = await qrFixService.markPaidAndDownloadQR('ticket-id', 'TKT-001')

// Method 2: Direct API endpoint approach (recommended)
const result = await qrFixService.markPaidAndDownloadQRDirect('ticket-id', 'TKT-001')
```

## 📋 Request/Response Format

### POST /api/Payment/mark-paid

**Request Body:**
```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response:**
```json
{
  "Success": true,
  "TicketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "IsPaid": true
}
```

### GET /api/Tickets/{id}/qrcode

**Response:** Binary PNG image data

## 🎯 Use Cases

### 1. Admin Panel
```typescript
// Admin marking multiple tickets as paid after bank transfer
const adminMarkPaidBulk = async (ticketIds: string[]) => {
  const tickets = ticketIds.map(id => ({ id }))
  const results = await markMultipleTicketsPaidAndDownloadQR(tickets)
  
  const successCount = results.filter(r => r.success).length
  console.log(`Marked ${successCount}/${ticketIds.length} tickets as paid`)
}
```

### 2. Event Check-in System
```typescript
// Event organizer manually marking tickets as paid at venue
const handleManualPayment = async (ticketId: string, ticketNumber: string) => {
  const result = await markTicketPaidAndDownloadQR(ticketId, ticketNumber)
  
  if (result.success) {
    // QR code downloaded automatically, ready for printing
    alert('Payment processed and QR code ready!')
  }
}
```

### 3. Customer Service
```typescript
// Customer service helping users with payment issues
const customerServiceHelper = async (ticketId: string) => {
  // First try to mark as paid only
  const markResult = await markTicketPaidOnly(ticketId)
  
  if (markResult.success) {
    // Then download QR separately if needed
    await qrFixService.downloadQRCode(ticketId)
  }
}
```

## 🛠️ Error Handling

The system provides detailed error messages for different scenarios:

- **Network errors**: Connection issues with the API
- **Payment failures**: Backend unable to mark ticket as paid  
- **QR generation failures**: Payment succeeded but QR code unavailable
- **Download failures**: QR code exists but download failed

Example error handling:
```typescript
const result = await markTicketPaidAndDownloadQR(ticketId)

if (!result.success) {
  if (result.message.includes('marked as paid but QR code')) {
    // Payment succeeded, QR failed - user can try downloading manually
    console.log('Payment OK, try manual QR download')
  } else {
    // Complete failure
    console.error('Payment failed:', result.message)
  }
}
```

## 🔍 Debugging

The system includes comprehensive logging:

```javascript
// Console output example:
// 💳 Marking ticket as paid (direct method): ticket-123
// ✅ Mark paid response: { Success: true, TicketId: "...", IsPaid: true }
// ✅ Ticket marked as paid successfully  
// 📥 Fetching QR code directly from API...
// ✅ QR code downloaded successfully
```

## 🚀 Integration Examples

### React Component
```tsx
import { markTicketPaidAndDownloadQR } from '@/lib/utils/mark-paid-utils'

function TicketManagement() {
  const handleMarkPaid = async (ticketId: string) => {
    const result = await markTicketPaidAndDownloadQR(ticketId)
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }
  
  return (
    <button onClick={() => handleMarkPaid(ticket.id)}>
      Mark Paid & Download QR
    </button>
  )
}
```

### API Route (Next.js)
```typescript
// pages/api/admin/mark-paid-bulk.ts
import { markMultipleTicketsPaidAndDownloadQR } from '@/lib/utils/mark-paid-utils'

export default async function handler(req, res) {
  const { ticketIds } = req.body
  
  const results = await markMultipleTicketsPaidAndDownloadQR(
    ticketIds.map(id => ({ id }))
  )
  
  res.json({ results })
}
```

This functionality provides a complete solution for marking tickets as paid and automatically downloading QR codes, with robust error handling and multiple integration options.

