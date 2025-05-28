"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Plus, Download, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ContactImport from "@/components/contact-import"
import GoogleContactsSync from "@/components/google-contacts-sync"
import type { Contact } from "@/lib/storage"
import { addContact, updateContact, deleteContact, getGroups, exportData, importData } from "@/lib/storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"
import { toast } from 'react-hot-toast'

interface ContactListProps {
  contacts: Contact[]
  onContactsUpdate: (contacts: Contact[]) => void
  onNotification: (notification: { type: string; title: string; message: string }) => void
  onContactSelect?: (contact: Contact) => void
}

interface ContactFormData {
  name: string
  phone: string
  email: string
  company: string
  title: string
  notes: string
  source?: string
  [key: string]: string | undefined
}

export default function ContactList({ contacts, onContactsUpdate, onNotification, onContactSelect }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined)
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    company: '',
    title: '',
    notes: '',
    source: 'manual'
  })

  const filteredContacts = contacts.filter(
    (contact) => (contact.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || contact.phone.includes(searchTerm),
  )

  const handleDeleteContact = async (id: string) => {
    try {
      deleteContact(id)
      onContactsUpdate(contacts.filter((contact) => contact.id !== id))
      toast.success('Contact deleted successfully')
    } catch (error: any) {
      onNotification({
        type: "error",
        title: "Error",
        message: `Failed to delete contact: ${error.message}`,
      })
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      company: contact.company || '',
      title: contact.title || '',
      notes: contact.notes || '',
      source: contact.source || 'manual'
    })
  }

  const handleAddContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const newContact = addContact(formData)
      onContactsUpdate([...contacts, newContact])
      setIsAddEditDialogOpen(false)
      setEditingContact(undefined)
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        title: '',
        notes: '',
        source: 'manual'
      })
      toast.success('Contact added successfully')
    } catch (error: any) {
      onNotification({
        type: "error",
        title: "Error",
        message: `Failed to add contact: ${error.message}`,
      })
    }
  }

  const handleUpdateContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingContact) return

    try {
      const updatedContact = updateContact(editingContact.id, formData)
      onContactsUpdate(contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c)))
      setEditingContact(undefined)
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        title: '',
        notes: '',
        source: 'manual'
      })
      toast.success('Contact updated successfully')
    } catch (error: any) {
      onNotification({
        type: "error",
        title: "Error",
        message: `Failed to update contact: ${error.message}`,
      })
    }
  }

  const handleExportContacts = () => {
    try {
      const data = JSON.stringify(contacts, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contacts.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Contacts exported successfully')
    } catch (error: any) {
      onNotification({
        type: "error",
        title: "Error",
        message: `Failed to export contacts: ${error.message}`,
      })
    }
  }

  const handleImportContacts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      // Check if it's a CSV file
      if (content.startsWith('name,phone') || content.startsWith('Name,Phone')) {
        const lines = content.split('\n')
        const headers = lines[0].toLowerCase().split(',')
        const nameIndex = headers.indexOf('name')
        const phoneIndex = headers.indexOf('phone')
        
        if (nameIndex === -1 || phoneIndex === -1) {
          throw new Error('Invalid CSV format: missing name or phone columns')
        }

        const newContacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[] = []
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          if (values.length !== headers.length) continue
          
          const name = values[nameIndex].trim()
          const phone = values[phoneIndex].trim()
          
          if (name && phone) {
            newContacts.push({
              name,
              phone,
              source: 'csv_import'
            })
          }
        }

        let importedCount = 0
        const importedContacts: Contact[] = []
        for (const contact of newContacts) {
          try {
            const newContact = addContact(contact)
            importedContacts.push(newContact)
            importedCount++
          } catch (error) {
            // skip duplicates
          }
        }

        onContactsUpdate([...contacts, ...importedContacts])
        toast.success(`Imported ${importedCount} contacts successfully`)
      } else {
        // Try to parse as JSON
        importData(content)
        const importedData = JSON.parse(content)
        if (!importedData.contacts || !Array.isArray(importedData.contacts)) {
          throw new Error('Invalid JSON format: missing contacts array')
        }
        const importedContacts: Contact[] = []
        for (const contact of importedData.contacts) {
          try {
            const newContact = addContact(contact)
            importedContacts.push(newContact)
          } catch (error) {
            // skip duplicates
          }
        }
        onContactsUpdate([...contacts, ...importedContacts])
        toast.success(`Imported ${importedContacts.length} contacts successfully`)
      }
    } catch (error: any) {
      onNotification({
        type: "error",
        title: "Error",
        message: `Failed to import contacts: ${error.message}`,
      })
    }
  }

  const getContactFields = () => {
    if (contacts.length === 0) return ["name", "phone", "email", "company", "title", "notes"]
    return Object.keys(contacts[0]).filter((key) => key !== "id")
  }

  return (
    <div className="space-y-6">
      {/* Google Contacts Sync */}
      <GoogleContactsSync contacts={contacts} onContactsUpdate={onContactsUpdate} onNotification={onNotification} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>Manage your contact list and add new contacts manually</CardDescription>
            </div>
            <div className="flex space-x-2">
              <ContactImport
                onContactsImported={(newContacts) => {
                  onContactsUpdate([...contacts, ...newContacts])
                }}
                onNotification={onNotification}
              />
              <Button variant="outline" onClick={handleExportContacts} disabled={contacts.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddEditDialogOpen || !!editingContact} onOpenChange={setIsAddEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
                  </DialogHeader>
                  <ContactForm
                    fields={getContactFields()}
                    initialData={editingContact}
                    onSubmit={editingContact ? handleUpdateContact : handleAddContact}
                    onCancel={() => {
                      setIsAddEditDialogOpen(false)
                      setEditingContact(undefined)
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Input type="file" accept=".csv,.json" onChange={handleImportContacts} className="hidden" id="import-contacts" />
              <Label htmlFor="import-contacts">
                <Button variant="outline" asChild>
                  <div>Import</div>
                </Button>
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Badge variant="secondary">{filteredContacts.length} contacts</Badge>
          </div>

          {filteredContacts.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Source</TableHead>
                    {getContactFields()
                      .filter(
                        (field) =>
                          !["name", "phone", "email", "company", "source", "googleResourceName", "googleEtag", "importedAt"].includes(
                            field,
                          ),
                      )
                      .map((field) => (
                        <TableHead key={field} className="capitalize">
                          {field}
                        </TableHead>
                      ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.email || "-"}</TableCell>
                      <TableCell>{contact.company || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={contact.source === "google_contacts" ? "default" : "secondary"}>
                          {contact.source?.replace("_", " ") || "manual"}
                        </Badge>
                      </TableCell>
                      {getContactFields()
                        .filter(
                          (field) =>
                            !["name", "phone", "email", "company", "source", "googleResourceName", "googleEtag", "importedAt"].includes(
                              field,
                            ),
                        )
                        .map((field) => (
                          <TableCell key={field}>{contact[field as keyof Contact] || "-"}</TableCell>
                        ))}
                      <TableCell>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleEditContact(contact)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Contact</DialogTitle>
                              </DialogHeader>
                              {editingContact && (
                                <ContactForm
                                  fields={getContactFields()}
                                  initialData={editingContact}
                                  onSubmit={handleUpdateContact}
                                  onCancel={() => setEditingContact(undefined)}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {onContactSelect && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onContactSelect(contact)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {contacts.length === 0 ? "No contacts uploaded yet" : "No contacts match your search"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ContactFormProps {
  fields: string[]
  initialData?: Contact
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

function ContactForm({ fields, initialData, onSubmit, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(() => {
    const data: ContactFormData = {
      name: '',
      phone: '',
      email: '',
      company: '',
      title: '',
      notes: '',
      source: 'manual'
    }
    fields.forEach((field) => {
      if (field in data) {
        data[field] = initialData?.[field as keyof Contact] || ''
      }
    })
    return data
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields
        .filter((field) => !["source", "googleResourceName", "googleEtag", "importedAt"].includes(field))
        .map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field} className="capitalize">
              {field}
            </Label>
            {field === "notes" ? (
              <Textarea
                id={field}
                value={formData[field]}
                onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                rows={3}
              />
            ) : (
              <Input
                id={field}
                value={formData[field]}
                onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                required={field === "name" || field === "phone"}
                type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
              />
            )}
          </div>
        ))}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Add"} Contact</Button>
      </div>
    </form>
  )
}
