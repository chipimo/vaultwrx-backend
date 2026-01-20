'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { IconSearch, IconChevronDown } from '@tabler/icons-react';
import { UseFormReturn } from 'react-hook-form';
import Image from 'next/image';
import {
  getColors,
  getEmblems,
  type ProductColor,
  type ProductEmblem
} from '@/services/product-services';

interface ProductSelectionProps {
  typeId: string;
  productType: { id: string; label: string; backendId: string } | undefined;
  form: UseFormReturn<any>;
  isLoading: boolean;
  isLoadingData: boolean;
}

export const ProductSelection = ({
  typeId,
  productType,
  form,
  isLoading,
  isLoadingData
}: ProductSelectionProps) => {
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [emblems, setEmblems] = useState<ProductEmblem[]>([]);
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [isLoadingEmblems, setIsLoadingEmblems] = useState(false);
  const [colorsFetched, setColorsFetched] = useState(false);
  const [emblemsFetched, setEmblemsFetched] = useState(false);

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
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor={`search-${typeId}`}>
          Search {productType?.label || typeId} Inventory
        </Label>
        <div className='relative'>
          <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <Input
            id={`search-${typeId}`}
            placeholder={`Search ${productType?.label?.toLowerCase() || typeId} inventory`}
            className='pr-9 pl-9'
          />
          <IconChevronDown className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
        </div>
      </div>
      <div className='flex gap-4'>
        <div className='flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-200'>
          <span className='text-xs text-gray-400'>
            {productType?.label || typeId} Image
          </span>
        </div>
        <div className='flex-1 space-y-4'>
          <div>
            <Label className='text-sm text-gray-500'>Product Name</Label>
            <p className='mt-1 text-sm font-medium text-gray-900'>
              Product Name
            </p>
          </div>
          {(typeId === 'vault' ||
            typeId === 'casket' ||
            typeId === 'monument') && (
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name={`productData.${typeId}.productPaintColorOptions` as any}
                render={() => (
                  <FormItem>
                    <FormLabel>Paint Color</FormLabel>
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
                        <SelectTrigger>
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
                                    style={{ backgroundColor: color.hex_code }}
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
                  <FormItem>
                    <FormLabel>Emblem</FormLabel>
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
                        <SelectTrigger>
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
          )}
        </div>
      </div>
    </div>
  );
};

