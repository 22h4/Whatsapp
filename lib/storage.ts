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
  notifications: {
    key: string;
    value: {
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
      read: boolean;
      createdAt: string;
      metadata?: Record<string, any>;
    };
  };
}

// Export types for use in other files
export type Contact = WhatsAppDBSchema['contacts']['value'];
export type Group = WhatsAppDBSchema['groups']['value'];
export type Message = WhatsAppDBSchema['messages']['value'];
export type Notification = WhatsAppDBSchema['notifications']['value'];
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
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id' });
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
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        defaultDelay: 0,
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

// Notification operations
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const database = await initDB();
    return database.getAll('notifications');
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
};

export const addNotification = async (data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> => {
  try {
    const database = await initDB();
    const now = new Date().toISOString();
    const newNotification: Notification = {
      ...data,
      id: crypto.randomUUID(),
      read: false,
      createdAt: now,
    };

    await database.add('notifications', newNotification);
    return newNotification;
  } catch (error) {
    console.error('Failed to add notification:', error);
    throw new Error('Failed to add notification');
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const database = await initDB();
    const notification = await database.get('notifications', id);
    if (notification) {
      notification.read = true;
      await database.put('notifications', notification);
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const database = await initDB();
    const tx = database.transaction('notifications', 'readwrite');
    const notifications = await tx.store.getAll();
    await Promise.all(
      notifications.map((notification: Notification) => {
        notification.read = true;
        return tx.store.put(notification);
      })
    );
    await tx.done;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
};

export const deleteNotification = async (id: string): Promise<void> => {
  try {
    const database = await initDB();
    await database.delete('notifications', id);
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw new Error('Failed to delete notification');
  }
};

export const clearNotifications = async (): Promise<void> => {
  try {
    const database = await initDB();
    const tx = database.transaction('notifications', 'readwrite');
    await tx.store.clear();
    await tx.done;
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    throw new Error('Failed to clear notifications');
  }
};

export const getNotificationsByType = async (type: Notification['type']): Promise<Notification[]> => {
  try {
    const database = await initDB();
    const notifications = await database.getAll('notifications');
    return notifications.filter((notification: Notification) => notification.type === type);
  } catch (error) {
    console.error('Failed to get notifications by type:', error);
    return [];
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

    // Clean up old notifications
    const notifications = await getNotifications();
    const recentNotifications = notifications.filter(
      (notification: Notification) => new Date(notification.createdAt) > cutoffDate
    );
    await Promise.all(recentNotifications.map((notification: Notification) => database.put('notifications', notification)));
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
}

const STORAGE_KEYS = {
  SESSION: 'whatsapp_session',
  CONTACTS: 'whatsapp_contacts',
  GROUPS: 'whatsapp_groups',
  MESSAGES: 'whatsapp_messages',
  SETTINGS: 'whatsapp_settings',
  NOTIFICATIONS: 'whatsapp_notifications',
};

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