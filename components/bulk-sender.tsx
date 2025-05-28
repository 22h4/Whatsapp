"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Contact, WhatsAppSession } from "@/lib/storage"

interface BulkSenderProps {
  contacts: Contact[]
  session: WhatsAppSession
  onNotification: (notification: any) => void
}

export default function BulkSender({ contacts, session, onNotification }: BulkSenderProps) {
  const [messageContent, setMessageContent] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [pendingMessages, setPendingMessages] = useState<any[]>([])
  const [delayBetweenMessages, setDelayBetweenMessages] = useState(2)
  const [batchSize, setBatchSize] = useState(10)
  const [failedMessages, setFailedMessages] = useState<Array<{contact: any, error: string}>>([])
  const [retryQueue, setRetryQueue] = useState<Array<{contact: any, message: string}>>([])

  const templates = [
    { id: "welcome", name: "Welcome Message" },
    { id: "reminder", name: "Reminder" },
    { id: "promotion", name: "Promotion" },
  ]

  const handleSendMessage = async () => {
    if (!session || session.status !== "connected") {
      onNotification({
        type: 'error',
        title: 'Not Connected',
        message: 'Please connect to WhatsApp to send messages.',
      })
      return
    }

    if (!messageContent.trim()) {
      onNotification({
        type: 'error',
        title: 'Empty Message',
        message: 'Message content cannot be empty.',
      })
      return
    }

    if (contacts.length === 0) {
      onNotification({
        type: 'error',
        title: 'No Contacts',
        message: 'Please add contacts before sending messages.',
      })
      return
    }

    setSending(true)
    setSentCount(0)
    setFailedCount(0)
    setPendingMessages([])
    setFailedMessages([])
    setRetryQueue([])

    // Process contacts in batches
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)
      const batchPromises = batch.map(async (contact) => {
        try {
          // Basic variable substitution (replace {{name}} with contact name)
          const content = messageContent.replace(/{{name}}/g, contact.name)

          const response = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: contact.phone,
              message: content,
            }),
          })

          const data = await response.json()

          if (data.success) {
            setSentCount((prev) => prev + 1)
            return { contact, status: 'sent', messageId: data.messageId }
          } else {
            setFailedCount((prev) => prev + 1)
            const errorMessage = data.error || 'Failed to send message'
            setFailedMessages(prev => [...prev, { contact, error: errorMessage }])
            setRetryQueue(prev => [...prev, { contact, message: content }])
            onNotification({
              type: 'error',
              title: 'Message Failed',
              message: `Failed to send message to ${contact.name}: ${errorMessage}`,
            })
            return { contact, status: 'failed', error: errorMessage }
          }
        } catch (error) {
          setFailedCount((prev) => prev + 1)
          const errorMessage = error instanceof Error ? error.message : 'Network error'
          setFailedMessages(prev => [...prev, { contact, error: errorMessage }])
          setRetryQueue(prev => [...prev, { contact, message: messageContent }])
          onNotification({
            type: 'error',
            title: 'Message Failed',
            message: `Failed to send message to ${contact.name}: ${errorMessage}`,
          })
          return { contact, status: 'failed', error: errorMessage }
        }
      })

      // Wait for all messages in the batch to be sent
      const results = await Promise.all(batchPromises)
      setPendingMessages((prev) => [...prev, ...results])

      // Add delay between batches
      if (i + batchSize < contacts.length) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenMessages * 1000))
      }
    }

    setSending(false)
  }

  const handleRetryFailed = async () => {
    if (retryQueue.length === 0) return

    setSending(true)
    const messagesToRetry = [...retryQueue]
    setRetryQueue([])
    setFailedMessages([])

    for (const { contact, message } of messagesToRetry) {
      try {
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: contact.phone,
            message: message,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setSentCount((prev) => prev + 1)
          setFailedCount((prev) => prev - 1)
        } else {
          const errorMessage = data.error || 'Failed to send message'
          setFailedMessages(prev => [...prev, { contact, error: errorMessage }])
          setRetryQueue(prev => [...prev, { contact, message }])
          onNotification({
            type: 'error',
            title: 'Retry Failed',
            message: `Failed to send message to ${contact.name}: ${errorMessage}`,
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Network error'
        setFailedMessages(prev => [...prev, { contact, error: errorMessage }])
        setRetryQueue(prev => [...prev, { contact, message }])
        onNotification({
          type: 'error',
          title: 'Retry Failed',
          message: `Failed to send message to ${contact.name}: ${errorMessage}`,
        })
      }

      // Add delay between retries
      await new Promise((resolve) => setTimeout(resolve, delayBetweenMessages * 1000))
    }

    setSending(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Message Sender</CardTitle>
          <CardDescription>Send messages to multiple contacts at once.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!session || session.status !== "connected" ? (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Please go to the Integration page and connect to WhatsApp to use the bulk sender.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">Select Template</Label>
                <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId || ""}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a message template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Enter your message content. Use {{name}} for contact name substitution."
                  disabled={sending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="delay">Delay Between Messages (seconds)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="1"
                    max="60"
                    value={delayBetweenMessages}
                    onChange={(e) => setDelayBetweenMessages(Number(e.target.value))}
                    disabled={sending}
                  />
                </div>

                <div>
                  <Label htmlFor="batch">Batch Size</Label>
                  <Input
                    id="batch"
                    type="number"
                    min="1"
                    max="100"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    disabled={sending}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || contacts.length === 0 || !messageContent.trim()}
                    className="w-full"
                  >
                    {sending ? 'Sending...' : 'Send Messages'}
                  </Button>
                </div>
              </div>

              {sending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sent: {sentCount}</span>
                    <span>Failed: {failedCount}</span>
                    <span>Pending: {contacts.length - sentCount - failedCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((sentCount + failedCount) / contacts.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {failedMessages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Failed Messages</h3>
          <div className="space-y-2">
            {failedMessages.map(({ contact, error }, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-lg">
                <p className="font-medium text-red-800">{contact.name}</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={handleRetryFailed}
            disabled={sending || retryQueue.length === 0}
            className="w-full"
          >
            {sending ? 'Retrying...' : 'Retry Failed Messages'}
          </Button>
        </div>
      )}
    </div>
  )
}
