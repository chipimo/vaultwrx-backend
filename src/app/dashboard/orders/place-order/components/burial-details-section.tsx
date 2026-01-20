'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { IconSearch, IconCalendar, IconClock, IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

// Placeholder cemeteries data - can be replaced with API data later
const CEMETERIES = [
  { id: 'cem1', name: 'Greenwood Cemetery', state: 'New York' },
  { id: 'cem2', name: 'Rose Hills Memorial Park', state: 'California' },
  { id: 'cem3', name: 'Forest Lawn', state: 'California' },
  { id: 'cem4', name: 'Arlington National Cemetery', state: 'Virginia' },
  { id: 'cem5', name: 'Spring Grove Cemetery', state: 'Ohio' },
];

interface BurialDetailsSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
}

export const BurialDetailsSection = ({ typeId, form }: BurialDetailsSectionProps) => {
  const [cemeteryOpen, setCemeteryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const monumentInPlace = form.watch('productData')?.[typeId]?.monumentInPlace || false;
  const graveSize = form.watch('productData')?.[typeId]?.graveSize || 'traditional';

  // Get selected cemetery
  const selectedCemeteryId = form.watch('productData')?.[typeId]?.cemeteryId;
  const selectedCemetery = CEMETERIES.find((c) => c.id === selectedCemeteryId);

  // Filter cemeteries based on search
  const filteredCemeteries = CEMETERIES.filter((cemetery) =>
    cemetery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cemetery.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateFormField = (field: string, value: any) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        [field]: value
      }
    });
  };

  // Handle cemetery selection
  const handleCemeterySelect = (cemetery: typeof CEMETERIES[0]) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        cemeteryId: cemetery.id,
        cemeteryName: `${cemetery.name}, ${cemetery.state}`
      }
    });
    setCemeteryOpen(false);
    setSearchQuery('');
  };

  return (
    <Card className='rounded-none shadow-none'>
      <CardContent className='space-y-4 px-4 py-3'>
        <div className='text-sm font-semibold text-foreground'>Burial Details</div>
        
        {/* Cemetery Search Dropdown */}
        <Popover open={cemeteryOpen} onOpenChange={setCemeteryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              role='combobox'
              aria-expanded={cemeteryOpen}
              className='h-9 w-full justify-start rounded-none border-0 border-b border-input bg-transparent px-0 font-normal hover:bg-transparent'
            >
              <div className='flex items-center gap-2'>
                <IconSearch className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span className='truncate text-muted-foreground'>
                  {selectedCemetery 
                    ? `${selectedCemetery.name}, ${selectedCemetery.state}` 
                    : 'Cemetery Name, State'}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[400px] p-0' align='start'>
            <Command>
              <CommandInput
                placeholder='Search cemetery...'
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No cemetery found.</CommandEmpty>
                <CommandGroup>
                  {filteredCemeteries.map((cemetery) => {
                    const isSelected = selectedCemeteryId === cemetery.id;
                    return (
                      <CommandItem
                        key={cemetery.id}
                        value={cemetery.name}
                        onSelect={() => handleCemeterySelect(cemetery)}
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
                          <span>{cemetery.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            {cemetery.state}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Section and Grave Space Row */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='border-b border-input pb-1'>
            <Input
              placeholder='Section'
              className='h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0'
              value={form.watch('productData')?.[typeId]?.section || ''}
              onChange={(e) => updateFormField('section', e.target.value)}
            />
          </div>
          <div className='border-b border-input pb-1'>
            <Input
              placeholder='Grave Space'
              className='h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0'
              value={form.watch('productData')?.[typeId]?.graveSpace || ''}
              onChange={(e) => updateFormField('graveSpace', e.target.value)}
            />
          </div>
        </div>

        {/* Service Time and Date Row */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center gap-2 border-b border-input pb-1'>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>
              Service Time (Arrival at Graveside)
            </span>
            <div className='relative flex-1'>
              <input
                type='time'
                className='w-full bg-transparent text-sm text-foreground outline-none [&::-webkit-calendar-picker-indicator]:opacity-0'
                value={form.watch('productData')?.[typeId]?.serviceTime || ''}
                onChange={(e) => updateFormField('serviceTime', e.target.value)}
              />
            </div>
            <IconClock className='h-4 w-4 shrink-0 text-muted-foreground' />
          </div>
          <div className='flex items-center gap-2 border-b border-input pb-1'>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>Date</span>
            <div className='relative flex-1'>
              <input
                type='date'
                className='w-full bg-transparent text-sm text-foreground outline-none [&::-webkit-calendar-picker-indicator]:opacity-0'
                value={form.watch('productData')?.[typeId]?.serviceDate || ''}
                onChange={(e) => updateFormField('serviceDate', e.target.value)}
              />
            </div>
            <IconCalendar className='h-4 w-4 shrink-0 text-muted-foreground' />
          </div>
        </div>

        {/* Monument In Place and Name On Stone Row */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id={`monument-in-place-${typeId}`}
              checked={monumentInPlace}
              onCheckedChange={(checked) => updateFormField('monumentInPlace', checked)}
            />
            <Label htmlFor={`monument-in-place-${typeId}`} className='text-sm'>
              Monument In Place
            </Label>
          </div>
          <div className='border-b border-input pb-1'>
            <Input
              placeholder='Name On The Stone'
              className='h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0'
              value={form.watch('productData')?.[typeId]?.nameOnStone || ''}
              onChange={(e) => updateFormField('nameOnStone', e.target.value)}
            />
          </div>
        </div>

        {/* Grave Size */}
        <div className='space-y-3'>
          <div className='text-sm text-foreground'>Grave Size</div>
          <div className='flex gap-8'>
            <div className='flex items-center gap-2'>
              <input
                type='radio'
                id={`grave-size-traditional-${typeId}`}
                name={`grave-size-${typeId}`}
                value='traditional'
                className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
                checked={graveSize === 'traditional'}
                onChange={() => updateFormField('graveSize', 'traditional')}
              />
              <Label htmlFor={`grave-size-traditional-${typeId}`} className='text-sm'>
                Traditional
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='radio'
                id={`grave-size-adult-${typeId}`}
                name={`grave-size-${typeId}`}
                value='adult'
                className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
                checked={graveSize === 'adult'}
                onChange={() => updateFormField('graveSize', 'adult')}
              />
              <Label htmlFor={`grave-size-adult-${typeId}`} className='text-sm'>
                Adult
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='radio'
                id={`grave-size-oversized-${typeId}`}
                name={`grave-size-${typeId}`}
                value='oversized'
                className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
                checked={graveSize === 'oversized'}
                onChange={() => updateFormField('graveSize', 'oversized')}
              />
              <Label htmlFor={`grave-size-oversized-${typeId}`} className='text-sm'>
                Oversized
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

