'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function WhatsAppPage() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('loading');

    useEffect(() => {
        const checkQRCode = async () => {
            try {
                const response = await fetch('/api/whatsapp/qr');
                const data = await response.json();
                
                if (data.qrCode) {
                    setQrCode(data.qrCode);
                    setStatus('pending');
                } else {
                    setStatus(data.status);
                }
            } catch (error) {
                console.error('Error checking QR code:', error);
                setStatus('error');
            }
        };

        const interval = setInterval(checkQRCode, 5000);
        checkQRCode();

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">WhatsApp Connection</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
                {status === 'loading' && (
                    <p className="text-lg">Loading WhatsApp connection...</p>
                )}
                
                {status === 'pending' && qrCode && (
                    <div className="text-center">
                        <p className="mb-4">Scan this QR code with your WhatsApp mobile app:</p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                            <Image
                                src={`data:image/png;base64,${qrCode}`}
                                alt="WhatsApp QR Code"
                                width={300}
                                height={300}
                            />
                        </div>
                    </div>
                )}
                
                {status === 'authenticated' && (
                    <p className="text-lg text-green-600">WhatsApp is connected! 🎉</p>
                )}
                
                {status === 'error' && (
                    <p className="text-lg text-red-600">Error connecting to WhatsApp. Please try again.</p>
                )}
            </div>
        </div>
    );
} 