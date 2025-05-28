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
  Bell,
  LayoutDashboard,
} from "lucide-react"

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
        {navigation.map((item) => (
          <Button
            key={item.page}
            variant={activePage === item.page ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              activePage === item.page && "bg-secondary"
            )}
            onClick={() => onPageChange(item.page)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </Button>
      </div>
    </div>
  )
} 