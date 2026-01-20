'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { IconSearch, IconCheck } from '@tabler/icons-react';
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

interface MonumentBurialDetailsProps {
  typeId: string;
  form: UseFormReturn<any>;
}

export const MonumentBurialDetails = ({ typeId, form }: MonumentBurialDetailsProps) => {
  const [cemeteryOpen, setCemeteryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      </CardContent>
    </Card>
  );
};


