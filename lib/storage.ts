import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface WhatsAppDBSchema extends DBSchema {
  contacts: {
    key: string;
    value: {
      id: string;
      name: string;
      phone: string;
      email?: string;
      company?: string;
      title?: string;
      notes?: string;
      source?: string;
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 'by-phone': string };
  };
  groups: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      contactIds: string[];
      createdAt: Date;
      updatedAt: Date;
    };
  };
  messages: {
    key: string;
    value: {
      id: string;
      content: string;
      scheduledAt: Date;
      status: 'pending' | 'sent' | 'failed';
      contactId: string;
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 'by-scheduled': Date };
  };
  settings: {
    key: string;
    value: {
      theme: 'light' | 'dark' | 'system';
      language: string;
      timezone: string;
      emailNotifications: boolean;
      pushNotifications: boolean;
      soundEnabled: boolean;
      defaultDelay: number;
      maxRetries: number;
      autoBackup: boolean;
      dataRetention: number;
      analyticsEnabled: boolean;
      crashReporting: boolean;
    };
  };
}

let db: IDBPDatabase<WhatsAppDBSchema> | null = null;

export async function initDB() {
  if (db) return db;

  db = await openDB<WhatsAppDBSchema>('whatsapp-automation', 1, {
    upgrade(database) {
      // Create contacts store
      const contactsStore = database.createObjectStore('contacts', { keyPath: 'id' });
      contactsStore.createIndex('by-phone', 'phone', { unique: true });

      // Create groups store
      database.createObjectStore('groups', { keyPath: 'id' });

      // Create messages store
      const messagesStore = database.createObjectStore('messages', { keyPath: 'id' });
      messagesStore.createIndex('by-scheduled', 'scheduledAt');

      // Create settings store
      database.createObjectStore('settings', { keyPath: 'id' });
    },
  });

  return db;
}

// Contacts
export async function getContacts() {
  const database = await initDB();
  return database.getAll('contacts');
}

export async function getContact(id: string) {
  const database = await initDB();
  return database.get('contacts', id);
}

export async function createContact(data: Omit<WhatsAppDBSchema['contacts']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  const database = await initDB();
  const id = crypto.randomUUID();
  const now = new Date();
  return database.add('contacts', {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateContact(id: string, data: Partial<WhatsAppDBSchema['contacts']['value']>) {
  const database = await initDB();
  const contact = await database.get('contacts', id);
  if (!contact) throw new Error('Contact not found');
  
  return database.put('contacts', {
    ...contact,
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteContact(id: string) {
  const database = await initDB();
  return database.delete('contacts', id);
}

// Groups
export async function getGroups() {
  const database = await initDB();
  return database.getAll('groups');
}

export async function createGroup(data: Omit<WhatsAppDBSchema['groups']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  const database = await initDB();
  const id = crypto.randomUUID();
  const now = new Date();
  return database.add('groups', {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateGroup(id: string, data: Partial<WhatsAppDBSchema['groups']['value']>) {
  const database = await initDB();
  const group = await database.get('groups', id);
  if (!group) throw new Error('Group not found');
  
  return database.put('groups', {
    ...group,
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteGroup(id: string) {
  const database = await initDB();
  return database.delete('groups', id);
}

// Messages
export async function getMessages() {
  const database = await initDB();
  return database.getAll('messages');
}

export async function createMessage(data: Omit<WhatsAppDBSchema['messages']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  const database = await initDB();
  const id = crypto.randomUUID();
  const now = new Date();
  return database.add('messages', {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateMessage(id: string, data: Partial<WhatsAppDBSchema['messages']['value']>) {
  const database = await initDB();
  const message = await database.get('messages', id);
  if (!message) throw new Error('Message not found');
  
  return database.put('messages', {
    ...message,
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteMessage(id: string) {
  const database = await initDB();
  return database.delete('messages', id);
}

// Settings
export async function getSettings() {
  const database = await initDB();
  return database.get('settings', 'default');
}

export async function updateSettings(data: Partial<WhatsAppDBSchema['settings']['value']>) {
  const database = await initDB();
  const settings = await database.get('settings', 'default');
  
  return database.put('settings', {
    ...settings,
    ...data,
  }, 'default');
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  title?: string;
  notes?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  scheduledAt: string;
  status: string;
  contactId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  defaultDelay: number;
  maxRetries: number;
  autoBackup: boolean;
  dataRetention: number;
  analyticsEnabled: boolean;
  crashReporting: boolean;
}

export interface WhatsAppSession {
  type: "business" | "web"
  status: "connected" | "disconnected"
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'marketing' | 'support' | 'notification' | 'custom';
  variables: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  approvedBy?: string;
  language: string;
  description?: string;
  tags?: string[];
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'failed';
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    dayOfMonth?: number;
    timeOfDay: string;
  };
  targetAudience: {
    type: 'all' | 'group' | 'filtered';
    groupId?: string;
    filters?: {
      field: string;
      operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
      value: string;
    }[];
  };
  metrics: {
    totalContacts: number;
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    replied: number;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Storage keys
const STORAGE_KEYS = {
  CONTACTS: 'whatsapp-contacts',
  GROUPS: 'whatsapp-contact-groups',
  MESSAGES: 'whatsapp-scheduled-messages',
  NOTIFICATIONS: 'whatsapp-notifications',
  SETTINGS: 'whatsapp-app-settings',
  SESSION: 'whatsapp-session',
  ACTIVE_TAB: 'whatsapp-active-tab',
  TEMPLATES: 'whatsapp-templates',
  CAMPAIGNS: 'whatsapp-campaigns',
  ANALYTICS: 'whatsapp-analytics',
  AUTOMATION_RULES: 'whatsapp-automation-rules',
  USER_SETTINGS: 'whatsapp-user-settings',
  ACTIVITY_LOGS: 'whatsapp-activity-logs',
} as const;

// Helper functions
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// Contact operations
export function getContacts(): Contact[] {
  return getItem(STORAGE_KEYS.CONTACTS, []);
}

export function getContact(id: string): Contact | undefined {
  return getContacts().find(contact => contact.id === id);
}

export function addContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
  const contacts = getContacts();
  
  // Check for duplicate phone number
  if (contacts.some(contact => contact.phone === data.phone)) {
    throw new Error('Contact with this phone number already exists');
  }

  const newContact: Contact = {
    ...data,
    id: `contact_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  contacts.push(newContact);
  setItem(STORAGE_KEYS.CONTACTS, contacts);
  return newContact;
}

export function updateContact(id: string, data: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Contact {
  const contacts = getContacts();
  const index = contacts.findIndex(contact => contact.id === id);
  
  if (index === -1) {
    throw new Error('Contact not found');
  }

  // Check for duplicate phone number if phone is being updated
  if (data.phone && contacts.some(contact => contact.phone === data.phone && contact.id !== id)) {
    throw new Error('Contact with this phone number already exists');
  }

  const updatedContact: Contact = {
    ...contacts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  contacts[index] = updatedContact;
  setItem(STORAGE_KEYS.CONTACTS, contacts);
  return updatedContact;
}

export function deleteContact(id: string): void {
  const contacts = getContacts();
  const filteredContacts = contacts.filter(contact => contact.id !== id);
  
  if (filteredContacts.length === contacts.length) {
    throw new Error('Contact not found');
  }

  setItem(STORAGE_KEYS.CONTACTS, filteredContacts);
}

// Group operations
export function getGroups(): Group[] {
  return getItem(STORAGE_KEYS.GROUPS, []);
}

export function getGroup(id: string): Group | undefined {
  return getGroups().find(group => group.id === id);
}

export function addGroup(data: Omit<Group, 'id' | 'contacts' | 'createdAt' | 'updatedAt'>): Group {
  const groups = getGroups();
  
  const newGroup: Group = {
    ...data,
    id: `group_${Date.now()}`,
    contacts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  groups.push(newGroup);
  setItem(STORAGE_KEYS.GROUPS, groups);
  return newGroup;
}

export function updateGroup(id: string, data: Partial<Omit<Group, 'id' | 'createdAt' | 'updatedAt'>>): Group {
  const groups = getGroups();
  const index = groups.findIndex(group => group.id === id);
  
  if (index === -1) {
    throw new Error('Group not found');
  }

  const updatedGroup: Group = {
    ...groups[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  groups[index] = updatedGroup;
  setItem(STORAGE_KEYS.GROUPS, groups);
  return updatedGroup;
}

export function deleteGroup(id: string): void {
  const groups = getGroups();
  const filteredGroups = groups.filter(group => group.id !== id);
  
  if (filteredGroups.length === groups.length) {
    throw new Error('Group not found');
  }

  setItem(STORAGE_KEYS.GROUPS, filteredGroups);
}

// Message operations
export function getMessages(): Message[] {
  return getItem(STORAGE_KEYS.MESSAGES, []);
}

export function getMessage(id: string): Message | undefined {
  return getMessages().find(message => message.id === id);
}

export function addMessage(data: Omit<Message, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Message {
  const messages = getMessages();
  
  const newMessage: Message = {
    ...data,
    id: `message_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  setItem(STORAGE_KEYS.MESSAGES, messages);
  return newMessage;
}

export function updateMessage(id: string, data: Partial<Omit<Message, 'id' | 'createdAt' | 'updatedAt'>>): Message {
  const messages = getMessages();
  const index = messages.findIndex(message => message.id === id);
  
  if (index === -1) {
    throw new Error('Message not found');
  }

  const updatedMessage: Message = {
    ...messages[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  messages[index] = updatedMessage;
  setItem(STORAGE_KEYS.MESSAGES, messages);
  return updatedMessage;
}

export function deleteMessage(id: string): void {
  const messages = getMessages();
  const filteredMessages = messages.filter(message => message.id !== id);
  
  if (filteredMessages.length === messages.length) {
    throw new Error('Message not found');
  }

  setItem(STORAGE_KEYS.MESSAGES, filteredMessages);
}

// Notification operations
export const getNotifications = (): Notification[] => getItem(STORAGE_KEYS.NOTIFICATIONS, []);
export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: `notification_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.NOTIFICATIONS, [newNotification, ...notifications].slice(0, 50));
  return newNotification;
};
export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map(notification =>
    notification.id === id ? { ...notification, read: true } : notification
  );
  setItem(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
};
export const clearNotifications = (): void => {
  setItem(STORAGE_KEYS.NOTIFICATIONS, []);
};

// Settings operations
export const getSettings = (): Settings => getItem(STORAGE_KEYS.SETTINGS, {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: true,
  defaultDelay: 2,
  maxRetries: 3,
  autoBackup: true,
  dataRetention: 30,
  analyticsEnabled: true,
  crashReporting: true,
});
export const updateSettings = (updates: Partial<Settings>): Settings => {
  const settings = getSettings();
  const updatedSettings = { ...settings, ...updates };
  setItem(STORAGE_KEYS.SETTINGS, updatedSettings);
  return updatedSettings;
};

// Session operations
export const getSession = (): WhatsAppSession => getItem(STORAGE_KEYS.SESSION, {
  type: 'web',
  status: 'disconnected',
});
export const updateSession = (updates: Partial<WhatsAppSession>): WhatsAppSession => {
  const session = getSession();
  const updatedSession = { ...session, ...updates };
  setItem(STORAGE_KEYS.SESSION, updatedSession);
  return updatedSession;
};

// Active tab
export const getActiveTab = (): string => getItem(STORAGE_KEYS.ACTIVE_TAB, 'upload');
export const setActiveTab = (tab: string): void => {
  setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
};

// Data export/import
export function exportData(): string {
  const data = {
    contacts: getContacts(),
    groups: getGroups(),
    messages: getMessages(),
    settings: getItem(STORAGE_KEYS.SETTINGS, {}),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): void {
  try {
    const data = JSON.parse(json);
    
    if (!data.version || !data.exportDate) {
      throw new Error('Invalid backup file format');
    }

    if (data.contacts) setItem(STORAGE_KEYS.CONTACTS, data.contacts);
    if (data.groups) setItem(STORAGE_KEYS.GROUPS, data.groups);
    if (data.messages) setItem(STORAGE_KEYS.MESSAGES, data.messages);
    if (data.settings) setItem(STORAGE_KEYS.SETTINGS, data.settings);
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format');
  }
}

// Data cleanup
export const cleanupOldData = (): void => {
  const settings = getSettings();
  const retentionDays = settings.dataRetention;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // Clean up old messages
  const messages = getMessages();
  const recentMessages = messages.filter(
    message => new Date(message.createdAt) > cutoffDate
  );
  setItem(STORAGE_KEYS.MESSAGES, recentMessages);

  // Clean up old notifications
  const notifications = getNotifications();
  const recentNotifications = notifications.filter(
    notification => new Date(notification.createdAt) > cutoffDate
  );
  setItem(STORAGE_KEYS.NOTIFICATIONS, recentNotifications);
};

// Template operations
export const getTemplates = (): MessageTemplate[] => getItem(STORAGE_KEYS.TEMPLATES, []);
export const addTemplate = (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): MessageTemplate => {
  const templates = getTemplates();
  const newTemplate: MessageTemplate = {
    ...template,
    id: `template_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.TEMPLATES, [...templates, newTemplate]);
  return newTemplate;
};
export const updateTemplate = (id: string, updates: Partial<MessageTemplate>): MessageTemplate => {
  const templates = getTemplates();
  const updatedTemplates = templates.map(template =>
    template.id === id
      ? { ...template, ...updates, updatedAt: new Date().toISOString() }
      : template
  );
  setItem(STORAGE_KEYS.TEMPLATES, updatedTemplates);
  return updatedTemplates.find(template => template.id === id)!;
};
export const deleteTemplate = (id: string): void => {
  const templates = getTemplates();
  setItem(STORAGE_KEYS.TEMPLATES, templates.filter(template => template.id !== id));
};

// Campaign operations
export const getCampaigns = (): Campaign[] => getItem(STORAGE_KEYS.CAMPAIGNS, []);
export const addCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Campaign => {
  const campaigns = getCampaigns();
  const newCampaign: Campaign = {
    ...campaign,
    id: `campaign_${Date.now()}`,
    metrics: {
      totalContacts: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      opened: 0,
      replied: 0,
      lastUpdated: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.CAMPAIGNS, [...campaigns, newCampaign]);
  return newCampaign;
};
export const updateCampaign = (id: string, updates: Partial<Campaign>): Campaign => {
  const campaigns = getCampaigns();
  const updatedCampaigns = campaigns.map(campaign =>
    campaign.id === id
      ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
      : campaign
  );
  setItem(STORAGE_KEYS.CAMPAIGNS, updatedCampaigns);
  return updatedCampaigns.find(campaign => campaign.id === id)!;
};
export const deleteCampaign = (id: string): void => {
  const campaigns = getCampaigns();
  setItem(STORAGE_KEYS.CAMPAIGNS, campaigns.filter(campaign => campaign.id !== id));
};

// Export all storage keys
export { STORAGE_KEYS }; 