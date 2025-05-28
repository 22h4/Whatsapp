"use client"

import { useState } from "react"
import { BarChart3, Download, TrendingUp, TrendingDown, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StatusReportsProps {
  stats: {
    total: number
    sent: number
    failed: number
    pending: number
  }
}

export default function StatusReports({ stats }: StatusReportsProps) {
  const [dateRange, setDateRange] = useState("7d")

  // Calculate success rate
  const successRate = stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : "0.0"

  // Mock data for demonstration
  const mockCampaigns = [
    {
      id: 1,
      name: "Order Confirmations",
      date: "2024-01-15",
      sent: 150,
      delivered: 145,
      failed: 5,
      successRate: 96.7,
    },
    {
      id: 2,
      name: "Appointment Reminders",
      date: "2024-01-14",
      sent: 89,
      delivered: 87,
      failed: 2,
      successRate: 97.8,
    },
    {
      id: 3,
      name: "Welcome Messages",
      date: "2024-01-13",
      sent: 45,
      delivered: 43,
      failed: 2,
      successRate: 95.6,
    },
  ]

  const mockErrorReasons = [
    { reason: "Invalid phone number", count: 4 },
    { reason: "Network timeout", count: 3 },
    { reason: "Rate limit exceeded", count: 2 },
  ]

  const exportReport = () => {
    const csvContent = [
      "Campaign,Date,Sent,Delivered,Failed,Success Rate",
      ...mockCampaigns.map(
        (campaign) =>
          `${campaign.name},${campaign.date},${campaign.sent},${campaign.delivered},${campaign.failed},${campaign.successRate}%`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `whatsapp-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status Reports & Analytics</CardTitle>
              <CardDescription>Track message delivery status and campaign performance</CardDescription>
            </div>
            <div className="flex space-x-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Messages Sent</div>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{successRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-green-500">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="campaigns" className="space-y-4">
            <TabsList>
              <TabsTrigger value="campaigns">Campaign History</TabsTrigger>
              <TabsTrigger value="errors">Error Analysis</TabsTrigger>
              <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campaign Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Delivered</TableHead>
                          <TableHead>Failed</TableHead>
                          <TableHead>Success Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockCampaigns.map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>{campaign.date}</TableCell>
                            <TableCell>{campaign.sent}</TableCell>
                            <TableCell className="text-green-600">{campaign.delivered}</TableCell>
                            <TableCell className="text-red-600">{campaign.failed}</TableCell>
                            <TableCell>
                              <Badge
                                variant={campaign.successRate >= 95 ? "default" : "secondary"}
                                className={
                                  campaign.successRate >= 95
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {campaign.successRate}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors">
              <Card>
                <CardHeader>
                  <CardTitle>Error Analysis</CardTitle>
                  <CardDescription>Common reasons for message delivery failures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockErrorReasons.map((error, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium">{error.reason}</span>
                        <Badge variant="secondary">{error.count} occurrences</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Validate phone numbers before sending</li>
                      <li>• Implement retry logic for network timeouts</li>
                      <li>• Monitor rate limits and adjust sending speed</li>
                      <li>• Keep contact lists updated and clean</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                        <span className="font-medium">{successRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pending Messages</span>
                        <span className="font-medium">{stats.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Failed Messages</span>
                        <span className="font-medium text-red-600">{stats.failed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Message Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Messages</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Delivered</span>
                        <span className="font-medium text-green-600">{stats.sent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pending</span>
                        <span className="font-medium text-blue-600">{stats.pending}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
