"use client"

import { useState, useEffect } from "react"
import { QrCode, CheckCircle, AlertCircle, Smartphone, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface WhatsAppSession {
  type: "business" | "web"
  status: "connected" | "disconnected"
}

interface WhatsAppIntegrationProps {
  session: WhatsAppSession
  onSessionUpdate: (session: WhatsAppSession) => void
}

export default function WhatsAppIntegration({ session, onSessionUpdate }: WhatsAppIntegrationProps) {
  const [businessApiKey, setBusinessApiKey] = useState("")
  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [webStatus, setWebStatus] = useState<"loading" | "pending" | "connected" | "error">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  useEffect(() => {
    const checkQRCode = async () => {
      try {
        const response = await fetch('/api/whatsapp/qr')
        const data = await response.json()
        
        if (data.qrCode) {
          setQrCode(data.qrCode)
          setWebStatus('pending')
          setErrorDetails(null)
          setRetryCount(0)
        } else if (data.status === 'authenticated') {
          setWebStatus('connected')
          setErrorDetails(null)
          setRetryCount(0)
          onSessionUpdate({ type: 'web', status: 'connected' })
        } else if (data.status === 'error') {
          setWebStatus('error')
          setErrorDetails(data.error || 'Failed to connect to WhatsApp Web')
        }
      } catch (error) {
        console.error('Error checking QR code:', error)
        setWebStatus('error')
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to WhatsApp Web'
        setErrorDetails(errorMessage)
      }
    }

    const interval = setInterval(checkQRCode, 5000)
    checkQRCode()

    return () => clearInterval(interval)
  }, [onSessionUpdate])

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1)
      setWebStatus('loading')
      setErrorDetails(null)
    }
  }

  const connectBusinessApi = async () => {
    if (!businessApiKey.trim() || !phoneNumberId.trim()) {
      return
    }

    setIsConnecting(true)
    try {
      // Implement business API connection logic here
      onSessionUpdate({ type: 'business', status: 'connected' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to WhatsApp Business API'
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async (type: "business" | "web") => {
    try {
      if (type === 'web') {
        const response = await fetch('/api/whatsapp/qr', { method: 'DELETE' })
        const data = await response.json()
        
        if (data.status === 'disconnected') {
          setQrCode(null)
          setWebStatus('loading')
          setErrorDetails(null)
          onSessionUpdate({ type: 'web', status: 'disconnected' })
        } else {
          throw new Error(data.error || 'Failed to disconnect')
        }
      } else {
        onSessionUpdate({ type: 'business', status: 'disconnected' })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect from WhatsApp'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-none shadow-none sm:border sm:shadow">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">WhatsApp Integration</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Connect your WhatsApp Business API or personal account to start sending messages
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="business" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="business" className="flex items-center space-x-2 py-2">
                <Building className="h-4 w-4" />
                <span className="text-sm sm:text-base">Business API</span>
              </TabsTrigger>
              <TabsTrigger value="web" className="flex items-center space-x-2 py-2">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm sm:text-base">WhatsApp Web</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="space-y-4 sm:space-y-6">
              <Card className="border-none shadow-none sm:border sm:shadow">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">WhatsApp Business API</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Official API for business messaging with higher limits and features
                      </CardDescription>
                    </div>
                    <Badge variant={session.type === 'business' && session.status === 'connected' ? "default" : "secondary"}>
                      {session.type === 'business' && session.status === 'connected' ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 space-y-4">
                  {!(session.type === 'business' && session.status === 'connected') ? (
                    <>
                      <Alert className="text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You need a WhatsApp Business API account. Get one from Meta or an approved Business Solution
                          Provider.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="api-key" className="text-sm">Access Token</Label>
                          <Input
                            id="api-key"
                            type="password"
                            placeholder="Enter your WhatsApp Business API access token"
                            value={businessApiKey}
                            onChange={(e) => setBusinessApiKey(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone-id" className="text-sm">Phone Number ID</Label>
                          <Input
                            id="phone-id"
                            placeholder="Enter your phone number ID"
                            value={phoneNumberId}
                            onChange={(e) => setPhoneNumberId(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <Button
                          onClick={connectBusinessApi}
                          disabled={!businessApiKey || !phoneNumberId || isConnecting}
                          className="w-full"
                        >
                          {isConnecting ? "Connecting..." : "Connect Business API"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <Alert className="text-sm border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Successfully connected to WhatsApp Business API
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="destructive"
                        onClick={() => disconnect('business')}
                        className="w-full"
                      >
                        Disconnect
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features & Limitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">✓ Advantages</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Higher message limits</li>
                        <li>• Official business verification</li>
                        <li>• Template message support</li>
                        <li>• Webhook notifications</li>
                        <li>• Analytics and reporting</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2">⚠ Requirements</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Business verification required</li>
                        <li>• Monthly subscription fees</li>
                        <li>• Template approval process</li>
                        <li>• Compliance with policies</li>
                        <li>• Technical integration</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="web" className="space-y-4 sm:space-y-6">
              <Card className="border-none shadow-none sm:border sm:shadow">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">WhatsApp Web Integration</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Connect your personal WhatsApp account via QR code scanning
                      </CardDescription>
                    </div>
                    <Badge variant={session.type === 'web' && session.status === 'connected' ? "default" : "secondary"}>
                      {session.type === 'web' && session.status === 'connected' ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {webStatus === 'loading' && (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-base sm:text-lg">Initializing WhatsApp Web...</p>
                    </div>
                  )}

                  {webStatus === 'pending' && qrCode && (
                    <div className="text-center py-6 sm:py-8">
                      <p className="mb-4 text-sm sm:text-base">Scan this QR code with your WhatsApp mobile app:</p>
                      <div className="bg-white p-2 sm:p-4 rounded-lg inline-block">
                        <Image
                          src={`data:image/png;base64,${qrCode}`}
                          alt="WhatsApp QR Code"
                          width={250}
                          height={250}
                          className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px]"
                        />
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground space-y-1">
                        <p>1. Open WhatsApp on your phone</p>
                        <p>2. Tap Menu (⋮) → Linked Devices</p>
                        <p>3. Tap "Link a Device"</p>
                        <p>4. Scan this QR code</p>
                      </div>
                    </div>
                  )}

                  {webStatus === 'connected' && (
                    <div className="space-y-4">
                      <Alert className="text-sm border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Successfully connected to WhatsApp Web
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="destructive"
                        onClick={() => disconnect('web')}
                        className="w-full"
                      >
                        Disconnect
                      </Button>
                    </div>
                  )}

                  {webStatus === 'error' && (
                    <div className="space-y-4">
                      <Alert variant="destructive" className="text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {errorDetails || 'Error connecting to WhatsApp Web. Please try again.'}
                        </AlertDescription>
                      </Alert>
                      {retryCount < MAX_RETRIES && (
                        <Button
                          variant="outline"
                          onClick={handleRetry}
                          className="w-full"
                        >
                          Retry Connection
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features & Limitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">✓ Advantages</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Free to use</li>
                        <li>• Quick setup</li>
                        <li>• No business verification</li>
                        <li>• Personal account access</li>
                        <li>• Immediate availability</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">⚠ Limitations</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Lower message limits</li>
                        <li>• Risk of account suspension</li>
                        <li>• No official support</li>
                        <li>• Session can expire</li>
                        <li>• Against WhatsApp ToS</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
