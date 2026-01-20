/**
 * Order types matching the backend Order model
 */

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DELIVERED = 'delivered',
  SHIPPED = 'shipped',
  RETURNED = 'returned'
}

export enum ServiceType {
  TRADITIONAL = 'traditional',
  CREMATION = 'cremation',
  MEMORIAL = 'memorial',
  GRAVESIDE = 'graveside'
}

export interface Order {
  id: string;
  companyId: string;
  userId?: string | null;
  retailerId?: string | null;
  customerId?: string | null;
  directorId?: string | null;
  staffId?: string | null;
  status: OrderStatus;
  total: number;
  subtotal: number;
  discount: number;
  salesTax: number;
  applyPlatformFee: boolean;
  serviceTypeName?: string | null;
  serviceTypePrice: number;
  cemetery?: string | null;
  locationId?: string | null;
  dateOfService?: Date | null;
  timeOfService?: string | null;
  arrivalTime?: string | null;
  contact?: string | null;
  email?: string | null;
  cellPhone?: string | null;
  isDeleted: boolean;
  isEdited: boolean;
  isParent: boolean;
  delivered: boolean;
  confirmed: boolean;
  newOrderNotificationsSent: boolean;
  comments?: string | null;
  deliveryInstructions?: string | null;
  orderDStatus?: string | null;
  productPaintColorOptions?: string | null;
  emblem?: string | null;
  serviceExtras?: string | null;
  image?: string | null;
  storeName?: string | null;
  storeAddress1?: string | null;
  storeAddress2?: string | null;
  storeCity?: string | null;
  storeState?: string | null;
  storeZip?: string | null;
  trackingColor?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations (optional, loaded when requested)
  orderItems?: any[];
  deceased?: any[];
  photos?: any[];
  orderExtraCharges?: any[];
  contacts?: any[];
  customer?: {
    id: string;
    user_id?: string;
    company_id?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    user?: {
      id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
    };
    name?: string;
    email?: string;
  };
  retailer?: {
    id: string;
    user_id?: string;
    user?: {
      id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
    };
    name?: string;
  };
  director?: {
    id: string;
    user_id?: string;
    user?: {
      id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
    };
    name?: string;
  };
  staff?: {
    id: string;
    user_id?: string;
    user?: {
      id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
    };
    name?: string;
  };
  location?: any;
  company?: {
    id: string;
    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    type?: string;
  };
}

export interface OrdersResponse {
  total_data: number;
  rows: Order[];
}

export interface GroupedOrdersByDate {
  date: string;
  vaults: Order[];
  caskets: Order[];
  urns: Order[];
  grave_diggings: Order[];
  cremations: Order[];
  monuments: Order[];
  bulk_precasts: Order[];
}

export type GroupedOrdersResponse = GroupedOrdersByDate[];
