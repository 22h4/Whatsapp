"use client"

import { useState } from "react"
import { Search, Download, MessageSquare, Clock, CheckCircle, XCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMobile } from "@/hooks/use-mobile"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface MessageRecord {
  id: string
  recipient: string
  phone: string
  message: string
  status: "sent" | "delivered" | "read" | "failed"
  timestamp: Date
  campaign?: string
  error?: string
  deliveredAt?: Date
  readAt?: Date
}

interface MessageHistoryProps {
  onNotification: (notification: any) => void
}

export default function MessageHistory({ onNotification }: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("7d")
  const isMobile = useMobile()

  // Mock data for demonstration
  const [messageHistory, setMessageHistory] = useLocalStorage<MessageRecord[]>("whatsapp-message-history", [
    // Keep the existing mock data as initial data
    {
      id: "msg_001",
      recipient: "John Doe",
      phone: "+1234567890",
      message: "Hi John, your order #12345 has been confirmed. Total: $99.99. Thank you!",
      status: "read",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      campaign: "Order Confirmations",
      deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
      readAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 120000),
    },
    {
      id: "msg_002",
      recipient: "Jane Smith",
      phone: "+0987654321",
      message: "Hello Jane, this is a reminder about your appointment on 2024-01-20 at 10:00 AM.",
      status: "delivered",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      campaign: "Appointment Reminders",
      deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 45000),
    },
    {
      id: "msg_003",
      recipient: "Bob Johnson",
      phone: "+1122334455",
      message: "Welcome to our service, Bob! We're excited to have you on board.",
      status: "failed",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      campaign: "Welcome Messages",
      error: "Invalid phone number",
    },
    {
      id: "msg_004",
      recipient: "Alice Brown",
      phone: "+5566778899",
      message: "Hi Alice, your payment of $150.00 is due on 2024-01-25. Please pay to avoid late fees.",
      status: "sent",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      campaign: "Payment Reminders",
    },
  ])

  const filteredMessages = messageHistory.filter((message) => {
    const matchesSearch =
      message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.phone.includes(searchTerm) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || message.status === statusFilter

    const now = new Date()
    const messageDate = message.timestamp
    let matchesDate = true

    if (dateFilter === "1d") {
      matchesDate = now.getTime() - messageDate.getTime() <= 24 * 60 * 60 * 1000
    } else if (dateFilter === "7d") {
      matchesDate = now.getTime() - messageDate.getTime() <= 7 * 24 * 60 * 60 * 1000
    } else if (dateFilter === "30d") {
      matchesDate = now.getTime() - messageDate.getTime() <= 30 * 24 * 60 * 60 * 1000
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusIcon = (status: MessageRecord["status"]) => {
    switch (status) {
      case "sent":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "read":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: MessageRecord["status"]) => {
    const variants = {
      sent: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      read: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }

    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const exportHistory = () => {
    const csvContent = [
      "Recipient,Phone,Message,Status,Timestamp,Campaign,Error",
      ...filteredMessages.map(
        (msg) =>
          `"${msg.recipient}","${msg.phone}","${msg.message}","${msg.status}","${msg.timestamp.toISOString()}","${msg.campaign || ""}","${msg.error || ""}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `message-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    onNotification({
      type: "success",
      title: "Export Complete",
      message: "Message history exported successfully",
    })
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportHistory}>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <Card key={message.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{message.recipient}</h3>
                    <p className="text-sm text-muted-foreground">{message.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(message.status)}
                    {getStatusBadge(message.status)}
                  </div>
                </div>

                <div className="text-sm">
                  <p className="line-clamp-2">{message.message}</p>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{message.timestamp.toLocaleString()}</span>
                  {message.campaign && (
                    <Badge variant="outline" className="text-xs">
                      {message.campaign}
                    </Badge>
                  )}
                </div>

                {message.error && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">Error: {message.error}</div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Message Details</DialogTitle>
                    </DialogHeader>
                    <MessageDetails message={message} />
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No messages found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Start sending messages to see history here"}
            </p>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Message History</CardTitle>
              <CardDescription>View and track all sent messages</CardDescription>
            </div>
            <Button onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by recipient, phone, or message content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredMessages.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">{message.recipient}</TableCell>
                      <TableCell>{message.phone}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={message.message}>
                          {message.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(message.status)}
                          {getStatusBadge(message.status)}
                        </div>
                      </TableCell>
                      <TableCell>{message.timestamp.toLocaleString()}</TableCell>
                      <TableCell>{message.campaign && <Badge variant="outline">{message.campaign}</Badge>}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Message Details</DialogTitle>
                            </DialogHeader>
                            <MessageDetails message={message} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Start sending messages to see your history here"}
              </p>
              {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setDateFilter("7d")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface MessageDetailsProps {
  message: MessageRecord
}

function MessageDetails({ message }: MessageDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Recipient Information</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span>{message.recipient}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone:</span>
            <span>{message.phone}</span>
          </div>
          {message.campaign && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign:</span>
              <span>{message.campaign}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Message Content</h4>
        <div className="p-3 bg-muted/50 rounded text-sm whitespace-pre-wrap">{message.message}</div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Delivery Timeline</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-muted-foreground">Sent:</span>
            <span>{message.timestamp.toLocaleString()}</span>
          </div>

          {message.deliveredAt && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-muted-foreground">Delivered:</span>
              <span>{message.deliveredAt.toLocaleString()}</span>
            </div>
          )}

          {message.readAt && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <span className="text-muted-foreground">Read:</span>
              <span>{message.readAt.toLocaleString()}</span>
            </div>
          )}

          {message.error && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-muted-foreground">Error:</span>
              <span className="text-red-600">{message.error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
