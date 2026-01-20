'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getHolidaysByRetailer, getUserData, Holiday } from '@/lib/api-client';

interface FuneralServiceSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
  isLoading?: boolean;
  isLoadingData?: boolean;
}

export const FuneralServiceSection = ({
  typeId,
  form,
  isLoading,
  isLoadingData
}: FuneralServiceSectionProps) => {
  const disabled = isLoading || isLoadingData;
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [holidays, setHolidays] = useState<Date[]>([]);
  
  // Get the date value from form
  const dateValue = form.watch('productData')?.[typeId]?.dateOfService;
  const selectedDate = dateValue ? new Date(dateValue) : undefined;
  
  // Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch holidays on mount
  useEffect(() => {
    const fetchHolidays = async () => {
      const userData = getUserData();
      const retailerId = userData?.retailer?.id;
      
      if (retailerId) {
        const response = await getHolidaysByRetailer(retailerId);
        if (response.success && response.data) {
          // Convert holiday dates to Date objects
          const holidayDates = response.data
            .filter((h: Holiday) => h.isActive)
            .map((h: Holiday) => new Date(h.date));
          setHolidays(holidayDates);
        }
      }
    };
    
    fetchHolidays();
  }, []);
  
  const handleDateSelect = (date: Date | null) => {
    if (date) {
      const currentData = form.getValues('productData') || {};
      form.setValue('productData', {
        ...currentData,
        [typeId]: {
          ...currentData[typeId],
          dateOfService: format(date, 'yyyy-MM-dd')
        }
      });
      setDatePickerOpen(false);
    }
  };

  return (
    <Card className='rounded-none shadow-none space-y-1'>
      <CardContent className='space-y-3 px-4 py-2'>
        {/* Cemetery Name, State - Location Autocomplete */}
        <div className='text-sm font-semibold text-foreground'>Funeral Service Details</div>
        <LocationAutocomplete
          placeholder='Cemetery Name, State'
          disabled={disabled}
          value={form.watch('productData')?.[typeId]?.cemetery || ''}
          onChange={(value) => {
            const currentData = form.getValues('productData') || {};
            form.setValue('productData', {
              ...currentData,
              [typeId]: {
                ...currentData[typeId],
                cemetery: value
              }
            });
          }}
        />

        {/* Funeral Service Type and Service Location */}
        <div className='grid grid-cols-2 gap-4'>
          <Select
            value={form.watch('productData')?.[typeId]?.funeralServiceType || ''}
            onValueChange={(value) => {
              const currentData = form.getValues('productData') || {};
              form.setValue('productData', {
                ...currentData,
                [typeId]: {
                  ...currentData[typeId],
                  funeralServiceType: value
                }
              });
            }}
            disabled={disabled}
          >
            <SelectTrigger className='h-9 w-full rounded-none border-0 border-b border-input bg-transparent px-0 shadow-none focus:ring-0'>
              <SelectValue placeholder='Funeral Service Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='burial'>Burial</SelectItem>
              <SelectItem value='cremation'>Cremation</SelectItem>
              <SelectItem value='memorial'>Memorial Service</SelectItem>
              <SelectItem value='graveside'>Graveside Service</SelectItem>
              <SelectItem value='celebration_of_life'>Celebration of Life</SelectItem>
              <SelectItem value='direct_burial'>Direct Burial</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder='Service Location'
            className='h-9 rounded-none border-0 border-b border-input bg-transparent px-0 shadow-none focus-visible:ring-0'
            disabled={disabled}
            value={form.watch('productData')?.[typeId]?.serviceLocation || ''}
            onChange={(e) => {
              const currentData = form.getValues('productData') || {};
              form.setValue('productData', {
                ...currentData,
                [typeId]: {
                  ...currentData[typeId],
                  serviceLocation: e.target.value
                }
              });
            }}
          />
        </div>

        {/* Date of Service and Service Start Time */}
        <div className='grid grid-cols-2 gap-4'>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='ghost'
                className={cn(
                  'h-9 w-full justify-start rounded-none border-0 border-b border-input bg-transparent px-0 text-left font-normal hover:bg-transparent',
                  !selectedDate && 'text-muted-foreground'
                )}
                disabled={disabled}
              >
                <div className='flex items-center w-full'>
                  <IconCalendar className='mr-2 h-4 w-4 text-muted-foreground' />
                  {selectedDate ? (
                    format(selectedDate, 'MM/dd/yy EEEE')
                  ) : (
                    <span>Date of Service</span>
                  )}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[620px] p-0' align='start'>
              <CustomDatePicker
                onChange={handleDateSelect}
                value={selectedDate || null}
                minDate={today}
                holidays={holidays}
              />
            </PopoverContent>
          </Popover>

          <div className='relative'>
            <FormControl>
              <Input
                type='time'
                placeholder='Service Start Time'
                className='h-9 rounded-none border-0 border-b border-input bg-transparent px-0 pr-8 shadow-none focus-visible:ring-0'
                disabled={disabled}
                value={form.watch('productData')?.[typeId]?.timeOfService || ''}
                onChange={(e) => {
                  const currentData = form.getValues('productData') || {};
                  form.setValue('productData', {
                    ...currentData,
                    [typeId]: {
                      ...currentData[typeId],
                      timeOfService: e.target.value
                    }
                  });
                }}
              />
            </FormControl>
            <IconClock className='pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          </div>
        </div>

        {/* Arrival at Graveside */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='relative'>
            <FormControl>
              <Input
                type='time'
                placeholder='Arrival at Graveside'
                className='h-9 rounded-none border-0 border-b border-input bg-transparent px-0 pr-8 shadow-none focus-visible:ring-0'
                disabled={disabled}
                value={form.watch('productData')?.[typeId]?.arrivalTime || ''}
                onChange={(e) => {
                  const currentData = form.getValues('productData') || {};
                  form.setValue('productData', {
                    ...currentData,
                    [typeId]: {
                      ...currentData[typeId],
                      arrivalTime: e.target.value
                    }
                  });
                }}
              />
            </FormControl>
            <IconClock className='pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          </div>
          {/* Empty column for alignment */}
          <div />
        </div>
      </CardContent>
    </Card>
  );
};

