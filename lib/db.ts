import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getContacts() {
  return prisma.contact.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getContact(id: string) {
  return prisma.contact.findUnique({
    where: { id }
  })
}

export async function createContact(data: {
  name: string
  phone: string
  email?: string
  company?: string
  title?: string
  notes?: string
  source?: string
}) {
  return prisma.contact.create({
    data
  })
}

export async function updateContact(id: string, data: {
  name?: string
  phone?: string
  email?: string
  company?: string
  title?: string
  notes?: string
  source?: string
}) {
  return prisma.contact.update({
    where: { id },
    data
  })
}

export async function deleteContact(id: string) {
  return prisma.contact.delete({
    where: { id }
  })
}

export async function getGroups() {
  return prisma.group.findMany({
    include: {
      contacts: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createGroup(data: {
  name: string
  description?: string
  contactIds?: string[]
}) {
  return prisma.group.create({
    data: {
      name: data.name,
      description: data.description,
      contacts: {
        connect: data.contactIds?.map(id => ({ id })) || []
      }
    },
    include: {
      contacts: true
    }
  })
}

export async function updateGroup(id: string, data: {
  name?: string
  description?: string
  contactIds?: string[]
}) {
  return prisma.group.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      contacts: {
        set: data.contactIds?.map(id => ({ id })) || []
      }
    },
    include: {
      contacts: true
    }
  })
}

export async function deleteGroup(id: string) {
  return prisma.group.delete({
    where: { id }
  })
}

export async function getMessages() {
  return prisma.message.findMany({
    orderBy: { scheduledAt: 'asc' }
  })
}

export async function createMessage(data: {
  content: string
  scheduledAt: Date
  contactId: string
}) {
  return prisma.message.create({
    data
  })
}

export async function updateMessage(id: string, data: {
  content?: string
  scheduledAt?: Date
  status?: string
}) {
  return prisma.message.update({
    where: { id },
    data
  })
}

export async function deleteMessage(id: string) {
  return prisma.message.delete({
    where: { id }
  })
} 