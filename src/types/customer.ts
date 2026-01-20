/**
 * Customer types matching the backend Customer model
 */

export interface CustomerLocation {
  id: string;
  companyId: string;
  retailerId?: string | null;
  customerId?: string | null;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Customer {
  id: string;
  user_id: string;
  company_id: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  dateOfBirth?: Date | string | null;
  preferredContactMethod?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Relations (optional, loaded when requested)
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    isActive?: boolean;
  };
  company?: {
    id: string;
    name?: string;
  };
  locations?: CustomerLocation[];
  userOrders?: any[];
  customerOrders?: any[];
}

export interface CustomersResponse {
  total_data: number;
  rows: Customer[];
}
