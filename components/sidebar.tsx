"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Users,
  MessageSquare,
  Send,
  FileText,
  BarChart2,
  Settings,
  Zap,
  LayoutDashboard,
  LineChart,
} from "lucide-react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      page: "dashboard",
    },
    {
      name: "Contacts",
      icon: Users,
      page: "contacts",
    },
    {
      name: "Integration",
      icon: MessageSquare,
      page: "integration",
    },
    {
      name: "Bulk Sender",
      icon: Send,
      page: "bulk-sender",
    },
    {
      name: "Templates",
      icon: FileText,
      page: "templates",
    },
    {
      name: "Campaigns",
      icon: BarChart2,
      page: "campaigns",
    },
    {
      name: "Analytics",
      icon: BarChart2,
      page: "analytics",
    },
    {
      name: "Automation",
      icon: Zap,
      page: "automation",
    },
    {
      name: "Settings",
      icon: Settings,
      page: "settings",
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">WhatsApp Automation</h2>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Integration</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-sender" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Bulk Sender</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center space-x-2">
            <BarChart2 className="h-4 w-4" />
            <span>Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <LineChart className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Automation</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
      </nav>
    </div>
  )
} 