'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import {
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconX
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import {
  getProducts,
  type Product
} from '@/services/product-services';

// Alias for clarity
type Casket = Product;

// Placeholder themes data - can be replaced with API data later
const THEMES = [
  { id: 'theme1', name: 'Classic' },
  { id: 'theme2', name: 'Modern' },
  { id: 'theme3', name: 'Traditional' },
  { id: 'theme4', name: 'Elegant' },
  { id: 'theme5', name: 'Heritage' },
];

interface CasketFormSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
  isLoading: boolean;
  isLoadingData: boolean;
}

export default function CasketFormSection({
  typeId,
  form,
  isLoading,
  isLoadingData
}: CasketFormSectionProps) {
  const [caskets, setCaskets] = useState<Casket[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch caskets from backend on mount
  useEffect(() => {
    const fetchCaskets = async () => {
      try {
        const response = await getProducts({
          productType: 'casket',
          pagination: {
            skip: 0,
            take: 100
          }
        });

        if (response.success && response.data) {
          setCaskets(response.data.rows || []);
        } else {
          setCaskets([]);
        }
      } catch (error) {
        setCaskets([]);
      }
    };

    fetchCaskets();
  }, []);

  // Get selected casket
  const selectedCasketId = form.watch('productData')?.[typeId]?.productId;
  const selectedCasket = caskets.find((c) => c.id === selectedCasketId);

  // Filter caskets based on search
  const filteredCaskets = caskets.filter((casket) =>
    casket.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle casket selection
  const handleCasketSelect = (casket: Casket) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        productId: casket.id,
        productName: casket.name
      }
    });
    setOpen(false);
    setSearchQuery('');
  };

  // Handle clearing the selected casket
  const handleClearSelection = () => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        productId: undefined,
        productName: undefined,
        theme: undefined
      }
    });
  };

  return (
    <div className='px-2 py-2'>
      {/* Choose A Casket Section */}
      <div className='border border-border p-2 px-5 pb-4'>
        <div className='mb-3 text-sm font-semibold text-foreground'>Choose A Casket</div>
        
        {/* Search Casket Inventory with Dropdown */}
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
                  {selectedCasket
                    ? selectedCasket.name
                    : 'Search Casket Inventory'}
                </span>
              </div>
              <IconChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[400px] p-0' align='start'>
            <Command>
              <CommandInput
                placeholder='Search Casket Inventory'
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No casket found.</CommandEmpty>
                <CommandGroup>
                  {filteredCaskets.map((casket) => {
                    const isSelected = selectedCasketId === casket.id;
                    return (
                      <CommandItem
                        key={casket.id}
                        value={casket.name}
                        onSelect={() => handleCasketSelect(casket)}
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
                          {casket.photo_url && (
                            <Image
                              src={casket.photo_url}
                              alt={casket.name}
                              width={16}
                              height={16}
                              className='h-6 w-6 rounded object-cover'
                            />
                          )}
                          <div className='flex flex-col'>
                            <span>{casket.name}</span>
                            {casket.description && (
                              <span className='text-xs text-muted-foreground'>
                                {casket.description}
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

        {/* Product Details Section */}
        {selectedCasket && (
          <div className='mt-3 flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              {/* Product Image */}
              <div className='flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted'>
                {selectedCasket.photo_url ? (
                  <Image
                    src={selectedCasket.photo_url}
                    alt={selectedCasket.name}
                    width={64}
                    height={64}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <span className='text-[10px] text-muted-foreground'>Casket Image</span>
                )}
              </div>
              
              {/* Product Name */}
              <div>
                <Label className='text-xs text-muted-foreground'>Product Name</Label>
                <p className='text-sm font-medium text-foreground'>
                  {selectedCasket.name}
                </p>
              </div>
            </div>

            {/* Theme Dropdown and X Button */}
            <div className='flex items-center gap-4'>
              {/* Theme Dropdown */}
              <FormField
                control={form.control}
                name={`productData.${typeId}.theme` as any}
                render={() => (
                  <FormItem className='flex items-center gap-3 border-b border-input pb-1'>
                    <FormLabel className='text-sm whitespace-nowrap text-muted-foreground'>
                      Theme
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentData = form.getValues('productData') || {};
                        form.setValue('productData', {
                          ...currentData,
                          [typeId]: {
                            ...currentData[typeId],
                            theme: value
                          }
                        });
                      }}
                      value={form.watch('productData')?.[typeId]?.theme || ''}
                      disabled={isLoading || isLoadingData}
                    >
                      <FormControl>
                        <SelectTrigger className='h-8 w-[140px] border-0 bg-transparent shadow-none focus:ring-0'>
                          <SelectValue placeholder='Select theme' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {THEMES.map((theme) => (
                          <SelectItem key={theme.id} value={theme.name}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Clear Selection Button */}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                onClick={handleClearSelection}
                disabled={isLoading || isLoadingData}
              >
                <IconX className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
