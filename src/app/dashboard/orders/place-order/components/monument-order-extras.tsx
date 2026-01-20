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
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

// Placeholder extras data - can be replaced with API data later
const EXTRAS_OPTIONS = [
  { id: 'extra1', name: 'Premium Finish', description: 'High-quality finish coating' },
  { id: 'extra2', name: 'Custom Engraving', description: 'Personalized text engraving' },
  { id: 'extra3', name: 'Base Upgrade', description: 'Premium granite base' },
  { id: 'extra4', name: 'Photo Ceramic', description: 'Ceramic photo attachment' },
  { id: 'extra5', name: 'Bronze Vase', description: 'Decorative bronze vase' },
];

interface MonumentOrderExtrasProps {
  typeId: string;
  form: UseFormReturn<any>;
}

export const MonumentOrderExtras = ({ typeId, form }: MonumentOrderExtrasProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get selected extra
  const selectedExtraId = form.watch('productData')?.[typeId]?.extras;
  const selectedExtra = EXTRAS_OPTIONS.find((e) => e.id === selectedExtraId);

  // Filter extras based on search
  const filteredExtras = EXTRAS_OPTIONS.filter((extra) =>
    extra.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle extra selection
  const handleExtraSelect = (extra: typeof EXTRAS_OPTIONS[0]) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        extras: extra.id
      }
    });
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Card className='rounded-none shadow-none'>
      <CardContent className='space-y-3 px-4 py-3'>
        <div className='text-sm font-semibold text-foreground'>Order Extras</div>
        
        {/* Searchable Extras Dropdown */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              role='combobox'
              aria-expanded={open}
              className='h-9 w-full justify-between rounded-none border-0 border-b border-input bg-transparent px-0 font-normal hover:bg-transparent'
            >
              <span className='truncate text-muted-foreground'>
                {selectedExtra ? selectedExtra.name : 'Add Extras'}
              </span>
              <IconChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[400px] p-0' align='start'>
            <Command>
              <CommandInput
                placeholder='Search extras...'
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No extras found.</CommandEmpty>
                <CommandGroup>
                  {filteredExtras.map((extra) => {
                    const isSelected = selectedExtraId === extra.id;
                    return (
                      <CommandItem
                        key={extra.id}
                        value={extra.name}
                        onSelect={() => handleExtraSelect(extra)}
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
                          <span>{extra.name}</span>
                          {extra.description && (
                            <span className='text-xs text-muted-foreground'>
                              {extra.description}
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
      </CardContent>
    </Card>
  );
};


