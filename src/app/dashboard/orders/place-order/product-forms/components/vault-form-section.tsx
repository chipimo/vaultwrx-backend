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
  getColors,
  getEmblems,
  type Product,
  type ProductColor,
  type ProductEmblem
} from '@/services/product-services';

// Alias for backward compatibility
type Vault = Product;

interface VaultFormSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
  isLoading: boolean;
  isLoadingData: boolean;
}

export default function VaultFormSection({
  typeId,
  form,
  isLoading,
  isLoadingData
}: VaultFormSectionProps) {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [emblems, setEmblems] = useState<ProductEmblem[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [isLoadingEmblems, setIsLoadingEmblems] = useState(false);
  const [colorsFetched, setColorsFetched] = useState(false);
  const [emblemsFetched, setEmblemsFetched] = useState(false);

  // Fetch vaults from backend on mount
  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const response = await getProducts({
          productType: 'vault',
          pagination: {
            skip: 0,
            take: 100
          }
        });

        if (response.success && response.data) {
          setVaults(response.data.rows || []);
        } else {
          setVaults([]);
        }
      } catch (error) {
        setVaults([]);
      }
    };

    fetchVaults();
  }, []);

  // Fetch colors on demand when dropdown is opened
  const handleColorsDropdownOpen = async (isOpen: boolean) => {
    if (isOpen && !colorsFetched && !isLoadingColors) {
      setIsLoadingColors(true);
      try {
        const response = await getColors();
        if (response.success && response.data) {
          setColors(response.data.rows || []);
        } else {
          setColors([]);
        }
      } catch (error) {
        setColors([]);
      } finally {
        setIsLoadingColors(false);
        setColorsFetched(true);
      }
    }
  };

  // Fetch emblems on demand when dropdown is opened
  const handleEmblemsDropdownOpen = async (isOpen: boolean) => {
    if (isOpen && !emblemsFetched && !isLoadingEmblems) {
      setIsLoadingEmblems(true);
      try {
        const response = await getEmblems();
        if (response.success && response.data) {
          setEmblems(response.data.rows || []);
        } else {
          setEmblems([]);
        }
      } catch (error) {
        setEmblems([]);
      } finally {
        setIsLoadingEmblems(false);
        setEmblemsFetched(true);
      }
    }
  };

  // Get selected vault
  const selectedVaultId = form.watch('productData')?.[typeId]?.productId;
  const selectedVault = vaults.find((v) => v.id === selectedVaultId);

  // Filter vaults based on search
  const filteredVaults = vaults.filter((vault) =>
    vault.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle vault selection
  const handleVaultSelect = (vault: Vault) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        productId: vault.id,
        productName: vault.name
      }
    });
    setOpen(false);
    setSearchQuery('');
  };

  // Handle clearing the selected vault
  const handleClearSelection = () => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        productId: undefined,
        productName: undefined,
        productPaintColorOptions: undefined,
        emblem: undefined
      }
    });
  };

  return (
    <div className='px-2 py-2'>
      {/* Search Vault Inventory with Dropdown */}
      <div className='border border-border p-2 px-5 pb-4'>
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
                  {selectedVault
                    ? selectedVault.name
                    : 'Search Vault Inventory'}
                </span>
              </div>
              <IconChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[400px] p-0' align='start'>
            <Command>
              <CommandInput
                placeholder='Search Vault Inventory'
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No vault found.</CommandEmpty>
                <CommandGroup>
                  {filteredVaults.map((vault) => {
                    const isSelected = selectedVaultId === vault.id;
                    return (
                      <CommandItem
                        key={vault.id}
                        value={vault.name}
                        onSelect={() => handleVaultSelect(vault)}
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
                          {vault.photo_url && (
                            <Image
                              src={vault.photo_url}
                              alt={vault.name}
                              width={16}
                              height={16}
                              className='h-6 w-6 rounded object-cover'
                            />
                          )}
                          <div className='flex flex-col'>
                            <span>{vault.name}</span>
                            {vault.description && (
                              <span className='text-xs text-muted-foreground'>
                                {vault.description}
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
        {selectedVault && (
          <div className='mt-3 flex justify-between gap-4'>
            <div className='flex items-start gap-3'>
              <div className='flex h-30 w-30 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted'>
                {selectedVault.photo_url ? (
                  <Image
                    src={selectedVault.photo_url}
                    alt={selectedVault.name}
                    width={64}
                    height={64}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <span className='text-[10px] text-muted-foreground'>Vault Image</span>
                )}
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>Product Name</Label>
                <p className='text-sm font-medium text-foreground'>
                  {selectedVault.name}
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div className='flex flex-col items-end justify-between'>
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
              <div className='flex-1 space-y-2'>
                {/* Paint Color and Emblem */}
                <div className='grid-row-2 grid gap-2'>
                  <FormField
                    control={form.control}
                    name={
                      `productData.${typeId}.productPaintColorOptions` as any
                    }
                    render={() => (
                      <FormItem className='flex items-center gap-3 border-b border-input pb-1'>
                        <FormLabel className='text-sm whitespace-nowrap text-muted-foreground'>
                          Paint Color
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const currentData =
                              form.getValues('productData') || {};
                            form.setValue('productData', {
                              ...currentData,
                              [typeId]: {
                                ...currentData[typeId],
                                productPaintColorOptions: value
                              }
                            });
                          }}
                          onOpenChange={handleColorsDropdownOpen}
                          value={
                            form.watch('productData')?.[typeId]
                              ?.productPaintColorOptions || ''
                          }
                          disabled={isLoading || isLoadingData}
                        >
                          <FormControl>
                            <SelectTrigger className='h-8 border-0 bg-transparent shadow-none focus:ring-0'>
                              <SelectValue placeholder='Select color' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingColors ? (
                              <SelectItem value='loading' disabled>
                                Loading colors...
                              </SelectItem>
                            ) : colors.length > 0 ? (
                              colors.map((color) => (
                                <SelectItem key={color.id} value={color.name}>
                                  <div className='flex items-center gap-2'>
                                    {color.hex_code && (
                                      <span
                                        className='h-3 w-3 rounded-full border'
                                        style={{
                                          backgroundColor: color.hex_code
                                        }}
                                      />
                                    )}
                                    {color.name}
                                  </div>
                                </SelectItem>
                              ))
                            ) : colorsFetched ? (
                              <SelectItem value='no-colors' disabled>
                                No colors available
                              </SelectItem>
                            ) : (
                              <SelectItem value='click-to-load' disabled>
                                Click to load colors
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`productData.${typeId}.emblem` as any}
                    render={() => (
                      <FormItem className='flex items-center gap-3 border-b border-input pb-1'>
                        <FormLabel className='text-sm whitespace-nowrap text-muted-foreground'>
                          Emblem
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const currentData =
                              form.getValues('productData') || {};
                            form.setValue('productData', {
                              ...currentData,
                              [typeId]: {
                                ...currentData[typeId],
                                emblem: value
                              }
                            });
                          }}
                          onOpenChange={handleEmblemsDropdownOpen}
                          value={
                            form.watch('productData')?.[typeId]?.emblem || ''
                          }
                          disabled={isLoading || isLoadingData}
                        >
                          <FormControl>
                            <SelectTrigger className='h-8 border-0 bg-transparent shadow-none focus:ring-0'>
                              <SelectValue placeholder='Select emblem' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingEmblems ? (
                              <SelectItem value='loading' disabled>
                                Loading emblems...
                              </SelectItem>
                            ) : emblems.length > 0 ? (
                              emblems.map((emblem) => (
                                <SelectItem key={emblem.id} value={emblem.name}>
                                  <div className='flex items-center gap-2'>
                                    {emblem.image_url && (
                                      <Image
                                        src={emblem.image_url}
                                        alt={emblem.name}
                                        width={16}
                                        height={16}
                                        className='h-4 w-4 object-contain'
                                      />
                                    )}
                                    {emblem.name}
                                  </div>
                                </SelectItem>
                              ))
                            ) : emblemsFetched ? (
                              <SelectItem value='no-emblems' disabled>
                                No emblems available
                              </SelectItem>
                            ) : (
                              <SelectItem value='click-to-load' disabled>
                                Click to load emblems
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
