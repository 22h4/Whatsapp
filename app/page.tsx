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
} from "@/lib/storage"

const defaultSettings: SettingsType = {
  id: 'default',
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  emailNotifications: true,
  pushNotifications: true,
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

  const stats = {
    total: contacts.length,
    sent: messages.filter(m => m.status === 'sent').length,
    failed: messages.filter(m => m.status === 'failed').length,
    pending: messages.filter(m => m.status === 'pending').length,
  }

  const handleNotification = (type: 'success' | 'error', title: string, message: string) => {
    if (type === 'error') {
      toast({
        title,
        description: message,
        variant: 'destructive',
      })
    } else {
      toast({
        title,
        description: message,
      })
    }
  }

  const handleSessionUpdate = (updates: Partial<WhatsAppSession>) => {
    const newSession = { ...session, ...updates }
    updateSession(newSession)
    setSession(newSession)
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
      <DesktopSidebar />

      {/* Mobile Header */}
      <header className="md:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex items-center space-x-2 mb-6">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                  <h1 className="text-lg font-bold">WhatsApp Auto</h1>
                </div>
                <nav className="space-y-2">
                  {tabItems.slice(4).map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      onClick={() => {
                        handleTabChange(tab.id)
                        setIsMenuOpen(false)
                      }}
                      className="w-full justify-start"
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleTabChange("settings")
                      setIsMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    <SettingsIcon className="mr-3 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            <MessageSquare className="h-6 w-6 text-green-600" />
            <h1 className="text-lg font-bold">WhatsApp Auto</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${session.type === 'business' && session.status === 'connected' ? "bg-green-500" : "bg-gray-300"}`}
              />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {session.type === 'business' ? "Business" : session.type === 'web' ? "Web" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block md:ml-64 border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold capitalize">
                {activeTab.replace(/([A-Z])/g, " $1")}
              </h2>
              <p className="text-muted-foreground">
                {activeTab === "upload" && "Upload and manage your contact lists"}
                {activeTab === "contacts" && "View and edit your contacts"}
                {activeTab === "groups" && "Organize contacts into groups"}
                {activeTab === "compose" && "Create message templates"}
                {activeTab === "integration" && "Connect to WhatsApp"}
                {activeTab === "send" && "Send bulk messages"}
                {activeTab === "history" && "View message history"}
                {activeTab === "reports" && "Analytics and reports"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${session.type === 'business' && session.status === 'connected' ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span className="text-sm text-muted-foreground">Business API</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${session.type === 'web' && session.status === 'connected' ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm text-muted-foreground">Web API</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${isMobile ? "pb-20" : "md:ml-64"} p-4 md:p-6`}>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.sent - stats.failed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "upload" && (
            <FileUpload 
              onContactsLoaded={(contacts) => setContacts(contacts as Contact[])} 
              onNotification={(type, title, message) => handleNotification(type, title, message)} 
            />
          )}
          {activeTab === "contacts" && (
            <ContactList 
              contacts={contacts} 
              onContactsUpdate={(contacts) => setContacts(contacts as Contact[])} 
              onNotification={(type, title, message) => handleNotification(type, title, message)} 
            />
          )}
          {activeTab === "groups" && (
            <ContactGroups 
              contacts={contacts} 
              onNotification={(type, title, message) => handleNotification(type, title, message)} 
            />
          )}
          {activeTab === "compose" && (
            <MessageComposer 
              contacts={contacts} 
              onNotification={(type, title, message) => handleNotification(type, title, message)} 
            />
          )}
          {activeTab === "integration" && (
            <WhatsAppIntegration
              session={session}
              onSessionUpdate={handleSessionUpdate}
              onNotification={(type, title, message) => handleNotification(type, title, message)}
            />
          )}
          {activeTab === "send" && (
            <div className="space-y-6">
              <BulkSender 
                contacts={contacts} 
                session={session} 
                onNotification={(type, title, message) => handleNotification(type, title, message)} 
              />
              <MessageScheduler 
                contacts={contacts} 
                onNotification={(type, title, message) => handleNotification(type, title, message)} 
              />
            </div>
          )}
          {activeTab === "history" && (
            <MessageHistory 
              messages={messages} 
              onNotification={(type, title, message) => handleNotification(type, title, message)} 
            />
          )}
          {activeTab === "reports" && <StatusReports messages={messages} />}
          {activeTab === "settings" && (
            <AppSettings 
              settings={settings} 
              onSettingsUpdate={setSettings} 
              onNotification={(type, title, message) => handleNotification(type, title, message)} 
            />
          )}
        </div>
      </main>

      <MobileNavigation />
    </div>
  )
}
