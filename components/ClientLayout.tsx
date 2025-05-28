"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import ContactList from "@/components/contact-list"
import WhatsAppIntegration from "@/components/whatsapp-integration"
import BulkSender from "@/components/bulk-sender"
import MessageTemplates from "@/components/message-templates"
import CampaignManager from "@/components/campaign-manager"
import Analytics from "@/components/analytics"
import AutomationRules from "@/components/automation-rules"
import Settings from "@/components/settings"
import Dashboard from "@/components/dashboard"
import { getContacts, getSession, updateSession, getSettings, updateSettings } from "@/lib/storage"
import type { Contact, WhatsAppSession, Settings as SettingsType } from "@/lib/storage"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState("dashboard")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [session, setSession] = useState<WhatsAppSession>({
    isAuthenticated: false,
    type: 'web',
    status: 'disconnected',
    lastActive: new Date().toISOString(),
    deviceInfo: {
      platform: 'web',
      browser: 'chrome',
      version: '1.0.0'
    }
  })
  const [settings, setSettings] = useState<SettingsType>({
    id: 'default',
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
        const [loadedContacts, loadedSession, loadedSettings] = await Promise.all([
          getContacts(),
          getSession(),
          getSettings()
        ]);
        
        setContacts(loadedContacts);
        setSession(loadedSession);
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

  const handleContactsUpdate = (updatedContacts: Contact[]) => {
    setContacts(updatedContacts);
  };

  const handleSessionUpdate = async (updates: Partial<WhatsAppSession>) => {
    try {
      const updatedSession = { ...session, ...updates };
      await updateSession(updatedSession);
      setSession(updatedSession);
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleSettingsUpdate = async (updates: Partial<SettingsType>) => {
    try {
      const updatedSettings = { ...settings, ...updates };
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const renderPage = () => {
    if (!isClient || isLoading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard contacts={contacts} session={session} />
      case "contacts":
        return <ContactList contacts={contacts} onContactsUpdate={handleContactsUpdate} />
      case "integration":
        return <WhatsAppIntegration session={session} onSessionUpdate={handleSessionUpdate} />
      case "bulk-sender":
        return <BulkSender contacts={contacts} session={session} />
      case "templates":
        return <MessageTemplates />
      case "campaigns":
        return <CampaignManager />
      case "analytics":
        return <Analytics campaigns={[]} messages={[]} />
      case "automation":
        return <AutomationRules />
      case "settings":
        return <Settings settings={settings} onSettingsUpdate={handleSettingsUpdate} />
      default:
        return <Dashboard contacts={contacts} session={session} />
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      <main className="flex-1 overflow-y-auto p-8">
        {renderPage()}
      </main>
    </div>
  )
} 