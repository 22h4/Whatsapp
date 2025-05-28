"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Smartphone, FileText, Users, Download, AlertCircle, CheckCircle, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContactImport } from "@/hooks/use-contact-import"
import { useGoogleContacts } from "@/hooks/use-google-contacts"
import { useMobile } from "@/hooks/use-mobile"

interface Contact {
  id: string
  name: string
  phone: string
  [key: string]: string
}

interface ContactImportProps {
  onContactsImported: (contacts: Contact[]) => void
  onNotification: (notification: any) => void
}

export default function ContactImport({ onContactsImported, onNotification }: ContactImportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [importedContacts, setImportedContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const { isImporting, importFromPhone, importFromCSV, importFromVCard } = useContactImport()
  const { isAuthenticated: isGoogleAuthenticated, importContactsFromGoogle } = useGoogleContacts()
  const isMobile = useMobile()

  const handlePhoneImport = async () => {
    try {
      setImportProgress(0)
      const contacts = await importFromPhone()
      setImportedContacts(contacts)
      setSelectedContacts(contacts.map((c) => c.id))
      setImportProgress(100)

      onNotification({
        type: "success",
        title: "Contacts Imported",
        message: `Successfully imported ${contacts.length} contacts from your phone`,
      })
    } catch (error) {
      onNotification({
        type: "error",
        title: "Import Failed",
        message: error instanceof Error ? error.message : "Failed to import contacts from phone",
      })
    }
  }

  const handleGoogleImport = async () => {
    try {
      setImportProgress(0)
      const contacts = await importContactsFromGoogle()
      setImportedContacts(contacts)
      setSelectedContacts(contacts.map((c) => c.id))
      setImportProgress(100)

      onNotification({
        type: "success",
        title: "Google Contacts Imported",
        message: `Successfully imported ${contacts.length} contacts from Google`,
      })
    } catch (error) {
      onNotification({
        type: "error",
        title: "Google Import Failed",
        message: error instanceof Error ? error.message : "Failed to import contacts from Google",
      })
    }
  }

  const handleFileImport = async (file: File) => {
    try {
      setImportProgress(0)
      let contacts: Contact[] = []

      if (file.name.endsWith(".csv")) {
        contacts = await importFromCSV(file)
      } else if (file.name.endsWith(".vcf")) {
        contacts = await importFromVCard(file)
      } else {
        throw new Error("Unsupported file format. Please use CSV or VCF files.")
      }

      setImportedContacts(contacts)
      setSelectedContacts(contacts.map((c) => c.id))
      setImportProgress(100)

      onNotification({
        type: "success",
        title: "File Imported",
        message: `Successfully imported ${contacts.length} contacts from ${file.name}`,
      })
    } catch (error) {
      onNotification({
        type: "error",
        title: "Import Failed",
        message: error instanceof Error ? error.message : "Failed to import contacts from file",
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileImport(file)
    }
  }

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    )
  }

  const selectAllContacts = () => {
    setSelectedContacts(importedContacts.map((c) => c.id))
  }

  const clearSelection = () => {
    setSelectedContacts([])
  }

  const confirmImport = () => {
    const contactsToImport = importedContacts.filter((c) => selectedContacts.includes(c.id))
    onContactsImported(contactsToImport)
    setIsDialogOpen(false)
    setImportedContacts([])
    setSelectedContacts([])
    setImportProgress(0)

    onNotification({
      type: "success",
      title: "Contacts Added",
      message: `Added ${contactsToImport.length} contacts to your list`,
    })
  }

  const downloadSampleCSV = () => {
    const csvContent = [
      "Name,Phone,Company,Email",
      "John Doe,+1234567890,Acme Corp,john@example.com",
      "Jane Smith,+0987654321,Tech Inc,jane@example.com",
      "Bob Johnson,+1122334455,Design Co,bob@example.com",
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-contacts.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const isPhoneImportSupported = typeof window !== "undefined" && "contacts" in navigator && "ContactsManager" in window

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Import Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className={`${isMobile ? "w-[95vw] max-w-md" : "max-w-4xl"}`}>
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="google" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="google" disabled={!isGoogleAuthenticated}>
              <Cloud className="h-4 w-4 mr-2" />
              Google
            </TabsTrigger>
            <TabsTrigger value="phone" disabled={!isPhoneImportSupported}>
              <Smartphone className="h-4 w-4 mr-2" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileText className="h-4 w-4 mr-2" />
              File
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Upload className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import from Google Contacts</CardTitle>
                <CardDescription>Import all your contacts from Google Contacts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isGoogleAuthenticated ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please connect to Google Contacts first in the Contacts tab to import your contacts.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert>
                      <Cloud className="h-4 w-4" />
                      <AlertDescription>
                        This will import all contacts from your Google account. Duplicates will be filtered out
                        automatically.
                      </AlertDescription>
                    </Alert>

                    <Button onClick={handleGoogleImport} disabled={isImporting} className="w-full">
                      <Cloud className="h-4 w-4 mr-2" />
                      {isImporting ? "Importing..." : "Import from Google"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import from Phone</CardTitle>
                <CardDescription>Import contacts directly from your device's address book</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isPhoneImportSupported ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Contact import is not supported in this browser. Please use Chrome or Edge on Android/Desktop.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your browser will ask for permission to access your contacts. Only selected contact information
                        will be imported.
                      </AlertDescription>
                    </Alert>

                    <Button onClick={handlePhoneImport} disabled={isImporting} className="w-full">
                      <Smartphone className="h-4 w-4 mr-2" />
                      {isImporting ? "Importing..." : "Import from Phone"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import from File</CardTitle>
                <CardDescription>Upload CSV or vCard (VCF) files containing contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Supported Formats:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• CSV files (.csv)</li>
                      <li>• vCard files (.vcf)</li>
                      <li>• Excel exports (as CSV)</li>
                      <li>• Google Contacts exports</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Required Fields:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Name (required)</li>
                      <li>• Phone (required)</li>
                      <li>• Company (optional)</li>
                      <li>• Email (optional)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild className="flex-1">
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                      <input type="file" accept=".csv,.vcf" onChange={handleFileSelect} className="hidden" />
                    </label>
                  </Button>

                  <Button variant="outline" onClick={downloadSampleCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Sample CSV
                  </Button>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">Processing file...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manual Entry</CardTitle>
                <CardDescription>Add contacts one by one using the contact management form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Add Contacts Manually</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use the "Add Contact" button in the Contacts tab to manually enter contact information
                  </p>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Go to Contacts Tab
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Preview and Selection */}
        {importedContacts.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Review Imported Contacts</CardTitle>
                  <CardDescription>Select which contacts to add to your list</CardDescription>
                </div>
                <Badge variant="secondary">
                  {selectedContacts.length} of {importedContacts.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={selectAllContacts}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>

              <div className="border rounded-lg max-h-64 overflow-auto">
                <div className="space-y-1 p-2">
                  {importedContacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contact.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{contact.phone}</p>
                        {contact.company && <p className="text-xs text-muted-foreground truncate">{contact.company}</p>}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {contact.source?.replace("_", " ")}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportedContacts([])
                    setSelectedContacts([])
                    setImportProgress(0)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={confirmImport} disabled={selectedContacts.length === 0}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Import {selectedContacts.length} Contact{selectedContacts.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
