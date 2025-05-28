import { NextResponse } from 'next/server'
import type { Contact } from '@/lib/storage'

// Helper function to get contacts from localStorage
function getStoredContacts(): Contact[] {
  if (typeof window === 'undefined') {
    return []
  }
  return JSON.parse(localStorage.getItem('whatsapp-contacts') || '[]')
}

// Helper function to save contacts to localStorage
function saveContacts(contacts: Contact[]) {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem('whatsapp-contacts', JSON.stringify(contacts))
}

// GET /api/contacts
export async function GET() {
  try {
    const contacts = getStoredContacts()
    return NextResponse.json({ contacts })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

// POST /api/contacts
export async function POST(request: Request) {
  try {
    const contact = await request.json()
    const contacts = getStoredContacts()
    
    // Validate contact data
    if (!contact.name || !contact.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // Check for duplicate phone number
    if (contacts.some((c: Contact) => c.phone === contact.phone)) {
      return NextResponse.json(
        { error: 'Contact with this phone number already exists' },
        { status: 400 }
      )
    }

    const newContact = {
      ...contact,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    contacts.push(newContact)
    saveContacts(contacts)

    return NextResponse.json(newContact)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}

// PUT /api/contacts/:id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const contacts = getStoredContacts()
    
    const index = contacts.findIndex((c: Contact) => c.id === params.id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    // Check for duplicate phone number if phone is being updated
    if (updates.phone && contacts.some((c: Contact) => c.phone === updates.phone && c.id !== params.id)) {
      return NextResponse.json(
        { error: 'Contact with this phone number already exists' },
        { status: 400 }
      )
    }

    const updatedContact = {
      ...contacts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    contacts[index] = updatedContact
    saveContacts(contacts)

    return NextResponse.json(updatedContact)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

// DELETE /api/contacts/:id
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const contacts = getStoredContacts()
    const filteredContacts = contacts.filter((c: Contact) => c.id !== params.id)
    
    if (filteredContacts.length === contacts.length) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    saveContacts(filteredContacts)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
} 