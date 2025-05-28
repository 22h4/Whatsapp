"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, MessageSquare, Send, FileText, BarChart2, Zap } from "lucide-react"
import { getContacts, getTemplates, getCampaigns } from "@/lib/storage"
import type { Contact, WhatsAppSession, Campaign, MessageTemplate } from "@/lib/storage"

interface DashboardProps {
  contacts: Contact[];
  session: WhatsAppSession;
}

export default function Dashboard({ contacts, session }: DashboardProps) {
  const templates = getTemplates()
  const campaigns = getCampaigns()

  const stats = {
    totalContacts: contacts.length,
    activeCampaigns: campaigns.filter(c => c.status === "running").length,
    totalTemplates: templates.length,
    messagesSent: campaigns.reduce((sum, campaign) => sum + campaign.metrics.sent, 0),
    responseRate: campaigns.length > 0 ? campaigns.reduce((sum, campaign) => sum + (campaign.metrics.sent > 0 ? (campaign.metrics.replied / campaign.metrics.sent) * 100 : 0), 0) / campaigns.length : 0,
  }

  const recentCampaigns = campaigns
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Total contacts in your database
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Currently running campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Message Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              Available message templates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average response rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>
              Overview of your most recent campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="space-y-2">
                  <div className="flex items-center justify-between">
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
                  <Progress
                    value={(campaign.metrics.sent / campaign.metrics.totalContacts) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Add New Contact
              </Button>
              <Button className="w-full justify-start">
                <Send className="mr-2 h-4 w-4" />
                Start New Campaign
              </Button>
              <Button className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Create Template
              </Button>
              <Button className="w-full justify-start">
                <Zap className="mr-2 h-4 w-4" />
                Set Up Automation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 