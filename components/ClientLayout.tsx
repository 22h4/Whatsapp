"use client"

import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Sidebar } from "@/components/sidebar"
import { Notifications } from "@/components/notifications"
import ContactList from "@/components/contact-list"
import WhatsAppIntegration from "@/components/whatsapp-integration"
import BulkSender from "@/components/bulk-sender"
import MessageTemplates from "@/components/message-templates"
import CampaignManager from "@/components/campaign-manager"
import Analytics from "@/components/analytics"
import AutomationRules from "@/components/automation-rules"
import Settings from "@/components/settings"
import Dashboard from "@/components/dashboard"
import { getContacts, getSession, updateSession, getNotifications, getSettings, updateSettings } from "@/lib/storage"
import type { Contact, WhatsAppSession, Notification, Settings as SettingsType } from "@/lib/storage"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState("dashboard")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [session, setSession] = useState<WhatsAppSession>({ type: 'web', status: 'disconnected' })
  const [settings, setSettings] = useState<SettingsType>({
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    defaultDelay: 2,
    maxRetries: 3,
    autoBackup: true,
    dataRetention: 30,
    analyticsEnabled: true,
    crashReporting: true,
  })
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedContacts, loadedSession, loadedNotifications, loadedSettings] = await Promise.all([
          getContacts(),
          getSession(),
          getNotifications(),
          getSettings()
        ]);
        
        setContacts(loadedContacts);
        setSession(loadedSession);
        setNotifications(loadedNotifications);
        setSettings(loadedSettings);
        setIsClient(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const { toast } = useToast();

  const handleNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    try {
      const newNotification = await addNotification(notification);
      setNotifications(prev => [newNotification, ...prev]);
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type,
      });
    } catch (error) {
      console.error('Failed to add notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to add notification',
        variant: 'error',
      });
    }
  };

  const handleContactsUpdate = (updatedContacts: Contact[]) => {
    setContacts(updatedContacts);
  };

  const handleSessionUpdate = async (updates: Partial<WhatsAppSession>) => {
    try {
      const updatedSession = await updateSession(updates);
      setSession(updatedSession);
    } catch (error) {
      console.error('Failed to update session:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session',
        variant: 'error',
      });
    }
  };

  const handleSettingsUpdate = async (updates: Partial<SettingsType>) => {
    try {
      const updatedSettings = await updateSettings(updates);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'error',
      });
    }
  };

  const renderPage = () => {
    if (!isClient || isLoading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard onNotification={handleNotification} contacts={contacts} session={session} notifications={notifications} />
      case "contacts":
        return <ContactList contacts={contacts} onContactsUpdate={handleContactsUpdate} onNotification={handleNotification} />
      case "integration":
        return <WhatsAppIntegration session={session} onSessionUpdate={handleSessionUpdate} onNotification={handleNotification} />
      case "bulk-sender":
        return <BulkSender contacts={contacts} session={session} onNotification={handleNotification} />
      case "templates":
        return <MessageTemplates onNotification={handleNotification} />
      case "campaigns":
        return <CampaignManager onNotification={handleNotification} />
      case "analytics":
        return <Analytics onNotification={handleNotification} campaigns={[]} messages={[]} />
      case "automation":
        return <AutomationRules onNotification={handleNotification} />
      case "settings":
        return <Settings onNotification={handleNotification} settings={settings} onSettingsUpdate={handleSettingsUpdate} />
      default:
        return <Dashboard onNotification={handleNotification} contacts={contacts} session={session} notifications={notifications} />
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      <main className="flex-1 overflow-y-auto p-8">
        {renderPage()}
      </main>
      <div className="fixed top-4 right-4 z-50">
        <Notifications />
      </div>
      <Toaster />
    </div>
  )
} 