'use client';

import { useState } from 'react';
import WhatsAppIntegration from '@/components/whatsapp-integration';

interface WhatsAppSession {
    type: "business" | "web";
    status: "connected" | "disconnected";
}

export default function IntegrationPage() {
    const [session, setSession] = useState<WhatsAppSession>({
        type: 'web',
        status: 'disconnected'
    });

    const handleSessionUpdate = (newSession: WhatsAppSession) => {
        setSession(newSession);
    };

    const handleNotification = (notification: any) => {
        console.log('Notification:', notification);
        // You can implement a toast notification system here
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Integrations</h1>
                <div className="max-w-4xl mx-auto">
                    <WhatsAppIntegration
                        session={session}
                        onSessionUpdate={handleSessionUpdate}
                        onNotification={handleNotification}
                    />
                </div>
            </div>
        </div>
    );
} 