import type { Contact, ContactStatus } from "@/types"

export interface CreateContactData {
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsappNumber?: string
  company?: string
  position?: string
  tags?: string[]
  status?: ContactStatus
  source?: string
  leadScore?: number
  assignedTo?: string
  organizationId?: string
  notes?: string
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string
}

export class ContactService {
  static async createContact(data: CreateContactData): Promise<Contact> {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create contact: ${response.statusText}`);
      }

      const contact = await response.json();
      console.log("Contact created successfully:", contact);
      return contact;
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }

  static async getAllContacts(): Promise<Contact[]> {
    try {
      const response = await fetch('/api/contacts');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Check if result has the expected structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid API response format');
      }
      
      const contacts = result.data || [];
      
      // Ensure contacts is an array before trying to map
      if (!Array.isArray(contacts)) {
        throw new Error('Contacts data is not an array');
      }
      
      // Parse JSON fields
      return contacts.map((contact: any) => ({
        ...contact,
        tags: typeof contact.tags === 'string' ? JSON.parse(contact.tags) : contact.tags || [],
        customFields: typeof contact.customFields === 'string' ? JSON.parse(contact.customFields) : contact.customFields || {},
        notes: Array.isArray(contact.notes) ? contact.notes : []
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  }

  static async getContactById(id: string): Promise<Contact | null> {
    try {
      const response = await fetch(`/api/contacts/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch contact: ${response.statusText}`);
      }
      
      const contact = await response.json();
      
      // Parse JSON fields
      return {
        ...contact,
        tags: typeof contact.tags === 'string' ? JSON.parse(contact.tags) : contact.tags || [],
        customFields: typeof contact.customFields === 'string' ? JSON.parse(contact.customFields) : contact.customFields || {},
        notes: Array.isArray(contact.notes) ? contact.notes : []
      };
    } catch (error) {
      console.error("Error fetching contact:", error);
      throw error;
    }
  }

  static async updateContact(data: UpdateContactData): Promise<Contact> {
    try {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update contact: ${response.statusText}`);
      }

      const contact = await response.json();
      return contact;
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  }

  static async deleteContact(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete contact: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  }

  static async searchContacts(query: string): Promise<Contact[]> {
    try {
      const response = await fetch(`/api/contacts?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search contacts: ${response.statusText}`);
      }
      
      const result = await response.json();
      const contacts = result.data || [];
      
      if (!Array.isArray(contacts)) {
        throw new Error('Contacts data is not an array');
      }
      
      // Parse JSON fields
      return contacts.map((contact: any) => ({
        ...contact,
        tags: typeof contact.tags === 'string' ? JSON.parse(contact.tags) : contact.tags || [],
        customFields: typeof contact.customFields === 'string' ? JSON.parse(contact.customFields) : contact.customFields || {},
        notes: Array.isArray(contact.notes) ? contact.notes : []
      }));
    } catch (error) {
      console.error("Error searching contacts:", error);
      throw error;
    }
  }
}