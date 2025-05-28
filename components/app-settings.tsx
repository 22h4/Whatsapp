"use client"

import type React from "react"
import { Save, Moon, Sun, Globe, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StorageManager from "@/components/storage-manager"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface AppSettingsProps {
  onSettingsUpdate: (settings: any) => void
}

export default function AppSettings({ onSettingsUpdate }: AppSettingsProps) {
  const [settings, setSettings] = useLocalStorage("whatsapp-app-settings", {
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
  })

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsUpdate(newSettings)
  }

  const saveSettings = () => {
    // In a real app, this would save to backend/localStorage
    onSettingsUpdate(settings)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "whatsapp-automation-settings.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)
        setSettings((prev) => ({ ...prev, ...importedSettings }))
        onSettingsUpdate(importedSettings)
      } catch (error) {
        console.error("Invalid settings file format")
      }
    }
    reader.readAsText(file)
  }

  const resetSettings = () => {
    setSettings({
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
    })
    onSettingsUpdate(settings)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>Configure your application preferences</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportSettings}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                  <input type="file" accept=".json" onChange={importSettings} className="hidden" />
                </label>
              </Button>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sound"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                  />
                  <Label htmlFor="sound">Sound Effects</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoBackup"
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                  />
                  <Label htmlFor="autoBackup">Auto Backup</Label>
                </div>

                <div>
                  <Label>Data Retention (days)</Label>
                  <Input
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => handleSettingChange("dataRetention", parseInt(e.target.value))}
                    min={1}
                    max={365}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="analytics"
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) => handleSettingChange("analyticsEnabled", checked)}
                  />
                  <Label htmlFor="analytics">Analytics Tracking</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="crashReporting"
                    checked={settings.crashReporting}
                    onCheckedChange={(checked) => handleSettingChange("crashReporting", checked)}
                  />
                  <Label htmlFor="crashReporting">Crash Reporting</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
