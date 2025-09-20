# QR Code Download Fix

This document explains the fixes implemented to resolve QR code download issues when the backend serves QR codes at paths like `/qrcodes/SSZM1EGC.png`.

## 🐛 Issues Fixed

### 1. **Backend URL Construction**
- ✅ **Fixed**: Proper construction of URLs for `/qrcodes/` static path
- ✅ **Fixed**: Support for both API endpoints and static file access
- ✅ **Fixed**: Environment-based URL configuration

### 2. **CORS Issues**
- ✅ **Fixed**: Proper CORS headers for cross-origin requests
- ✅ **Fixed**: Credentials handling for authenticated requests
- ✅ **Fixed**: Accept headers for image content types

### 3. **Filename Preservation**
- ✅ **Fixed**: Original filename extraction from response headers
- ✅ **Fixed**: Fallback to ticket code-based naming
- ✅ **Fixed**: Proper file extension handling

## 🛠️ Implementation Details

### **Multiple Download Approaches**
The system now tries multiple methods in order of preference:

1. **Static Path Access** (`/qrcodes/{ticketCode}.png`)
2. **Tickets API Endpoint** (`/api/Tickets/{id}/qrcode`)
3. **QR API Endpoint** (`/api/Qr/{ticketCode}`)

### **CORS Configuration**
All requests now include proper CORS headers:

```typescript
const response = await fetch(qrUrl, {
  method: 'GET',
  mode: 'cors',
  credentials: 'include',
  headers: {
    'Accept': 'image/png,image/*,*/*',
  }
})
```

### **Filename Handling**
The system preserves original filenames using multiple strategies:

1. **Content-Disposition Header**: Extracts filename from HTTP response headers
2. **Ticket Code**: Uses the ticket code as filename (e.g., `SSZM1EGC.png`)
3. **Custom Filename**: Falls back to user-provided filename
4. **Default Pattern**: Uses `ticket-{id}.png` as last resort

## 🎯 API Endpoints Supported

### 1. Static File Access
```
GET {baseUrl}/qrcodes/{ticketCode}.png
```
- **Direct access** to QR code files
- **Fastest method** when files exist
- **Preserves original filename**

### 2. Tickets API
```
GET /api/Tickets/{ticketId}/qrcode
```
- **Authenticated endpoint** with payment validation
- **Dynamic generation** if QR doesn't exist
- **Blob response** with proper headers

### 3. QR API
```
GET /api/Qr/{ticketCode}
```
- **Direct QR code access** by ticket code
- **Alternative endpoint** for QR retrieval
- **Fallback option** if other methods fail

## 💻 Usage Examples

### **Basic Download**
```typescript
import { qrFixService } from '@/lib/services/qr-fix.service'

// Download QR code for a ticket
await qrFixService.downloadQRCode('ticket-id-123', 'TKT-001')
```

### **Direct Ticket Code Download**
```typescript
// Download directly using ticket code (e.g., from backend path /qrcodes/SSZM1EGC.png)
await qrFixService.downloadQRCodeByTicketCode('SSZM1EGC', 'my-ticket')
```

### **Check QR Code Existence**
```typescript
// Check if QR code exists before attempting download
const exists = await qrFixService.checkQRCodeExists('SSZM1EGC')
if (exists) {
  await qrFixService.downloadQRCodeByTicketCode('SSZM1EGC')
}
```

### **Mark Paid and Download**
```typescript
// Mark ticket as paid and automatically download QR code
const result = await qrFixService.markPaidAndDownloadQRDirect('ticket-id-123', 'TKT-001')
console.log(result.success ? 'Success!' : result.message)
```

## 🧪 Testing

### **Test Utilities**
Use the provided test utilities to verify functionality:

```typescript
import { runComprehensiveQRTest } from '@/lib/utils/qr-download-test'

// Test all download methods
await runComprehensiveQRTest('ticket-id-123', 'SSZM1EGC', 'TKT-001')
```

### **Individual Tests**
```typescript
import { testQRDownload, testQRDownloadByCode, testQRExists } from '@/lib/utils/qr-download-test'

// Test download by ticket ID
await testQRDownload('ticket-id-123')

// Test download by ticket code
await testQRDownloadByCode('SSZM1EGC')

// Test QR code existence
const exists = await testQRExists('SSZM1EGC')
```

## 🔧 Error Handling

### **Comprehensive Error Messages**
The system provides detailed error information:

```typescript
try {
  await qrFixService.downloadQRCode(ticketId)
} catch (error) {
  if (error.message.includes('not paid yet')) {
    // Handle unpaid ticket
  } else if (error.message.includes('CORS')) {
    // Handle CORS issues
  } else if (error.message.includes('not found')) {
    // Handle missing QR code
  }
}
```

### **Fallback Mechanisms**
- If static path fails → Try API endpoint
- If API endpoint fails → Try QR API
- If all methods fail → Provide detailed error message

## 🚀 Browser Compatibility

### **Download Mechanism**
Uses modern browser APIs with fallbacks:

```typescript
// Creates temporary download link
const link = document.createElement('a')
link.href = downloadUrl
link.download = filename
link.style.display = 'none'
document.body.appendChild(link)
link.click()
document.body.removeChild(link)

// Clean up blob URL
setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
```

### **CORS Support**
- ✅ **Chrome/Edge**: Full support
- ✅ **Firefox**: Full support  
- ✅ **Safari**: Full support
- ✅ **Mobile browsers**: Full support

## 📋 Configuration

### **Environment Variables**
```bash
# Backend API base URL
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
```

### **Default Behavior**
- **Base URL**: Falls back to `http://127.0.0.1:5000` if not configured
- **Timeout**: 30 seconds for API requests
- **Retry Logic**: 3 attempts with different methods
- **File Naming**: Preserves original names when possible

## 🔍 Debugging

### **Console Logging**
The system provides detailed console output:

```
🔗 Downloading from static URL: http://127.0.0.1:5000/qrcodes/SSZM1EGC.png
✅ Download completed: { originalFilename: "SSZM1EGC.png", downloadFilename: "TKT-001.png", ticketCode: "SSZM1EGC" }
```

### **Network Tab**
Monitor these requests in browser dev tools:
- `GET /qrcodes/{ticketCode}.png` - Static file access
- `GET /api/Tickets/{id}/qrcode` - API endpoint
- `GET /api/Qr/{ticketCode}` - QR API endpoint

## ✅ Verification

### **Success Indicators**
- ✅ File downloads automatically
- ✅ Correct filename preserved
- ✅ No CORS errors in console
- ✅ Works across all supported browsers

### **Manual Testing**
1. Open browser dev tools (Network tab)
2. Click "Download QR" button on a paid ticket
3. Verify successful download with correct filename
4. Check console for success messages
5. Confirm no CORS or network errors

The QR code download functionality is now robust, handles CORS properly, preserves original filenames, and provides multiple fallback mechanisms for reliable downloads.
