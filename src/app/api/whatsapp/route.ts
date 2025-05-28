import { NextResponse } from 'next/server';
import WhatsAppService from '@/services/whatsapp';

export async function POST(request: Request) {
    try {
        const { to, message } = await request.json();
        
        // Input validation
        if (!to || !message) {
            return NextResponse.json(
                { error: 'Missing required fields', details: { to: !to, message: !message } },
                { status: 400 }
            );
        }

        // Phone number validation
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        const cleanNumber = to.replace(/\D/g, '');
        if (!phoneRegex.test(cleanNumber)) {
            return NextResponse.json(
                { error: 'Invalid phone number format', details: { number: to } },
                { status: 400 }
            );
        }

        const whatsapp = WhatsAppService.getInstance();
        
        // Check if WhatsApp client is ready
        if (!whatsapp.isReady()) {
            return NextResponse.json(
                { error: 'WhatsApp client is not ready', details: { lastError: whatsapp.getLastError() } },
                { status: 503 }
            );
        }

        const success = await whatsapp.sendMessage(cleanNumber, message);

        if (success) {
            return NextResponse.json({ 
                success: true,
                message: 'Message sent successfully'
            });
        } else {
            return NextResponse.json(
                { 
                    error: 'Failed to send message',
                    details: { lastError: whatsapp.getLastError() }
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in WhatsApp API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: { message: errorMessage }
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const whatsapp = WhatsAppService.getInstance();
        
        if (!whatsapp.isReady()) {
            return NextResponse.json(
                { error: 'WhatsApp client is not ready', details: { lastError: whatsapp.getLastError() } },
                { status: 503 }
            );
        }

        const chats = await whatsapp.getChats();
        return NextResponse.json({ 
            success: true,
            data: { chats }
        });
    } catch (error) {
        console.error('Error in WhatsApp API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: { message: errorMessage }
            },
            { status: 500 }
        );
    }
} 