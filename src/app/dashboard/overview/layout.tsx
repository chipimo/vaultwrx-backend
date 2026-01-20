'use client';

import Image from 'next/image';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconCalendar,
  IconEdit,
  IconChevronDown,
  IconSunFilled,
  IconPlus,
  IconRobot,
  IconBroadcast
} from '@tabler/icons-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import moment from 'moment';

// Get current date and time
function getCurrentDateTime() {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  const day = days[now.getDay()];
  const month = months[now.getMonth()];
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${day} ${month} ${date}, ${displayHours}:${displayMinutes}${ampm}`;
}

// Get greeting based on time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function OverViewLayout({
  sales: _sales,
  pie_stats: _pie_stats,
  bar_stats: _bar_stats,
  area_stats: _area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || 'User';
  const greeting = getGreeting();
  const currentDateTime = getCurrentDateTime();

  return (
    <div className='-mt-4 rounded-tr-xl bg-background p-2'>
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-center justify-between gap-4'>
            {/* Good Morning Card */}
            <Card className='max-w-xs flex-1 bg-muted/50'>
              <CardContent className='-pt-1'>
                <div className='space-y-1'>
                  <div className='flex flex-row items-center gap-2'>
                    <div>{greeting}</div>
                    <div className='font-semibold'>
                      {userName}
                    </div>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <div className='flex flex-row items-center gap-2'>
                      <IconSunFilled className='h-12 w-12 text-yellow-500' />
                      <div>
                        <div>Sunny</div>
                        <span className='text-md font-bold'>22°F</span>
                      </div>
                      <span className='mx-1'>•</span>
                    </div>
                    <div>

                      <div className='text-xs'>
                        {moment().format('ddd MMM D')}
                      </div>
                      <div className='text-xs font-bold'>
                        {moment().format('LT')}
                      </div>
                    </div>
                  </div>
                  <p className='text-muted-foreground text-xs font-bold'>
                    Saint Petersberg
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Center Logo/Avatar */}
            <div className='flex flex-shrink-0 items-center justify-center'>
              <Image src='/assets/images/image_2-removebg-preview.png' alt='Logo' width={180} height={180} />
            </div>

            {/* Last 90 Days Button */}
            <div className='flex-shrink-0 '>
              <Button variant='outline' className='gap-2'>
                <IconCalendar className='h-4 w-4' />
                Last 90 Days
              </Button>
            </div>
          </div>

          <div className='grid grid-row gap-4 px-10'>
            {/* Stats Row */}
            <Card className='border'>
              <CardContent className='p-0'>
                <div className='flex divide-x'>
                  <div className='flex flex-1 items-center justify-between p-4'>
                    <div>
                      <div className='text-3xl font-bold'>15</div>
                      <div className='text-sm text-muted-foreground'>Active Funeral Homes</div>
                    </div>
                    <IconEdit className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div className='flex flex-1 items-center justify-between p-4'>
                    <div>
                      <div className='text-3xl font-bold'>714</div>
                      <div className='text-sm text-muted-foreground'>Total Orders</div>
                    </div>
                  </div>
                  <div className='flex flex-1 items-center justify-between p-4'>
                    <div>
                      <div className='text-3xl font-bold'>9.8</div>
                      <div className='text-sm text-muted-foreground'>Vault Setter Rating</div>
                    </div>
                    <IconRobot className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div className='flex items-center px-4'>
                    <IconChevronDown className='h-5 w-5 text-muted-foreground' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className='grid grid-cols-2 gap-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-base font-semibold'>Operational Funnel</CardTitle>
                  <Button variant='outline' size='sm'>New Order</Button>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div className='flex items-center justify-between rounded-md border-l-4 border-l-muted-foreground/30 bg-muted/50 p-3'>
                    <span className='text-sm'>Unconfirmed Orders</span>
                    <Badge variant='secondary'>5</Badge>
                  </div>
                  <div className='flex items-center justify-between rounded-md border-l-4 border-l-muted-foreground/30 bg-muted/50 p-3'>
                    <span className='text-sm'>Ongoing Orders</span>
                    <Badge variant='secondary'>5</Badge>
                  </div>
                  <div className='flex items-center justify-between rounded-md border-l-4 border-l-green-500 bg-muted/50 p-3'>
                    <span className='text-sm'>Serviced Orders Today</span>
                    <Badge className='bg-green-500 text-white'>15</Badge>
                  </div>
                  <div className='flex items-center justify-between rounded-md border-l-4 border-l-yellow-500 bg-muted/50 p-3'>
                    <span className='text-sm'>Postponed Order</span>
                    <Badge className='bg-yellow-500 text-white'>9</Badge>
                  </div>
                  <div className='flex items-center justify-between rounded-md border-l-4 border-l-yellow-500 bg-muted/50 p-3'>
                    <span className='text-sm'>Low Inventory Alert</span>
                    <Badge className='bg-yellow-500 text-white'>9</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Message Center */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-base font-semibold'>Message Center</CardTitle>
                  <Button variant='outline' size='sm'>
                    <IconBroadcast className='mr-1 h-4 w-4' />
                    New Broadcast
                  </Button>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='rounded-md border p-3'>
                    <div className='flex items-start justify-between'>
                      <span className='text-xs text-muted-foreground'>Sent as text message to Metro Area segment</span>
                      <span className='text-xs text-muted-foreground'>2 Jul 2025, 5:43PM</span>
                    </div>
                    <div className='mt-1 text-sm font-medium'>Service Update - Potential Weather Delays for 4th July</div>
                    <p className='mt-1 text-xs text-muted-foreground'>Please be aware that due to the forecast of heavy rain and high...</p>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='flex items-start justify-between'>
                      <span className='text-xs text-muted-foreground'>Sent as text message to Metro Area segment</span>
                      <span className='text-xs text-muted-foreground'>2 Jul 2025, 5:43PM</span>
                    </div>
                    <div className='mt-1 text-sm font-medium'>Service Update - Potential Weather Delays for 4th July</div>
                    <p className='mt-1 text-xs text-muted-foreground'>Please be aware that due to the forecast of heavy rain and high...</p>
                  </div>
                </CardContent>
              </Card>

              {/* Unit Sales - spans full width */}
              <Card className='col-span-1'>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-base font-semibold'>Unit Sales</CardTitle>
                  <Select defaultValue='all'>
                    <SelectTrigger className='w-[140px]'>
                      <SelectValue placeholder='All Products' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Products</SelectItem>
                      <SelectItem value='vaults'>Vaults</SelectItem>
                      <SelectItem value='caskets'>Caskets</SelectItem>
                      <SelectItem value='urns'>Urns</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 flex-1 rounded-full bg-muted'>
                        <div className='h-2 rounded-full bg-green-500' style={{ width: '83%' }}></div>
                      </div>
                      <span className='text-xs text-muted-foreground'>500</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>Product Name</span>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 flex-1 rounded-full bg-muted'>
                        <div className='h-2 rounded-full bg-green-500' style={{ width: '7.5%' }}></div>
                      </div>
                      <span className='text-xs text-muted-foreground'>45</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>Product Name</span>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 flex-1 rounded-full bg-muted'>
                        <div className='h-2 rounded-full bg-green-500' style={{ width: '100%' }}></div>
                      </div>
                      <span className='text-xs text-muted-foreground'>600</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>Product Name</span>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 flex-1 rounded-full bg-muted'>
                        <div className='h-2 rounded-full bg-green-500' style={{ width: '6.3%' }}></div>
                      </div>
                      <span className='text-xs text-muted-foreground'>38</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>Product Name</span>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 flex-1 rounded-full bg-muted'>
                        <div className='h-2 rounded-full bg-green-500' style={{ width: '66.7%' }}></div>
                      </div>
                      <span className='text-xs text-muted-foreground'>400</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>Product Name</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
