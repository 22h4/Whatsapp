"use client"

import { useState } from "react"

interface Contact {
  id: string
  name: string
  phone: string
  [key: string]: string
}

export function useContactImport() {
  const [isImporting, setIsImporting] = useState(false)

  const importFromPhone = async (): Promise<Contact[]> => {
    setIsImporting(true)

    try {
      // Check if the Contacts API is supported
      if (!("contacts" in navigator) || !("ContactsManager" in window)) {
        throw new Error("Contact import is not supported in this browser")
      }

      // Request contacts with specific properties
      const contacts = await (navigator as any).contacts.select(["name", "tel"], {
        multiple: true,
      })

      // Transform the contacts to our format
      const transformedContacts: Contact[] = contacts
        .map((contact: any, index: number) => ({
          id: `imported_${Date.now()}_${index}`,
          name: contact.name?.[0] || "Unknown",
          phone: contact.tel?.[0] || "",
          source: "phone_import",
          importedAt: new Date().toISOString(),
        }))
        .filter((contact: Contact) => contact.phone) // Only include contacts with phone numbers

      return transformedContacts
    } catch (error) {
      console.error("Contact import failed:", error)
      throw error
    } finally {
      setIsImporting(false)
    }
  }

  const importFromCSV = async (file: File): Promise<Contact[]> => {
    setIsImporting(true)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        throw new Error("CSV must have at least a header and one data row")
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      const contacts: Contact[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        if (values.length !== headers.length) continue

        const contact: Contact = {
          id: `csv_${Date.now()}_${i}`,
          name: "",
          phone: "",
          source: "csv_import",
          importedAt: new Date().toISOString(),
        }

        headers.forEach((header, index) => {
          const key = header.toLowerCase()
          if (key.includes("name")) contact.name = values[index]
          else if (key.includes("phone") || key.includes("number")) contact.phone = values[index]
          else contact[header] = values[index]
        })

        if (contact.phone) contacts.push(contact)
      }

      return contacts
    } catch (error) {
      console.error("CSV import failed:", error)
      throw error
    } finally {
      setIsImporting(false)
    }
  }

  const importFromVCard = async (file: File): Promise<Contact[]> => {
    setIsImporting(true)

    try {
      const text = await file.text()
      const vcards = text.split("BEGIN:VCARD")
      const contacts: Contact[] = []

      for (let i = 1; i < vcards.length; i++) {
        const vcard = "BEGIN:VCARD" + vcards[i]
        const contact: Contact = {
          id: `vcard_${Date.now()}_${i}`,
          name: "",
          phone: "",
          source: "vcard_import",
          importedAt: new Date().toISOString(),
        }

        // Parse FN (Full Name)
        const nameMatch = vcard.match(/FN:(.+)/i)
        if (nameMatch) contact.name = nameMatch[1].trim()

        // Parse TEL (Phone)
        const phoneMatch = vcard.match(/TEL[^:]*:(.+)/i)
        if (phoneMatch) contact.phone = phoneMatch[1].trim()

        // Parse ORG (Organization)
        const orgMatch = vcard.match(/ORG:(.+)/i)
        if (orgMatch) contact.company = orgMatch[1].trim()

        // Parse EMAIL
        const emailMatch = vcard.match(/EMAIL[^:]*:(.+)/i)
        if (emailMatch) contact.email = emailMatch[1].trim()

        if (contact.name && contact.phone) {
          contacts.push(contact)
        }
      }

      return contacts
    } catch (error) {
      console.error("vCard import failed:", error)
      throw error
    } finally {
      setIsImporting(false)
    }
  }

  return {
    isImporting,
    importFromPhone,
    importFromCSV,
    importFromVCard,
  }
}
