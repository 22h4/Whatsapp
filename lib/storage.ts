import { openDB, DBSchema } from 'idb';

// Define interfaces once at the top of the file
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
      createdAt: string;
      updatedAt: string;
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
      createdAt: string;
      updatedAt: string;
    };
  };
  messages: {
    key: string;
    value: {
      id: string;
      content: string;
      scheduledAt: string;
      status: 'pending' | 'sent' | 'failed';
      contactId: string;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-scheduled': string };
  };
  settings: {
    key: string;
    value: {
      id: string;
      theme: 'light' | 'dark' | 'system';
      language: string;
      timezone: string;
      soundEnabled: boolean;
      defaultDelay: number;
      maxRetries: number;
      autoBackup: boolean;
      dataRetention: number;
      analyticsEnabled: boolean;
      crashReporting: boolean;
      webhookUrl?: string;
      apiKey?: string;
    };
  };
  templates: {
    key: string;
    value: {
      id: string;
      name: string;
      content: string;
      category: 'marketing' | 'support' | 'custom';
      variables: string[];
      status: 'draft' | 'pending' | 'approved' | 'rejected';
      createdAt: string;
      updatedAt: string;
      createdBy?: string;
      approvedBy?: string;
      language: string;
      description?: string;
      tags?: string[];
    };
  };
  campaigns: {
    key: string;
    value: {
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
    };
  };
}

// Export types for use in other files
export type Contact = WhatsAppDBSchema['contacts']['value'];
export type Group = WhatsAppDBSchema['groups']['value'];
export type Message = WhatsAppDBSchema['messages']['value'];
export type Settings = WhatsAppDBSchema['settings']['value'];

// Initialize database
const initDB = async () => {
  return openDB<WhatsAppDBSchema>('whatsapp-automation', 1, {
    upgrade(db) {
      // Create object stores
      if (!db.objectStoreNames.contains('contacts')) {
        const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
        contactStore.createIndex('by-phone', 'phone', { unique: true });
      }
      if (!db.objectStoreNames.contains('groups')) {
        db.createObjectStore('groups', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('by-scheduled', 'scheduledAt');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('campaigns')) {
        db.createObjectStore('campaigns', { keyPath: 'id' });
      }
    },
  });
};

// Contact operations
export const getContacts = async (): Promise<Contact[]> => {
  try {
    const database = await initDB();
    return database.getAll('contacts');
  } catch (error) {
    console.error('Failed to get contacts:', error);
    return [];
  }
};

export const getContact = async (id: string): Promise<Contact | undefined> => {
  const database = await initDB();
  return database.get('contacts', id);
};

export const addContact = async (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
  try {
    const database = await initDB();
    const now = new Date().toISOString();
    const contact: Contact = {
      ...data,
      id: `contact_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    await database.add('contacts', contact);
    return contact;
  } catch (error) {
    console.error('Failed to add contact:', error);
    throw new Error('Failed to add contact');
  }
};

export const updateContact = async (id: string, data: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact> => {
  const database = await initDB();
  const contact = await database.get('contacts', id);
  if (!contact) throw new Error('Contact not found');
  
  const now = new Date().toISOString();
  const updatedContact: Contact = {
    ...contact,
    ...data,
    updatedAt: now,
  };

  await database.put('contacts', updatedContact);
  return updatedContact;
};

export const deleteContact = async (id: string): Promise<void> => {
  const database = await initDB();
  await database.delete('contacts', id);
};

// Group operations
export const getGroups = async (): Promise<Group[]> => {
  const database = await initDB();
  return database.getAll('groups');
};

export const getGroup = async (id: string): Promise<Group | undefined> => {
  const database = await initDB();
  return database.get('groups', id);
};

export const addGroup = async (data: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> => {
  const database = await initDB();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const group: Group = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  await database.add('groups', group);
  return group;
};

export const updateGroup = async (id: string, data: Partial<Omit<Group, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Group> => {
  const database = await initDB();
  const group = await database.get('groups', id);
  if (!group) throw new Error('Group not found');
  
  const now = new Date().toISOString();
  const updatedGroup: Group = {
    ...group,
    ...data,
    updatedAt: now,
  };

  await database.put('groups', updatedGroup);
  return updatedGroup;
};

export const deleteGroup = async (id: string): Promise<void> => {
  const database = await initDB();
  await database.delete('groups', id);
};

// Message operations
export const getMessages = async (): Promise<Message[]> => {
  const database = await initDB();
  return database.getAll('messages');
};

export const getMessage = async (id: string): Promise<Message | undefined> => {
  const database = await initDB();
  return database.get('messages', id);
};

export const addMessage = async (data: Omit<Message, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Message> => {
  const database = await initDB();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const message: Message = {
    ...data,
    id,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  
  await database.add('messages', message);
  return message;
};

export const updateMessage = async (id: string, data: Partial<Omit<Message, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Message> => {
  const database = await initDB();
  const message = await database.get('messages', id);
  if (!message) throw new Error('Message not found');
  
  const now = new Date().toISOString();
  const updatedMessage: Message = {
    ...message,
    ...data,
    updatedAt: now,
  };

  await database.put('messages', updatedMessage);
  return updatedMessage;
};

export const deleteMessage = async (id: string): Promise<void> => {
  const database = await initDB();
  await database.delete('messages', id);
};

// Settings operations
export const getSettings = async (): Promise<Settings> => {
  try {
    const database = await initDB();
    const settings = await database.get('settings', 'default');
    if (!settings) {
      const defaultSettings: Settings = {
        id: 'default',
        theme: 'system',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        soundEnabled: true,
        defaultDelay: 2,
        maxRetries: 3,
        autoBackup: true,
        dataRetention: 30,
        analyticsEnabled: true,
        crashReporting: true,
      };
      await database.add('settings', defaultSettings);
      return defaultSettings;
    }
    return settings;
  } catch (error) {
    console.error('Failed to get settings:', error);
    throw new Error('Failed to get settings');
  }
};

export const updateSettings = async (updates: Partial<Omit<Settings, 'id'>>): Promise<Settings> => {
  try {
    const database = await initDB();
    const settings = await database.get('settings', 'default');
    if (!settings) throw new Error('Settings not found');

    const updatedSettings: Settings = {
      ...settings,
      ...updates,
    };

    await database.put('settings', updatedSettings);
    return updatedSettings;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw new Error('Failed to update settings');
  }
};

// Data cleanup
export const cleanupData = async (): Promise<void> => {
  try {
    const database = await initDB();
    const settings = await getSettings();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetention);

    // Clean up old messages
    const messages = await getMessages();
    const recentMessages = messages.filter(
      (message: Message) => new Date(message.createdAt) > cutoffDate
    );
    await Promise.all(recentMessages.map((message: Message) => database.put('messages', message)));
  } catch (error) {
    console.error('Failed to cleanup data:', error);
    throw new Error('Failed to cleanup data');
  }
};

// Data import/export
export const importData = async (data: {
  contacts?: Contact[];
  groups?: Group[];
  messages?: Message[];
  settings?: Settings;
}): Promise<void> => {
  try {
    const database = await initDB();
    if (data.contacts) {
      await Promise.all(data.contacts.map((contact: Contact) => database.put('contacts', contact)));
    }
    if (data.groups) {
      await Promise.all(data.groups.map((group: Group) => database.put('groups', group)));
    }
    if (data.messages) {
      await Promise.all(data.messages.map((message: Message) => database.put('messages', message)));
    }
    if (data.settings) {
      await database.put('settings', data.settings);
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data');
  }
};

// Update STORAGE_KEYS to remove notification key
const STORAGE_KEYS = {
  SESSION: 'whatsapp_session',
  CONTACTS: 'whatsapp_contacts',
  GROUPS: 'whatsapp_groups',
  MESSAGES: 'whatsapp_messages',
  SETTINGS: 'whatsapp_settings',
  ACTIVE_TAB: 'whatsapp_active_tab',
  TEMPLATES: 'whatsapp_templates',
  CAMPAIGNS: 'whatsapp_campaigns',
} as const;

export const getSession = (): WhatsAppSession => {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  return session ? JSON.parse(session) : { isAuthenticated: false };
};

export const updateSession = (session: WhatsAppSession): void => {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
};

export const clearSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

// Export storage keys
export { STORAGE_KEYS };

// Export all data for backup/export
export const exportData = async (): Promise<string> => {
  try {
    const database = await initDB();
    const [contacts, groups, messages, settings, templates, campaigns] = await Promise.all([
      database.getAll('contacts'),
      database.getAll('groups'),
      database.getAll('messages'),
      database.getAll('settings'),
      database.getAll('templates'),
      database.getAll('campaigns'),
    ]);

    const data = {
      contacts,
      groups,
      messages,
      settings,
      templates,
      campaigns,
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data');
  }
};

// Session operations
export interface WhatsAppSession {
  isAuthenticated: boolean;
  userId?: string;
  lastActive?: string;
  deviceInfo?: {
    platform: string;
    browser: string;
    version: string;
  };
  type: 'web' | 'business';
  status: 'connected' | 'disconnected';
}

// Template and Campaign types
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'marketing' | 'support' | 'custom';
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

// Active tab operations
export function getActiveTab(): string {
  const tab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
  return tab || 'dashboard';
}

export function setActiveTab(tab: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
}

// Template operations
export const getTemplates = async (): Promise<MessageTemplate[]> => {
  const db = await openDB<WhatsAppDBSchema>('whatsapp-automation', 1)
  return db.getAll('templates')
};

export const getTemplate = async (id: string): Promise<MessageTemplate | undefined> => {
  const db = await openDB<WhatsAppDBSchema>('whatsapp-automation', 1)
  return db.get('templates', id)
};

export const addTemplate = async (data: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<MessageTemplate> => {
  try {
    const database = await initDB();
    const now = new Date().toISOString();
    const template: MessageTemplate = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    await database.add('templates', template);
    return template;
  } catch (error) {
    console.error('Failed to add template:', error);
    throw new Error('Failed to add template');
  }
};

export const updateTemplate = async (id: string, data: Partial<Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MessageTemplate> => {
  try {
    const database = await initDB();
    const template = await database.get('templates', id);
    if (!template) throw new Error('Template not found');
    
    const now = new Date().toISOString();
    const updatedTemplate: MessageTemplate = {
      ...template,
      ...data,
      updatedAt: now,
    };

    await database.put('templates', updatedTemplate);
    return updatedTemplate;
  } catch (error) {
    console.error('Failed to update template:', error);
    throw new Error('Failed to update template');
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    const database = await initDB();
    await database.delete('templates', id);
  } catch (error) {
    console.error('Failed to delete template:', error);
    throw new Error('Failed to delete template');
  }
};

// Campaign operations
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const database = await initDB();
    return database.getAll('campaigns');
  } catch (error) {
    console.error('Failed to get campaigns:', error);
    return [];
  }
};

export const addCampaign = async (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<Campaign> => {
  try {
    const database = await initDB();
    const now = new Date().toISOString();
    const campaign: Campaign = {
      ...data,
      id: crypto.randomUUID(),
      metrics: {
        totalContacts: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        replied: 0,
        lastUpdated: now,
      },
      createdAt: now,
      updatedAt: now,
    };
    
    await database.add('campaigns', campaign);
    return campaign;
  } catch (error) {
    console.error('Failed to add campaign:', error);
    throw new Error('Failed to add campaign');
  }
};

export const updateCampaign = async (id: string, data: Partial<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Campaign> => {
  try {
    const database = await initDB();
    const campaign = await database.get('campaigns', id);
    if (!campaign) throw new Error('Campaign not found');
    
    const now = new Date().toISOString();
    const updatedCampaign: Campaign = {
      ...campaign,
      ...data,
      updatedAt: now,
    };

    await database.put('campaigns', updatedCampaign);
    return updatedCampaign;
  } catch (error) {
    console.error('Failed to update campaign:', error);
    throw new Error('Failed to update campaign');
  }
};

export const deleteCampaign = async (id: string): Promise<void> => {
  try {
    const database = await initDB();
    await database.delete('campaigns', id);
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    throw new Error('Failed to delete campaign');
  }
}; 