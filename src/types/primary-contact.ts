/**
 * Primary Contact (Funeral Director) types matching the backend FuneralDirector model
 * FuneralDirector serves as a Primary Contact and can be linked to Customers
 */

export interface PrimaryContact {
  id: string;
  user_id?: string | null;
  company_id: string;
  customer_id?: string | null;
  // Contact info for Primary Contacts without user accounts
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: Date | string | null;
  isVerified: boolean;
  specialization?: string | null;
  yearsOfExperience?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Relations (optional, loaded when requested)
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    isActive?: boolean;
  } | null;
  company?: {
    id: string;
    name?: string;
  };
  customer?: {
    id: string;
    user_id?: string;
  };
}

export interface PrimaryContactsResponse {
  success: boolean;
  data: PrimaryContact[];
  count: number;
}

export interface CreatePrimaryContactRequest {
  company_id: string;
  customer_id: string;
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
}

export interface CreatePrimaryContactResponse {
  success: boolean;
  data: PrimaryContact;
}

// Helper to get display name for a primary contact
export function getPrimaryContactDisplayName(contact: PrimaryContact): string {
  // First try the direct name field
  if (contact.name) {
    return contact.name;
  }
  // Then try user name if linked
  if (contact.user) {
    const firstName = contact.user.first_name || '';
    const lastName = contact.user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    if (contact.user.email) return contact.user.email;
  }
  // Fallback to email or id
  return contact.email || contact.id;
}

