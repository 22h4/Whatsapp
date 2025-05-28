"use client"

import type React from "react"

import { useState } from "react"
import { Eye, FileText, ImageIcon, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface Contact {
  id: string
  name: string
  phone: string
  [key: string]: string
}

interface MessageComposerProps {
  onMessageSent: (message: { content: string; attachments: File[] }) => void
}

export default function MessageComposer({ onMessageSent }: MessageComposerProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [previewContact, setPreviewContact] = useState<Contact | null>(null)

  const getAvailableVariables = () => {
    return ['name', 'phone', 'email', 'company', 'title']
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("message-textarea") as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newMessage = message.substring(0, start) + `{{${variable}}}` + message.substring(end)
    setMessage(newMessage)

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4)
    }, 0)
  }

  const renderPreview = (contact: Contact) => {
    let preview = message
    getAvailableVariables().forEach((variable) => {
      const regex = new RegExp(`{{${variable}}}`, "g")
      preview = preview.replace(regex, contact[variable] || `[${variable}]`)
    })
    return preview
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const handleSend = () => {
    onMessageSent({
      content: message,
      attachments,
    })
    setMessage("")
    setAttachments([])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Message Composer</CardTitle>
          <CardDescription>Create your message template with personalized variables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label htmlFor="message-textarea">Message Template</Label>
                <Textarea
                  id="message-textarea"
                  placeholder="Type your message here... Use {{name}}, {{phone}}, etc. for personalization"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[200px] mt-2"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  Character count: {message.length} | Estimated SMS parts: {Math.ceil(message.length / 160)}
                </div>
              </div>

              <div>
                <Label>Attachments (Optional)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Add Attachment
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    <span className="text-sm text-muted-foreground">Images, PDFs, and documents</span>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file)}
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Available Variables</Label>
                <div className="mt-2 space-y-2">
                  {getAvailableVariables().length > 0 ? (
                    getAvailableVariables().map((variable) => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable)}
                        className="w-full justify-start"
                      >
                        {`{{${variable}}}`}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Upload contacts to see available variables</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Message Preview</Label>
                <div className="mt-2">
                  {previewContact && (
                    <div className="space-y-2">
                      <Label>Preview for {previewContact.name}:</Label>
                      <div className="p-4 border rounded bg-muted/50 whitespace-pre-wrap">
                        {renderPreview(previewContact) || "Your message will appear here..."}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Quick templates to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Order Confirmation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Hi {`{{name}}`}, your order {`{{order}}`} has been confirmed. Total: {`{{amount}}`}. Thank you!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage("Hi {{name}}, your order {{order}} has been confirmed. Total: {{amount}}. Thank you!")
                }}
              >
                Use Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Appointment Reminder</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Hello {`{{name}}`}, this is a reminder about your appointment on {`{{date}}`} at {`{{time}}`}.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage("Hello {{name}}, this is a reminder about your appointment on {{date}} at {{time}}.")
                }}
              >
                Use Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Welcome Message</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Welcome to our service, {`{{name}}`}! We're excited to have you on board.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage("Welcome to our service, {{name}}! We're excited to have you on board.")
                }}
              >
                Use Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Payment Reminder</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Hi {`{{name}}`}, your payment of {`{{amount}}`} is due on {`{{due_date}}`}. Please pay to avoid late
                fees.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage(
                    "Hi {{name}}, your payment of {{amount}} is due on {{due_date}}. Please pay to avoid late fees.",
                  )
                }}
              >
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
          <CardDescription>Send your message to the selected contact</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSend}
            disabled={!message || attachments.length === 0}
          >
            Send Message
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
