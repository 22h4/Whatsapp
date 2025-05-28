import { NextResponse } from 'next/server';
import WhatsAppService from '../../../../services/whatsapp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const whatsapp = WhatsAppService.getInstance();
        const qrCode = await whatsapp.getQRCode();
        
        return NextResponse.json({ 
            qrCode,
            status: qrCode ? 'pending' : 'authenticated'
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error getting QR code:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
} 