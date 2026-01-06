import { Order, OrderStatus, OrderType, DeliveryMethod } from '@base/api/models/Sales-and-orders/Order';
import { OrderItem, ItemType } from '@base/api/models/Sales-and-orders/OrderItem';

export class OrderItemResponseDto {
  id: string;
  itemName: string;
  itemDescription?: string;
  itemType: ItemType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ballotType?: string;
  language?: string;
  paperType?: string;
  printingSpecifications?: string;
  customizationNotes?: string;
  customFields?: any;
  serviceStartDate?: Date;
  serviceEndDate?: Date;
  serviceLocation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  voterName?: string;
  voterDateOfBirth?: Date;
  voterRegistrationNumber?: string;
  electionName?: string;
  electionDate?: Date;
  pollingStation?: string;
  district?: string;
  constituency?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZipCode?: string;
  deliveryCountry?: string;
  deliveryDate?: Date;
  deliveryTime?: Date;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  deliveryInstructions?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedAt?: Date;
  orderItems: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  companyId: string;

  // Helper methods
  getFormattedOrderNumber(): string {
    return `VW-${this.orderNumber}`;
  }

  getTotalItems(): number {
    return this.orderItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  isEditable(): boolean {
    return [OrderStatus.DRAFT, OrderStatus.PENDING].includes(this.status);
  }

  canBeCancelled(): boolean {
    return [OrderStatus.DRAFT, OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
  }
}

export class OrderListResponseDto {
  orders: OrderResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class OrderStatisticsDto {
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByType: Record<OrderType, number>;
  totalRevenue: number;
  averageOrderValue: number;
}

export class DashboardOrdersDto {
  recentOrders: OrderResponseDto[];
  pendingOrders: OrderResponseDto[];
  completedOrders: OrderResponseDto[];
}
