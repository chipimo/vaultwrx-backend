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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconChevronRight,
  IconMessageCircle,
  IconMessage,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
  IconUser,
  IconTruck,
  IconStar,
  IconStarFilled,
  IconLink,
  IconLoader2} from '@tabler/icons-react';
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
import { getGroupedOrders, updateOrder, getLocations, LocationData } from '@/lib/api-client';
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
  // If time is in HH:MM:SS format, convert to HH:MM AM/PM
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

// Helper function to map Order to CasketsRow
const mapOrderToCasketsRow = (order: Order, index: number): CasketsRow => {
  // Get first deceased name or default
  const deceasedName =
    order.deceased && order.deceased.length > 0
      ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() ||
        `${order.deceased[0].first_name || ''} ${order.deceased[0].last_name || ''}`.trim()
      : 'N/A';

  // Get customer name from customer.user or company name
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

  // Get product from first order item
  let product = 'N/A';
  if (order.orderItems && order.orderItems.length > 0) {
    const firstItem = order.orderItems[0];
    product = firstItem.product?.name || firstItem.name || 'N/A';
  }

  // Get paint color
  const paintColor = order.productPaintColorOptions || 'N/A';

  // Get assigned staff name
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

  // Get customer contact (prefer contact field, then email, then customer email)
  const customerContact =
    order.contact ||
    order.email ||
    order.customer?.user?.email ||
    order.customer?.email ||
    'N/A';

  // Use tracking color from order if available, otherwise use a default color based on index
  const defaultColors = TRACKING_COLOR_OPTIONS.map(c => c.value);
  const colorIndicator = order.trackingColor || defaultColors[index % defaultColors.length];

  return {
    id: parseInt(order.id.slice(0, 8), 16) || index + 1, // Convert UUID to number for display
    rowNumber: index + 1,
    orderId: order.id, // Store the actual order ID
    orderStatus: order.status, // Store the actual order status
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

// Types for table data - must be defined before helper functions
type CasketsRow = {
  id: number;
  rowNumber: number;
  orderId?: string; // Store the actual order ID
  orderStatus: OrderStatus; // Store the actual order status for dropdown
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


export default function Page() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrdersByDate[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  // Track which date groups and product types are open
  const [openDateGroups, setOpenDateGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [openProductTypes, setOpenProductTypes] = useState<
    Record<string, boolean>
  >({});
  // Track active product type tab
  const [activeProductTab, setActiveProductTab] = useState<string>('all');
  // Track active main tab (DailyTracking, Monuments, Cremations)
  const [activeMainTab, setActiveMainTab] = useState<string>('DailyTracking');
  
  // Locations for color picker
  const [locations, setLocations] = useState<LocationData[]>([]);
  // Track which order is updating its color
  const [updatingColorOrderId, setUpdatingColorOrderId] = useState<string | null>(null);

  // Fetch locations for color picker
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getLocations();
        if (response.success && response.data) {
          setLocations(response.data.rows);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  // Map tab values to productType query parameters
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

  // Fetch grouped orders based on active tab
  useEffect(() => {
    const fetchGroupedOrders = async () => {
      setIsLoadingOrders(true);
      try {
        // Determine productType based on active main tab or product tab
        let productType: string | undefined;
        if (activeMainTab === 'Monuments') {
          productType = 'monument';
        } else if (activeMainTab === 'Cremations') {
          productType = 'cremation';
        } else {
          // For DailyTracking, use the activeProductTab
          productType = getProductTypeFromTab(activeProductTab);
        }

        // Fetch grouped orders with relations and productType filter
        const queryParams: Record<string, any> = {
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

        // Add productType if not 'all' (or if explicitly 'all', we can omit it)
        if (productType && productType !== 'all') {
          queryParams.productType = productType;
        }

        const response = await getGroupedOrders(queryParams);

        if (response.success && response.data) {
          setGroupedOrders(response.data || []);
          // Also flatten all orders for backward compatibility
          const allOrders: Order[] = [];
          response.data.forEach((dateGroup: GroupedOrdersByDate) => {
            // Safely push orders only if they exist and are arrays
            if (Array.isArray(dateGroup.vaults))
              allOrders.push(...dateGroup.vaults);
            if (Array.isArray(dateGroup.caskets))
              allOrders.push(...dateGroup.caskets);
            if (Array.isArray(dateGroup.urns))
              allOrders.push(...dateGroup.urns);
            if (Array.isArray(dateGroup.grave_diggings))
              allOrders.push(...dateGroup.grave_diggings);
            if (Array.isArray(dateGroup.cremations))
              allOrders.push(...dateGroup.cremations);
            if (Array.isArray(dateGroup.monuments))
              allOrders.push(...dateGroup.monuments);
            if (Array.isArray(dateGroup.bulk_precasts))
              allOrders.push(...dateGroup.bulk_precasts);
          });
          setOrders(allOrders);
          setTotalOrders(allOrders.length);
        } else {
          toast.error(
            response.error?.message || 'Failed to fetch grouped orders'
          );
          setGroupedOrders([]);
          setOrders([]);
        }
      } catch (error: any) {
        toast.error('An error occurred while fetching grouped orders');
        console.error('Error fetching grouped orders:', error);
        setGroupedOrders([]);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchGroupedOrders();
  }, [activeProductTab, activeMainTab]);

  // Get all column keys
  const allColumnKeys = [
    'rowNumber',
    'colorIndicator',
    'customer',
    'star',
    'customerContact',
    'deceased',
    'messageIcon',
    'serviceTime',
    'serviceType',
    'product',
    'paintColor',
    'emblemIcon',
    'emblem',
    'cemetery',
    'arrivalTime',
    'assigned',
    'status',
    'actions'
  ];

  // Initialize visible columns - hide paintColor, emblemIcon, and emblem by default
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(
      allColumnKeys.filter(
        (key) => !['paintColor', 'emblemIcon', 'emblem'].includes(key)
      )
    )
  );

  // Helper function to get order ID from row
  const getOrderIdFromRow = (row: any): string | null => {
    // Try to get orderId from row if it exists
    if (row.orderId) {
      return row.orderId;
    }
    // Fallback to finding by row number
    const orderIndex = row.rowNumber - 1;
    if (orderIndex >= 0 && orderIndex < orders.length) {
      return orders[orderIndex].id;
    }
    return null;
  };

  // Handler to update tracking color
  const handleColorChange = async (orderId: string, newColor: string) => {
    setUpdatingColorOrderId(orderId);
    try {
      const response = await updateOrder(orderId, { trackingColor: newColor });
      if (response.success) {
        // Update local state to reflect the change
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, trackingColor: newColor } 
              : order
          )
        );
        setGroupedOrders(prevGrouped =>
          prevGrouped.map(dateGroup => ({
            ...dateGroup,
            vaults: dateGroup.vaults?.map(o => o.id === orderId ? { ...o, trackingColor: newColor } : o) || [],
            caskets: dateGroup.caskets?.map(o => o.id === orderId ? { ...o, trackingColor: newColor } : o) || [],
            urns: dateGroup.urns?.map(o => o.id === orderId ? { ...o, trackingColor: newColor } : o) || [],
            grave_diggings: dateGroup.grave_diggings?.map(o => o.id === orderId ? { ...o, trackingColor: newColor } : o) || [],
            cremations: dateGroup.cremations?.map(o => o.id === orderId ? { ...o, trackingColor: newColor } : o) || [],
            monuments: dateGroup.monuments?.map(o => o.id === orderId ? { ...o, trackingColor: newColor } : o) || [],
            bulk_precasts: dateGroup.bulk_precasts?.map(o => o.id === orderId ? { ...o, trackingColor: newColor } : o) || []
          }))
        );
        toast.success('Color updated successfully');
      } else {
        toast.error(response.error?.message || 'Failed to update color');
      }
    } catch (error: any) {
      toast.error('An error occurred while updating color');
      console.error('Error updating color:', error);
    } finally {
      setUpdatingColorOrderId(null);
    }
  };

  // Helper function to extract hex color from tracking color (handles both bg-[#xxx] format and raw hex)
  const getHexFromTrackingColor = (trackingColor: string): string => {
    if (trackingColor.startsWith('bg-[')) {
      const match = trackingColor.match(/bg-\[(#[A-Fa-f0-9]+)\]/);
      return match ? match[1] : '#6b7280';
    }
    if (trackingColor.startsWith('#')) {
      return trackingColor;
    }
    return '#6b7280';
  };

  // Helper function to find location name from tracking color
  const getLocationNameFromColor = (trackingColor: string): string | null => {
    const hexColor = getHexFromTrackingColor(trackingColor);
    const location = locations.find(loc => loc.color?.toLowerCase() === hexColor.toLowerCase());
    return location?.name || null;
  };

  // Color picker dropdown component - shows locations with their colors
  const ColorPickerDropdown = ({ orderId, currentColor }: { orderId: string; currentColor: string }) => {
    const currentHex = getHexFromTrackingColor(currentColor);
    const isLoading = updatingColorOrderId === orderId;
    
    // Show loading spinner when updating
    if (isLoading) {
      return (
        <div className="h-5 w-5 shrink-0 flex items-center justify-center">
          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-5 w-5 shrink-0 cursor-pointer rounded hover:ring-2 hover:ring-offset-1 hover:ring-primary transition-all"
            style={{ backgroundColor: currentHex }}
            title="Click to change location"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 p-2 bg-card">
          <div className="flex flex-col gap-1">
            {locations.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No locations available
              </div>
            ) : (
              locations.map((location) => (
                <button
                  key={location.id}
                  className={cn(
                    'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-all hover:bg-accent',
                    currentHex.toLowerCase() === (location.color || '').toLowerCase() && 'bg-accent'
                  )}
                  onClick={() => handleColorChange(orderId, location.color || '#6b7280')}
                >
                  <div 
                    className="h-5 w-5 shrink-0 rounded" 
                    style={{ backgroundColor: location.color || '#6b7280' }}
                  />
                  <span className="text-sm font-medium text-foreground">{location.name}</span>
                </button>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Status options for dropdown - colors match reference images
  const STATUS_OPTIONS = [
    { value: OrderStatus.PENDING, label: 'Confirm', icon: 'alert', bgColor: 'bg-[#EF4444]' },
    { value: OrderStatus.CONFIRMED, label: 'Assigned', icon: 'user', bgColor: 'bg-[#86EFAC]' },
    { value: OrderStatus.IN_PROGRESS, label: 'Ongoing', icon: 'truck', bgColor: 'bg-[#22C55E]' },
    { value: OrderStatus.SHIPPED, label: 'Shipped', icon: 'truck', bgColor: 'bg-[#16A34A]' },
    { value: OrderStatus.DELIVERED, label: 'Delivered', icon: 'truck', bgColor: 'bg-[#166534]' },
    { value: OrderStatus.COMPLETED, label: 'Completed', icon: 'check', bgColor: 'bg-[#86EFAC]' },
  ];

  // Get status icon based on type
  const getStatusIconElement = (icon: string, className: string) => {
    switch (icon) {
      case 'alert':
        return <IconAlertTriangle className={className} />;
      case 'user':
        return <IconUser className={className} />;
      case 'truck':
        return <IconTruck className={className} />;
      case 'check':
        return (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return <IconAlertTriangle className={className} />;
    }
  };

  // Get current status option
  const getCurrentStatusOption = (status: OrderStatus) => {
    return STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success('Order status updated successfully!');
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status.');
    }
  };

  // Status dropdown component
  const StatusDropdown = ({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) => {
    const currentOption = getCurrentStatusOption(currentStatus);
    const iconColor = currentOption.icon === 'user' || currentOption.icon === 'check' ? 'text-green-800' : 'text-white';
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-all hover:opacity-80',
              currentOption.bgColor
            )}
            title={`${currentOption.label}. Click to change status`}
          >
            {getStatusIconElement(currentOption.icon, `h-4 w-4 ${iconColor}`)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-foreground">
            {currentOption.label}. Click to change status
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="flex flex-col gap-1 p-1">
            {STATUS_OPTIONS.filter(opt => opt.value !== currentStatus).map((statusOpt) => {
              const optIconColor = statusOpt.icon === 'user' || statusOpt.icon === 'check' ? 'text-green-800' : 'text-white';
              return (
                <button
                  key={statusOpt.value}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:opacity-80',
                    statusOpt.bgColor,
                    statusOpt.icon === 'user' || statusOpt.icon === 'check' ? 'text-green-800' : 'text-white'
                  )}
                  onClick={() => handleStatusUpdate(orderId, statusOpt.value)}
                >
                  {getStatusIconElement(statusOpt.icon, `h-5 w-5 ${optIconColor}`)}
                  <span>{statusOpt.label}</span>
                </button>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Status icon component (fallback for non-editable status)
  const StatusIcon = ({ status, statusBg }: { status: string; statusBg: string }) => {
    const iconClass = status === 'user' || status === 'check' ? 'h-4 w-4 text-green-800' : 'h-4 w-4 text-white';
    const containerClass = cn('flex h-6 w-6 items-center justify-center rounded-md', statusBg);
    
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

  // Helper function to render HTML table for Caskets/Vaults/BulkPrecast rows
  const renderCasketsTable = (rows: CasketsRow[]) => {
    return (
      <div className='overflow-x-auto rounded-md border border-border/50 bg-card scrollbar-thin'>
        <table className='w-full min-w-[800px] table-auto'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='sticky left-0 z-10 w-[50px] whitespace-nowrap bg-muted/30 px-2 py-2 text-left text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Customer
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Contact
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Deceased
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Service time
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Service Type
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Product
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Paint Color
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Emblem
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Cemetery
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Arrival time
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Assigned
              </th>
              <th className='sticky right-[70px] z-10 whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Status
              </th>
              <th className='sticky right-0 z-10 w-[70px] whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const orderId = getOrderIdFromRow(row);
              return (
                <tr key={row.id} className='border-b border-border/50 transition-colors hover:bg-muted/50 group'>
                  {/* Row number and Color indicator - Sticky left */}
                  <td className='sticky left-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center gap-1.5'>
                      <span className='inline-block w-4 text-right text-xs font-medium text-foreground'>
                        {row.rowNumber}
                      </span>
                      {orderId ? (
                        <ColorPickerDropdown orderId={orderId} currentColor={row.colorIndicator} />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: getHexFromTrackingColor(row.colorIndicator) }}></div>
                      )}
                    </div>
                  </td>
                  {/* Customer */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <Button
                      className='m-0 h-auto cursor-pointer p-0 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline'
                      variant='link'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (orderId) {
                          router.push(`/dashboard/orders/${orderId}`);
                        }
                      }}
                    >
                      {row.customer}
                    </Button>
                  </td>
                  {/* Star icon */}
                  <td className='px-1 py-1.5 text-center'>
                    {row.hasStar && (
                      <IconStarFilled className='inline-block h-4 w-4 text-foreground' />
                    )}
                  </td>
                  {/* Contact */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs font-medium text-blue-600'>
                      {row.customerContact}
                    </span>
                  </td>
                  {/* Deceased */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.deceased}
                    </span>
                  </td>
                  {/* Comments icon */}
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
                  {/* Service time */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.serviceTime}
                    </span>
                  </td>
                  {/* Service Type */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.serviceType}
                    </span>
                  </td>
                  {/* Product */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.product}</span>
                  </td>
                  {/* Paint Color */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.paintColor}
                    </span>
                  </td>
                  {/* Emblem */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.emblem}</span>
                  </td>
                  {/* Cemetery */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.cemetery}
                    </span>
                  </td>
                  {/* Arrival time */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.arrivalTime}
                    </span>
                  </td>
                  {/* Assigned */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.assigned}
                    </span>
                  </td>
                  {/* Status - Sticky right */}
                  <td className='sticky right-[70px] z-10 bg-card px-2 py-1.5 text-center group-hover:bg-muted/50'>
                    <div className='flex justify-center'>
                      {orderId ? (
                        <StatusDropdown orderId={orderId} currentStatus={row.orderStatus} />
                      ) : (
                        <StatusIcon status={row.status} statusBg={row.statusBg} />
                      )}
                    </div>
                  </td>
                  {/* Actions - Sticky right */}
                  <td className='sticky right-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center justify-center gap-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (orderId) {
                            router.push(`/dashboard/orders/${orderId}`);
                          }
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Edit'
                      >
                        <IconEdit className='h-4 w-4 text-muted-foreground' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete action placeholder
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Delete'
                      >
                        <IconTrash className='h-4 w-4 text-muted-foreground' />
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

  // Helper function to render HTML table for Urns rows
  const renderUrnsTable = (rows: UrnsRow[]) => {
    return (
      <div className='overflow-x-auto rounded-md border border-border/50 bg-card scrollbar-thin'>
        <table className='w-full min-w-[700px] table-auto'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='sticky left-0 z-10 w-[50px] whitespace-nowrap bg-muted/30 px-2 py-2 text-left text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Customer
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Contact
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Deceased
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Items
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Delivery Location
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Delivery Time
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Assigned
              </th>
              <th className='sticky right-[70px] z-10 whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Status
              </th>
              <th className='sticky right-0 z-10 w-[70px] whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const orderId = getOrderIdFromRow(row);
              return (
                <tr key={row.id} className='border-b border-border/50 transition-colors hover:bg-muted/50 group'>
                  {/* Row number and Color indicator - Sticky left */}
                  <td className='sticky left-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center gap-1.5'>
                      <span className='inline-block w-4 text-right text-xs font-medium text-foreground'>
                        {row.rowNumber}
                      </span>
                      {orderId ? (
                        <ColorPickerDropdown orderId={orderId} currentColor={row.colorIndicator} />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: getHexFromTrackingColor(row.colorIndicator) }}></div>
                      )}
                    </div>
                  </td>
                  {/* Customer */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <Button
                      className='m-0 h-auto cursor-pointer p-0 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline'
                      variant='link'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (orderId) {
                          router.push(`/dashboard/orders/${orderId}`);
                        }
                      }}
                    >
                      {row.customer}
                    </Button>
                  </td>
                  {/* Star icon */}
                  <td className='px-1 py-1.5 text-center'>
                    {row.hasStar && (
                      <IconStarFilled className='inline-block h-4 w-4 text-foreground' />
                    )}
                  </td>
                  {/* Contact */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs font-medium text-blue-600'>
                      {row.customerContact}
                    </span>
                  </td>
                  {/* Deceased */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.deceased}
                    </span>
                  </td>
                  {/* Comments icon */}
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
                  {/* Items */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.items}</span>
                  </td>
                  {/* Delivery Location */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.deliveryLocation}
                    </span>
                  </td>
                  {/* Delivery Time */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.deliveryTime}
                    </span>
                  </td>
                  {/* Assigned */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.assigned}
                    </span>
                  </td>
                  {/* Status - Sticky right */}
                  <td className='sticky right-[70px] z-10 bg-card px-2 py-1.5 text-center group-hover:bg-muted/50'>
                    <div className='flex justify-center'>
                      {orderId ? (
                        <StatusDropdown orderId={orderId} currentStatus={row.orderStatus} />
                      ) : (
                        <StatusIcon status={row.status} statusBg={row.statusBg} />
                      )}
                    </div>
                  </td>
                  {/* Actions - Sticky right */}
                  <td className='sticky right-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center justify-center gap-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (orderId) {
                            router.push(`/dashboard/orders/${orderId}`);
                          }
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Edit'
                      >
                        <IconEdit className='h-4 w-4 text-muted-foreground' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Delete'
                      >
                        <IconTrash className='h-4 w-4 text-muted-foreground' />
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

  // Helper function to render HTML table for Grave Digging rows
  const renderGraveDiggingTable = (rows: GraveDiggingRow[]) => {
    return (
      <div className='overflow-x-auto rounded-md border border-border/50 bg-card scrollbar-thin'>
        <table className='w-full min-w-[800px] table-auto'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='sticky left-0 z-10 w-[50px] whitespace-nowrap bg-muted/30 px-2 py-2 text-left text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Customer
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Contact
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Deceased
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Cemetery
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Grave Type
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Section
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Plot Number
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Arrival at Graveside
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Assigned
              </th>
              <th className='sticky right-[70px] z-10 whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Status
              </th>
              <th className='sticky right-0 z-10 w-[70px] whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const orderId = getOrderIdFromRow(row);
              return (
                <tr key={row.id} className='border-b border-border/50 transition-colors hover:bg-muted/50 group'>
                  {/* Row number and Color indicator - Sticky left */}
                  <td className='sticky left-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center gap-1.5'>
                      <span className='inline-block w-4 text-right text-xs font-medium text-foreground'>
                        {row.rowNumber}
                      </span>
                      {orderId ? (
                        <ColorPickerDropdown orderId={orderId} currentColor={row.colorIndicator} />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: getHexFromTrackingColor(row.colorIndicator) }}></div>
                      )}
                    </div>
                  </td>
                  {/* Customer */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <Button
                      className='m-0 h-auto cursor-pointer p-0 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline'
                      variant='link'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (orderId) {
                          router.push(`/dashboard/orders/${orderId}`);
                        }
                      }}
                    >
                      {row.customer}
                    </Button>
                  </td>
                  {/* Star icon */}
                  <td className='px-1 py-1.5 text-center'>
                    {row.hasStar && (
                      <IconStarFilled className='inline-block h-4 w-4 text-foreground' />
                    )}
                  </td>
                  {/* Contact */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs font-medium text-blue-600'>
                      {row.customerContact}
                    </span>
                  </td>
                  {/* Deceased */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.deceased}
                    </span>
                  </td>
                  {/* Comments icon */}
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
                  {/* Cemetery */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.cemetery}
                    </span>
                  </td>
                  {/* Grave Type */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.graveType}
                    </span>
                  </td>
                  {/* Section */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.section}</span>
                  </td>
                  {/* Plot Number */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.plotNumber}
                    </span>
                  </td>
                  {/* Arrival at Graveside */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.arrivalAtGraveside}
                    </span>
                  </td>
                  {/* Assigned */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.assigned}
                    </span>
                  </td>
                  {/* Status - Sticky right */}
                  <td className='sticky right-[70px] z-10 bg-card px-2 py-1.5 text-center group-hover:bg-muted/50'>
                    <div className='flex justify-center'>
                      {orderId ? (
                        <StatusDropdown orderId={orderId} currentStatus={row.orderStatus} />
                      ) : (
                        <StatusIcon status={row.status} statusBg={row.statusBg} />
                      )}
                    </div>
                  </td>
                  {/* Actions - Sticky right */}
                  <td className='sticky right-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center justify-center gap-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (orderId) {
                            router.push(`/dashboard/orders/${orderId}`);
                          }
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Edit'
                      >
                        <IconEdit className='h-4 w-4 text-muted-foreground' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Delete'
                      >
                        <IconTrash className='h-4 w-4 text-muted-foreground' />
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

  // Helper function to render HTML table for Cremations rows
  const renderCremationsTable = (rows: CremationsRow[]) => {
    return (
      <div className='overflow-x-auto rounded-md border border-border/50 bg-card scrollbar-thin'>
        <table className='w-full min-w-[900px] table-auto'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='sticky left-0 z-10 w-[50px] whitespace-nowrap bg-muted/30 px-2 py-2 text-left text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Customer
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Contact
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Deceased
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Documents
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Witness
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Delivery
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Time
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Return
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Return Date
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Return Location
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Assigned
              </th>
              <th className='sticky right-[70px] z-10 whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Status
              </th>
              <th className='sticky right-0 z-10 w-[70px] whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const orderId = getOrderIdFromRow(row);
              return (
                <tr key={row.id} className='border-b border-border/50 transition-colors hover:bg-muted/50 group'>
                  {/* Row number and Color indicator - Sticky left */}
                  <td className='sticky left-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center gap-1.5'>
                      <span className='inline-block w-4 text-right text-xs font-medium text-foreground'>
                        {row.rowNumber}
                      </span>
                      {orderId ? (
                        <ColorPickerDropdown orderId={orderId} currentColor={row.colorIndicator} />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: getHexFromTrackingColor(row.colorIndicator) }}></div>
                      )}
                    </div>
                  </td>
                  {/* Customer */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <Button
                      className='m-0 h-auto cursor-pointer p-0 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline'
                      variant='link'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (orderId) {
                          router.push(`/dashboard/orders/${orderId}`);
                        }
                      }}
                    >
                      {row.customer}
                    </Button>
                  </td>
                  {/* Star icon */}
                  <td className='px-1 py-1.5 text-center'>
                    {row.hasStar && (
                      <IconStarFilled className='inline-block h-4 w-4 text-foreground' />
                    )}
                  </td>
                  {/* Contact */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs font-medium text-blue-600'>
                      {row.customerContact}
                    </span>
                  </td>
                  {/* Deceased */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.deceased}
                    </span>
                  </td>
                  {/* Comments icon */}
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
                  {/* Documents */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.documents}
                    </span>
                  </td>
                  {/* Witness */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.witness}</span>
                  </td>
                  {/* Delivery */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.delivery}
                    </span>
                  </td>
                  {/* Time */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.time}</span>
                  </td>
                  {/* Return */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.return}</span>
                  </td>
                  {/* Return Date */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.returnDate}
                    </span>
                  </td>
                  {/* Return Location */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.returnLocation}
                    </span>
                  </td>
                  {/* Assigned */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.assigned}
                    </span>
                  </td>
                  {/* Status - Sticky right */}
                  <td className='sticky right-[70px] z-10 bg-card px-2 py-1.5 text-center group-hover:bg-muted/50'>
                    <div className='flex justify-center'>
                      {orderId ? (
                        <StatusDropdown orderId={orderId} currentStatus={row.orderStatus} />
                      ) : (
                        <StatusIcon status={row.status} statusBg={row.statusBg} />
                      )}
                    </div>
                  </td>
                  {/* Actions - Sticky right */}
                  <td className='sticky right-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center justify-center gap-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (orderId) {
                            router.push(`/dashboard/orders/${orderId}`);
                          }
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Edit'
                      >
                        <IconEdit className='h-4 w-4 text-muted-foreground' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Delete'
                      >
                        <IconTrash className='h-4 w-4 text-muted-foreground' />
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

  // Helper function to render HTML table for Monuments rows
  const renderMonumentsTable = (rows: MonumentsRow[]) => {
    return (
      <div className='overflow-x-auto rounded-md border border-border/50 bg-card scrollbar-thin'>
        <table className='w-full min-w-[800px] table-auto'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='sticky left-0 z-10 w-[50px] whitespace-nowrap bg-muted/30 px-2 py-2 text-left text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Customer
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Contact
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Deceased
              </th>
              <th className='w-[28px] whitespace-nowrap px-1 py-2 text-center text-xs font-medium text-muted-foreground'></th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Monument
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Requested Completion
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Cemetery
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Block
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Section
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Lot
              </th>
              <th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                Assigned
              </th>
              <th className='sticky right-[70px] z-10 whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Status
              </th>
              <th className='sticky right-0 z-10 w-[70px] whitespace-nowrap bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const orderId = getOrderIdFromRow(row);
              return (
                <tr key={row.id} className='border-b border-border/50 transition-colors hover:bg-muted/50 group'>
                  {/* Row number and Color indicator - Sticky left */}
                  <td className='sticky left-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center gap-1.5'>
                      <span className='inline-block w-4 text-right text-xs font-medium text-foreground'>
                        {row.rowNumber}
                      </span>
                      {orderId ? (
                        <ColorPickerDropdown orderId={orderId} currentColor={row.colorIndicator} />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: getHexFromTrackingColor(row.colorIndicator) }}></div>
                      )}
                    </div>
                  </td>
                  {/* Customer */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <Button
                      className='m-0 h-auto cursor-pointer p-0 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline'
                      variant='link'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (orderId) {
                          router.push(`/dashboard/orders/${orderId}`);
                        }
                      }}
                    >
                      {row.customer}
                    </Button>
                  </td>
                  {/* Star icon */}
                  <td className='px-1 py-1.5 text-center'>
                    {row.hasStar && (
                      <IconStarFilled className='inline-block h-4 w-4 text-foreground' />
                    )}
                  </td>
                  {/* Contact */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs font-medium text-blue-600'>
                      {row.customerContact}
                    </span>
                  </td>
                  {/* Deceased */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.deceased}
                    </span>
                  </td>
                  {/* Comments icon */}
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
                  {/* Monument */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.monument}
                    </span>
                  </td>
                  {/* Requested Completion */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.requestedCompletion}
                    </span>
                  </td>
                  {/* Cemetery */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.cemetery}
                    </span>
                  </td>
                  {/* Block */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.block}</span>
                  </td>
                  {/* Section */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.section}</span>
                  </td>
                  {/* Lot */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>{row.lot}</span>
                  </td>
                  {/* Assigned */}
                  <td className='whitespace-nowrap px-3 py-1.5'>
                    <span className='text-xs text-foreground'>
                      {row.assigned}
                    </span>
                  </td>
                  {/* Status - Sticky right */}
                  <td className='sticky right-[70px] z-10 bg-card px-2 py-1.5 text-center group-hover:bg-muted/50'>
                    <div className='flex justify-center'>
                      {orderId ? (
                        <StatusDropdown orderId={orderId} currentStatus={row.orderStatus} />
                      ) : (
                        <StatusIcon status={row.status} statusBg={row.statusBg} />
                      )}
                    </div>
                  </td>
                  {/* Actions - Sticky right */}
                  <td className='sticky right-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/50'>
                    <div className='flex items-center justify-center gap-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (orderId) {
                            router.push(`/dashboard/orders/${orderId}`);
                          }
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Edit'
                      >
                        <IconEdit className='h-4 w-4 text-muted-foreground' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className='rounded p-1 hover:bg-muted'
                        title='Delete'
                      >
                        <IconTrash className='h-4 w-4 text-muted-foreground' />
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

  // Helper function to format date as "Friday, MM/DD/YYYY"
  const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString);
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    const dayName = days[date.getDay()];
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${month}/${day}/${year}`;
  };

  // Helper function to get total count for a date group
  const getDateGroupTotal = (dateGroup: GroupedOrdersByDate): number => {
    return (
      (Array.isArray(dateGroup.vaults) ? dateGroup.vaults.length : 0) +
      (Array.isArray(dateGroup.caskets) ? dateGroup.caskets.length : 0) +
      (Array.isArray(dateGroup.urns) ? dateGroup.urns.length : 0) +
      (Array.isArray(dateGroup.grave_diggings)
        ? dateGroup.grave_diggings.length
        : 0) +
      (Array.isArray(dateGroup.cremations) ? dateGroup.cremations.length : 0) +
      (Array.isArray(dateGroup.monuments) ? dateGroup.monuments.length : 0) +
      (Array.isArray(dateGroup.bulk_precasts)
        ? dateGroup.bulk_precasts.length
        : 0)
    );
  };

  // Helper function to get data for a specific date and product type
  const getDateProductTypeData = (
    dateGroup: GroupedOrdersByDate,
    productType: keyof Omit<GroupedOrdersByDate, 'date'>
  ) => {
    const orders = dateGroup[productType];
    // Check if orders exists and is an array with items
    if (!Array.isArray(orders) || orders.length === 0) {
      return [];
    }

    switch (productType) {
      case 'vaults':
      case 'caskets':
      case 'bulk_precasts':
        return orders.map((order, index) => mapOrderToCasketsRow(order, index));
      case 'urns':
        return orders.map((order, index) => mapOrderToUrnsRow(order, index));
      case 'grave_diggings':
        return orders.map((order, index) =>
          mapOrderToGraveDiggingRow(order, index)
        );
      case 'cremations':
        return orders.map((order, index) =>
          mapOrderToCremationsRow(order, index)
        );
      case 'monuments':
        return orders.map((order, index) =>
          mapOrderToMonumentsRow(order, index)
        );
      default:
        return [];
    }
  };

  // Helper function to map order to UrnsRow
  const mapOrderToUrnsRow = (order: Order, index: number): UrnsRow => {
    const deceasedName =
      order.deceased && order.deceased.length > 0
        ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() ||
          'N/A'
        : 'N/A';

    const customerName = order.customer?.user
      ? getUserFullName(order.customer.user)
      : order.customer?.name ||
        (order.retailer?.user
          ? getUserFullName(order.retailer.user)
          : order.retailer?.name || order.company?.name || 'N/A');

    const customerContact =
      order.contact ||
      order.email ||
      order.customer?.user?.email ||
      order.customer?.email ||
      'N/A';

    const items =
      order.orderItems && order.orderItems.length > 0
        ? order.orderItems
            .map((item) => item.product?.name || item.name || 'N/A')
            .join(', ')
        : 'N/A';

    const deliveryLocation = order.cemetery || order.location?.name || 'N/A';
    const deliveryTime = formatTime(order.arrivalTime || order.timeOfService);

    const assignedName = order.staff?.user
      ? getUserFullName(order.staff.user)
      : order.staff?.name ||
        (order.director?.user
          ? getUserFullName(order.director.user)
          : order.director?.name || '-');

    // Use tracking color from order if available, otherwise use a default color based on index
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
      items: items,
      deliveryLocation: deliveryLocation,
      deliveryTime: deliveryTime,
      assigned: assignedName,
      status: mapOrderStatusToDisplayStatus(order.status),
      statusBg: getStatusBg(order.status),
      statusIcon: mapOrderStatusToDisplayStatus(order.status),
      statusColor: 'text-white',
      hasStar: order.confirmed || false,
      hasMessageIcon: !!order.comments
    };
  };

  // Helper function to map order to GraveDiggingRow
  const mapOrderToGraveDiggingRow = (
    order: Order,
    index: number
  ): GraveDiggingRow => {
    const deceasedName =
      order.deceased && order.deceased.length > 0
        ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() ||
          'N/A'
        : 'N/A';

    const customerName = order.customer?.user
      ? getUserFullName(order.customer.user)
      : order.customer?.name ||
        (order.retailer?.user
          ? getUserFullName(order.retailer.user)
          : order.retailer?.name || order.company?.name || 'N/A');

    const customerContact =
      order.contact ||
      order.email ||
      order.customer?.user?.email ||
      order.customer?.email ||
      'N/A';

    const graveType =
      order.orderItems &&
      order.orderItems.length > 0 &&
      order.orderItems[0].graveType
        ? order.orderItems[0].graveType
        : 'Traditional';

    const cemetery = order.cemetery || order.location?.name || 'N/A';
    const arrivalAtGraveside = formatTime(
      order.arrivalTime || order.timeOfService
    );

    const assignedName = order.staff?.user
      ? getUserFullName(order.staff.user)
      : order.staff?.name ||
        (order.director?.user
          ? getUserFullName(order.director.user)
          : order.director?.name || '-');

    // Cycle through colors based on index
    // Use tracking color from order if available, otherwise use a default color based on index
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
      cemetery: cemetery,
      graveType: graveType,
      section: '-',
      plotNumber: '-',
      arrivalAtGraveside: arrivalAtGraveside,
      assigned: assignedName,
      status: mapOrderStatusToDisplayStatus(order.status),
      statusBg: getStatusBg(order.status),
      statusIcon: mapOrderStatusToDisplayStatus(order.status),
      statusColor: 'text-white',
      hasStar: order.confirmed || false,
      hasMessageIcon: !!order.comments
    };
  };

  // Helper function to map order to CremationsRow
  const mapOrderToCremationsRow = (
    order: Order,
    index: number
  ): CremationsRow => {
    const deceasedName =
      order.deceased && order.deceased.length > 0
        ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() ||
          'N/A'
        : 'N/A';

    const customerName = order.customer?.user
      ? getUserFullName(order.customer.user)
      : order.customer?.name ||
        (order.retailer?.user
          ? getUserFullName(order.retailer.user)
          : order.retailer?.name || order.company?.name || 'N/A');

    const customerContact =
      order.contact ||
      order.email ||
      order.customer?.user?.email ||
      order.customer?.email ||
      'N/A';

    const documents = order.photos && order.photos.length > 0 ? 'Yes' : 'No';
    const witness =
      order.orderItems &&
      order.orderItems.length > 0 &&
      order.orderItems[0].witnessType
        ? order.orderItems[0].witnessType
        : 'No';

    const cremationType =
      order.orderItems &&
      order.orderItems.length > 0 &&
      order.orderItems[0].cremationType
        ? order.orderItems[0].cremationType
        : 'Pick Up';

    const delivery = cremationType === 'pickup' ? 'Pick Up' : 'Drop Off';
    const time = formatTime(order.timeOfService || order.arrivalTime);
    const returnType = '-';
    const returnDate = '-';
    const returnLocation = order.cemetery || order.location?.name || '-';

    const assignedName = order.staff?.user
      ? getUserFullName(order.staff.user)
      : order.staff?.name ||
        (order.director?.user
          ? getUserFullName(order.director.user)
          : order.director?.name || '-');

    // Use tracking color from order if available, otherwise use a default color based on index
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
      documents: documents,
      documentsHasIcon: order.photos && order.photos.length > 0,
      witness: witness,
      delivery: delivery,
      time: time,
      return: returnType,
      returnDate: returnDate,
      returnLocation: returnLocation,
      assigned: assignedName,
      status: mapOrderStatusToDisplayStatus(order.status),
      statusBg: getStatusBg(order.status),
      statusIcon: mapOrderStatusToDisplayStatus(order.status),
      statusColor: 'text-white',
      hasStar: order.confirmed || false,
      hasMessageIcon: !!order.comments
    };
  };

  // Helper function to map order to MonumentsRow
  const mapOrderToMonumentsRow = (
    order: Order,
    index: number
  ): MonumentsRow => {
    const deceasedName =
      order.deceased && order.deceased.length > 0
        ? `${order.deceased[0].firstName || ''} ${order.deceased[0].lastName || ''}`.trim() ||
          'N/A'
        : 'N/A';

    const customerName = order.customer?.user
      ? getUserFullName(order.customer.user)
      : order.customer?.name ||
        (order.retailer?.user
          ? getUserFullName(order.retailer.user)
          : order.retailer?.name || order.company?.name || 'N/A');

    const customerContact =
      order.contact ||
      order.email ||
      order.customer?.user?.email ||
      order.customer?.email ||
      'N/A';

    const monument =
      order.orderItems && order.orderItems.length > 0
        ? order.orderItems[0].product?.name || order.orderItems[0].name || 'N/A'
        : 'N/A';

    const requestedCompletion = order.dateOfService
      ? new Date(order.dateOfService).toLocaleDateString()
      : '-';

    const cemetery = order.cemetery || order.location?.name || '-';
    const block = '-';
    const section = '-';
    const lot = '-';

    const assignedName = order.staff?.user
      ? getUserFullName(order.staff.user)
      : order.staff?.name ||
        (order.director?.user
          ? getUserFullName(order.director.user)
          : order.director?.name || '-');

    // Use tracking color from order if available, otherwise use a default color based on index
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
      monument: monument,
      monumentHasIcon: false,
      requestedCompletion: requestedCompletion,
      cemetery: cemetery,
      block: block,
      section: section,
      lot: lot,
      assigned: assignedName,
      status: mapOrderStatusToDisplayStatus(order.status),
      statusBg: getStatusBg(order.status),
      statusIcon: mapOrderStatusToDisplayStatus(order.status),
      statusColor: 'text-white',
      hasStar: order.confirmed || false,
      hasMessageIcon: !!order.comments
    };
  };

  return (
    <div className='-mt-4 h-[calc(100vh+1rem)] rounded-tr-xl bg-zinc-100 dark:bg-zinc-800 p-2 pb-4'>
      <PageContainer scrollable={false}>
        <div className='flex min-w-0 flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='ORDERS' description='' />
            <Link
              href='/dashboard/orders/place-order'
              className={cn(buttonVariants(), 'text-xs md:text-sm')}
            >
              <IconPlus className='mr-2 h-4 w-4' /> Place Order
            </Link>
          </div>
          <Separator />

          <div
            className='flex w-full min-w-0 flex-col'
            style={{ height: 'calc(100dvh - 200px)', overflow: 'hidden' }}
          >
            <Tabs
              value={activeMainTab}
              onValueChange={setActiveMainTab}
              className='flex h-full min-w-0 flex-col'
            >
              <div className='w-full flex-shrink-0'>
                <TabsList className='bg-transparent'>
                  <TabsTrigger value='DailyTracking'>
                    Daily Tracking
                  </TabsTrigger>
                  <TabsTrigger value='Monuments'>Monuments</TabsTrigger>
                  <TabsTrigger value='Cremations'>Cremations</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent
                value='DailyTracking'
                className='mt-0 flex-1 overflow-auto scrollbar-thin'
              >
                <Tabs
                  value={activeProductTab}
                  onValueChange={setActiveProductTab}
                  className='min-w-0'
                >
                  <TabsList className='h-auto w-fit gap-4 bg-transparent p-0'>
                    <TabsTrigger
                      value='all'
                      className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value='Vaults'
                      className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'
                    >
                      Vaults
                    </TabsTrigger>
                    <TabsTrigger
                      value='BulkPrecast'
                      className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'
                    >
                      Bulk / Precast
                    </TabsTrigger>
                    <TabsTrigger
                      value='Caskets'
                      className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'
                    >
                      Caskets
                    </TabsTrigger>
                    <TabsTrigger
                      value='Urns'
                      className='h-6 rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground'
                    >
                      Urns
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='all' className='overflow-auto scrollbar-thin'>
                    <div className='space-y-2'>
                      {isLoadingOrders ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>
                            Loading orders...
                          </span>
                        </div>
                      ) : groupedOrders.length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>No orders found</span>
                        </div>
                      ) : (
                        groupedOrders.map((dateGroup) => {
                          const dateKey = dateGroup.date;
                          const isDateOpen = openDateGroups[dateKey] !== false; // Default to open
                          const totalCount = getDateGroupTotal(dateGroup);

                          // Product type configurations - filter based on active tab
                          const allProductTypes = [
                            {
                              key: 'vaults' as const,
                              label: 'Vaults',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'vaults')
                            },
                            {
                              key: 'bulk_precasts' as const,
                              label: 'Precast (Bulk Vaults)',
                              getRows: () =>
                                getDateProductTypeData(
                                  dateGroup,
                                  'bulk_precasts'
                                )
                            },
                            {
                              key: 'caskets' as const,
                              label: 'Caskets',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'caskets')
                            },
                            {
                              key: 'urns' as const,
                              label: 'Urns',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'urns')
                            },
                            {
                              key: 'grave_diggings' as const,
                              label: 'Grave Digging',
                              getRows: () =>
                                getDateProductTypeData(
                                  dateGroup,
                                  'grave_diggings'
                                )
                            },
                            {
                              key: 'cremations' as const,
                              label: 'Cremations',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'cremations')
                            },
                            {
                              key: 'monuments' as const,
                              label: 'Monuments',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'monuments')
                            }
                          ];

                          // Filter product types based on active tab
                          let productTypes = allProductTypes;
                          if (activeProductTab !== 'all') {
                            const tabToProductTypeMap: Record<
                              string,
                              keyof Omit<GroupedOrdersByDate, 'date'>
                            > = {
                              Vaults: 'vaults',
                              BulkPrecast: 'bulk_precasts',
                              Caskets: 'caskets',
                              Urns: 'urns'
                            };
                            const selectedProductType =
                              tabToProductTypeMap[activeProductTab];
                            if (selectedProductType) {
                              productTypes = allProductTypes.filter(
                                (pt) => pt.key === selectedProductType
                              );
                            }
                          }

                          return (
                            <Collapsible
                              key={dateKey}
                              open={isDateOpen}
                              onOpenChange={(open) => {
                                setOpenDateGroups((prev) => ({
                                  ...prev,
                                  [dateKey]: open
                                }));
                              }}
                              className='flex w-full flex-col gap-2'
                            >
                              <div className='flex items-center justify-between rounded-lg bg-black px-2 py-1 shadow-sm'>
                                <div className='flex items-center gap-2'>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='size-8 text-white'
                                    >
                                      <ChevronsUpDown />
                                      <span className='sr-only'>Toggle</span>
                                    </Button>
                                  </CollapsibleTrigger>
                                  <span className='font-medium text-white'>
                                    {formatDateHeader(dateKey)}
                                  </span>
                                </div>
                                <div className='rounded bg-muted px-2 py-1'>
                                  <span className='text-sm font-semibold text-green-600'>
                                    {totalCount}
                                  </span>
                                </div>
                              </div>

                              <CollapsibleContent className='flex flex-col gap-2'>
                                <div className='space-y-2'>
                                  {productTypes.map((productType) => {
                                    const productKey = `${dateKey}-${productType.key}`;
                                    const isProductOpen =
                                      openProductTypes[productKey] !== false; // Default to open
                                    const orders = dateGroup[productType.key];
                                    // Check if orders exists and is an array before accessing length
                                    const count = Array.isArray(orders)
                                      ? orders.length
                                      : 0;
                                    const rows = productType.getRows();

                                    if (count === 0) return null;

                                    return (
                                      <Collapsible
                                        key={productKey}
                                        open={isProductOpen}
                                        onOpenChange={(open) => {
                                          setOpenProductTypes((prev) => ({
                                            ...prev,
                                            [productKey]: open
                                          }));
                                        }}
                                        className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
                                      >
                                        <div className='flex items-center justify-between border-b border-border bg-muted px-3 py-1'>
                                          <div className='flex items-center gap-2'>
                                            <CollapsibleTrigger asChild>
                                              <div className='flex size-6 cursor-pointer items-center justify-center bg-card'>
                                                <IconChevronRight
                                                  className={`h-5 w-5 transition-transform ${isProductOpen ? 'rotate-90' : ''}`}
                                                />
                                              </div>
                                            </CollapsibleTrigger>
                                            <h3 className='text-sm font-semibold text-foreground'>
                                              {productType.label}
                                            </h3>
                                            <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                                              {count}
                                            </span>
                                          </div>
                                          <div className='flex items-center gap-1'>
                                            <span className='cursor-pointer text-xs text-blue-500 underline'>
                                              See all
                                            </span>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconSearch className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconFilter className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                                  <IconChevronRight className='h-4 w-4 rotate-90 text-muted-foreground' />
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent
                                                align='end'
                                                className='w-56'
                                              >
                                                {/* Column visibility toggle removed - using HTML tables now */}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                        <CollapsibleContent>
                                          <div className='w-full overflow-x-auto px-2 py-1'>
                                            {(() => {
                                              const key = (productType as any)
                                                .key;
                                              if (
                                                key === 'vaults' ||
                                                key === 'caskets' ||
                                                key === 'bulk_precasts'
                                              ) {
                                                return renderCasketsTable(
                                                  rows as CasketsRow[]
                                                );
                                              } else if (key === 'urns') {
                                                return renderUrnsTable(
                                                  rows as UrnsRow[]
                                                );
                                              } else if (
                                                key === 'grave_diggings'
                                              ) {
                                                return renderGraveDiggingTable(
                                                  rows as GraveDiggingRow[]
                                                );
                                              } else if (key === 'cremations') {
                                                return renderCremationsTable(
                                                  rows as CremationsRow[]
                                                );
                                              } else if (key === 'monuments') {
                                                return renderMonumentsTable(
                                                  rows as MonumentsRow[]
                                                );
                                              } else {
                                                return (
                                                  <div>
                                                    Unknown product type
                                                  </div>
                                                );
                                              }
                                            })()}
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
                  {/* All other tabs use the same rendering logic as 'all' tab */}
                  <TabsContent value='Vaults' className='overflow-auto scrollbar-thin'>
                    <div className='space-y-2'>
                      {isLoadingOrders ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>
                            Loading orders...
                          </span>
                        </div>
                      ) : groupedOrders.length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>No orders found</span>
                        </div>
                      ) : (
                        groupedOrders.map((dateGroup) => {
                          const dateKey = dateGroup.date;
                          const isDateOpen = openDateGroups[dateKey] !== false;
                          const totalCount = getDateGroupTotal(dateGroup);

                          // For specific tabs, only show the selected product type
                          const allProductTypes = [
                            {
                              key: 'vaults' as const,
                              label: 'Vaults',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'vaults')
                            },
                            {
                              key: 'bulk_precasts' as const,
                              label: 'Precast (Bulk Vaults)',
                              getRows: () =>
                                getDateProductTypeData(
                                  dateGroup,
                                  'bulk_precasts'
                                )
                            },
                            {
                              key: 'caskets' as const,
                              label: 'Caskets',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'caskets')
                            },
                            {
                              key: 'urns' as const,
                              label: 'Urns',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'urns')
                            }
                          ];

                          const tabToProductTypeMap: Record<
                            string,
                            keyof Omit<GroupedOrdersByDate, 'date'>
                          > = {
                            Vaults: 'vaults',
                            BulkPrecast: 'bulk_precasts',
                            Caskets: 'caskets',
                            Urns: 'urns'
                          };
                          const selectedProductType =
                            tabToProductTypeMap[activeProductTab] ||
                            tabToProductTypeMap['Vaults'];
                          const productTypes = selectedProductType
                            ? allProductTypes.filter(
                                (pt) => pt.key === selectedProductType
                              )
                            : [];

                          if (
                            productTypes.length === 0 ||
                            (productTypes[0] &&
                              dateGroup[productTypes[0].key]?.length === 0)
                          ) {
                            return null;
                          }

                          return (
                            <Collapsible
                              key={dateKey}
                              open={isDateOpen}
                              onOpenChange={(open) => {
                                setOpenDateGroups((prev) => ({
                                  ...prev,
                                  [dateKey]: open
                                }));
                              }}
                              className='flex w-full flex-col gap-2'
                            >
                              <div className='flex items-center justify-between rounded-lg bg-zinc-800 px-2 py-1 shadow-sm'>
                                <div className='flex items-center gap-2'>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='size-8 text-white'
                                    >
                                      <ChevronsUpDown />
                                      <span className='sr-only'>Toggle</span>
                                    </Button>
                                  </CollapsibleTrigger>
                                  <span className='font-medium text-white'>
                                    {formatDateHeader(dateKey)}
                                  </span>
                                </div>
                                <div className='rounded bg-muted px-2 py-1'>
                                  <span className='text-sm font-semibold text-green-600'>
                                    {totalCount}
                                  </span>
                                </div>
                              </div>

                              <CollapsibleContent className='flex flex-col gap-2'>
                                <div className='space-y-2'>
                                  {productTypes.map((productType) => {
                                    const productKey = `${dateKey}-${productType.key}`;
                                    const isProductOpen =
                                      openProductTypes[productKey] !== false;
                                    const orders = dateGroup[productType.key];
                                    // Check if orders exists and is an array before accessing length
                                    const count = Array.isArray(orders)
                                      ? orders.length
                                      : 0;
                                    const rows = productType.getRows();

                                    if (count === 0) return null;

                                    return (
                                      <Collapsible
                                        key={productKey}
                                        open={isProductOpen}
                                        onOpenChange={(open) => {
                                          setOpenProductTypes((prev) => ({
                                            ...prev,
                                            [productKey]: open
                                          }));
                                        }}
                                        className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
                                      >
                                        <div className='flex items-center justify-between border-b border-border bg-muted px-3 py-1'>
                                          <div className='flex items-center gap-2'>
                                            <CollapsibleTrigger asChild>
                                              <div className='flex size-6 cursor-pointer items-center justify-center bg-card'>
                                                <IconChevronRight
                                                  className={`h-5 w-5 transition-transform ${isProductOpen ? 'rotate-90' : ''}`}
                                                />
                                              </div>
                                            </CollapsibleTrigger>
                                            <h3 className='text-sm font-semibold text-foreground'>
                                              {productType.label}
                                            </h3>
                                            <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                                              {count}
                                            </span>
                                          </div>
                                          <div className='flex items-center gap-1'>
                                            <span className='cursor-pointer text-xs text-blue-500 underline'>
                                              See all
                                            </span>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconSearch className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconFilter className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                                  <IconChevronRight className='h-4 w-4 rotate-90 text-muted-foreground' />
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent
                                                align='end'
                                                className='w-56'
                                              >
                                                {/* Column visibility toggle removed - using HTML tables now */}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                        <CollapsibleContent>
                                          <div className='w-full overflow-x-auto px-2 py-1'>
                                            {(() => {
                                              const key = (productType as any)
                                                .key;
                                              if (
                                                key === 'vaults' ||
                                                key === 'caskets' ||
                                                key === 'bulk_precasts'
                                              ) {
                                                return renderCasketsTable(
                                                  rows as CasketsRow[]
                                                );
                                              } else if (key === 'urns') {
                                                return renderUrnsTable(
                                                  rows as UrnsRow[]
                                                );
                                              } else if (
                                                key === 'grave_diggings'
                                              ) {
                                                return renderGraveDiggingTable(
                                                  rows as GraveDiggingRow[]
                                                );
                                              } else if (key === 'cremations') {
                                                return renderCremationsTable(
                                                  rows as CremationsRow[]
                                                );
                                              } else if (key === 'monuments') {
                                                return renderMonumentsTable(
                                                  rows as MonumentsRow[]
                                                );
                                              } else {
                                                return (
                                                  <div>
                                                    Unknown product type
                                                  </div>
                                                );
                                              }
                                            })()}
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
                  <TabsContent value='BulkPrecast' className='overflow-auto scrollbar-thin'>
                    <div className='space-y-2'>
                      {isLoadingOrders ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>
                            Loading orders...
                          </span>
                        </div>
                      ) : groupedOrders.length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>No orders found</span>
                        </div>
                      ) : (
                        groupedOrders.map((dateGroup) => {
                          const dateKey = dateGroup.date;
                          const isDateOpen = openDateGroups[dateKey] !== false;
                          const totalCount = getDateGroupTotal(dateGroup);
                          const allProductTypes = [
                            {
                              key: 'bulk_precasts' as const,
                              label: 'Precast (Bulk Vaults)',
                              getRows: () =>
                                getDateProductTypeData(
                                  dateGroup,
                                  'bulk_precasts'
                                )
                            }
                          ];
                          const productTypes = allProductTypes;
                          if (
                            productTypes.length === 0 ||
                            (productTypes[0] &&
                              dateGroup[productTypes[0].key]?.length === 0)
                          ) {
                            return null;
                          }
                          return (
                            <Collapsible
                              key={dateKey}
                              open={isDateOpen}
                              onOpenChange={(open) => {
                                setOpenDateGroups((prev) => ({
                                  ...prev,
                                  [dateKey]: open
                                }));
                              }}
                              className='flex w-full flex-col gap-2'
                            >
                              <div className='flex items-center justify-between rounded-lg bg-zinc-800 px-2 py-1 shadow-sm'>
                                <div className='flex items-center gap-2'>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='size-8 text-white'
                                    >
                                      <ChevronsUpDown />
                                      <span className='sr-only'>Toggle</span>
                                    </Button>
                                  </CollapsibleTrigger>
                                  <span className='font-medium text-white'>
                                    {formatDateHeader(dateKey)}
                                  </span>
                                </div>
                                <div className='rounded bg-muted px-2 py-1'>
                                  <span className='text-sm font-semibold text-green-600'>
                                    {totalCount}
                                  </span>
                                </div>
                              </div>
                              <CollapsibleContent className='flex flex-col gap-2'>
                                <div className='space-y-2'>
                                  {productTypes.map((productType) => {
                                    const productKey = `${dateKey}-${productType.key}`;
                                    const isProductOpen =
                                      openProductTypes[productKey] !== false;
                                    const orders = dateGroup[productType.key];
                                    // Check if orders exists and is an array before accessing length
                                    const count = Array.isArray(orders)
                                      ? orders.length
                                      : 0;
                                    const rows = productType.getRows();
                                    if (count === 0) return null;
                                    return (
                                      <Collapsible
                                        key={productKey}
                                        open={isProductOpen}
                                        onOpenChange={(open) => {
                                          setOpenProductTypes((prev) => ({
                                            ...prev,
                                            [productKey]: open
                                          }));
                                        }}
                                        className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
                                      >
                                        <div className='flex items-center justify-between border-b border-border bg-muted px-3 py-1'>
                                          <div className='flex items-center gap-2'>
                                            <CollapsibleTrigger asChild>
                                              <div className='flex size-6 cursor-pointer items-center justify-center bg-card'>
                                                <IconChevronRight
                                                  className={`h-5 w-5 transition-transform ${isProductOpen ? 'rotate-90' : ''}`}
                                                />
                                              </div>
                                            </CollapsibleTrigger>
                                            <h3 className='text-sm font-semibold text-foreground'>
                                              {productType.label}
                                            </h3>
                                            <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                                              {count}
                                            </span>
                                          </div>
                                          <div className='flex items-center gap-1'>
                                            <span className='cursor-pointer text-xs text-blue-500 underline'>
                                              See all
                                            </span>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconSearch className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconFilter className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                                  <IconChevronRight className='h-4 w-4 rotate-90 text-muted-foreground' />
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent
                                                align='end'
                                                className='w-56'
                                              >
                                                {/* Column visibility toggle removed - using HTML tables now */}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                        <CollapsibleContent>
                                          <div className='w-full overflow-x-auto px-2 py-1'>
                                            {(() => {
                                              const key = (productType as any)
                                                .key;
                                              if (
                                                key === 'vaults' ||
                                                key === 'caskets' ||
                                                key === 'bulk_precasts'
                                              ) {
                                                return renderCasketsTable(
                                                  rows as CasketsRow[]
                                                );
                                              } else if (key === 'urns') {
                                                return renderUrnsTable(
                                                  rows as UrnsRow[]
                                                );
                                              } else if (
                                                key === 'grave_diggings'
                                              ) {
                                                return renderGraveDiggingTable(
                                                  rows as GraveDiggingRow[]
                                                );
                                              } else if (key === 'cremations') {
                                                return renderCremationsTable(
                                                  rows as CremationsRow[]
                                                );
                                              } else if (key === 'monuments') {
                                                return renderMonumentsTable(
                                                  rows as MonumentsRow[]
                                                );
                                              } else {
                                                return (
                                                  <div>
                                                    Unknown product type
                                                  </div>
                                                );
                                              }
                                            })()}
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
                  <TabsContent value='Caskets' className='overflow-auto scrollbar-thin'>
                    <div className='space-y-2'>
                      {isLoadingOrders ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>
                            Loading orders...
                          </span>
                        </div>
                      ) : groupedOrders.length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>No orders found</span>
                        </div>
                      ) : (
                        groupedOrders.map((dateGroup) => {
                          const dateKey = dateGroup.date;
                          const isDateOpen = openDateGroups[dateKey] !== false;
                          const totalCount = getDateGroupTotal(dateGroup);
                          const allProductTypes = [
                            {
                              key: 'caskets' as const,
                              label: 'Caskets',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'caskets')
                            }
                          ];
                          const productTypes = allProductTypes;
                          if (
                            productTypes.length === 0 ||
                            (productTypes[0] &&
                              dateGroup[productTypes[0].key]?.length === 0)
                          ) {
                            return null;
                          }
                          return (
                            <Collapsible
                              key={dateKey}
                              open={isDateOpen}
                              onOpenChange={(open) => {
                                setOpenDateGroups((prev) => ({
                                  ...prev,
                                  [dateKey]: open
                                }));
                              }}
                              className='flex w-full flex-col gap-2'
                            >
                              <div className='flex items-center justify-between rounded-lg bg-zinc-800 px-2 py-1 shadow-sm'>
                                <div className='flex items-center gap-2'>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='size-8 text-white'
                                    >
                                      <ChevronsUpDown />
                                      <span className='sr-only'>Toggle</span>
                                    </Button>
                                  </CollapsibleTrigger>
                                  <span className='font-medium text-white'>
                                    {formatDateHeader(dateKey)}
                                  </span>
                                </div>
                                <div className='rounded bg-muted px-2 py-1'>
                                  <span className='text-sm font-semibold text-green-600'>
                                    {totalCount}
                                  </span>
                                </div>
                              </div>
                              <CollapsibleContent className='flex flex-col gap-2'>
                                <div className='space-y-2'>
                                  {productTypes.map((productType) => {
                                    const productKey = `${dateKey}-${productType.key}`;
                                    const isProductOpen =
                                      openProductTypes[productKey] !== false;
                                    const orders = dateGroup[productType.key];
                                    // Check if orders exists and is an array before accessing length
                                    const count = Array.isArray(orders)
                                      ? orders.length
                                      : 0;
                                    const rows = productType.getRows();
                                    if (count === 0) return null;
                                    return (
                                      <Collapsible
                                        key={productKey}
                                        open={isProductOpen}
                                        onOpenChange={(open) => {
                                          setOpenProductTypes((prev) => ({
                                            ...prev,
                                            [productKey]: open
                                          }));
                                        }}
                                        className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
                                      >
                                        <div className='flex items-center justify-between border-b border-border bg-muted px-3 py-1'>
                                          <div className='flex items-center gap-2'>
                                            <CollapsibleTrigger asChild>
                                              <div className='flex size-6 cursor-pointer items-center justify-center bg-card'>
                                                <IconChevronRight
                                                  className={`h-5 w-5 transition-transform ${isProductOpen ? 'rotate-90' : ''}`}
                                                />
                                              </div>
                                            </CollapsibleTrigger>
                                            <h3 className='text-sm font-semibold text-foreground'>
                                              {productType.label}
                                            </h3>
                                            <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                                              {count}
                                            </span>
                                          </div>
                                          <div className='flex items-center gap-1'>
                                            <span className='cursor-pointer text-xs text-blue-500 underline'>
                                              See all
                                            </span>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconSearch className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconFilter className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                                  <IconChevronRight className='h-4 w-4 rotate-90 text-muted-foreground' />
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent
                                                align='end'
                                                className='w-56'
                                              >
                                                {/* Column visibility toggle removed - using HTML tables now */}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                        <CollapsibleContent>
                                          <div className='w-full overflow-x-auto px-2 py-1'>
                                            {(() => {
                                              const key = (productType as any)
                                                .key;
                                              if (
                                                key === 'vaults' ||
                                                key === 'caskets' ||
                                                key === 'bulk_precasts'
                                              ) {
                                                return renderCasketsTable(
                                                  rows as CasketsRow[]
                                                );
                                              } else if (key === 'urns') {
                                                return renderUrnsTable(
                                                  rows as UrnsRow[]
                                                );
                                              } else if (
                                                key === 'grave_diggings'
                                              ) {
                                                return renderGraveDiggingTable(
                                                  rows as GraveDiggingRow[]
                                                );
                                              } else if (key === 'cremations') {
                                                return renderCremationsTable(
                                                  rows as CremationsRow[]
                                                );
                                              } else if (key === 'monuments') {
                                                return renderMonumentsTable(
                                                  rows as MonumentsRow[]
                                                );
                                              } else {
                                                return (
                                                  <div>
                                                    Unknown product type
                                                  </div>
                                                );
                                              }
                                            })()}
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
                  <TabsContent value='Urns' className='overflow-auto scrollbar-thin'>
                    <div className='space-y-2'>
                      {isLoadingOrders ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>
                            Loading orders...
                          </span>
                        </div>
                      ) : groupedOrders.length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                          <span className='text-muted-foreground'>No orders found</span>
                        </div>
                      ) : (
                        groupedOrders.map((dateGroup) => {
                          const dateKey = dateGroup.date;
                          const isDateOpen = openDateGroups[dateKey] !== false;
                          const totalCount = getDateGroupTotal(dateGroup);
                          const allProductTypes = [
                            {
                              key: 'urns' as const,
                              label: 'Urns',
                              getRows: () =>
                                getDateProductTypeData(dateGroup, 'urns')
                            }
                          ];
                          const productTypes = allProductTypes;
                          if (
                            productTypes.length === 0 ||
                            (productTypes[0] &&
                              dateGroup[productTypes[0].key]?.length === 0)
                          ) {
                            return null;
                          }
                          return (
                            <Collapsible
                              key={dateKey}
                              open={isDateOpen}
                              onOpenChange={(open) => {
                                setOpenDateGroups((prev) => ({
                                  ...prev,
                                  [dateKey]: open
                                }));
                              }}
                              className='flex w-full flex-col gap-2'
                            >
                              <div className='flex items-center justify-between rounded-lg bg-zinc-800 px-2 py-1 shadow-sm'>
                                <div className='flex items-center gap-2'>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='size-8 text-white'
                                    >
                                      <ChevronsUpDown />
                                      <span className='sr-only'>Toggle</span>
                                    </Button>
                                  </CollapsibleTrigger>
                                  <span className='font-medium text-white'>
                                    {formatDateHeader(dateKey)}
                                  </span>
                                </div>
                                <div className='rounded bg-muted px-2 py-1'>
                                  <span className='text-sm font-semibold text-green-600'>
                                    {totalCount}
                                  </span>
                                </div>
                              </div>
                              <CollapsibleContent className='flex flex-col gap-2'>
                                <div className='space-y-2'>
                                  {productTypes.map((productType) => {
                                    const productKey = `${dateKey}-${productType.key}`;
                                    const isProductOpen =
                                      openProductTypes[productKey] !== false;
                                    const orders = dateGroup[productType.key];
                                    // Check if orders exists and is an array before accessing length
                                    const count = Array.isArray(orders)
                                      ? orders.length
                                      : 0;
                                    const rows = productType.getRows();
                                    if (count === 0) return null;
                                    return (
                                      <Collapsible
                                        key={productKey}
                                        open={isProductOpen}
                                        onOpenChange={(open) => {
                                          setOpenProductTypes((prev) => ({
                                            ...prev,
                                            [productKey]: open
                                          }));
                                        }}
                                        className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
                                      >
                                        <div className='flex items-center justify-between border-b border-border bg-muted px-3 py-1'>
                                          <div className='flex items-center gap-2'>
                                            <CollapsibleTrigger asChild>
                                              <div className='flex size-6 cursor-pointer items-center justify-center bg-card'>
                                                <IconChevronRight
                                                  className={`h-5 w-5 transition-transform ${isProductOpen ? 'rotate-90' : ''}`}
                                                />
                                              </div>
                                            </CollapsibleTrigger>
                                            <h3 className='text-sm font-semibold text-foreground'>
                                              {productType.label}
                                            </h3>
                                            <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                                              {count}
                                            </span>
                                          </div>
                                          <div className='flex items-center gap-1'>
                                            <span className='cursor-pointer text-xs text-blue-500 underline'>
                                              See all
                                            </span>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconSearch className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                              <IconFilter className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                                  <IconChevronRight className='h-4 w-4 rotate-90 text-muted-foreground' />
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent
                                                align='end'
                                                className='w-56'
                                              >
                                                {/* Column visibility toggle removed - using HTML tables now */}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                        <CollapsibleContent>
                                          <div className='w-full overflow-x-auto px-2 py-1'>
                                            {(() => {
                                              const key = (productType as any)
                                                .key;
                                              if (
                                                key === 'vaults' ||
                                                key === 'caskets' ||
                                                key === 'bulk_precasts'
                                              ) {
                                                return renderCasketsTable(
                                                  rows as CasketsRow[]
                                                );
                                              } else if (key === 'urns') {
                                                return renderUrnsTable(
                                                  rows as UrnsRow[]
                                                );
                                              } else if (
                                                key === 'grave_diggings'
                                              ) {
                                                return renderGraveDiggingTable(
                                                  rows as GraveDiggingRow[]
                                                );
                                              } else if (key === 'cremations') {
                                                return renderCremationsTable(
                                                  rows as CremationsRow[]
                                                );
                                              } else if (key === 'monuments') {
                                                return renderMonumentsTable(
                                                  rows as MonumentsRow[]
                                                );
                                              } else {
                                                return (
                                                  <div>
                                                    Unknown product type
                                                  </div>
                                                );
                                              }
                                            })()}
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
                </Tabs>
              </TabsContent>
              <TabsContent
                value='Cremations'
                className='mt-0 flex-1 overflow-auto'
              >
                <div className='space-y-2'>
                  {isLoadingOrders ? (
                    <div className='flex items-center justify-center py-8'>
                      <span className='text-muted-foreground'>
                        Loading cremations...
                      </span>
                    </div>
                  ) : groupedOrders.length === 0 ? (
                    <div className='flex items-center justify-center py-8'>
                      <span className='text-muted-foreground'>No cremations found</span>
                    </div>
                  ) : (
                    groupedOrders.map((dateGroup) => {
                      const dateKey = dateGroup.date;
                      const isDateOpen = openDateGroups[dateKey] !== false;
                      const cremations = dateGroup.cremations || [];
                      const count = Array.isArray(cremations)
                        ? cremations.length
                        : 0;
                      const rows = getDateProductTypeData(
                        dateGroup,
                        'cremations'
                      ) as CremationsRow[];

                      if (count === 0) return null;

                      return (
                        <Collapsible
                          key={dateKey}
                          open={isDateOpen}
                          onOpenChange={(open) => {
                            setOpenDateGroups((prev) => ({
                              ...prev,
                              [dateKey]: open
                            }));
                          }}
                          className='flex w-full flex-col gap-2'
                        >
                          <div className='flex items-center justify-between rounded-lg bg-zinc-800 px-2 py-1 shadow-sm'>
                            <div className='flex items-center gap-2'>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-8 text-white'
                                >
                                  <ChevronsUpDown />
                                  <span className='sr-only'>Toggle</span>
                                </Button>
                              </CollapsibleTrigger>
                              <span className='font-medium text-white'>
                                {formatDateHeader(dateKey)}
                              </span>
                            </div>
                            <div className='rounded bg-muted px-2 py-1'>
                              <span className='text-sm font-semibold text-green-600'>
                                {count}
                              </span>
                            </div>
                          </div>

                          <CollapsibleContent className='flex flex-col gap-2'>
                            <div className='space-y-2'>
                              <Collapsible
                                defaultOpen={true}
                                className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
                              >
                                <div className='flex items-center justify-between border-b border-border bg-muted px-3 py-1'>
                                  <div className='flex items-center gap-2'>
                                    <CollapsibleTrigger asChild>
                                      <div className='flex size-6 cursor-pointer items-center justify-center bg-card'>
                                        <IconChevronRight className='h-5 w-5 rotate-90 transition-transform' />
                                      </div>
                                    </CollapsibleTrigger>
                                    <h3 className='text-sm font-semibold text-foreground'>
                                      Cremations
                                    </h3>
                                    <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                                      {count}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-1'>
                                    <span className='cursor-pointer text-xs text-blue-500 underline'>
                                      See all
                                    </span>
                                    <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                      <IconSearch className='h-4 w-4 text-muted-foreground' />
                                    </button>
                                    <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                      <IconFilter className='h-4 w-4 text-muted-foreground' />
                                    </button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                          <IconChevronRight className='h-4 w-4 rotate-90 text-muted-foreground' />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align='end'
                                        className='w-56'
                                      >
                                        <DropdownMenuLabel>
                                          Toggle Columns
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {[].map((col: any) => {
                                          const displayName =
                                            col.name || col.key;
                                          return (
                                            <DropdownMenuCheckboxItem
                                              key={col.key}
                                              checked={visibleColumns.has(
                                                col.key
                                              )}
                                              onCheckedChange={(checked) => {
                                                const newVisibleColumns =
                                                  new Set(visibleColumns);
                                                if (checked) {
                                                  newVisibleColumns.add(
                                                    col.key
                                                  );
                                                } else {
                                                  newVisibleColumns.delete(
                                                    col.key
                                                  );
                                                }
                                                setVisibleColumns(
                                                  newVisibleColumns
                                                );
                                              }}
                                            >
                                              {displayName}
                                            </DropdownMenuCheckboxItem>
                                          );
                                        })}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                <CollapsibleContent>
                                  <div className='p-4'>
                                    {renderCremationsTable(rows)}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })
                  )}
                </div>
              </TabsContent>
              <TabsContent
                value='Monuments'
                className='mt-0 flex-1 overflow-auto'
              >
                <div className='space-y-2'>
                  {isLoadingOrders ? (
                    <div className='flex items-center justify-center py-8'>
                      <span className='text-muted-foreground'>
                        Loading monuments...
                      </span>
                    </div>
                  ) : groupedOrders.length === 0 ? (
                    <div className='flex items-center justify-center py-8'>
                      <span className='text-muted-foreground'>No monuments found</span>
                    </div>
                  ) : (
                    groupedOrders.map((dateGroup) => {
                      const dateKey = dateGroup.date;
                      const isDateOpen = openDateGroups[dateKey] !== false;
                      const monuments = dateGroup.monuments || [];
                      const count = Array.isArray(monuments)
                        ? monuments.length
                        : 0;
                      const rows = getDateProductTypeData(
                        dateGroup,
                        'monuments'
                      ) as MonumentsRow[];

                      if (count === 0) return null;

                      return (
                        <Collapsible
                          key={dateKey}
                          open={isDateOpen}
                          onOpenChange={(open) => {
                            setOpenDateGroups((prev) => ({
                              ...prev,
                              [dateKey]: open
                            }));
                          }}
                          className='flex w-full flex-col gap-2'
                        >
                          <div className='flex items-center justify-between rounded-lg bg-zinc-800 px-2 py-1 shadow-sm'>
                            <div className='flex items-center gap-2'>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-8 text-white'
                                >
                                  <ChevronsUpDown />
                                  <span className='sr-only'>Toggle</span>
                                </Button>
                              </CollapsibleTrigger>
                              <span className='font-medium text-white'>
                                {formatDateHeader(dateKey)}
                              </span>
                            </div>
                            <div className='rounded bg-muted px-2 py-1'>
                              <span className='text-sm font-semibold text-green-600'>
                                {count}
                              </span>
                            </div>
                          </div>

                          <CollapsibleContent className='flex flex-col gap-2'>
                            <div className='space-y-2'>
                              <Collapsible
                                defaultOpen={true}
                                className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
                              >
                                <div className='flex items-center justify-between border-b border-border bg-muted px-3 py-1'>
                                  <div className='flex items-center gap-2'>
                                    <CollapsibleTrigger asChild>
                                      <div className='flex size-6 cursor-pointer items-center justify-center bg-card'>
                                        <IconChevronRight className='h-5 w-5 rotate-90 transition-transform' />
                                      </div>
                                    </CollapsibleTrigger>
                                    <h3 className='text-sm font-semibold text-foreground'>
                                      Monuments
                                    </h3>
                                    <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                                      {count}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-1'>
                                    <span className='cursor-pointer text-xs text-blue-500 underline'>
                                      See all
                                    </span>
                                    <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                      <IconSearch className='h-4 w-4 text-muted-foreground' />
                                    </button>
                                    <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                      <IconFilter className='h-4 w-4 text-muted-foreground' />
                                    </button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className='rounded-lg p-2 transition-colors hover:bg-muted'>
                                          <IconChevronRight className='h-4 w-4 rotate-90 text-muted-foreground' />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align='end'
                                        className='w-56'
                                      >
                                        <DropdownMenuLabel>
                                          Toggle Columns
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {/* Column visibility toggle removed - using HTML tables now */}
                                        {[].map((col: any) => {
                                          const displayName =
                                            col.name ||
                                            (col.key === 'paintColor'
                                              ? 'Paint Color'
                                              : col.key === 'emblemIcon'
                                                ? 'Emblem Icon'
                                                : col.key === 'emblem'
                                                  ? 'Emblem'
                                                  : col.key === 'rowNumber'
                                                    ? 'Row Number'
                                                    : col.key ===
                                                        'colorIndicator'
                                                      ? 'Color Indicator'
                                                      : col.key === 'star'
                                                        ? 'Star'
                                                        : col.key ===
                                                            'messageIcon'
                                                          ? 'Message Icon'
                                                          : col.key);
                                          return (
                                            <DropdownMenuCheckboxItem
                                              key={col.key}
                                              checked={visibleColumns.has(
                                                col.key
                                              )}
                                              onCheckedChange={(checked) => {
                                                const newVisibleColumns =
                                                  new Set(visibleColumns);
                                                if (checked) {
                                                  newVisibleColumns.add(
                                                    col.key
                                                  );
                                                } else {
                                                  newVisibleColumns.delete(
                                                    col.key
                                                  );
                                                }
                                                setVisibleColumns(
                                                  newVisibleColumns
                                                );
                                              }}
                                            >
                                              {displayName}
                                            </DropdownMenuCheckboxItem>
                                          );
                                        })}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <CollapsibleContent>
                                  <div className='w-full overflow-x-auto px-2 py-1'>
                                    {renderMonumentsTable(
                                      rows as MonumentsRow[]
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })
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
