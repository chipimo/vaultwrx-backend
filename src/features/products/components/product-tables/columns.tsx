'use client';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { CellAction } from './cell-action';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const FALLBACK_PRODUCT_IMAGE = '/assets/images/image_2-removebg-preview.png';

function getStatusLabel(product: Product): 'Active' | 'Draft' | 'Inactive' {
  const raw = String((product as any)?.status ?? '').trim().toLowerCase();
  if (raw === 'draft') return 'Draft';
  if (raw === 'inactive') return 'Inactive';
  // Default to Active when status is missing/unknown (keeps legacy/mock records reasonable)
  return 'Active';
}

function getInventoryLabel(product: Product) {
  const provided = (product as any)?.inventoryLabel;
  if (typeof provided === 'string' && provided.trim().length > 0) return provided;

  const track = Boolean((product as any)?.trackQuantity ?? false);
  const locs = Array.isArray((product as any)?.locations)
    ? (((product as any).locations as any[]) ?? [])
    : [];
  const total = track
    ? locs.reduce((sum, l) => sum + Number(l?.qty ?? 0), 0)
    : 0;
  return `${Number.isFinite(total) ? total : 0} in Stock`;
}

export const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    cell: ({ cell }) => (
      <div className='text-sm text-foreground'>{cell.getValue<string>()}</div>
    )
  },
  {
    id: 'product',
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
      const name = row.original.name;
      const rawPhoto = (row.original as any)?.photo_url;
      const photo =
        typeof rawPhoto === 'string' && rawPhoto.trim().length > 0
          ? rawPhoto
          : FALLBACK_PRODUCT_IMAGE;
      return (
        <div className='flex items-center gap-3'>
          <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted'>
            {photo ? (
              <Image src={photo} alt={name} fill className='object-cover' />
            ) : null}
          </div>
          <div className='text-sm font-medium text-foreground'>{name}</div>
        </div>
      );
    }
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getStatusLabel(row.original);
      return (
        <Badge
          variant='secondary'
          className={
            status === 'Active'
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
              : status === 'Inactive'
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
          }
        >
          {status}
        </Badge>
      );
    }
  },
  {
    id: 'inventory',
    header: 'Inventory Count',
    cell: ({ row }) => (
      <div className='text-sm text-foreground'>
        {getInventoryLabel(row.original)}
      </div>
    )
  },
  {
    id: 'standard_price',
    header: 'Standard Price',
    cell: ({ row }) => (
      <div className='text-sm text-foreground'>US {row.original.price}</div>
    )
  },
  {
    id: 'price_lists',
    header: 'Price Lists',
    cell: ({ row }) => {
      const saved = (row.original as any)?.priceLists;
      const lists: { id: string; name: string; price: number }[] = Array.isArray(saved)
        ? saved
            .map((p: any) => ({
              id: String(p?.id ?? ''),
              name: String(p?.name ?? ''),
              price: Number(p?.price ?? 0)
            }))
            .filter((p) => p.id.length > 0 && p.name.length > 0)
        : [];

      // Always include the default "Standard Price" list.
      const standardPrice = Number.isFinite(Number(row.original.price))
        ? Number(row.original.price)
        : 0;
      const displayLists: { id: string; name: string; price: number }[] = [
        { id: 'standard', name: 'Standard Price', price: standardPrice },
        ...lists
      ];

      const count = displayLists.length;

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              className='h-8 w-full justify-end gap-2 px-2 text-sm'
            >
              <span>{count}</span>
              <ChevronDown className='h-4 w-4 text-muted-foreground' />
            </Button>
          </PopoverTrigger>
          <PopoverContent align='end' className='w-[260px] p-3'>
            <div className='space-y-2'>
              <div className='text-sm font-medium'>Price Lists</div>
              <div className='space-y-1'>
                {displayLists.map((pl) => (
                  <div key={pl.id} className='flex items-center justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate text-sm'>{pl.name}</div>
                      <div className='text-muted-foreground truncate text-xs'>{pl.id}</div>
                    </div>
                    <div className='text-sm tabular-nums'>US {Number(pl.price ?? 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
    size: 60
  }
];
