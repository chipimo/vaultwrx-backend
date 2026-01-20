'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/calendar';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  
  // Get the date value from form
  const dateValue = form.watch('productData')?.[typeId]?.dateOfService;
  const selectedDate = dateValue ? new Date(dateValue) : undefined;
  
  // Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
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
    <Card className='rounded-none'>
      <CardHeader>
        <CardTitle>Funeral Service Details</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Cemetery Name, State - Location Autocomplete */}
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
            <SelectTrigger>
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
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal pr-9',
                  !selectedDate && 'text-muted-foreground'
                )}
                disabled={disabled}
              >
                <div className='flex items-center w-full'>
                  <IconCalendar className='mr-2 h-4 w-4' />
                  {selectedDate ? (
                    format(selectedDate, 'MM/dd/yy EEEE')
                  ) : (
                    <span>Date of Service</span>
                  )}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                onChange={handleDateSelect}
                value={selectedDate || null}
                minDate={today}
                className='rounded-md border shadow-sm'
              />
            </PopoverContent>
          </Popover>

          <div className='relative'>
            <FormControl>
              <Input
                type='time'
                placeholder='Service Start Time'
                className='pr-9'
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
            <IconClock className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
          </div>
        </div>

        {/* Arrival at Graveside */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='relative'>
            <FormControl>
              <Input
                type='time'
                placeholder='Arrival at Graveside'
                className='pr-9'
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
            <IconClock className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
          </div>
          {/* Empty column for alignment */}
          <div />
        </div>
      </CardContent>
    </Card>
  );
};

