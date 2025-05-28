"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Clock, Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Contact {
  id: string
  name: string
  phone: string
  [key: string]: string
}

interface ScheduledMessage {
  id: string
  message: string
  scheduledTime: Date
  contacts: Contact[]
  status: "scheduled" | "sent" | "failed"
  createdAt: Date
}

interface MessageSchedulerProps {
  contacts: Contact[]
  onNotification: (type: 'success' | 'error', title: string, message: string) => void
}

export default function MessageScheduler({ contacts, onNotification }: MessageSchedulerProps) {
  const [scheduledMessages, setScheduledMessages] = useLocalStorage<ScheduledMessage[]>(
    "whatsapp-scheduled-messages",
    [],
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(null)

  const handleScheduleMessage = (messageData: Omit<ScheduledMessage, "id" | "status" | "createdAt">) => {
    const newMessage: ScheduledMessage = {
      ...messageData,
      id: `msg_${Date.now()}`,
      status: "scheduled",
      createdAt: new Date(),
    }
    setScheduledMessages((prev) => [...prev, newMessage])
    setIsDialogOpen(false)

    onNotification({
      type: "success",
      title: "Message Scheduled",
      message: `Message scheduled for ${messageData.scheduledTime.toLocaleString()}`,
    })
  }

  const handleEditMessage = (updatedMessage: ScheduledMessage) => {
    setScheduledMessages((prev) => prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg)))
    setEditingMessage(null)
  }

  const handleDeleteMessage = (id: string) => {
    setScheduledMessages((prev) => prev.filter((msg) => msg.id !== id))

    onNotification({
      type: "info",
      title: "Scheduled Message Deleted",
      message: "Scheduled message removed",
    })
  }

  const getStatusBadge = (status: ScheduledMessage["status"]) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }

    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Message Scheduler</CardTitle>
            <CardDescription>Schedule messages to be sent at specific times</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Message</DialogTitle>
              </DialogHeader>
              <ScheduleForm
                contacts={contacts}
                onSubmit={handleScheduleMessage}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {scheduledMessages.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={message.message}>
                        {message.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{message.contacts.length} contacts</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{message.scheduledTime.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{message.scheduledTime.toLocaleTimeString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMessage(message)}
                              disabled={message.status !== "scheduled"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Scheduled Message</DialogTitle>
                            </DialogHeader>
                            {editingMessage && (
                              <ScheduleForm
                                contacts={contacts}
                                initialData={editingMessage}
                                onSubmit={handleEditMessage}
                                onCancel={() => setEditingMessage(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={message.status === "sent"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No scheduled messages yet</div>
        )}
      </CardContent>
    </Card>
  )
}

interface ScheduleFormProps {
  contacts: Contact[]
  initialData?: ScheduledMessage
  onSubmit: (data: any) => void
  onCancel: () => void
}

function ScheduleForm({ contacts, initialData, onSubmit, onCancel }: ScheduleFormProps) {
  const [message, setMessage] = useState(initialData?.message || "")
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>(initialData?.contacts || [])
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduledTime.toISOString().split("T")[0] || "")
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime.toTimeString().slice(0, 5) || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)

    if (initialData) {
      onSubmit({
        ...initialData,
        message,
        contacts: selectedContacts,
        scheduledTime: scheduledDateTime,
      })
    } else {
      onSubmit({
        message,
        contacts: selectedContacts,
        scheduledTime: scheduledDateTime,
      })
    }
  }

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts((prev) => {
      const isSelected = prev.some((c) => c.id === contact.id)
      if (isSelected) {
        return prev.filter((c) => c.id !== contact.id)
      } else {
        return [...prev, contact]
      }
    })
  }

  const selectAllContacts = () => {
    setSelectedContacts(contacts)
  }

  const clearSelection = () => {
    setSelectedContacts([])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message..."
          className="min-h-[100px] mt-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Recipients ({selectedContacts.length} selected)</Label>
          <div className="space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={selectAllContacts}>
              Select All
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
        <div className="border rounded-lg max-h-48 overflow-auto p-2 space-y-1">
          {contacts.map((contact) => (
            <label
              key={contact.id}
              className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedContacts.some((c) => c.id === contact.id)}
                onChange={() => toggleContactSelection(contact)}
              />
              <span className="flex-1">{contact.name}</span>
              <span className="text-sm text-muted-foreground">{contact.phone}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!message || !scheduledDate || !scheduledTime || selectedContacts.length === 0}>
          {initialData ? "Update" : "Schedule"} Message
        </Button>
      </div>
    </form>
  )
}
