import React from 'react';
import Link from 'next/link';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeSelector } from '../theme-selector';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import { Button } from '../ui/button';
import { IconPlus } from '@tabler/icons-react';

export default function Header() {
  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 bg-gray-900 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14'>
      <div className='flex items-center gap-2 px-2'>
        <SidebarTrigger className='-ml-1 text-white hover:bg-gray-800 hover:text-white' />
        <Separator orientation='vertical' className='mr-2 h-4 bg-gray-700' />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
      </div>
      <div className='flex items-center gap-3 px-4'>
        <Button
          asChild
          size='sm'
          className='bg-green-600 text-white hover:bg-green-700'
        >
          <Link href='/dashboard/orders/place-order'>
            <IconPlus className='mr-1 h-4 w-4' />
            Place Order
          </Link>
        </Button>
        <UserNav />
        <ModeToggle />
        {/* <ThemeSelector /> */}
      </div>
    </header>
  );
}
