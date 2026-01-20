'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { IconCheck, IconChevronDown, IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

// Placeholder extras data - can be replaced with API data later
const EXTRAS_OPTIONS = [
  { id: 'extra1', name: 'Premium Finish', description: 'High-quality finish coating' },
  { id: 'extra2', name: 'Custom Engraving', description: 'Personalized text engraving' },
  { id: 'extra3', name: 'Decorative Handles', description: 'Ornate handle accessories' },
  { id: 'extra4', name: 'Interior Lining', description: 'Velvet interior upgrade' },
  { id: 'extra5', name: 'Memorial Plaque', description: 'Brass memorial plaque' },
];

interface OrderExtrasProps {
  typeId: string;
  form: UseFormReturn<any>;
  customization: boolean;
  setCustomizationChecked: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export const OrderExtras = ({
  typeId,
  form,
  customization,
  setCustomizationChecked
}: OrderExtrasProps) => {
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
      <CardContent className='space-y-3 px-4 py-2'>
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
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground whitespace-nowrap'>Add Extras</span>
                <span className='truncate text-foreground'>
                  {selectedExtra ? selectedExtra.name : ''}
                </span>
              </div>
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

        <div className='flex items-center justify-between pt-1'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id={`customization-${typeId}`}
              checked={customization}
              onCheckedChange={(checked) => {
                setCustomizationChecked((prev) => ({
                  ...prev,
                  [typeId]: checked as boolean
                }));
                const currentData = form.getValues('productData') || {};
                form.setValue('productData', {
                  ...currentData,
                  [typeId]: {
                    ...currentData[typeId],
                    customization: checked as boolean
                  }
                });
              }}
            />
            <Label
              htmlFor={`customization-${typeId}`}
              className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Add Customization
            </Label>
          </div>
          {customization && (
            <Button variant='link' className='h-auto p-0 text-blue-600'>
              View artwork
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
