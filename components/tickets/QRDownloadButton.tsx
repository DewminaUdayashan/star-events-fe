'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTicketQRCode } from '@/hooks/useTickets';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRDownloadButtonProps {
  ticketId: string;
  ticketCode?: string;
  eventTitle?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showStatus?: boolean; // Show success/error status
  onDownloadSuccess?: (url: string) => void;
  onDownloadError?: (error: string) => void;
}

export function QRDownloadButton({ 
  ticketId, 
  ticketCode, 
  eventTitle,
  variant = 'outline',
  size = 'default',
  className = '',
  showStatus = false,
  onDownloadSuccess,
  onDownloadError
}: QRDownloadButtonProps) {
  const { 
    qrCodeUrl, 
    downloadQRCode, 
    retryDownloadQRCode, 
    loading, 
    error 
  } = useTicketQRCode();

  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleDownload = async () => {
    try {
      setDownloadStatus('downloading');
      setStatusMessage('Generating QR code...');

      let qrUrl = qrCodeUrl;
      
      // If we don't have a QR code URL yet, generate it
      if (!qrUrl) {
        console.log('Generating QR code for ticket:', ticketId);
        qrUrl = await downloadQRCode(ticketId);
      }

      if (!qrUrl) {
        throw new Error('Failed to generate QR code');
      }

      // Trigger download
      setStatusMessage('Downloading QR code...');
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `ticket-${ticketCode || ticketId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus('success');
      setStatusMessage('QR code downloaded successfully!');
      
      // Call success callback if provided
      if (onDownloadSuccess) {
        onDownloadSuccess(qrUrl);
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus('idle');
        setStatusMessage('');
      }, 3000);

    } catch (err) {
      console.error('Download failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download QR code';
      
      setDownloadStatus('error');
      setStatusMessage(errorMessage);
      
      // Call error callback if provided
      if (onDownloadError) {
        onDownloadError(errorMessage);
      }
    }
  };

  const handleRetry = async () => {
    try {
      setDownloadStatus('downloading');
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setStatusMessage(`Retrying... (attempt ${newRetryCount})`);
      
      console.log(`QR download retry attempt ${newRetryCount}`);
      
      // Use retry function with exponential backoff
      const qrUrl = await retryDownloadQRCode(ticketId);
      
      if (qrUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `ticket-${ticketCode || ticketId}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadStatus('success');
        setStatusMessage('QR code downloaded successfully!');
        
        if (onDownloadSuccess) {
          onDownloadSuccess(qrUrl);
        }

        // Reset status after 3 seconds
        setTimeout(() => {
          setDownloadStatus('idle');
          setStatusMessage('');
        }, 3000);
      }
    } catch (err) {
      console.error('Retry failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Retry failed';
      
      setDownloadStatus('error');
      setStatusMessage(`Retry failed: ${errorMessage}`);
      
      if (onDownloadError) {
        onDownloadError(errorMessage);
      }
    }
  };

  const isLoading = loading || downloadStatus === 'downloading';
  const hasError = error || downloadStatus === 'error';
  const isSuccess = downloadStatus === 'success';

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {downloadStatus === 'downloading' ? 'Downloading...' : 'Loading...'}
        </>
      );
    }
    
    if (isSuccess) {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          Downloaded
        </>
      );
    }
    
    if (hasError && retryCount > 0) {
      return (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry ({retryCount + 1})
        </>
      );
    }
    
    if (hasError) {
      return (
        <>
          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
          Try Again
        </>
      );
    }
    
    return (
      <>
        <Download className="h-4 w-4 mr-2" />
        Download QR
      </>
    );
  };

  const getButtonVariant = () => {
    if (isSuccess) return 'default';
    if (hasError) return 'destructive';
    return variant;
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={hasError && retryCount > 0 ? handleRetry : handleDownload}
        disabled={isLoading}
        variant={getButtonVariant()}
        size={size}
        className={className}
      >
        {getButtonContent()}
      </Button>
      
      {showStatus && statusMessage && (
        <Alert className={`text-sm ${isSuccess ? 'border-green-500 bg-green-500/10' : hasError ? 'border-red-500 bg-red-500/10' : 'border-blue-500 bg-blue-500/10'}`}>
          <AlertDescription className={isSuccess ? 'text-green-400' : hasError ? 'text-red-400' : 'text-blue-400'}>
            {statusMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {hasError && retryCount >= 3 && (
        <Alert className="border-yellow-500 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-400">
            Multiple attempts failed. Please contact support with ticket ID: {ticketId}
            {eventTitle && ` for ${eventTitle}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-400">QR Button Debug</summary>
          <div className="mt-1 space-y-1 bg-gray-900 p-2 rounded font-mono">
            <div>Ticket ID: {ticketId}</div>
            <div>Ticket Code: {ticketCode || 'Not provided'}</div>
            <div>QR URL: {qrCodeUrl ? 'Available ✓' : 'Not available ✗'}</div>
            <div>Loading: {loading.toString()}</div>
            <div>Download Status: {downloadStatus}</div>
            <div>Retry Count: {retryCount}</div>
            <div>Error: {error || 'None'}</div>
            <div>Status Message: {statusMessage || 'None'}</div>
          </div>
        </details>
      )}
    </div>
  );
}

// Export a simplified version for quick usage
export function SimpleQRDownloadButton({ ticketId, ticketCode }: { ticketId: string; ticketCode?: string }) {
  return (
    <QRDownloadButton
      ticketId={ticketId}
      ticketCode={ticketCode}
      variant="outline"
      size="sm"
      showStatus={true}
    />
  );
}