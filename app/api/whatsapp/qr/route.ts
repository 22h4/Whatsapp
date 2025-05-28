import { NextResponse } from 'next/server'
import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode'
import path from 'path'
import fs from 'fs'

let client: Client | null = null
let qrCode: string | null = null
let isAuthenticated = false

// Ensure the auth directory exists
const dataDir = path.join(process.cwd(), '.wwebjs_auth')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export async function GET() {
  try {
    if (!client) {
      client = new Client({
        authStrategy: new LocalAuth({
          dataPath: dataDir
        }),
        puppeteer: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ],
          headless: true,
          executablePath: process.env.CHROME_PATH || undefined
        }
      })

      client.on('qr', async (qr) => {
        try {
          qrCode = await qrcode.toDataURL(qr)
          console.log('QR Code generated successfully')
        } catch (err) {
          console.error('Error generating QR code:', err)
          qrCode = null
        }
      })

      client.on('ready', () => {
        console.log('WhatsApp client is ready')
        isAuthenticated = true
        qrCode = null
      })

      client.on('authenticated', () => {
        console.log('WhatsApp client is authenticated')
        isAuthenticated = true
        qrCode = null
      })

      client.on('auth_failure', (msg) => {
        console.error('WhatsApp authentication failed:', msg)
        isAuthenticated = false
        qrCode = null
        client = null
      })

      client.on('disconnected', (reason) => {
        console.log('WhatsApp client disconnected:', reason)
        isAuthenticated = false
        qrCode = null
        client = null
      })

      try {
        console.log('Initializing WhatsApp client...')
        await client.initialize()
        console.log('WhatsApp client initialized successfully')
      } catch (err) {
        console.error('Error initializing WhatsApp client:', err)
        client = null
        throw err
      }
    }

    if (isAuthenticated) {
      return NextResponse.json({ status: 'authenticated' })
    }

    if (qrCode) {
      return NextResponse.json({ qrCode: qrCode.split(',')[1] })
    }

    return NextResponse.json({ status: 'pending' })
  } catch (error) {
    console.error('WhatsApp QR code error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to generate QR code',
        error: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    if (client) {
      console.log('Destroying WhatsApp client...')
      await client.destroy()
      client = null
      qrCode = null
      isAuthenticated = false
      console.log('WhatsApp client destroyed successfully')
    }
    return NextResponse.json({ status: 'disconnected' })
  } catch (error) {
    console.error('WhatsApp disconnect error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to disconnect',
        error: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
} 