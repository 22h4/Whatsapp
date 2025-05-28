"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Download, Upload, Trash2, HardDrive, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface StorageManagerProps {
  onNotification: (notification: any) => void
}

export default function StorageManager({ onNotification }: StorageManagerProps) {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    total: 0,
    items: 0,
  })
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    calculateStorageUsage()
  }, [])

  const calculateStorageUsage = () => {
    if (typeof window === "undefined") return

    let totalSize = 0
    let itemCount = 0

    // Calculate localStorage usage
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
        itemCount++
      }
    }

    // Estimate available storage (5MB typical limit)
    const estimatedLimit = 5 * 1024 * 1024 // 5MB in bytes
    const used = totalSize * 2 // UTF-16 encoding
    const available = Math.max(0, estimatedLimit - used)

    setStorageInfo({
      used,
      available,
      total: estimatedLimit,
      items: itemCount,
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const exportAllData = () => {
    try {
      const data = {
        contacts: JSON.parse(localStorage.getItem("whatsapp-contacts") || "[]"),
        groups: JSON.parse(localStorage.getItem("whatsapp-contact-groups") || "[]"),
        messages: JSON.parse(localStorage.getItem("whatsapp-scheduled-messages") || "[]"),
        settings: JSON.parse(localStorage.getItem("whatsapp-app-settings") || "{}"),
        integrationStatus: JSON.parse(localStorage.getItem("whatsapp-integration-status") || "{}"),
        messageHistory: JSON.parse(localStorage.getItem("whatsapp-message-history") || "[]"),
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `whatsapp-automation-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      onNotification({
        type: "success",
        title: "Data Exported",
        message: "All app data has been exported successfully",
      })
    } catch (error) {
      onNotification({
        type: "error",
        title: "Export Failed",
        message: "Failed to export app data",
      })
    }
  }

  const importAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Validate data structure
        if (!data.version || !data.exportDate) {
          throw new Error("Invalid backup file format")
        }

        // Import data to localStorage
        if (data.contacts) localStorage.setItem("whatsapp-contacts", JSON.stringify(data.contacts))
        if (data.groups) localStorage.setItem("whatsapp-contact-groups", JSON.stringify(data.groups))
        if (data.messages) localStorage.setItem("whatsapp-scheduled-messages", JSON.stringify(data.messages))
        if (data.settings) localStorage.setItem("whatsapp-app-settings", JSON.stringify(data.settings))
        if (data.integrationStatus)
          localStorage.setItem("whatsapp-integration-status", JSON.stringify(data.integrationStatus))
        if (data.messageHistory) localStorage.setItem("whatsapp-message-history", JSON.stringify(data.messageHistory))

        calculateStorageUsage()

        onNotification({
          type: "success",
          title: "Data Imported",
          message: "App data has been restored successfully. Please refresh the page.",
        })

        // Refresh page after a delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } catch (error) {
        onNotification({
          type: "error",
          title: "Import Failed",
          message: "Invalid backup file or corrupted data",
        })
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = async () => {
    setIsClearing(true)

    try {
      // Clear all WhatsApp automation related data
      const keysToRemove = Object.keys(localStorage).filter((key) => key.startsWith("whatsapp-"))

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key)
      })

      // Also clear sessionStorage
      const sessionKeysToRemove = Object.keys(sessionStorage).filter((key) => key.startsWith("whatsapp-"))

      sessionKeysToRemove.forEach((key) => {
        sessionStorage.removeItem(key)
      })

      calculateStorageUsage()

      onNotification({
        type: "success",
        title: "Data Cleared",
        message: "All app data has been cleared. Page will refresh.",
      })

      // Refresh page after a delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      onNotification({
        type: "error",
        title: "Clear Failed",
        message: "Failed to clear app data",
      })
    } finally {
      setIsClearing(false)
    }
  }

  const getStorageItems = () => {
    const items = []
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith("whatsapp-")) {
        const value = localStorage[key]
        items.push({
          key,
          size: (value.length + key.length) * 2, // UTF-16 encoding
          preview: value.substring(0, 100) + (value.length > 100 ? "..." : ""),
        })
      }
    }
    return items.sort((a, b) => b.size - a.size)
  }

  const usagePercentage = (storageInfo.used / storageInfo.total) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5" />
          <span>Storage Management</span>
        </CardTitle>
        <CardDescription>Manage your browser storage and backup your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Usage */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="text-sm text-muted-foreground">
              {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
            </span>
          </div>
          <Progress value={usagePercentage} className="w-full" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Used: </span>
              <span className="font-medium">{formatBytes(storageInfo.used)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Available: </span>
              <span className="font-medium">{formatBytes(storageInfo.available)}</span>
            </div>
          </div>
        </div>

        {/* Storage Warning */}
        {usagePercentage > 80 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Storage is {usagePercentage.toFixed(1)}% full. Consider exporting and clearing old data.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button onClick={exportAllData} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>

          <Button asChild variant="outline" className="w-full">
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
              <input type="file" accept=".json" onChange={importAllData} className="hidden" />
            </label>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will permanently delete all your contacts, messages, settings, and other app data. Make sure to
                    export your data first if you want to keep it.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive" onClick={clearAllData} disabled={isClearing}>
                    {isClearing ? "Clearing..." : "Clear All Data"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Storage Items */}
        <div className="space-y-3">
          <h4 className="font-medium">Stored Data</h4>
          <div className="space-y-2">
            {getStorageItems().map((item) => (
              <div key={item.key} className="flex justify-between items-center p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.key.replace("whatsapp-", "").replace(/-/g, " ")}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.preview}</p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {formatBytes(item.size)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-backup Info */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your data is automatically saved to your browser's local storage. Export regularly to create backups that
            persist across devices and browser resets.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
