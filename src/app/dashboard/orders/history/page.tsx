'use client';

import PageContainer from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  IconSearch,
  IconFilter,
  IconChevronRight,
  IconMessage,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
  IconUser,
  IconTruck,
  IconStarFilled,
  IconHistory
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { getGroupedOrders, updateOrder } from '@/lib/api-client';
import { Order, OrderStatus, GroupedOrdersByDate } from '@/types/order';
import { toast } from 'sonner';
import OrderCommentsModal from '@/components/orders/order-comments-modal';

// Color options for tracking
const TRACKING_COLOR_OPTIONS = [
  { value: 'bg-[#00D26A]', label: 'Green', hex: '#00D26A' },
  { value: 'bg-[#FF9500]', label: 'Orange', hex: '#FF9500' },
  { value: 'bg-[#FFEB3B]', label: 'Yellow', hex: '#FFEB3B' },
  { value: 'bg-[#00E5CC]', label: 'Cyan', hex: '#00E5CC' },
  { value: 'bg-[#2979FF]', label: 'Blue', hex: '#2979FF' },
  { value: 'bg-[#FF00FF]', label: 'Magenta', hex: '#FF00FF' },
  { value: 'bg-[#AAFF00]', label: 'Lime', hex: '#AAFF00' },
  { value: 'bg-[#FF3D00]', label: 'Red', hex: '#FF3D00' },
  { value: 'bg-[#2E7D32]', label: 'Forest', hex: '#2E7D32' },
  { value: 'bg-[#9E9E9E]', label: 'Gray', hex: '#9E9E9E' }
];

// Helper function to map Order status to display status
const mapOrderStatusToDisplayStatus = (
  status: OrderStatus
): 'alert' | 'user' | 'truck' | 'check' => {
  switch (status) {
    case OrderStatus.PENDING:
    case OrderStatus.DRAFT:
      return 'alert';
    case OrderStatus.CONFIRMED:
    case OrderStatus.PROCESSING:
      return 'user';
    case OrderStatus.IN_PROGRESS:
    case OrderStatus.SHIPPED:
      return 'truck';
    case OrderStatus.COMPLETED:
    case OrderStatus.DELIVERED:
      return 'check';
    default:
      return 'alert';
  }
};

// Helper function to get status background color
const getStatusBg = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
    case OrderStatus.DRAFT:
      return 'bg-red-500';
    case OrderStatus.CONFIRMED:
    case OrderStatus.PROCESSING:
      return 'bg-blue-500';
    case OrderStatus.IN_PROGRESS:
    case OrderStatus.SHIPPED:
      return 'bg-yellow-500';
    case OrderStatus.COMPLETED:
    case OrderStatus.DELIVERED:
      return 'bg-green-500';
    default:
      return 'bg-muted0';
  }
};

// Helper function to format time from HH:MM:SS to HH:MM AM/PM
const formatTime = (time: string | null | undefined): string => {
  if (!time) return 'N/A';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  if (isNaN(hour)) return 'N/A';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

// Helper function to get full name from user object
const getUserFullName = (user: any): string => {
  if (!user) return '';
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.email || '';
};

// Types for table data
type CasketsRow = {
  id: number;
  rowNumber: number;
  orderId?: string;
  orderStatus: OrderStatus;
  colorIndicator: string;
  customer: string;
  customerContact: string;
  deceased: string;
  serviceTime: string;
  serviceType: string;
  product: string;
  paintColor: string;
  emblem: string;
  cemetery: string;
  arrivalTime: string;
  assigned: string;
  status: 'alert' | 'user' | 'truck' | 'check';
  statusBg: string;
  statusIcon: 'alert' | 'user' | 'truck' | 'check';
  statusColor: string;
  hasStar?: boolean;
  hasMessageIcon?: boolean;
  hasEmblemIcon?: boolean;
};

type UrnsRow = {
  id: number;
  rowNumber: number;
  orderId?: string;
  orderStatus: OrderStatus;
  colorIndicator: string;
  customer: string;
  customerContact: string;
  deceased: string;
  items: string;
  deliveryLocation: string;
  deliveryTime: string;
  assigned: string;
  status: 'alert' | 'user' | 'truck' | 'check';
  statusBg: string;
  statusIcon: 'alert' | 'user' | 'truck' | 'check';
  statusColor: string;
  hasStar?: boolean;
  hasMessageIcon?: boolean;
};

type GraveDiggingRow = {
  id: number;
  rowNumber: number;
  orderId?: string;
  orderStatus: OrderStatus;
  colorIndicator: string;
  customer: string;
  customerContact: string;
  deceased: string;
  cemetery: string;
  graveType: string;
  section: string;
  plotNumber: string;
  arrivalAtGraveside: string;
  assigned: string;
  status: 'alert' | 'user' | 'truck' | 'check';
  statusBg: string;
  statusIcon: 'alert' | 'user' | 'truck' | 'check';
  statusColor: string;
  hasStar?: boolean;
  hasMessageIcon?: boolean;
};

type CremationsRow = {
  id: number;
  rowNumber: number;
  orderId?: string;
  orderStatus: OrderStatus;
  colorIndicator: string;
  customer: string;
  customerContact: string;
  deceased: string;
  documents: string;
  documentsHasIcon?: boolean;
  witness: string;
  delivery: string;
  time: string;
  return: string;
  returnDate: string;
  returnLocation: string;
  assigned: string;
  status: 'alert' | 'user' | 'truck' | 'check';
  statusBg: string;
  statusIcon: 'alert' | 'user' | 'truck' | 'check';
  statusColor: string;
  hasStar?: boolean;
  hasMessageIcon?: boolean;
};

type MonumentsRow = {
  id: number;
  rowNumber: number;
  orderId?: string;
  orderStatus: OrderStatus;
  colorIndicator: string;
  customer: string;
  customerContact: string;
  deceased: string;
  monument: string;
  monumentHasIcon?: boolean;
  requestedCompletion: string;
  cemetery: string;
  block: string;
  section: string;
  lot: string;
  assigned: string;
  status: 'alert' | 'user' | 'truck' | 'check';
  statusBg: string;
  statusIcon: 'alert' | 'user' | 'truck' | 'check';
  statusColor: string;
  hasStar?: boolean;
  hasMessageIcon?: boolean;
};

// Helper function to map Order to CasketsRow
const mapOrderToCasketsRow = (order: Order, index: number): CasketsRow => {
  const deceasedName =
    order.deceased && order.deceased.length > 0
      ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() ||
        `${order.deceased[0].first_name || ''} ${order.deceased[0].last_name || ''}`.trim()
      : 'N/A';

  let customerName = 'N/A';
  if (order.customer?.user) {
    customerName = getUserFullName(order.customer.user);
  } else if (order.customer?.name) {
    customerName = order.customer.name;
  } else if (order.retailer?.user) {
    customerName = getUserFullName(order.retailer.user);
  } else if (order.retailer?.name) {
    customerName = order.retailer.name;
  } else if (order.company?.name) {
    customerName = order.company.name;
  }

  let product = 'N/A';
  if (order.orderItems && order.orderItems.length > 0) {
    const firstItem = order.orderItems[0];
    product = firstItem.product?.name || firstItem.name || 'N/A';
  }

  const paintColor = order.productPaintColorOptions || 'N/A';

  let assignedName = '';
  if (order.staff?.user) {
    assignedName = getUserFullName(order.staff.user);
  } else if (order.staff?.name) {
    assignedName = order.staff.name;
  } else if (order.director?.user) {
    assignedName = getUserFullName(order.director.user);
  } else if (order.director?.name) {
    assignedName = order.director.name;
  }

  const customerContact =
    order.contact ||
    order.email ||
    order.customer?.user?.email ||
    order.customer?.email ||
    'N/A';

  const defaultColors = TRACKING_COLOR_OPTIONS.map(c => c.value);
  const colorIndicator = order.trackingColor || defaultColors[index % defaultColors.length];

  return {
    id: parseInt(order.id.slice(0, 8), 16) || index + 1,
    rowNumber: index + 1,
    orderId: order.id,
    orderStatus: order.status,
    colorIndicator: colorIndicator,
    customer: customerName,
    customerContact: customerContact,
    deceased: deceasedName,
    serviceTime: formatTime(order.timeOfService),
    serviceType: order.serviceTypeName || 'N/A',
    product: product,
    paintColor: paintColor,
    emblem: order.emblem || 'N/A',
    cemetery: order.cemetery || 'N/A',
    arrivalTime: formatTime(order.arrivalTime),
    assigned: assignedName,
    status: mapOrderStatusToDisplayStatus(order.status),
    statusBg: getStatusBg(order.status),
    statusIcon: mapOrderStatusToDisplayStatus(order.status),
    statusColor: 'text-white',
    hasStar: order.confirmed || false,
    hasMessageIcon: !!order.comments,
    hasEmblemIcon: !!order.emblem
  };
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrdersByDate[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [openDateGroups, setOpenDateGroups] = useState<Record<string, boolean>>({});
  const [openProductTypes, setOpenProductTypes] = useState<Record<string, boolean>>({});
  const [activeProductTab, setActiveProductTab] = useState<string>('all');
  const [activeMainTab, setActiveMainTab] = useState<string>('DailyTracking');

  const getProductTypeFromTab = (tabValue: string): string | undefined => {
    const mapping: Record<string, string> = {
      all: 'all',
      Vaults: 'vault',
      BulkPrecast: 'bulk_precast',
      Caskets: 'casket',
      Urns: 'urn',
      Monuments: 'monument',
      Cremations: 'cremation'
    };
    return mapping[tabValue] || undefined;
  };

  // Fetch past orders (order history)
  useEffect(() => {
    const fetchPastOrders = async () => {
      setIsLoadingOrders(true);
      try {
        let productType: string | undefined;
        if (activeMainTab === 'Monuments') {
          productType = 'monument';
        } else if (activeMainTab === 'Cremations') {
          productType = 'cremation';
        } else {
          productType = getProductTypeFromTab(activeProductTab);
        }

        const queryParams: Record<string, any> = {
          orderStatus: 'past', // Key difference: fetch past orders
          relations: [
            'customer',
            'retailer',
            'director',
            'staff',
            'deceased',
            'orderItems',
            'orderItems.product',
            'location'
          ]
        };

        if (productType && productType !== 'all') {
          queryParams.productType = productType;
        }

        const response = await getGroupedOrders(queryParams);

        if (response.success && response.data) {
          setGroupedOrders(response.data || []);
          const allOrders: Order[] = [];
          response.data.forEach((dateGroup: GroupedOrdersByDate) => {
            if (Array.isArray(dateGroup.vaults)) allOrders.push(...dateGroup.vaults);
            if (Array.isArray(dateGroup.caskets)) allOrders.push(...dateGroup.caskets);
            if (Array.isArray(dateGroup.urns)) allOrders.push(...dateGroup.urns);
            if (Array.isArray(dateGroup.grave_diggings)) allOrders.push(...dateGroup.grave_diggings);
            if (Array.isArray(dateGroup.cremations)) allOrders.push(...dateGroup.cremations);
            if (Array.isArray(dateGroup.monuments)) allOrders.push(...dateGroup.monuments);
            if (Array.isArray(dateGroup.bulk_precasts)) allOrders.push(...dateGroup.bulk_precasts);
          });
          setOrders(allOrders);
          setTotalOrders(allOrders.length);
        } else {
          toast.error(response.error?.message || 'Failed to fetch order history');
          setGroupedOrders([]);
          setOrders([]);
        }
      } catch (error: any) {
        toast.error('An error occurred while fetching order history');
        console.error('Error fetching order history:', error);
        setGroupedOrders([]);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchPastOrders();
  }, [activeProductTab, activeMainTab]);

  const getOrderIdFromRow = (row: any): string | null => {
    if (row.orderId) return row.orderId;
    const orderIndex = row.rowNumber - 1;
    if (orderIndex >= 0 && orderIndex < orders.length) {
      return orders[orderIndex].id;
    }
    return null;
  };

  // Status icon component
  const StatusIcon = ({ status, statusBg }: { status: string; statusBg: string }) => {
    switch (status) {
      case 'alert':
        return (
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-md bg-[#EF4444]')}>
            <IconAlertTriangle className="h-4 w-4 text-white" />
          </div>
        );
      case 'user':
        return (
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-md bg-[#86EFAC]')}>
            <IconUser className="h-4 w-4 text-green-800" />
          </div>
        );
      case 'truck':
        return (
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-md bg-[#22C55E]')}>
            <IconTruck className="h-4 w-4 text-white" />
          </div>
        );
      case 'check':
        return (
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-md bg-[#86EFAC]')}>
            <svg className="h-4 w-4 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Helper function to render table for Caskets/Vaults/BulkPrecast rows
  const renderCasketsTable = (rows: CasketsRow[]) => {
    return (
      <div className='overflow-x-auto rounded-md border border-border/50 bg-card scrollbar-thin'>
        <table className='w-full min-w-[800px] table-auto'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='sticky left-0 z-10 w-[50px] whitespace-nowrap bg-muted/30 px-2 py-2 text-left text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Customer</th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Contact</th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Deceased</th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Service time</th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Service Type</th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Product</th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Paint Color</th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Emblem</th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Cemetery</th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Arrival time</th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>Assigned</th>
              <th className='sticky right-[70px] z-10 whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>Status</th>
              <th className='sticky right-0 z-10 w-[70px] whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const orderId = getOrderIdFromRow(row);
              return (
                <tr key={row.id} className='border-b border-border/50 transition-colors hover:bg-muted/50 group'>
                  <td className='sticky left-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center gap-1.5'>
                      <span className='inline-block w-4 text-right text-xs font-medium text-muted-foreground'>{row.rowNumber}</span>
                      <div className={`h-3.5 w-3.5 shrink-0 ${row.colorIndicator}`}></div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <Button
                      className='m-0 h-auto cursor-pointer p-0 text-xs font-medium text-foreground hover:underline'
                      variant='link'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (orderId) router.push(`/dashboard/orders/${orderId}`);
                      }}
                    >
                      {row.customer}
                    </Button>
                  </td>
                  <td className='px-1 py-1.5 text-center'>
                    {row.hasStar && <IconStarFilled className='inline-block h-4 w-4 text-foreground' />}
                  </td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.customerContact}</span></td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.deceased}</span></td>
                  <td className='px-1 py-1.5 text-center'>
                    {row.hasMessageIcon && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (orderId) {
                            setSelectedOrderId(orderId);
                            setCommentsModalOpen(true);
                          }
                        }}
                        className='inline-flex items-center justify-center hover:opacity-70'
                        title='View Comments'
                      >
                        <IconMessage className='h-4 w-4 text-muted-foreground' />
                      </button>
                    )}
                  </td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.serviceTime}</span></td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.serviceType}</span></td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.product}</span></td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.paintColor}</span></td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.emblem}</span></td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.cemetery}</span></td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.arrivalTime}</span></td>
                  <td className='whitespace-nowrap px-3 py-1.5'><span className='text-xs text-muted-foreground'>{row.assigned}</span></td>
                  <td className='sticky right-[70px] z-10 bg-card px-2 py-1.5 text-center group-hover:bg-muted/50'>
                    <div className='flex justify-center'>
                      <StatusIcon status={row.status} statusBg={row.statusBg} />
                    </div>
                  </td>
                  <td className='sticky right-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center justify-center gap-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (orderId) router.push(`/dashboard/orders/${orderId}`);
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='View'
                      >
                        <IconEdit className='h-4 w-4 text-muted-foreground' />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper to map orders to UrnsRow, GraveDiggingRow, CremationsRow, MonumentsRow (simplified versions)
  const mapOrderToUrnsRow = (order: Order, index: number): UrnsRow => {
    const deceasedName = order.deceased && order.deceased.length > 0
      ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() || 'N/A'
      : 'N/A';
    const customerName = order.customer?.user ? getUserFullName(order.customer.user) : order.customer?.name || order.company?.name || 'N/A';
    const customerContact = order.contact || order.email || order.customer?.user?.email || 'N/A';
    const items = order.orderItems && order.orderItems.length > 0 ? order.orderItems.map((item) => item.product?.name || item.name || 'N/A').join(', ') : 'N/A';
    const deliveryLocation = order.cemetery || order.location?.name || 'N/A';
    const deliveryTime = formatTime(order.arrivalTime || order.timeOfService);
    const assignedName = order.staff?.user ? getUserFullName(order.staff.user) : order.staff?.name || '-';
    const defaultColors = TRACKING_COLOR_OPTIONS.map(c => c.value);
    const colorIndicator = order.trackingColor || defaultColors[index % defaultColors.length];

    return {
      id: parseInt(order.id.slice(0, 8), 16) || index + 1,
      rowNumber: index + 1,
      orderId: order.id,
      orderStatus: order.status,
      colorIndicator,
      customer: customerName,
      customerContact,
      deceased: deceasedName,
      items,
      deliveryLocation,
      deliveryTime,
      assigned: assignedName,
      status: mapOrderStatusToDisplayStatus(order.status),
      statusBg: getStatusBg(order.status),
      statusIcon: mapOrderStatusToDisplayStatus(order.status),
      statusColor: 'text-white',
      hasStar: order.confirmed || false,
      hasMessageIcon: !!order.comments
    };
  };

  const mapOrderToGraveDiggingRow = (order: Order, index: number): GraveDiggingRow => {
    const deceasedName = order.deceased && order.deceased.length > 0 ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() || 'N/A' : 'N/A';
    const customerName = order.customer?.user ? getUserFullName(order.customer.user) : order.customer?.name || order.company?.name || 'N/A';
    const customerContact = order.contact || order.email || order.customer?.user?.email || 'N/A';
    const graveType = order.orderItems && order.orderItems.length > 0 && order.orderItems[0].graveType ? order.orderItems[0].graveType : 'Traditional';
    const cemetery = order.cemetery || order.location?.name || 'N/A';
    const arrivalAtGraveside = formatTime(order.arrivalTime || order.timeOfService);
    const assignedName = order.staff?.user ? getUserFullName(order.staff.user) : order.staff?.name || '-';
    const defaultColors = TRACKING_COLOR_OPTIONS.map(c => c.value);
    const colorIndicator = order.trackingColor || defaultColors[index % defaultColors.length];

    return {
      id: parseInt(order.id.slice(0, 8), 16) || index + 1,
      rowNumber: index + 1,
      orderId: order.id,
      orderStatus: order.status,
      colorIndicator,
      customer: customerName,
      customerContact,
      deceased: deceasedName,
      cemetery,
      graveType,
      section: '-',
      plotNumber: '-',
      arrivalAtGraveside,
      assigned: assignedName,
      status: mapOrderStatusToDisplayStatus(order.status),
      statusBg: getStatusBg(order.status),
      statusIcon: mapOrderStatusToDisplayStatus(order.status),
      statusColor: 'text-white',
      hasStar: order.confirmed || false,
      hasMessageIcon: !!order.comments
    };
  };

  const mapOrderToCremationsRow = (order: Order, index: number): CremationsRow => {
    const deceasedName = order.deceased && order.deceased.length > 0 ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() || 'N/A' : 'N/A';
    const customerName = order.customer?.user ? getUserFullName(order.customer.user) : order.customer?.name || order.company?.name || 'N/A';
    const customerContact = order.contact || order.email || order.customer?.user?.email || 'N/A';
    const documents = order.photos && order.photos.length > 0 ? 'Yes' : 'No';
    const witness = order.orderItems && order.orderItems.length > 0 && order.orderItems[0].witnessType ? order.orderItems[0].witnessType : 'No';
    const cremationType = order.orderItems && order.orderItems.length > 0 && order.orderItems[0].cremationType ? order.orderItems[0].cremationType : 'Pick Up';
    const delivery = cremationType === 'pickup' ? 'Pick Up' : 'Drop Off';
    const time = formatTime(order.timeOfService || order.arrivalTime);
    const returnLocation = order.cemetery || order.location?.name || '-';
    const assignedName = order.staff?.user ? getUserFullName(order.staff.user) : order.staff?.name || '-';
    const defaultColors = TRACKING_COLOR_OPTIONS.map(c => c.value);
    const colorIndicator = order.trackingColor || defaultColors[index % defaultColors.length];

    return {
      id: parseInt(order.id.slice(0, 8), 16) || index + 1,
      rowNumber: index + 1,
      orderId: order.id,
      orderStatus: order.status,
      colorIndicator,
      customer: customerName,
      customerContact,
      deceased: deceasedName,
      documents,
      documentsHasIcon: order.photos && order.photos.length > 0,
      witness,
      delivery,
      time,
      return: '-',
      returnDate: '-',
      returnLocation,
      assigned: assignedName,
      status: mapOrderStatusToDisplayStatus(order.status),
      statusBg: getStatusBg(order.status),
      statusIcon: mapOrderStatusToDisplayStatus(order.status),
      statusColor: 'text-white',
      hasStar: order.confirmed || false,
      hasMessageIcon: !!order.comments
    };
  };

  const mapOrderToMonumentsRow = (order: Order, index: number): MonumentsRow => {
    const deceasedName = order.deceased && order.deceased.length > 0 ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() || 'N/A' : 'N/A';
    const customerName = order.customer?.user ? getUserFullName(order.customer.user) : order.customer?.name || order.company?.name || 'N/A';
    const customerContact = order.contact || order.email || order.customer?.user?.email || 'N/A';
    const monument = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0].product?.name || order.orderItems[0].name || 'N/A' : 'N/A';
    const requestedCompletion = order.dateOfService ? new Date(order.dateOfService).toLocaleDateString() : '-';
    const cemetery = order.cemetery || order.location?.name || '-';
    const assignedName = order.staff?.user ? getUserFullName(order.staff.user) : order.staff?.name || '-';
    const defaultColors = TRACKING_COLOR_OPTIONS.map(c => c.value);
    const colorIndicator = order.trackingColor || defaultColors[index % defaultColors.length];

    return {
      id: parseInt(order.id.slice(0, 8), 16) || index + 1,
      rowNumber: index + 1,
      orderId: order.id,
      orderStatus: order.status,
      colorIndicator,
      customer: customerName,
      customerContact,
      deceased: deceasedName,
      monument,
      monumentHasIcon: false,
      requestedCompletion,
      cemetery,
      block: '-',
      section: '-',
      lot: '-',
      assigned: assignedName,
      status: mapOrderStatusToDisplayStatus(order.status),
      statusBg: getStatusBg(order.status),
      statusIcon: mapOrderStatusToDisplayStatus(order.status),
      statusColor: 'text-white',
      hasStar: order.confirmed || false,
      hasMessageIcon: !!order.comments
    };
  };

  // Helper function to format date as "Friday, MM/DD/YYYY"
  const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${month}/${day}/${year}`;
  };

  const getDateGroupTotal = (dateGroup: GroupedOrdersByDate): number => {
    return (
      (Array.isArray(dateGroup.vaults) ? dateGroup.vaults.length : 0) +
      (Array.isArray(dateGroup.caskets) ? dateGroup.caskets.length : 0) +
      (Array.isArray(dateGroup.urns) ? dateGroup.urns.length : 0) +
      (Array.isArray(dateGroup.grave_diggings) ? dateGroup.grave_diggings.length : 0) +
      (Array.isArray(dateGroup.cremations) ? dateGroup.cremations.length : 0) +
      (Array.isArray(dateGroup.monuments) ? dateGroup.monuments.length : 0) +
      (Array.isArray(dateGroup.bulk_precasts) ? dateGroup.bulk_precasts.length : 0)
    );
  };

  const getDateProductTypeData = (dateGroup: GroupedOrdersByDate, productType: keyof Omit<GroupedOrdersByDate, 'date'>) => {
    const orders = dateGroup[productType];
    if (!Array.isArray(orders) || orders.length === 0) return [];

    switch (productType) {
      case 'vaults':
      case 'caskets':
      case 'bulk_precasts':
        return orders.map((order, index) => mapOrderToCasketsRow(order, index));
      case 'urns':
        return orders.map((order, index) => mapOrderToUrnsRow(order, index));
      case 'grave_diggings':
        return orders.map((order, index) => mapOrderToGraveDiggingRow(order, index));
      case 'cremations':
        return orders.map((order, index) => mapOrderToCremationsRow(order, index));
      case 'monuments':
        return orders.map((order, index) => mapOrderToMonumentsRow(order, index));
      default:
        return [];
    }
  };

  // Simplified table renderers for other product types
  const renderSimpleTable = (rows: any[], productType: string) => {
    return renderCasketsTable(rows as CasketsRow[]);
  };

  return (
    <div className='-mt-4 rounded-tr-xl bg-muted p-2'>
      <PageContainer scrollable={false}>
        <div className='flex min-w-0 flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <IconHistory className='h-8 w-8 text-muted-foreground' />
              <Heading title='ORDER HISTORY' description='View past and completed orders' />
            </div>
            <Link
              href='/dashboard/orders/track'
              className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
            >
              Back to Tracking
            </Link>
          </div>
          <Separator />

          <div className='flex w-full min-w-0 flex-col' style={{ height: 'calc(100dvh - 200px)', overflow: 'hidden' }}>
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className='flex h-full min-w-0 flex-col'>
              <div className='w-full flex-shrink-0 bg-muted'>
                <TabsList>
                  <TabsTrigger value='DailyTracking'>All History</TabsTrigger>
                  <TabsTrigger value='Monuments'>Monuments</TabsTrigger>
                  <TabsTrigger value='Cremations'>Cremations</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value='DailyTracking' className='mt-0 flex-1 overflow-auto'>
                <Tabs value={activeProductTab} onValueChange={setActiveProductTab} className='min-w-0'>
                  <TabsList className='h-auto w-fit gap-4 bg-transparent p-0'>
                    <TabsTrigger value='all' className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'>All</TabsTrigger>
                    <TabsTrigger value='Vaults' className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'>Vaults</TabsTrigger>
                    <TabsTrigger value='BulkPrecast' className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'>Bulk / Precast</TabsTrigger>
                    <TabsTrigger value='Caskets' className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'>Caskets</TabsTrigger>
                    <TabsTrigger value='Urns' className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'>Urns</TabsTrigger>
                  </TabsList>
                  <TabsContent value='all' className='overflow-auto'>
                    <div className='space-y-2'>
                      {isLoadingOrders ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>Loading order history...</span>
                        </div>
                      ) : groupedOrders.length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>No past orders found</span>
                        </div>
                      ) : (
                        groupedOrders.map((dateGroup) => {
                          const dateKey = dateGroup.date;
                          const isDateOpen = openDateGroups[dateKey] !== false;
                          const totalCount = getDateGroupTotal(dateGroup);

                          const allProductTypes = [
                            { key: 'vaults' as const, label: 'Vaults', getRows: () => getDateProductTypeData(dateGroup, 'vaults') },
                            { key: 'bulk_precasts' as const, label: 'Precast (Bulk Vaults)', getRows: () => getDateProductTypeData(dateGroup, 'bulk_precasts') },
                            { key: 'caskets' as const, label: 'Caskets', getRows: () => getDateProductTypeData(dateGroup, 'caskets') },
                            { key: 'urns' as const, label: 'Urns', getRows: () => getDateProductTypeData(dateGroup, 'urns') },
                            { key: 'grave_diggings' as const, label: 'Grave Digging', getRows: () => getDateProductTypeData(dateGroup, 'grave_diggings') },
                            { key: 'cremations' as const, label: 'Cremations', getRows: () => getDateProductTypeData(dateGroup, 'cremations') },
                            { key: 'monuments' as const, label: 'Monuments', getRows: () => getDateProductTypeData(dateGroup, 'monuments') }
                          ];

                          return (
                            <Collapsible
                              key={dateKey}
                              open={isDateOpen}
                              onOpenChange={(open) => setOpenDateGroups((prev) => ({ ...prev, [dateKey]: open }))}
                              className='flex w-full flex-col gap-2'
                            >
                              <div className='flex items-center justify-between rounded-lg bg-zinc-700 px-2 py-1 shadow-sm'>
                                <div className='flex items-center gap-2'>
                                  <CollapsibleTrigger asChild>
                                    <Button variant='ghost' size='icon' className='size-8 text-white'>
                                      <ChevronsUpDown />
                                      <span className='sr-only'>Toggle</span>
                                    </Button>
                                  </CollapsibleTrigger>
                                  <span className='font-medium text-white'>{formatDateHeader(dateKey)}</span>
                                </div>
                                <div className='rounded bg-muted px-2 py-1'>
                                  <span className='text-sm font-semibold text-blue-600'>{totalCount}</span>
                                </div>
                              </div>

                              <CollapsibleContent className='flex flex-col gap-2'>
                                <div className='space-y-2'>
                                  {allProductTypes.map((productType) => {
                                    const productKey = `${dateKey}-${productType.key}`;
                                    const isProductOpen = openProductTypes[productKey] !== false;
                                    const orders = dateGroup[productType.key];
                                    const count = Array.isArray(orders) ? orders.length : 0;
                                    const rows = productType.getRows();

                                    if (count === 0) return null;

                                    return (
                                      <Collapsible
                                        key={productKey}
                                        open={isProductOpen}
                                        onOpenChange={(open) => setOpenProductTypes((prev) => ({ ...prev, [productKey]: open }))}
                                        className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
                                      >
                                        <div className='flex items-center justify-between border-b border-border bg-muted px-3 py-1'>
                                          <div className='flex items-center gap-2'>
                                            <CollapsibleTrigger asChild>
                                              <div className='flex size-6 cursor-pointer items-center justify-center bg-card'>
                                                <IconChevronRight className={`h-5 w-5 transition-transform ${isProductOpen ? 'rotate-90' : ''}`} />
                                              </div>
                                            </CollapsibleTrigger>
                                            <h3 className='text-sm font-semibold text-foreground'>{productType.label}</h3>
                                            <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>{count}</span>
                                          </div>
                                          <div className='flex items-center gap-1'>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconSearch className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconFilter className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                          </div>
                                        </div>
                                        <CollapsibleContent>
                                          <div className='w-full overflow-x-auto px-2 py-1'>
                                            {renderCasketsTable(rows as CasketsRow[])}
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>
                  {/* Simplified tab content for other product types */}
                  {['Vaults', 'BulkPrecast', 'Caskets', 'Urns'].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className='overflow-auto'>
                      <div className='space-y-2'>
                        {isLoadingOrders ? (
                          <div className='flex items-center justify-center py-8'>
                            <span className='text-muted-foreground'>Loading order history...</span>
                          </div>
                        ) : groupedOrders.length === 0 ? (
                          <div className='flex items-center justify-center py-8'>
                            <span className='text-muted-foreground'>No past orders found</span>
                          </div>
                        ) : (
                          <div className='text-sm text-muted-foreground py-4'>Filtered view for {tabValue}</div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
              <TabsContent value='Monuments' className='mt-0 flex-1 overflow-auto'>
                <div className='space-y-2'>
                  {isLoadingOrders ? (
                    <div className='flex items-center justify-center py-8'>
                      <span className='text-muted-foreground'>Loading monument history...</span>
                    </div>
                  ) : groupedOrders.length === 0 ? (
                    <div className='flex items-center justify-center py-8'>
                      <span className='text-muted-foreground'>No past monument orders found</span>
                    </div>
                  ) : (
                    <div className='text-sm text-muted-foreground py-4'>Monument history will appear here</div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value='Cremations' className='mt-0 flex-1 overflow-auto'>
                <div className='space-y-2'>
                  {isLoadingOrders ? (
                    <div className='flex items-center justify-center py-8'>
                      <span className='text-muted-foreground'>Loading cremation history...</span>
                    </div>
                  ) : groupedOrders.length === 0 ? (
                    <div className='flex items-center justify-center py-8'>
                      <span className='text-muted-foreground'>No past cremation orders found</span>
                    </div>
                  ) : (
                    <div className='text-sm text-muted-foreground py-4'>Cremation history will appear here</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageContainer>

      {/* Comments Modal */}
      {selectedOrderId && (
        <OrderCommentsModal
          isOpen={commentsModalOpen}
          onClose={() => {
            setCommentsModalOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
}
