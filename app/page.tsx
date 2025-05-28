"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Users, BarChart3, Calendar, Menu, Settings as SettingsIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import FileUpload from "@/components/file-upload"
import ContactList from "@/components/contact-list"
import MessageComposer from "@/components/message-composer"
import WhatsAppIntegration from "@/components/whatsapp-integration"
import BulkSender from "@/components/bulk-sender"
import StatusReports from "@/components/status-reports"
import MessageScheduler from "@/components/message-scheduler"
import ContactGroups from "@/components/contact-groups"
import MessageHistory from "@/components/message-history"
import AppSettings from "@/components/app-settings"
import { useMobile } from "@/hooks/use-mobile"
import {
  getContacts,
  getGroups,
  getMessages,
  getSettings,
  getSession,
  getActiveTab,
  setActiveTab,
  updateSession,
  type Contact,
  type Group,
  type Message,
  type Settings as SettingsType,
  type WhatsAppSession,
  addGroup,
} from "@/lib/storage"

const defaultSettings: SettingsType = {
  id: 'default',
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  soundEnabled: true,
  defaultDelay: 2,
  maxRetries: 3,
  autoBackup: true,
  dataRetention: 30,
  analyticsEnabled: true,
  crashReporting: true,
}

const defaultSession: WhatsAppSession = {
  isAuthenticated: false,
  lastActive: new Date().toISOString(),
  deviceInfo: {
    platform: 'web',
    browser: 'chrome',
    version: '1.0.0',
  },
  type: 'web',
  status: 'disconnected',
}

export default function WhatsAppAutomationApp() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [settings, setSettings] = useState<SettingsType>(defaultSettings)
  const [session, setSession] = useState<WhatsAppSession>(defaultSession)
  const [activeTab, setActiveTabState] = useState('upload')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      setIsClient(true)
      try {
        const [loadedContacts, loadedGroups, loadedMessages, loadedSettings, loadedSession] = await Promise.all([
          getContacts(),
          getGroups(),
          getMessages(),
          getSettings(),
          getSession(),
        ])
        setContacts(loadedContacts)
        setGroups(loadedGroups)
        setMessages(loadedMessages)
        setSettings(loadedSettings)
        setSession(loadedSession)
        setActiveTabState(getActiveTab())
      } catch (error) {
        console.error('Failed to load data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load application data',
          variant: 'destructive',
        })
      }
    }
    loadData()
  }, [toast])

  // Update active tab in localStorage when it changes
  const handleTabChange = (tab: string) => {
    setActiveTabState(tab)
    setActiveTab(tab)
  }

  // Calculate message stats
  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.status === 'sent').length,
    failed: messages.filter(m => m.status === 'failed').length,
    pending: messages.filter(m => m.status === 'pending').length
  }

  const handleNotification = (type: 'success' | 'error', title: string, message: string) => {
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    })
  }

  const handleSessionUpdate = (updates: Partial<WhatsAppSession>) => {
    const newSession = { ...session, ...updates }
    updateSession(newSession)
    setSession(newSession)
  }

  // Update the group creation logic
  const handleGroupCreate = async (groupData: Omit<Group, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newGroup = await addGroup({
        ...groupData,
        color: "bg-blue-100 text-blue-800" // Add default color
      })
      setGroups([...groups, newGroup])
    } catch (error) {
      console.error("Failed to create group:", error)
    }
  }

  // Don't render anything until we're on the client
  if (!isClient) {
    return null
  }

  const tabItems = [
    { id: "upload", label: "Upload", icon: "📁" },
    { id: "contacts", label: "Contacts", icon: "👥" },
    { id: "groups", label: "Groups", icon: "📋" },
    { id: "compose", label: "Compose", icon: "✏️" },
    { id: "integration", label: "Connect", icon: "🔗" },
    { id: "send", label: "Send", icon: "📤" },
    { id: "history", label: "History", icon: "📜" },
    { id: "reports", label: "Reports", icon: "📊" },
  ]

  const MobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
      <div className="grid grid-cols-4 gap-1 p-2">
        {tabItems.slice(0, 4).map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange(tab.id)}
            className="flex flex-col h-12 text-xs"
          >
            <span className="text-base">{tab.icon}</span>
            <span className="truncate">{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )

  const DesktopSidebar = () => (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <MessageSquare className="h-8 w-8 text-green-600" />
          <h1 className="ml-2 text-xl font-bold">WhatsApp Auto</h1>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {tabItems.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => handleTabChange(tab.id)}
                className="w-full justify-start"
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileNavigation /> : <DesktopSidebar />}
      <main className={`${isMobile ? 'pb-16' : 'md:pl-64'} min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'upload' && (
            <FileUpload onContactsUpdate={setContacts} />
          )}
          {activeTab === 'contacts' && (
            <ContactList contacts={contacts} onContactsUpdate={setContacts} />
          )}
          {activeTab === 'groups' && (
            <ContactGroups groups={groups} onGroupsUpdate={setGroups} />
          )}
          {activeTab === 'compose' && (
            <MessageComposer 
              onMessageSent={(message) => {
                const newMessage = {
                  id: `msg_${Date.now()}`,
                  content: message.content,
                  scheduledAt: new Date().toISOString(),
                  status: 'pending' as const,
                  contactId: '', // This will be set when the message is actually sent
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  attachments: message.attachments
                }
                setMessages([...messages, newMessage])
              }} 
            />
          )}
          {activeTab === 'integration' && (
            <WhatsAppIntegration session={session} onSessionUpdate={handleSessionUpdate} />
          )}
          {activeTab === 'send' && (
            <BulkSender contacts={contacts} session={session} />
          )}
          {activeTab === 'history' && (
            <MessageHistory messages={messages} />
          )}
          {activeTab === 'reports' && (
            <StatusReports
              stats={{
                total: messages.length,
                sent: messages.filter((m) => m.status === "sent").length,
                failed: messages.filter((m) => m.status === "failed").length,
                pending: messages.filter((m) => m.status === "pending").length,
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
