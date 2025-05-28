"use client"

import { useState, useCallback } from "react"

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  [key: string]: string | undefined
}

interface GoogleContact {
  resourceName: string
  etag: string
  names?: Array<{
    displayName: string
    givenName?: string
    familyName?: string
  }>
  phoneNumbers?: Array<{
    value: string
    type?: string
    canonicalForm?: string
  }>
  emailAddresses?: Array<{
    value: string
    type?: string
  }>
  organizations?: Array<{
    name: string
    title?: string
  }>
  addresses?: Array<{
    formattedValue: string
    type?: string
  }>
  biographies?: Array<{
    value: string
  }>
}

interface GoogleContactsResponse {
  connections: GoogleContact[]
  nextPageToken?: string
  totalPeople: number
}

export function useGoogleContacts() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  // Google OAuth configuration
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id"
  const SCOPES = "https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/contacts"
  const DISCOVERY_DOC = "https://people.googleapis.com/$discovery/rest?version=v1"

  const initializeGoogleAPI = useCallback(async () => {
    try {
      if (typeof window === "undefined") return false

      // Load Google API
      await new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://apis.google.com/js/api.js"
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      // Load Google Identity Services
      await new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://accounts.google.com/gsi/client"
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      // Initialize Google API
      await new Promise((resolve) => {
        window.gapi.load("client", resolve)
      })

      await window.gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
      })

      return true
    } catch (error) {
      console.error("Failed to initialize Google API:", error)
      return false
    }
  }, [])

  const authenticate = useCallback(async () => {
    setIsLoading(true)
    try {
      const initialized = await initializeGoogleAPI()
      if (!initialized) {
        throw new Error("Failed to initialize Google API")
      }

      if (!CLIENT_ID || CLIENT_ID === "your-google-client-id") {
        throw new Error("Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.")
      }

      return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error) {
              let errorMessage = response.error
              if (response.error === "invalid_client") {
                errorMessage = "Invalid Google Client ID. Please check your configuration."
              } else if (response.error === "access_denied") {
                errorMessage = "Access was denied. Please try again and grant the required permissions."
              }
              reject(new Error(errorMessage))
              return
            }
            setAccessToken(response.access_token)
            setIsAuthenticated(true)
            window.gapi.client.setToken({ access_token: response.access_token })
            resolve(response.access_token)
          },
        })

        tokenClient.requestAccessToken({ prompt: "consent" })
      })
    } catch (error) {
      console.error("Authentication failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [CLIENT_ID, SCOPES, initializeGoogleAPI])

  const disconnect = useCallback(() => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken)
    }
    setAccessToken(null)
    setIsAuthenticated(false)
    window.gapi.client.setToken(null)
  }, [accessToken])

  const transformGoogleContact = (googleContact: GoogleContact): Contact => {
    const name = googleContact.names?.[0]?.displayName || "Unknown"
    const phone = googleContact.phoneNumbers?.[0]?.value || ""
    const email = googleContact.emailAddresses?.[0]?.value
    const company = googleContact.organizations?.[0]?.name

    return {
      id: `google_${googleContact.resourceName.split("/")[1]}`,
      name,
      phone,
      email,
      company,
      source: "google_contacts",
      googleResourceName: googleContact.resourceName,
      googleEtag: googleContact.etag,
      importedAt: new Date().toISOString(),
    }
  }

  const transformToGoogleContact = (contact: Contact): any => {
    const googleContact: any = {}

    if (contact.name) {
      googleContact.names = [
        {
          displayName: contact.name,
          givenName: contact.name.split(" ")[0],
          familyName: contact.name.split(" ").slice(1).join(" ") || undefined,
        },
      ]
    }

    if (contact.phone) {
      googleContact.phoneNumbers = [
        {
          value: contact.phone,
          type: "mobile",
        },
      ]
    }

    if (contact.email) {
      googleContact.emailAddresses = [
        {
          value: contact.email,
          type: "work",
        },
      ]
    }

    if (contact.company) {
      googleContact.organizations = [
        {
          name: contact.company,
        },
      ]
    }

    return googleContact
  }

  const fetchContacts = useCallback(
    async (pageToken?: string): Promise<Contact[]> => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated with Google")
      }

      try {
        setIsLoading(true)
        const response = await window.gapi.client.people.people.connections.list({
          resourceName: "people/me",
          pageSize: 1000,
          personFields: "names,phoneNumbers,emailAddresses,organizations,addresses,biographies",
          pageToken,
        })

        const data: GoogleContactsResponse = response.result
        const contacts = data.connections?.map(transformGoogleContact) || []

        // If there are more pages, fetch them recursively
        if (data.nextPageToken) {
          const nextPageContacts = await fetchContacts(data.nextPageToken)
          return [...contacts, ...nextPageContacts]
        }

        return contacts
      } catch (error) {
        console.error("Failed to fetch contacts:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  const createContact = useCallback(
    async (contact: Contact): Promise<Contact> => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated with Google")
      }

      try {
        const googleContact = transformToGoogleContact(contact)
        const response = await window.gapi.client.people.people.createContact({
          resource: googleContact,
        })

        return transformGoogleContact(response.result)
      } catch (error) {
        console.error("Failed to create contact:", error)
        throw error
      }
    },
    [isAuthenticated],
  )

  const updateContact = useCallback(
    async (contact: Contact): Promise<Contact> => {
      if (!isAuthenticated || !contact.googleResourceName) {
        throw new Error("Not authenticated or missing Google resource name")
      }

      try {
        const googleContact = transformToGoogleContact(contact)
        const response = await window.gapi.client.people.people.updateContact({
          resourceName: contact.googleResourceName,
          updatePersonFields: "names,phoneNumbers,emailAddresses,organizations",
          resource: googleContact,
        })

        return transformGoogleContact(response.result)
      } catch (error) {
        console.error("Failed to update contact:", error)
        throw error
      }
    },
    [isAuthenticated],
  )

  const deleteContact = useCallback(
    async (resourceName: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated with Google")
      }

      try {
        await window.gapi.client.people.people.deleteContact({
          resourceName,
        })
      } catch (error) {
        console.error("Failed to delete contact:", error)
        throw error
      }
    },
    [isAuthenticated],
  )

  const syncContacts = useCallback(
    async (
      localContacts: Contact[],
    ): Promise<{
      imported: Contact[]
      exported: Contact[]
      updated: Contact[]
      conflicts: Array<{ local: Contact; google: Contact }>
    }> => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated with Google")
      }

      setSyncStatus("syncing")
      try {
        // Fetch all Google contacts
        const googleContacts = await fetchContacts()

        const imported: Contact[] = []
        const exported: Contact[] = []
        const updated: Contact[] = []
        const conflicts: Array<{ local: Contact; google: Contact }> = []

        // Create maps for efficient lookup
        const googleContactsMap = new Map(googleContacts.map((contact) => [contact.phone, contact]))
        const localContactsMap = new Map(localContacts.map((contact) => [contact.phone, contact]))

        // Find contacts to import from Google
        for (const googleContact of googleContacts) {
          if (!localContactsMap.has(googleContact.phone)) {
            imported.push(googleContact)
          } else {
            const localContact = localContactsMap.get(googleContact.phone)!
            // Check for conflicts (different names for same phone)
            if (localContact.name !== googleContact.name) {
              conflicts.push({ local: localContact, google: googleContact })
            }
          }
        }

        // Find contacts to export to Google
        for (const localContact of localContacts) {
          if (!googleContactsMap.has(localContact.phone) && localContact.source !== "google_contacts") {
            try {
              const createdContact = await createContact(localContact)
              exported.push(createdContact)
            } catch (error) {
              console.error("Failed to export contact:", localContact.name, error)
            }
          }
        }

        setSyncStatus("success")
        return { imported, exported, updated, conflicts }
      } catch (error) {
        setSyncStatus("error")
        throw error
      }
    },
    [isAuthenticated, fetchContacts, createContact],
  )

  const exportContactsToGoogle = useCallback(
    async (contacts: Contact[]): Promise<Contact[]> => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated with Google")
      }

      const exported: Contact[] = []

      for (const contact of contacts) {
        try {
          const createdContact = await createContact(contact)
          exported.push(createdContact)
        } catch (error) {
          console.error("Failed to export contact:", contact.name, error)
        }
      }

      return exported
    },
    [isAuthenticated, createContact],
  )

  const importContactsFromGoogle = useCallback(async (): Promise<Contact[]> => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated with Google")
    }

    return await fetchContacts()
  }, [isAuthenticated, fetchContacts])

  return {
    isLoading,
    isAuthenticated,
    syncStatus,
    authenticate,
    disconnect,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    syncContacts,
    exportContactsToGoogle,
    importContactsFromGoogle,
  }
}

// Extend window object for TypeScript
declare global {
  interface Window {
    gapi: any
    google: any
  }
}
