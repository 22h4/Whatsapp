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
  onNotification: (notification: any) => void
}

export default function AppSettings({ onNotification }: AppSettingsProps) {
  const [settings, setSettings] = useLocalStorage("whatsapp-app-settings", {
    // General Settings
    theme: "system",
    language: "en",
    timezone: "UTC",

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,

    // Messaging Settings
    defaultDelay: 2,
    maxRetries: 3,
    autoBackup: true,

    // Privacy Settings
    dataRetention: 30,
    analyticsEnabled: true,
    crashReporting: true,
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    // In a real app, this would save to backend/localStorage
    onNotification({
      type: "success",
      title: "Settings Saved",
      message: "Your preferences have been updated successfully",
    })
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

    onNotification({
      type: "success",
      title: "Settings Exported",
      message: "Settings file downloaded successfully",
    })
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)
        setSettings((prev) => ({ ...prev, ...importedSettings }))
        onNotification({
          type: "success",
          title: "Settings Imported",
          message: "Settings have been imported successfully",
        })
      } catch (error) {
        onNotification({
          type: "error",
          title: "Import Failed",
          message: "Invalid settings file format",
        })
      }
    }
    reader.readAsText(file)
  }

  const resetSettings = () => {
    setSettings({
      theme: "system",
      language: "en",
      timezone: "UTC",
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

    onNotification({
      type: "success",
      title: "Settings Reset",
      message: "All settings have been reset to defaults",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>Customize your WhatsApp automation experience</CardDescription>
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
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>System</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about message delivery status</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show browser notifications for important events</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">Play sound alerts for notifications</p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messaging" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="defaultDelay">Default Delay Between Messages (seconds)</Label>
                  <Input
                    id="defaultDelay"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.defaultDelay}
                    onChange={(e) => handleSettingChange("defaultDelay", Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Recommended: 2-5 seconds to avoid rate limiting</p>
                </div>

                <div>
                  <Label htmlFor="maxRetries">Maximum Retry Attempts</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="0"
                    max="10"
                    value={settings.maxRetries}
                    onChange={(e) => handleSettingChange("maxRetries", Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Number of times to retry failed messages</p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup contacts and message history</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="dataRetention">Data Retention Period (days)</Label>
                  <Select
                    value={settings.dataRetention.toString()}
                    onValueChange={(value) => handleSettingChange("dataRetention", Number(value))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="-1">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">How long to keep message history and logs</p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) => handleSettingChange("analyticsEnabled", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Crash Reporting</Label>
                    <p className="text-sm text-muted-foreground">Automatically report crashes to help fix bugs</p>
                  </div>
                  <Switch
                    checked={settings.crashReporting}
                    onCheckedChange={(checked) => handleSettingChange("crashReporting", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Danger Zone</h4>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Reset All Settings</h5>
                        <p className="text-sm text-muted-foreground">
                          This will reset all settings to their default values
                        </p>
                      </div>
                      <Button variant="destructive" onClick={resetSettings}>
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="storage" className="space-y-6">
              <StorageManager onNotification={onNotification} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
