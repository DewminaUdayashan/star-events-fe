'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, Ticket, CheckCircle } from 'lucide-react';

interface QRCodeDisplayProps {
  ticketId: string;
  eventTitle: string;
  ticketCode?: string;
}

export function QRCodeDisplay({ ticketId, eventTitle, ticketCode }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // First try to generate QR code if it doesn't exist
        const generateResponse = await fetch('http://localhost:5000/api/qr/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticketId: ticketId
          }),
        });

        if (generateResponse.ok) {
          const generateData = await generateResponse.json();
          if (generateData.success) {
            setQrCodeUrl(`data:image/png;base64,${generateData.data.qrCodeBase64}`);
            return;
          }
        }

        // If generation fails, try to fetch existing QR code
        if (ticketCode) {
          const fetchResponse = await fetch(`http://localhost:5000/api/qr/${ticketCode}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (fetchResponse.ok) {
            const blob = await fetchResponse.blob();
            const url = URL.createObjectURL(blob);
            setQrCodeUrl(url);
            return;
          }
        }

        throw new Error('Failed to load QR code. Please ensure your ticket is paid.');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load QR code';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRCode();

    // Cleanup URL object when component unmounts
    return () => {
      if (qrCodeUrl && qrCodeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [ticketId, ticketCode, qrCodeUrl]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `ticket-${ticketCode || ticketId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating QR code...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Ticket QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Your Ticket
        </CardTitle>
        <CardDescription>
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
              />
            )}
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Present this QR code at the event entrance
          </p>
          {ticketCode && (
            <p className="text-xs text-gray-500 font-mono">
              Ticket Code: {ticketCode}
            </p>
          )}
          <Button onClick={handleDownload} variant="outline" size="sm" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
