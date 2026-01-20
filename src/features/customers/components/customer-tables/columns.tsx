'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Customer } from '@/types/customer';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Mail, Phone, MapPin, XCircle, Text } from 'lucide-react';
import { CellAction } from './cell-action';

// Helper function to get full name from user
const getUserFullName = (customer: Customer): string => {
  if (customer.user) {
    const firstName = customer.user.first_name || '';
    const lastName = customer.user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || customer.user.email || 'N/A';
  }
  return 'N/A';
};

// Helper function to get email
const getEmail = (customer: Customer): string => {
  return customer.user?.email || 'N/A';
};

// Helper function to get full address
const getFullAddress = (customer: Customer): string => {
  const parts = [
    customer.address,
    customer.city,
    customer.state,
    customer.zipCode
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'N/A';
};

export const columns: ColumnDef<Customer>[] = [
  {
    id: 'name',
    accessorFn: (row) => getUserFullName(row),
    header: ({ column }: { column: Column<Customer, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const name = getUserFullName(row.original);
      const email = getEmail(row.original);
      return (
        <div className='flex flex-col'>
          <div className='font-medium'>{name}</div>
          <div className='text-muted-foreground text-sm'>{email}</div>
        </div>
      );
    },
    meta: {
      label: 'Name',
      placeholder: 'Search customers...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'email',
    accessorFn: (row) => getEmail(row),
    header: ({ column }: { column: Column<Customer, unknown> }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = getEmail(row.original);
      return (
        <div className='flex items-center gap-2'>
          <Mail className='text-muted-foreground h-4 w-4' />
          <span>{email}</span>
        </div>
      );
    },
    enableColumnFilter: true
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }: { column: Column<Customer, unknown> }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => {
      const phone = row.original.phone;
      return phone ? (
        <div className='flex items-center gap-2'>
          <Phone className='text-muted-foreground h-4 w-4' />
          <span>{phone}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>N/A</span>
      );
    }
  },
  {
    id: 'address',
    accessorFn: (row) => getFullAddress(row),
    header: ({ column }: { column: Column<Customer, unknown> }) => (
      <DataTableColumnHeader column={column} title='Address' />
    ),
    cell: ({ row }) => {
      const address = getFullAddress(row.original);
      return (
        <div className='flex max-w-[200px] items-center gap-2'>
          <MapPin className='text-muted-foreground h-4 w-4 flex-shrink-0' />
          <span className='truncate'>{address}</span>
        </div>
      );
    }
  },
  {
    id: 'preferredContactMethod',
    accessorKey: 'preferredContactMethod',
    header: ({ column }: { column: Column<Customer, unknown> }) => (
      <DataTableColumnHeader column={column} title='Contact Method' />
    ),
    cell: ({ row }) => {
      const method = row.original.preferredContactMethod;
      return method ? (
        <Badge variant='outline' className='capitalize'>
          {method}
        </Badge>
      ) : (
        <span className='text-muted-foreground'>N/A</span>
      );
    }
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({ column }: { column: Column<Customer, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      const Icon = isActive ? CheckCircle2 : XCircle;
      return (
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className='capitalize'
        >
          <Icon className='mr-1 h-3 w-3' />
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'select',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ]
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
