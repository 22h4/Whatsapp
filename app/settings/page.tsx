"use client"

import { motion } from "framer-motion"
import { useSettingsStore } from "@/lib/settings-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { fadeIn, slideIn, gradients, glows } from "@/lib/theme-provider"
import { toast } from "react-hot-toast"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const settings = useSettingsStore()

  const handleReset = () => {
    settings.resetSettings()
    toast.success("Settings reset to defaults")
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      className="container mx-auto py-8 space-y-8"
    >
      <motion.div variants={slideIn} className="space-y-2">
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your WhatsApp automation experience</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance */}
        <motion.div variants={slideIn}>
          <Card className={`${gradients[theme as keyof typeof gradients].primary} ${glows[theme as keyof typeof glows].primary}`}>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={settings.theme} onValueChange={settings.setTheme}>
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

              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Enable Notifications</Label>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={settings.setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound Effects</Label>
                <Switch
                  id="sound"
                  checked={settings.soundEnabled}
                  onCheckedChange={settings.setSoundEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={slideIn}>
          <Card className={`${gradients[theme as keyof typeof gradients].secondary} ${glows[theme as keyof typeof glows].secondary}`}>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={settings.setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={settings.setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Automation */}
        <motion.div variants={slideIn}>
          <Card className={`${gradients[theme as keyof typeof gradients].accent} ${glows[theme as keyof typeof glows].accent}`}>
            <CardHeader>
              <CardTitle>Automation</CardTitle>
              <CardDescription>Configure your automation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Delay (seconds)</Label>
                <Slider
                  value={[settings.defaultDelay]}
                  onValueChange={([value]) => settings.setDefaultDelay(value)}
                  min={1}
                  max={30}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Retries</Label>
                <Slider
                  value={[settings.maxRetries]}
                  onValueChange={([value]) => settings.setMaxRetries(value)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div variants={slideIn}>
          <Card className={`${gradients[theme as keyof typeof gradients].primary} ${glows[theme as keyof typeof glows].primary}`}>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup">Auto Backup</Label>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={settings.setAutoBackup}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Retention (days)</Label>
                <Slider
                  value={[settings.dataRetention]}
                  onValueChange={([value]) => settings.setDataRetention(value)}
                  min={7}
                  max={365}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Analytics</Label>
                <Switch
                  id="analytics"
                  checked={settings.analyticsEnabled}
                  onCheckedChange={settings.setAnalyticsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="crashReporting">Crash Reporting</Label>
                <Switch
                  id="crashReporting"
                  checked={settings.crashReporting}
                  onCheckedChange={settings.setCrashReporting}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={slideIn} className="flex justify-end">
        <Button variant="destructive" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </motion.div>
    </motion.div>
  )
} 