'use client';

import { useState, useEffect } from 'react';
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
import {
  IconCheck,
  IconChevronDown,
  IconSearch
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { UseFormReturn } from 'react-hook-form';
import {
  getProducts,
  type Product
} from '@/services/product-services';

// Alias for clarity
type Monument = Product;

interface MonumentFormSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
  isLoading: boolean;
  isLoadingData: boolean;
}

export default function MonumentFormSection({
  typeId,
  form,
  isLoading,
  isLoadingData
}: MonumentFormSectionProps) {
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch monuments from backend on mount
  useEffect(() => {
    const fetchMonuments = async () => {
      try {
        const response = await getProducts({
          productType: 'monument',
          pagination: {
            skip: 0,
            take: 100
          }
        });

        if (response.success && response.data) {
          setMonuments(response.data.rows || []);
        } else {
          setMonuments([]);
        }
      } catch (error) {
        setMonuments([]);
      }
    };

    fetchMonuments();
  }, []);

  // Get selected monument
  const selectedMonumentId = form.watch('productData')?.[typeId]?.productId;
  const selectedMonument = monuments.find((m) => m.id === selectedMonumentId);

  // Filter monuments based on search
  const filteredMonuments = monuments.filter((monument) =>
    monument.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle monument selection
  const handleMonumentSelect = (monument: Monument) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        productId: monument.id,
        productName: monument.name
      }
    });
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className='border border-border p-4 px-5'>
      <div className='mb-3 text-sm font-semibold text-foreground'>Choose A Monument</div>
      
      {/* Search Monument with Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            role='combobox'
            aria-expanded={open}
            className='h-9 w-full justify-between rounded-none border-0 border-b border-input bg-transparent px-0 font-normal hover:bg-transparent'
            disabled={isLoading || isLoadingData}
          >
            <div className='flex items-center gap-2'>
              <IconSearch className='h-4 w-4 shrink-0 text-muted-foreground' />
              <span className='truncate text-foreground'>
                {selectedMonument
                  ? selectedMonument.name
                  : 'Search Monuments'}
              </span>
            </div>
            <IconChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[400px] p-0' align='start'>
          <Command>
            <CommandInput
              placeholder='Search Monuments'
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No monument found.</CommandEmpty>
              <CommandGroup>
                {filteredMonuments.map((monument) => {
                  const isSelected = selectedMonumentId === monument.id;
                  return (
                    <CommandItem
                      key={monument.id}
                      value={monument.name}
                      onSelect={() => handleMonumentSelect(monument)}
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
                      <div className='flex flex-1 items-center gap-2'>
                        {monument.photo_url && (
                          <Image
                            src={monument.photo_url}
                            alt={monument.name}
                            width={16}
                            height={16}
                            className='h-6 w-6 rounded object-cover'
                          />
                        )}
                        <div className='flex flex-col'>
                          <span>{monument.name}</span>
                          {monument.description && (
                            <span className='text-xs text-muted-foreground'>
                              {monument.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}


