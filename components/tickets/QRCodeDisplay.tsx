'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, Ticket, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTicketQRCode } from '@/hooks/useTickets';

interface QRCodeDisplayProps {
  ticketId: string;
  eventTitle: string;
  ticketCode?: string;
}

export function QRCodeDisplay({ ticketId, eventTitle, ticketCode }: QRCodeDisplayProps) {
  const { 
    qrCodeUrl, 
    downloadQRCode, 
    retryDownloadQRCode, 
    clearQRCode, 
    loading, 
    error 
  } = useTicketQRCode();

  const [retryCount, setRetryCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-load QR code on component mount
  useEffect(() => {
    const loadQRCode = async () => {
      if (ticketId && !qrCodeUrl && !loading) {
        try {
          await downloadQRCode(ticketId);
        } catch (err) {
          console.warn('Failed to auto-load QR code:', err);
        }
      }
    };

    loadQRCode();
  }, [ticketId, qrCodeUrl, loading, downloadQRCode]);

  const handleManualDownload = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `ticket-${ticketCode || ticketId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  const handleRetry = async () => {
    try {
      setIsDownloading(true);
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      console.log(`Retry attempt ${newRetryCount}`);
      
      // Clear existing QR code first
      clearQRCode();
      
      // Use retry function with exponential backoff
      await retryDownloadQRCode(ticketId);
      
    } catch (err) {
      console.error('QR retry failed:', err);
      // Show user-friendly error message
      alert('Unable to load QR code after multiple attempts. Please contact support.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsDownloading(true);
      clearQRCode();
      await downloadQRCode(ticketId);
    } catch (err) {
      console.error('Failed to refresh QR code:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const isLoading = loading || isDownloading;

  if (isLoading && !qrCodeUrl) {
    return (
      <Card className="w-full max-w-sm bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="text-gray-300">Loading your QR code...</span>
            <span className="text-gray-500 text-sm">Please wait</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !qrCodeUrl) {
    return (
      <Card className="w-full max-w-sm bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            QR Code Error
          </CardTitle>
          <CardDescription className="text-gray-400">
            {eventTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-600 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleRetry}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="w-full border-gray-600 bg-transparent text-white hover:bg-gray-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry {retryCount > 0 && `(${retryCount + 1})`}
                </>
              )}
            </Button>
            
            <Button
              onClick={() => alert(`Please contact support with your ticket ID: ${ticketId}`)}
              variant="outline"
              size="sm"
              className="w-full text-gray-400 hover:text-white"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CheckCircle className="h-5 w-5 text-green-400" />
          Your Ticket
        </CardTitle>
        <CardDescription className="text-gray-400">
          {eventTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            {qrCodeUrl && (
              <Image
                src={qrCodeUrl}
                alt="Ticket QR Code"
                width={200}
                height={200}
                className="rounded"
                unoptimized
                priority
              />
            )}
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-300">
            Present this QR code at the event entrance
          </p>
          {ticketCode && (
            <p className="text-xs text-gray-500 font-mono bg-gray-900 p-2 rounded">
              Code: {ticketCode}
            </p>
          )}
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleManualDownload} 
              variant="outline" 
              size="sm" 
              className="flex-1 border-gray-600 bg-transparent text-white hover:bg-gray-700"
              disabled={!qrCodeUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="border-gray-600 bg-transparent text-white hover:bg-gray-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Debug Info for Development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-gray-500 mt-4">
            <summary className="cursor-pointer hover:text-gray-400">Debug Info</summary>
            <div className="mt-2 space-y-1 bg-gray-900 p-2 rounded font-mono">
              <div>Ticket ID: {ticketId}</div>
              <div>Ticket Code: {ticketCode || 'Not provided'}</div>
              <div>QR URL: {qrCodeUrl ? 'Generated ✓' : 'Not generated ✗'}</div>
              <div>Loading: {loading.toString()}</div>
              <div>Retry Count: {retryCount}</div>
              <div>Error: {error || 'None'}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}