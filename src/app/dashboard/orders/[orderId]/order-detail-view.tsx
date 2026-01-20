'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  IconArrowLeft,
  IconMessageCircle,
  IconPrinter,
  IconDownload,
  IconDots,
  IconFile,
  IconCheck,
  IconChevronDown
} from '@tabler/icons-react';
import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

type OrderDetailViewProps = {
  orderId: string;
};

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  // In a real app, you would fetch order data based on orderId
  // For now, using mock data based on the image
  const displayOrderId = `#${orderId}`;
  const orderDate = '24 April 2025 at 3:53pm';
  const grandTotal = 'US $3000';

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-6 bg-gray-50 p-6'>
        {/* Header Section */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard/orders/track'>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <IconArrowLeft className='h-5 w-5' />
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                {displayOrderId}
              </h1>
              <p className='text-sm text-gray-500'>{orderDate}</p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            {/* Tags */}
            <div className='flex items-center gap-2'>
              <Badge className='flex items-center gap-1 border-green-200 bg-green-100 text-green-800'>
                <IconCheck className='h-3 w-3' />
                Vault
              </Badge>
              <Badge className='border-green-200 bg-green-50 text-green-700'>
                Casket
              </Badge>
            </div>
            {/* Action Buttons */}
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm'>
                Comments
              </Button>
              <Button variant='outline' size='sm'>
                <IconPrinter className='mr-2 h-4 w-4' />
                Print
              </Button>
              <Button variant='outline' size='sm'>
                <IconDownload className='mr-2 h-4 w-4' />
                Export
              </Button>
              <Button variant='outline' size='icon' className='h-9 w-9'>
                <IconDots className='h-4 w-4' />
              </Button>
              <Button size='sm' className='bg-green-600 hover:bg-green-700'>
                <IconCheck className='mr-2 h-4 w-4' />
                Mark as Paid
              </Button>
            </div>
            {/* Grand Total */}
            <div className='text-right'>
              <p className='text-sm text-gray-500'>Grand Order Total:</p>
              <p className='text-2xl font-bold text-gray-900'>
                <span className='text-green-600'>US</span> $3000
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Left Column */}
          <div className='space-y-6 lg:col-span-1'>
            {/* Tracking Card */}
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Status</p>
                  <Badge className='border-orange-200 bg-orange-100 text-orange-800'>
                    Postponed
                  </Badge>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Assigned</p>
                  <p className='text-sm font-medium text-gray-900'>Value</p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Location Tagged</p>
                  <p className='text-sm font-medium text-gray-900'>Value</p>
                </div>
              </CardContent>
            </Card>

            {/* Customer Card */}
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Name</p>
                  <p className='text-sm font-medium text-gray-900'>Acme</p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Location</p>
                  <p className='text-sm font-medium text-gray-900'>
                    Washington
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Name</p>
                  <p className='text-sm font-medium text-gray-900'>
                    Simone Lane
                  </p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Phone</p>
                  <p className='text-sm font-medium text-gray-900'>
                    +230 786 674 234
                  </p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Email</p>
                  <p className='text-sm font-medium text-gray-900'>
                    Simonlane@gmail.com
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Deceased Card */}
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Deceased
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Name</p>
                  <p className='text-sm font-medium text-gray-900'>Value</p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>DOB</p>
                  <p className='text-sm font-medium text-gray-900'>
                    MM / DD / YY
                  </p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>DOD</p>
                  <p className='text-sm font-medium text-gray-900'>
                    MM / DD / YY
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Special Order Instructions Card */}
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Special Order Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-700'>
                  Include 15 chairs at every funeral
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Casket Order Summary Card */}
            <Card className='bg-white'>
              <Collapsible defaultOpen>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-base font-semibold text-green-600'>
                    Casket Order Summary
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-6 w-6'>
                      <IconChevronDown className='h-4 w-4' />
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-500'>
                          Order #1100989A
                        </span>
                        <IconChevronDown className='h-3 w-3 text-gray-400' />
                      </div>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>
                        Product Name
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        US $1
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>
                        Date of Service
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        US $1
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>
                        Service Types
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        US $1
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>
                        Service Extras
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        US $1
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between'>
                      <span className='text-sm font-semibold text-gray-900'>
                        Sub Total
                      </span>
                      <span className='text-sm font-semibold text-gray-900'>
                        US $1
                      </span>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Vault Information Card */}
            <Card className='bg-white'>
              <Collapsible defaultOpen>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-base font-semibold'>
                    Vault Information
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-6 w-6'>
                      <IconChevronDown className='h-4 w-4' />
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className='flex gap-4'>
                      <div className='flex h-24 w-24 items-center justify-center rounded-lg bg-gray-800'>
                        <span className='text-xs text-white'>Vault</span>
                      </div>
                      <div className='flex-1 space-y-3'>
                        <div>
                          <p className='mb-1 text-sm text-gray-500'>
                            Product Name
                          </p>
                          <p className='text-sm font-medium text-gray-900'>
                            Product Name
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Funeral Service Details Card */}
            <Card className='bg-white pt-0'>
              <CardHeader className='pb-0 pt-0'>
                <CardTitle className='text-base font-semibold pt-0'>
                  Funeral Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Cemetery</p>
                  <p className='text-sm font-medium text-gray-900'>Value</p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Service Type</p>
                  <p className='text-sm font-medium text-gray-900'>Value</p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Service Location</p>
                  <p className='text-sm font-medium text-gray-900'>Value</p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Date Of Service</p>
                  <p className='text-sm font-medium text-gray-900'>
                    DAY, MM / DD / YY
                  </p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>
                    Service Start Time
                  </p>
                  <p className='text-sm font-medium text-gray-900'>HH:MM</p>
                </div>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>
                    Arrive At Graveside
                  </p>
                  <p className='text-sm font-medium text-gray-900'>HH:MM</p>
                </div>
              </CardContent>
            </Card>

            {/* Service Extras Card */}
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Service Extras
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='mb-1 text-sm text-gray-500'>Extras</p>
                  <p className='text-sm font-medium text-gray-900'>
                    Value 1, Value 2, Value 3
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox id='customisation' defaultChecked />
                  <label
                    htmlFor='customisation'
                    className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Add Customisation
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Attachments Card */}
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-700'>
                  <IconFile className='h-4 w-4 text-gray-400' />
                  <span>Content name . pdf</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-700'>
                  <IconFile className='h-4 w-4 text-gray-400' />
                  <span>Content name . pdf</span>
                </div>
              </CardContent>
            </Card>

            {/* Comments Or Delivery Instructions Card */}
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Comments Or Delivery Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-700'>Value</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
