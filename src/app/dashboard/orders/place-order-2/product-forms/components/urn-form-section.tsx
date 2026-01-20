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
type Urn = Product;

interface UrnFormSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
  isLoading: boolean;
  isLoadingData: boolean;
}

export default function UrnFormSection({
  typeId,
  form,
  isLoading,
  isLoadingData
}: UrnFormSectionProps) {
  const [urns, setUrns] = useState<Urn[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch urns from backend on mount
  useEffect(() => {
    const fetchUrns = async () => {
      try {
        const response = await getProducts({
          productType: 'urn',
          pagination: {
            skip: 0,
            take: 100
          }
        });

        if (response.success && response.data) {
          setUrns(response.data.rows || []);
        } else {
          setUrns([]);
        }
      } catch (error) {
        setUrns([]);
      }
    };

    fetchUrns();
  }, []);

  // Get selected urn
  const selectedUrnId = form.watch('productData')?.[typeId]?.productId;
  const selectedUrn = urns.find((u) => u.id === selectedUrnId);

  // Filter urns based on search
  const filteredUrns = urns.filter((urn) =>
    urn.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle urn selection
  const handleUrnSelect = (urn: Urn) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        productId: urn.id,
        productName: urn.name
      }
    });
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className='border border-border p-4 px-5'>
      <div className='mb-3 text-sm font-semibold text-foreground'>Choose An Urn</div>
      
      {/* Search Urn Inventory with Dropdown */}
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
                {selectedUrn
                  ? selectedUrn.name
                  : 'Search Urn Inventory'}
              </span>
            </div>
            <IconChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[400px] p-0' align='start'>
          <Command>
            <CommandInput
              placeholder='Search Urn Inventory'
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No urn found.</CommandEmpty>
              <CommandGroup>
                {filteredUrns.map((urn) => {
                  const isSelected = selectedUrnId === urn.id;
                  return (
                    <CommandItem
                      key={urn.id}
                      value={urn.name}
                      onSelect={() => handleUrnSelect(urn)}
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
                        {urn.photo_url && (
                          <Image
                            src={urn.photo_url}
                            alt={urn.name}
                            width={16}
                            height={16}
                            className='h-6 w-6 rounded object-cover'
                          />
                        )}
                        <div className='flex flex-col'>
                          <span>{urn.name}</span>
                          {urn.description && (
                            <span className='text-xs text-muted-foreground'>
                              {urn.description}
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

