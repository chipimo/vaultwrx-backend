'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { IconSearch, IconCalendar, IconClock, IconCheck, IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

// Placeholder locations data - can be replaced with API data later
const LOCATIONS = [
  { id: 'loc1', name: 'Main Cemetery', address: '123 Main St' },
  { id: 'loc2', name: 'Memorial Park', address: '456 Oak Ave' },
  { id: 'loc3', name: 'Riverside Cemetery', address: '789 River Rd' },
  { id: 'loc4', name: 'Hillside Memorial', address: '321 Hill Dr' },
  { id: 'loc5', name: 'Garden of Peace', address: '654 Garden Ln' },
];

interface DeliverySectionProps {
  typeId: string;
  form: UseFormReturn<any>;
}

export const DeliverySection = ({ typeId, form }: DeliverySectionProps) => {
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get selected location
  const selectedLocationId = form.watch('productData')?.[typeId]?.deliveryLocationId;
  const selectedLocation = LOCATIONS.find((l) => l.id === selectedLocationId);

  // Filter locations based on search
  const filteredLocations = LOCATIONS.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle location selection
  const handleLocationSelect = (location: typeof LOCATIONS[0]) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        deliveryLocationId: location.id,
        deliveryLocation: location.name
      }
    });
    setLocationOpen(false);
    setSearchQuery('');
  };

  return (
    <Card className='rounded-none shadow-none'>
      <CardContent className='space-y-3 px-4 py-2'>
        <div className='text-sm font-semibold text-foreground'>Deliver By</div>
        
        {/* Location Search Dropdown */}
        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              role='combobox'
              aria-expanded={locationOpen}
              className='h-9 w-full justify-between rounded-none border-0 border-b border-input bg-transparent px-0 font-normal hover:bg-transparent'
            >
              <div className='flex items-center gap-2'>
                <IconSearch className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span className='truncate text-foreground'>
                  {selectedLocation ? selectedLocation.name : 'Location'}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[400px] p-0' align='start'>
            <Command>
              <CommandInput
                placeholder='Search location...'
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No location found.</CommandEmpty>
                <CommandGroup>
                  {filteredLocations.map((location) => {
                    const isSelected = selectedLocationId === location.id;
                    return (
                      <CommandItem
                        key={location.id}
                        value={location.name}
                        onSelect={() => handleLocationSelect(location)}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                            isSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-input [&_svg]:invisible'
                          )}
                        >
                          <IconCheck className='h-3.5 w-3.5' />
                        </div>
                        <div className='flex flex-col'>
                          <span>{location.name}</span>
                          {location.address && (
                            <span className='text-xs text-muted-foreground'>
                              {location.address}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Date and Time Row */}
        <div className='grid grid-cols-2 gap-4'>
          {/* Date Field */}
          <div className='flex items-center gap-2 border-b border-input pb-1'>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>Date</span>
            <div className='relative flex-1'>
              <input
                type='date'
                className='w-full bg-transparent text-sm text-foreground outline-none [&::-webkit-calendar-picker-indicator]:opacity-0'
                value={form.watch('productData')?.[typeId]?.deliverByDate || ''}
                onChange={(e) => {
                  const currentData = form.getValues('productData') || {};
                  form.setValue('productData', {
                    ...currentData,
                    [typeId]: {
                      ...currentData[typeId],
                      deliverByDate: e.target.value
                    }
                  });
                }}
              />
            </div>
            <IconCalendar className='h-4 w-4 shrink-0 text-muted-foreground' />
          </div>

          {/* Time Field */}
          <div className='flex items-center gap-2 border-b border-input pb-1'>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>Time</span>
            <div className='relative flex-1'>
              <input
                type='time'
                className='w-full bg-transparent text-sm text-foreground outline-none [&::-webkit-calendar-picker-indicator]:opacity-0'
                value={form.watch('productData')?.[typeId]?.deliverByTime || ''}
                onChange={(e) => {
                  const currentData = form.getValues('productData') || {};
                  form.setValue('productData', {
                    ...currentData,
                    [typeId]: {
                      ...currentData[typeId],
                      deliverByTime: e.target.value
                    }
                  });
                }}
              />
            </div>
            <IconClock className='h-4 w-4 shrink-0 text-muted-foreground' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
