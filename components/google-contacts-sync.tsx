"use client"

import { useState } from "react"
import {
  Cloud,
  Download,
  Upload,
  FolderSyncIcon as Sync,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useGoogleContacts } from "@/hooks/use-google-contacts"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useMobile } from "@/hooks/use-mobile"

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  [key: string]: string | undefined
}

interface GoogleContactsSyncProps {
  contacts: Contact[]
  onContactsUpdate: (contacts: Contact[]) => void
  onNotification: (notification: any) => void
}

export default function GoogleContactsSync({ contacts, onContactsUpdate, onNotification }: GoogleContactsSyncProps) {
  const [syncSettings, setSyncSettings] = useLocalStorage("google-sync-settings", {
    autoSync: false,
    syncInterval: 60, // minutes
    lastSync: null as string | null,
    conflictResolution: "manual" as "manual" | "google" | "local",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [syncResults, setSyncResults] = useState<any>(null)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, "google" | "local">>({})

  const isMobile = useMobile()

  const {
    isLoading,
    isAuthenticated,
    syncStatus,
    authenticate,
    disconnect,
    syncContacts,
    exportContactsToGoogle,
    importContactsFromGoogle,
  } = useGoogleContacts()

  const handleAuthenticate = async () => {
    try {
      await authenticate()
      onNotification({
        type: "success",
        title: "Google Connected",
        message: "Successfully connected to Google Contacts",
      })
    } catch (error) {
      onNotification({
        type: "error",
        title: "Connection Failed",
        message: error instanceof Error ? error.message : "Failed to connect to Google Contacts",
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setSyncResults(null)
    onNotification({
      type: "info",
      title: "Google Disconnected",
      message: "Disconnected from Google Contacts",
    })
  }

  const handleFullSync = async () => {
    try {
      const results = await syncContacts(contacts)
      setSyncResults(results)
      setSyncSettings((prev) => ({ ...prev, lastSync: new Date().toISOString() }))

      // Auto-apply imported contacts
      if (results.imported.length > 0) {
        onContactsUpdate([...contacts, ...results.imported])
      }

      onNotification({
        type: "success",
        title: "Sync Complete",
        message: `Imported ${results.imported.length}, exported ${results.exported.length} contacts`,
      })
    } catch (error) {
      onNotification({
        type: "error",
        title: "Sync Failed",
        message: error instanceof Error ? error.message : "Failed to sync contacts",
      })
    }
  }

  const handleImportFromGoogle = async () => {
    try {
      const googleContacts = await importContactsFromGoogle()
      const newContacts = googleContacts.filter((gc) => !contacts.some((c) => c.phone === gc.phone))

      if (newContacts.length > 0) {
        onContactsUpdate([...contacts, ...newContacts])
        onNotification({
          type: "success",
          title: "Import Complete",
          message: `Imported ${newContacts.length} new contacts from Google`,
        })
      } else {
        onNotification({
          type: "info",
          title: "No New Contacts",
          message: "All Google contacts are already in your list",
        })
      }
    } catch (error) {
      onNotification({
        type: "error",
        title: "Import Failed",
        message: error instanceof Error ? error.message : "Failed to import from Google",
      })
    }
  }

  const handleExportToGoogle = async () => {
    try {
      const contactsToExport =
        selectedContacts.length > 0
          ? contacts.filter((c) => selectedContacts.includes(c.id))
          : contacts.filter((c) => c.source !== "google_contacts")

      if (contactsToExport.length === 0) {
        onNotification({
          type: "info",
          title: "No Contacts to Export",
          message: "Select contacts to export or add non-Google contacts",
        })
        return
      }

      const exported = await exportContactsToGoogle(contactsToExport)

      onNotification({
        type: "success",
        title: "Export Complete",
        message: `Exported ${exported.length} contacts to Google`,
      })

      setSelectedContacts([])
    } catch (error) {
      onNotification({
        type: "error",
        title: "Export Failed",
        message: error instanceof Error ? error.message : "Failed to export to Google",
      })
    }
  }

  const resolveConflicts = () => {
    if (!syncResults?.conflicts) return

    const resolvedContacts = [...contacts]

    syncResults.conflicts.forEach((conflict: any) => {
      const resolution = conflictResolutions[conflict.local.id]
      if (resolution === "google") {
        const index = resolvedContacts.findIndex((c) => c.id === conflict.local.id)
        if (index !== -1) {
          resolvedContacts[index] = { ...conflict.google, id: conflict.local.id }
        }
      }
      // If 'local', keep the existing contact as is
    })

    onContactsUpdate(resolvedContacts)
    setSyncResults((prev) => ({ ...prev, conflicts: [] }))
    setConflictResolutions({})

    onNotification({
      type: "success",
      title: "Conflicts Resolved",
      message: "Contact conflicts have been resolved",
    })
  }

  const getStatusIcon = () => {
    if (!isAuthenticated) return <XCircle className="h-5 w-5 text-red-500" />
    if (syncStatus === "syncing") return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    if (syncStatus === "success") return <CheckCircle className="h-5 w-5 text-green-500" />
    if (syncStatus === "error") return <XCircle className="h-5 w-5 text-red-500" />
    return <Cloud className="h-5 w-5 text-gray-500" />
  }

  const getStatusText = () => {
    if (!isAuthenticated) return "Disconnected"
    if (syncStatus === "syncing") return "Syncing..."
    if (syncStatus === "success") return "Synced"
    if (syncStatus === "error") return "Error"
    return "Connected"
  }

  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-lg">Google Contacts</CardTitle>
                <CardDescription>{getStatusText()}</CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>Google Contacts Sync</DialogTitle>
                </DialogHeader>
                <GoogleSyncContent
                  isAuthenticated={isAuthenticated}
                  isLoading={isLoading}
                  syncResults={syncResults}
                  contacts={contacts}
                  selectedContacts={selectedContacts}
                  conflictResolutions={conflictResolutions}
                  onAuthenticate={handleAuthenticate}
                  onDisconnect={handleDisconnect}
                  onFullSync={handleFullSync}
                  onImport={handleImportFromGoogle}
                  onExport={handleExportToGoogle}
                  onContactSelect={setSelectedContacts}
                  onConflictResolve={setConflictResolutions}
                  onResolveConflicts={resolveConflicts}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <div className="text-center py-4">
              <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Connect to Google Contacts to sync your contacts</p>
              <Button onClick={handleAuthenticate} disabled={isLoading} className="w-full">
                {isLoading ? "Connecting..." : "Connect Google"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleImportFromGoogle} disabled={isLoading} className="text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Import
                </Button>
                <Button variant="outline" onClick={handleExportToGoogle} disabled={isLoading} className="text-xs">
                  <Upload className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
              <Button onClick={handleFullSync} disabled={isLoading} className="w-full">
                <Sync className="h-4 w-4 mr-2" />
                {isLoading ? "Syncing..." : "Full Sync"}
              </Button>
              {syncSettings.lastSync && (
                <p className="text-xs text-muted-foreground text-center">
                  Last sync: {new Date(syncSettings.lastSync).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <CardTitle>Google Contacts Sync</CardTitle>
              <CardDescription>Synchronize your contacts with Google Contacts</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isAuthenticated ? "default" : "secondary"}>{getStatusText()}</Badge>
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <GoogleSyncContent
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          syncResults={syncResults}
          contacts={contacts}
          selectedContacts={selectedContacts}
          conflictResolutions={conflictResolutions}
          onAuthenticate={handleAuthenticate}
          onDisconnect={handleDisconnect}
          onFullSync={handleFullSync}
          onImport={handleImportFromGoogle}
          onExport={handleExportToGoogle}
          onContactSelect={setSelectedContacts}
          onConflictResolve={setConflictResolutions}
          onResolveConflicts={resolveConflicts}
        />
      </CardContent>
    </Card>
  )
}

interface GoogleSyncContentProps {
  isAuthenticated: boolean
  isLoading: boolean
  syncResults: any
  contacts: Contact[]
  selectedContacts: string[]
  conflictResolutions: Record<string, "google" | "local">
  onAuthenticate: () => void
  onDisconnect: () => void
  onFullSync: () => void
  onImport: () => void
  onExport: () => void
  onContactSelect: (contacts: string[]) => void
  onConflictResolve: (resolutions: Record<string, "google" | "local">) => void
  onResolveConflicts: () => void
}

function GoogleSyncContent({
  isAuthenticated,
  isLoading,
  syncResults,
  contacts,
  selectedContacts,
  conflictResolutions,
  onAuthenticate,
  onFullSync,
  onImport,
  onExport,
  onContactSelect,
  onConflictResolve,
  onResolveConflicts,
}: GoogleSyncContentProps) {
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Alert>
          <Cloud className="h-4 w-4" />
          <AlertDescription>
            Connect your Google account to sync contacts between WhatsApp Automation and Google Contacts.
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Benefits of Google Sync:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automatic backup of your contacts</li>
              <li>• Access contacts across all devices</li>
              <li>• Two-way synchronization</li>
              <li>• Conflict resolution for duplicates</li>
            </ul>
          </div>

          <Button onClick={onAuthenticate} disabled={isLoading} className="w-full">
            <Cloud className="h-4 w-4 mr-2" />
            {isLoading ? "Connecting..." : "Connect Google Contacts"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="sync" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="sync">Sync</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
        <TabsTrigger value="conflicts">
          Conflicts
          {syncResults?.conflicts?.length > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
              {syncResults.conflicts.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sync" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={onFullSync} disabled={isLoading} className="w-full">
            <Sync className="h-4 w-4 mr-2" />
            {isLoading ? "Syncing..." : "Full Sync"}
          </Button>

          <Button variant="outline" onClick={onImport} disabled={isLoading} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Import Only
          </Button>

          <Button variant="outline" onClick={onExport} disabled={isLoading} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
        </div>

        {syncResults && (
          <div className="space-y-4">
            <h4 className="font-medium">Last Sync Results:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-green-600">{syncResults.imported?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-blue-600">{syncResults.exported?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Exported</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-orange-600">{syncResults.updated?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Updated</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-red-600">{syncResults.conflicts?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Conflicts</div>
              </div>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="export" className="space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Select Contacts to Export</h4>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => onContactSelect(contacts.map((c) => c.id))}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={() => onContactSelect([])}>
                Clear
              </Button>
            </div>
          </div>

          <div className="border rounded-lg max-h-64 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedContacts.length === contacts.length}
                      onCheckedChange={(checked) => {
                        onContactSelect(checked ? contacts.map((c) => c.id) : [])
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onContactSelect([...selectedContacts, contact.id])
                          } else {
                            onContactSelect(selectedContacts.filter((id) => id !== contact.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>
                      <Badge variant={contact.source === "google_contacts" ? "default" : "secondary"}>
                        {contact.source?.replace("_", " ") || "manual"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button onClick={onExport} disabled={isLoading || selectedContacts.length === 0} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Export {selectedContacts.length} Contact{selectedContacts.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="conflicts" className="space-y-4">
        {syncResults?.conflicts?.length > 0 ? (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {syncResults.conflicts.length} contact conflicts. Choose which version to keep.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {syncResults.conflicts.map((conflict: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <h5 className="font-medium">Conflict for phone: {conflict.local.phone}</h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`conflict-${index}`}
                          checked={conflictResolutions[conflict.local.id] === "local"}
                          onChange={() =>
                            onConflictResolve({
                              ...conflictResolutions,
                              [conflict.local.id]: "local",
                            })
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium">Local Version</div>
                          <div className="text-sm text-muted-foreground">{conflict.local.name}</div>
                          <div className="text-xs text-muted-foreground">{conflict.local.email}</div>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`conflict-${index}`}
                          checked={conflictResolutions[conflict.local.id] === "google"}
                          onChange={() =>
                            onConflictResolve({
                              ...conflictResolutions,
                              [conflict.local.id]: "google",
                            })
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium">Google Version</div>
                          <div className="text-sm text-muted-foreground">{conflict.google.name}</div>
                          <div className="text-xs text-muted-foreground">{conflict.google.email}</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={onResolveConflicts}
              disabled={Object.keys(conflictResolutions).length !== syncResults.conflicts.length}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve All Conflicts
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-medium mb-2">No Conflicts</h3>
            <p className="text-sm text-muted-foreground">All contacts are in sync with Google Contacts</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
