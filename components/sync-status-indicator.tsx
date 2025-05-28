"use client"

import { useState, useEffect } from "react"
import { Cloud, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface SyncStatusIndicatorProps {
  isGoogleConnected: boolean
  lastSyncTime?: string
  onSync?: () => void
}

export default function SyncStatusIndicator({ isGoogleConnected, lastSyncTime, onSync }: SyncStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [syncSettings] = useLocalStorage("google-sync-settings", {
    autoSync: false,
    syncInterval: 60,
    lastSync: null as string | null,
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-500" />
    if (!isGoogleConnected) return <Cloud className="h-4 w-4 text-gray-400" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = () => {
    if (!isOnline) return "Offline"
    if (!isGoogleConnected) return "Not Connected"
    return "Connected"
  }

  const getStatusColor = () => {
    if (!isOnline) return "destructive"
    if (!isGoogleConnected) return "secondary"
    return "default"
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          {getStatusIcon()}
          <Badge variant={getStatusColor()} className="ml-2 text-xs">
            {getStatusText()}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Sync Status</h4>
            {onSync && isGoogleConnected && isOnline && (
              <Button variant="outline" size="sm" onClick={onSync}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync
              </Button>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Internet Connection:</span>
              <div className="flex items-center space-x-1">
                {isOnline ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Google Contacts:</span>
              <div className="flex items-center space-x-1">
                {isGoogleConnected ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>{isGoogleConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>

            {syncSettings.lastSync && (
              <div className="flex items-center justify-between">
                <span>Last Sync:</span>
                <span className="text-muted-foreground">{new Date(syncSettings.lastSync).toLocaleString()}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span>Auto Sync:</span>
              <span className="text-muted-foreground">
                {syncSettings.autoSync ? `Every ${syncSettings.syncInterval}m` : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
