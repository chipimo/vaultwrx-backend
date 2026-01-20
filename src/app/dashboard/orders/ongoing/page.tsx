'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import {
  IconChevronRight,
  IconSearch,
  IconFilter,
  IconStarFilled
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getGroupedOrders } from '@/lib/api-client';
import { toast } from 'sonner';
import { Order, OrderStatus, GroupedOrdersByDate } from '@/types/order';

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
      return 'bg-muted';
  }
};

// Helper function to format time from HH:MM:SS to HH:MM AM/PM
const formatTime = (time: string | null | undefined): string => {
  if (!time) return '-';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  if (isNaN(hour)) return '-';
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
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${dayName}, ${month}/${day}/${year}`;
};

// Types for table data
type CasketsRow = {
  id: number;
  rowNumber: number;
  orderId?: string;
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
  hasStar?: boolean;
};

type GraveDiggingRow = {
  id: number;
  rowNumber: number;
  orderId?: string;
  colorIndicator: string;
  customer: string;
  customerContact: string;
  deceased: string;
  cemetery: string;
  graveType: string;
  section: string;
  plotNumber: string;
  arrivalAtGraveside: string;
  hasStar?: boolean;
};

type MonumentsRow = {
  id: number;
  rowNumber: number;
  orderId?: string;
  colorIndicator: string;
  customer: string;
  customerContact: string;
  deceased: string;
  monument: string;
  requestedCompletion: string;
  cemetery: string;
  block: string;
  section: string;
  lot: string;
  hasStar?: boolean;
};

// Get color based on order status
const getColorFromStatus = (status: string): string => {
  switch (status) {
    case 'completed':
    case 'delivered':
      return 'bg-green-500';
    case 'in_progress':
    case 'processing':
      return 'bg-blue-500';
    case 'pending':
    case 'confirmed':
      return 'bg-orange-500';
    case 'cancelled':
    case 'returned':
      return 'bg-red-500';
    case 'draft':
      return 'bg-gray-400';
    default:
      return 'bg-orange-500';
  }
};

// Map order to CasketsRow (for Vaults/Caskets)
const mapOrderToCasketsRow = (order: Order, index: number): CasketsRow => {
  const deceasedName =
    order.deceased && order.deceased.length > 0
      ? `${order.deceased[0].firstName || order.deceased[0].first_name || ''} ${order.deceased[0].lastName || order.deceased[0].last_name || ''}`.trim() ||
        'N/A'
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
  const customerContact =
    order.contact ||
    order.email ||
    order.customer?.user?.email ||
    order.customer?.email ||
    customerName;

  const colorIndicator = getColorFromStatus(order.status);

  return {
    id: index + 1,
    rowNumber: index + 1,
    orderId: order.id,
    colorIndicator: colorIndicator,
    customer: customerName,
    customerContact: customerContact,
    deceased: deceasedName,
    serviceTime: formatTime(order.timeOfService),
    serviceType: order.serviceTypeName || 'Traditional',
    product: product,
    paintColor: paintColor,
    emblem: order.emblem || 'N/A',
    cemetery: order.cemetery || 'N/A',
    hasStar: order.confirmed || false
  };
};

// Map order to GraveDiggingRow
const mapOrderToGraveDiggingRow = (
  order: Order,
  index: number
): GraveDiggingRow => {
  const deceasedName =
    order.deceased && order.deceased.length > 0
      ? `${order.deceased[0].firstName || order.deceased[0].first_name || ''} ${order.deceased[0].lastName || order.deceased[0].last_name || ''}`.trim() ||
        'N/A'
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

  const customerContact =
    order.contact ||
    order.email ||
    order.customer?.user?.email ||
    order.customer?.email ||
    customerName;

  const colorIndicator = getColorFromStatus(order.status);

  // Get graveType from orderItems if available
  const graveType =
    order.orderItems &&
    order.orderItems.length > 0 &&
    order.orderItems[0].graveType
      ? order.orderItems[0].graveType
      : 'Traditional';

  return {
    id: index + 1,
    rowNumber: index + 1,
    orderId: order.id,
    colorIndicator: colorIndicator,
    customer: customerName,
    customerContact: customerContact,
    deceased: deceasedName,
    cemetery: order.cemetery || 'N/A',
    graveType: graveType,
    section: '-',
    plotNumber: '-',
    arrivalAtGraveside: formatTime(order.arrivalTime || order.timeOfService),
    hasStar: order.confirmed || false
  };
};

// Map order to MonumentsRow
const mapOrderToMonumentsRow = (order: Order, index: number): MonumentsRow => {
  const deceasedName =
    order.deceased && order.deceased.length > 0
      ? `${order.deceased[0].firstName || order.deceased[0].first_name || ''} ${order.deceased[0].lastName || order.deceased[0].last_name || ''}`.trim() ||
        'N/A'
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

  const customerContact =
    order.contact ||
    order.email ||
    order.customer?.user?.email ||
    order.customer?.email ||
    customerName;

  let monument = 'N/A';
  if (order.orderItems && order.orderItems.length > 0) {
    const firstItem = order.orderItems[0];
    monument = firstItem.product?.name || firstItem.name || 'N/A';
  }

  const colorIndicator = getColorFromStatus(order.status);

  return {
    id: index + 1,
    rowNumber: index + 1,
    orderId: order.id,
    colorIndicator: colorIndicator,
    customer: customerName,
    customerContact: customerContact,
    deceased: deceasedName,
    monument: monument,
    requestedCompletion: order.dateOfService
      ? new Date(order.dateOfService).toLocaleDateString()
      : '-',
    cemetery: order.cemetery || 'N/A',
    block: '-',
    section: '-',
    lot: '-',
    hasStar: order.confirmed || false
  };
};

export default function OngoingOrdersPage() {
  const router = useRouter();
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrdersByDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDateGroups, setOpenDateGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [openProductTypes, setOpenProductTypes] = useState<
    Record<string, boolean>
  >({});

  // Fetch ongoing orders (orders with orderDStatus = 'ongoing' AND confirmed = true)
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await getGroupedOrders({ orderStatus: 'ongoing' });
        if (response.success && response.data) {
          setGroupedOrders(response.data);
        } else {
          toast.error(response.error?.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Get total count for a date group
  const getDateGroupTotal = (dateGroup: GroupedOrdersByDate): number => {
    let total = 0;
    if (dateGroup.vaults) total += dateGroup.vaults.length;
    if (dateGroup.caskets) total += dateGroup.caskets.length;
    if (dateGroup.urns) total += dateGroup.urns.length;
    if (dateGroup.grave_diggings) total += dateGroup.grave_diggings.length;
    if (dateGroup.monuments) total += dateGroup.monuments.length;
    return total;
  };

  // Render Vaults/Caskets table
  const renderCasketsTable = (rows: CasketsRow[]) => {
    return (
      <div className='bg-card overflow-x-auto'>
        <table className='w-full table-fixed'>
          <thead>
            <tr className='border-border border-b'>
              <th className='text-muted-foreground w-[50px] px-1 py-0.5 text-left text-xs font-normal'></th>
              <th className='text-muted-foreground w-[15%] px-1 py-0.5 text-left text-xs font-normal'>
                Customer
              </th>
              <th className='text-muted-foreground w-[30px] px-1 py-0.5 text-left text-xs font-normal'></th>
              <th className='text-muted-foreground w-[10%] px-1 py-0.5 text-left text-xs font-normal'>
                Contact
              </th>
              <th className='text-muted-foreground w-[10%] px-1 py-0.5 text-left text-xs font-normal'>
                Deceased
              </th>
              <th className='text-muted-foreground w-[8%] px-1 py-0.5 text-left text-xs font-normal'>
                Service time
              </th>
              <th className='text-muted-foreground w-[8%] px-1 py-0.5 text-left text-xs font-normal'>
                Service Type
              </th>
              <th className='text-muted-foreground w-[12%] px-1 py-0.5 text-left text-xs font-normal'>
                Product
              </th>
              <th className='text-muted-foreground w-[8%] px-1 py-0.5 text-left text-xs font-normal'>
                Paint Color
              </th>
              <th className='text-muted-foreground w-[6%] px-1 py-0.5 text-left text-xs font-normal'>
                Emblem
              </th>
              <th className='text-muted-foreground w-[15%] px-1 py-0.5 text-left text-xs font-normal'>
                Cemetery
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className='border-border/50 hover:bg-muted/50 border-b'
              >
                <td className='px-1 py-0.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-xs'>
                      {row.rowNumber}
                    </span>
                    <div
                      className={`h-3 w-3 shrink-0 ${row.colorIndicator}`}
                    ></div>
                  </div>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <Button
                    className='text-foreground m-0 h-auto cursor-pointer truncate p-0 text-xs font-normal hover:underline'
                    variant='link'
                    onClick={() => {
                      if (row.orderId) {
                        router.push(`/dashboard/orders/${row.orderId}`);
                      }
                    }}
                  >
                    {row.customer}
                  </Button>
                </td>
                <td className='px-1 py-0.5'>
                  {row.hasStar && (
                    <IconStarFilled className='text-foreground h-4 w-4' />
                  )}
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.customerContact}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.deceased}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.serviceTime}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.serviceType}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.product}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.paintColor}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.emblem}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.cemetery}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Grave Digging table
  const renderGraveDiggingTable = (rows: GraveDiggingRow[]) => {
    return (
      <div className='bg-card overflow-x-auto'>
        <table className='w-full table-fixed'>
          <thead>
            <tr className='border-border border-b'>
              <th className='text-muted-foreground w-[50px] px-1 py-0.5 text-left text-xs font-normal'></th>
              <th className='text-muted-foreground w-[15%] px-1 py-0.5 text-left text-xs font-normal'>
                Customer
              </th>
              <th className='text-muted-foreground w-[30px] px-1 py-0.5 text-left text-xs font-normal'></th>
              <th className='text-muted-foreground w-[10%] px-1 py-0.5 text-left text-xs font-normal'>
                Contact
              </th>
              <th className='text-muted-foreground w-[10%] px-1 py-0.5 text-left text-xs font-normal'>
                Deceased
              </th>
              <th className='text-muted-foreground w-[18%] px-1 py-0.5 text-left text-xs font-normal'>
                Cemetery
              </th>
              <th className='text-muted-foreground w-[10%] px-1 py-0.5 text-left text-xs font-normal'>
                Grave Type
              </th>
              <th className='text-muted-foreground w-[8%] px-1 py-0.5 text-left text-xs font-normal'>
                Section
              </th>
              <th className='text-muted-foreground w-[8%] px-1 py-0.5 text-left text-xs font-normal'>
                Plot Number
              </th>
              <th className='text-muted-foreground w-[12%] px-1 py-0.5 text-left text-xs font-normal'>
                Arrival at Graveside
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className='border-border/50 hover:bg-muted/50 border-b'
              >
                <td className='px-1 py-0.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-xs'>
                      {row.rowNumber}
                    </span>
                    <div
                      className={`h-3 w-3 shrink-0 ${row.colorIndicator}`}
                    ></div>
                  </div>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <Button
                    className='text-foreground m-0 h-auto cursor-pointer truncate p-0 text-xs font-normal hover:underline'
                    variant='link'
                    onClick={() => {
                      if (row.orderId) {
                        router.push(`/dashboard/orders/${row.orderId}`);
                      }
                    }}
                  >
                    {row.customer}
                  </Button>
                </td>
                <td className='px-1 py-0.5'>
                  {row.hasStar && (
                    <IconStarFilled className='text-foreground h-4 w-4' />
                  )}
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.customerContact}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.deceased}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.cemetery}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.graveType}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.section}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.plotNumber}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.arrivalAtGraveside}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Monuments table
  const renderMonumentsTable = (rows: MonumentsRow[]) => {
    return (
      <div className='bg-card overflow-x-auto'>
        <table className='w-full table-fixed'>
          <thead>
            <tr className='border-border border-b'>
              <th className='text-muted-foreground w-[50px] px-1 py-0.5 text-left text-xs font-normal'></th>
              <th className='text-muted-foreground w-[14%] px-1 py-0.5 text-left text-xs font-normal'>
                Customer
              </th>
              <th className='text-muted-foreground w-[30px] px-1 py-0.5 text-left text-xs font-normal'></th>
              <th className='text-muted-foreground w-[10%] px-1 py-0.5 text-left text-xs font-normal'>
                Contact
              </th>
              <th className='text-muted-foreground w-[10%] px-1 py-0.5 text-left text-xs font-normal'>
                Deceased
              </th>
              <th className='text-muted-foreground w-[12%] px-1 py-0.5 text-left text-xs font-normal'>
                Monument
              </th>
              <th className='text-muted-foreground w-[12%] px-1 py-0.5 text-left text-xs font-normal'>
                Requested Completion
              </th>
              <th className='text-muted-foreground w-[15%] px-1 py-0.5 text-left text-xs font-normal'>
                Cemetery
              </th>
              <th className='text-muted-foreground w-[6%] px-1 py-0.5 text-left text-xs font-normal'>
                Block
              </th>
              <th className='text-muted-foreground w-[6%] px-1 py-0.5 text-left text-xs font-normal'>
                Section
              </th>
              <th className='text-muted-foreground w-[5%] px-1 py-0.5 text-left text-xs font-normal'>
                Lot
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className='border-border/50 hover:bg-muted/50 border-b'
              >
                <td className='px-1 py-0.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-xs'>
                      {row.rowNumber}
                    </span>
                    <div
                      className={`h-3 w-3 shrink-0 ${row.colorIndicator}`}
                    ></div>
                  </div>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <Button
                    className='text-foreground m-0 h-auto cursor-pointer truncate p-0 text-xs font-normal hover:underline'
                    variant='link'
                    onClick={() => {
                      if (row.orderId) {
                        router.push(`/dashboard/orders/${row.orderId}`);
                      }
                    }}
                  >
                    {row.customer}
                  </Button>
                </td>
                <td className='px-1 py-0.5'>
                  {row.hasStar && (
                    <IconStarFilled className='text-foreground h-4 w-4' />
                  )}
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.customerContact}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.deceased}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.monument}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.requestedCompletion}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.cemetery}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.block}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.section}
                  </span>
                </td>
                <td className='overflow-hidden px-1 py-0.5'>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {row.lot}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className='bg-muted -mt-4 rounded-tr-xl p-2'>
      <PageContainer scrollable={true}>
        <div className='flex flex-col gap-4'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <Heading title='Ongoing Orders' description='' />
            <Button variant='outline'>Export</Button>
          </div>

          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <span className='text-muted-foreground'>Loading orders...</span>
            </div>
          ) : groupedOrders.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <span className='text-muted-foreground'>No orders found</span>
            </div>
          ) : (
            <div className='space-y-2'>
              {groupedOrders.map((dateGroup) => {
                const dateKey = dateGroup.date;
                const isDateOpen = openDateGroups[dateKey] !== false;
                const totalCount = getDateGroupTotal(dateGroup);

                const productTypes = [
                  {
                    key: 'vaults' as const,
                    label: 'Vaults',
                    getRows: () =>
                      (dateGroup.vaults || []).map((order, index) =>
                        mapOrderToCasketsRow(order, index)
                      )
                  },
                  {
                    key: 'caskets' as const,
                    label: 'Caskets',
                    getRows: () =>
                      (dateGroup.caskets || []).map((order, index) =>
                        mapOrderToCasketsRow(order, index)
                      )
                  },
                  {
                    key: 'grave_diggings' as const,
                    label: 'Grave Digging',
                    getRows: () =>
                      (dateGroup.grave_diggings || []).map((order, index) =>
                        mapOrderToGraveDiggingRow(order, index)
                      )
                  },
                  {
                    key: 'monuments' as const,
                    label: 'Monuments',
                    getRows: () =>
                      (dateGroup.monuments || []).map((order, index) =>
                        mapOrderToMonumentsRow(order, index)
                      )
                  }
                ];

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
                    {/* Date Header */}
                    <div className='flex items-center justify-between rounded-lg bg-black px-4 py-2 shadow-sm'>
                      <div className='flex items-center gap-2'>
                        <CollapsibleTrigger asChild>
                          <button className='text-white hover:opacity-80'>
                            <ChevronsUpDown className='h-4 w-4' />
                          </button>
                        </CollapsibleTrigger>
                        <span className='font-medium text-white'>
                          {formatDateHeader(dateKey)}
                        </span>
                      </div>
                      <div className='rounded bg-blue-500 px-2.5 py-0.5'>
                        <span className='text-sm font-semibold text-white'>
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
                              className='bg-card'
                            >
                              <div className='flex items-center justify-between px-2 py-2'>
                                <div className='flex items-center gap-2'>
                                  <CollapsibleTrigger asChild>
                                    <button className='flex items-center justify-center hover:opacity-70'>
                                      <IconChevronRight
                                        className={`text-muted-foreground h-4 w-4 transition-transform ${isProductOpen ? 'rotate-90' : ''}`}
                                      />
                                    </button>
                                  </CollapsibleTrigger>
                                  <h3 className='text-foreground text-sm font-semibold'>
                                    {productType.label}
                                  </h3>
                                  <span className='text-muted-foreground text-sm font-medium'>
                                    {count}
                                  </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <span className='cursor-pointer text-xs text-blue-500 hover:underline'>
                                    See all
                                  </span>
                                  <button className='p-1 transition-colors hover:opacity-70'>
                                    <IconSearch className='text-muted-foreground h-4 w-4' />
                                  </button>
                                  <button className='p-1 transition-colors hover:opacity-70'>
                                    <IconFilter className='text-muted-foreground h-4 w-4' />
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className='p-1 transition-colors hover:opacity-70'>
                                        <IconChevronRight className='text-muted-foreground h-4 w-4 rotate-90' />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align='end'
                                      className='w-56'
                                    >
                                      {/* Column visibility options */}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              <CollapsibleContent>
                                <div className='w-full overflow-x-auto'>
                                  {(() => {
                                    const key = productType.key;
                                    if (key === 'vaults' || key === 'caskets') {
                                      return renderCasketsTable(
                                        rows as CasketsRow[]
                                      );
                                    } else if (key === 'grave_diggings') {
                                      return renderGraveDiggingTable(
                                        rows as GraveDiggingRow[]
                                      );
                                    } else if (key === 'monuments') {
                                      return renderMonumentsTable(
                                        rows as MonumentsRow[]
                                      );
                                    } else {
                                      return <div>Unknown product type</div>;
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
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
