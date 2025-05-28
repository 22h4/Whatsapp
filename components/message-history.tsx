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

interface Message {
  id: string
  content: string
  scheduledAt: string
  status: "pending" | "sent" | "failed"
  contactId: string
  createdAt: string
  updatedAt: string
  attachments?: File[]
}

interface MessageHistoryProps {
  messages: Message[]
}

export default function MessageHistory({ messages }: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("7d")
  const isMobile = useMobile()

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || message.status === statusFilter

    const now = new Date()
    const messageDate = new Date(message.scheduledAt)
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

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: Message["status"]) => {
    const variants = {
      sent: "bg-green-100 text-green-800",
      pending: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
    }

    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const exportHistory = () => {
    const csvContent = [
      "ID,Content,Scheduled At,Status,Contact ID,Created At,Updated At",
      ...filteredMessages.map(
        (msg) =>
          `"${msg.id}","${msg.content}","${msg.scheduledAt}","${msg.status}","${msg.contactId}","${msg.createdAt}","${msg.updatedAt}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `message-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
                <SelectItem value="pending">Pending</SelectItem>
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
                    <p className="text-sm line-clamp-2">{message.content}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(message.status)}
                    {getStatusBadge(message.status)}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{new Date(message.scheduledAt).toLocaleString()}</span>
                  <span>Contact ID: {message.contactId}</span>
                </div>

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
              <CardDescription>View and manage your message history</CardDescription>
            </div>
            <Button variant="outline" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
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

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled At</TableHead>
                    <TableHead>Contact ID</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate">{message.content}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(message.status)}
                          {getStatusBadge(message.status)}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(message.scheduledAt).toLocaleString()}</TableCell>
                      <TableCell>{message.contactId}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MessageDetailsProps {
  message: Message
}

function MessageDetails({ message }: MessageDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-1">Message Content</h4>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Status</h4>
          <p className="text-sm">{message.status}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Scheduled At</h4>
          <p className="text-sm">{new Date(message.scheduledAt).toLocaleString()}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Contact ID</h4>
          <p className="text-sm">{message.contactId}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Created At</h4>
          <p className="text-sm">{new Date(message.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {message.attachments && message.attachments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-1">Attachments</h4>
          <div className="space-y-2">
            {message.attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
