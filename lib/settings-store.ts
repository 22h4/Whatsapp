import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from './storage'

interface SettingsStore extends Settings {
  setTheme: (theme: Settings['theme']) => void
  setLanguage: (language: string) => void
  setTimezone: (timezone: string) => void
  setEmailNotifications: (enabled: boolean) => void
  setPushNotifications: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setDefaultDelay: (delay: number) => void
  setMaxRetries: (retries: number) => void
  setAutoBackup: (enabled: boolean) => void
  setDataRetention: (days: number) => void
  setAnalyticsEnabled: (enabled: boolean) => void
  setCrashReporting: (enabled: boolean) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
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
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setEmailNotifications: (emailNotifications) => set({ emailNotifications }),
      setPushNotifications: (pushNotifications) => set({ pushNotifications }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setDefaultDelay: (defaultDelay) => set({ defaultDelay }),
      setMaxRetries: (maxRetries) => set({ maxRetries }),
      setAutoBackup: (autoBackup) => set({ autoBackup }),
      setDataRetention: (dataRetention) => set({ dataRetention }),
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
      setCrashReporting: (crashReporting) => set({ crashReporting }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'whatsapp-settings',
    }
  )
) 