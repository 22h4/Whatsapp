import { create } from 'zustand'

interface Settings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  soundEnabled: boolean
  defaultDelay: number
  maxRetries: number
  autoBackup: boolean
  dataRetention: number
  analyticsEnabled: boolean
  crashReporting: boolean
  webhookUrl?: string
  apiKey?: string
}

interface SettingsStore {
  settings: Settings
  setTheme: (theme: Settings['theme']) => void
  setLanguage: (language: string) => void
  setTimezone: (timezone: string) => void
  setSoundEnabled: (enabled: boolean) => void
  setDefaultDelay: (delay: number) => void
  setMaxRetries: (retries: number) => void
  setAutoBackup: (enabled: boolean) => void
  setDataRetention: (days: number) => void
  setAnalyticsEnabled: (enabled: boolean) => void
  setCrashReporting: (enabled: boolean) => void
  setWebhookUrl: (url: string) => void
  setApiKey: (key: string) => void
}

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  soundEnabled: true,
  defaultDelay: 2,
  maxRetries: 3,
  autoBackup: true,
  dataRetention: 30,
  analyticsEnabled: true,
  crashReporting: true,
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  setTheme: (theme) => set((state) => ({ settings: { ...state.settings, theme } })),
  setLanguage: (language) => set((state) => ({ settings: { ...state.settings, language } })),
  setTimezone: (timezone) => set((state) => ({ settings: { ...state.settings, timezone } })),
  setSoundEnabled: (soundEnabled) => set((state) => ({ settings: { ...state.settings, soundEnabled } })),
  setDefaultDelay: (defaultDelay) => set((state) => ({ settings: { ...state.settings, defaultDelay } })),
  setMaxRetries: (maxRetries) => set((state) => ({ settings: { ...state.settings, maxRetries } })),
  setAutoBackup: (autoBackup) => set((state) => ({ settings: { ...state.settings, autoBackup } })),
  setDataRetention: (dataRetention) => set((state) => ({ settings: { ...state.settings, dataRetention } })),
  setAnalyticsEnabled: (analyticsEnabled) => set((state) => ({ settings: { ...state.settings, analyticsEnabled } })),
  setCrashReporting: (crashReporting) => set((state) => ({ settings: { ...state.settings, crashReporting } })),
  setWebhookUrl: (webhookUrl) => set((state) => ({ settings: { ...state.settings, webhookUrl } })),
  setApiKey: (apiKey) => set((state) => ({ settings: { ...state.settings, apiKey } })),
})) 