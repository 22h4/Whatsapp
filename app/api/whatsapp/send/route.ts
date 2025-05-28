import { NextResponse } from 'next/server'
import { Client } from 'whatsapp-web.js'

let client: Client | null = null

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!client) {
      return NextResponse.json(
        { error: 'WhatsApp client not initialized' },
        { status: 400 }
      )
    }

    // Format phone number (remove any non-numeric characters)
    const formattedNumber = phoneNumber.replace(/\D/g, '')

    // Send message
    const response = await client.sendMessage(`${formattedNumber}@c.us`, message)

    return NextResponse.json({
      success: true,
      messageId: response.id._serialized
    })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 