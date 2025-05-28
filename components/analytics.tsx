"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCampaigns } from "@/lib/storage"
import type { Campaign, Message } from "@/lib/storage"

interface AnalyticsProps {
  onNotification: (notification: any) => void;
  campaigns: Campaign[];
  messages: Message[];
}

export default function Analytics({
  onNotification,
  campaigns,
  messages,
}: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d")

  const calculateMetrics = () => {
    const now = new Date()
    const startDate = new Date()
    switch (timeRange) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24)
        break
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    const filteredCampaigns = campaigns.filter(
      (campaign) => new Date(campaign.createdAt) >= startDate && new Date(campaign.createdAt) <= now
    )

    const totalCampaigns = filteredCampaigns.length
    const totalMessages = filteredCampaigns.reduce((sum, campaign) => sum + campaign.metrics.sent, 0)
    const totalContacts = filteredCampaigns.reduce((sum, campaign) => sum + campaign.metrics.totalContacts, 0)
    const avgResponseRate = filteredCampaigns.reduce((sum, campaign) => sum + (campaign.metrics.replied / campaign.metrics.sent) * 100, 0) / totalCampaigns || 0

    return {
      totalCampaigns,
      totalMessages,
      totalContacts,
      avgResponseRate,
      campaigns: filteredCampaigns,
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Active campaigns in selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Messages sent in selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Unique contacts reached
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average response rate across campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="messages">Message Analytics</TabsTrigger>
          <TabsTrigger value="contacts">Contact Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed performance metrics for each campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {campaign.metrics.sent} / {campaign.metrics.totalContacts} sent
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((campaign.metrics.replied / campaign.metrics.sent) * 100).toFixed(1)}% response rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Analytics</CardTitle>
              <CardDescription>
                Message delivery and response patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add message analytics visualization here */}
                <p className="text-muted-foreground">
                  Message analytics visualization coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Engagement</CardTitle>
              <CardDescription>
                Contact interaction and response patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add contact engagement visualization here */}
                <p className="text-muted-foreground">
                  Contact engagement visualization coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 