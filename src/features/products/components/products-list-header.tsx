'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ChevronDown, ListFilter, Search } from 'lucide-react';
import Link from 'next/link';

export default function ProductsListHeader() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
            PRODUCTS
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='secondary'
                size='sm'
                className='h-7 gap-1 rounded-full px-3'
              >
                Burial Vaults <ChevronDown className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem>Burial Vaults</DropdownMenuItem>
              <DropdownMenuItem>Grave Liners</DropdownMenuItem>
              <DropdownMenuItem>Urn Vaults</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-4 rounded-lg border bg-background p-3'>
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='secondary' size='sm' className='gap-1'>
                Burial Vaults <ChevronDown className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem>Burial Vaults</DropdownMenuItem>
              <DropdownMenuItem>Grave Liners</DropdownMenuItem>
              <DropdownMenuItem>Urn Vaults</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className='text-muted-foreground hidden items-center gap-3 text-sm sm:flex'>
            <Link href='/dashboard/product' className='text-primary font-medium'>
              Service Extras
            </Link>
            <Link href='/dashboard/product' className='hover:text-foreground'>
              Service Types
            </Link>
          </div>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <Button variant='outline' size='icon' className='h-8 w-8'>
            <Search className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon' className='h-8 w-8'>
            <ListFilter className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon' className='h-8 w-8'>
            <ArrowUpDown className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}


