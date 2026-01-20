'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { IconSearch, IconMapPin, IconLoader2 } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { searchLocations, GeocodingResult } from '@/lib/api-client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';

interface LocationAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (result: GeocodingResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function LocationAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search location...',
  disabled = false,
  className
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(inputValue, 300);

  // Fetch locations when debounced search value changes
  React.useEffect(() => {
    const fetchLocations = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchLocations(debouncedSearch);
        if (response.success && Array.isArray(response.data)) {
          setResults(response.data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [debouncedSearch]);

  // Sync external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(newValue);
      
      if (newValue.length >= 2) {
        setOpen(true);
      }
    },
    [onChange]
  );

  // Build secondary text from address
  const getSecondaryText = (result: GeocodingResult) => {
    const parts = [];
    if (result.address?.city) parts.push(result.address.city);
    if (result.address?.state) parts.push(result.address.state);
    if (result.address?.country) parts.push(result.address.country);
    return parts.join(', ');
  };

  const handleSelect = useCallback(
    (result: GeocodingResult) => {
      // Use name + city, state for a cleaner display
      const parts = [result.name];
      if (result.address?.city) parts.push(result.address.city);
      if (result.address?.state) parts.push(result.address.state);
      const displayValue = parts.join(', ');
      
      setInputValue(displayValue);
      onChange?.(displayValue);
      onSelect?.(result);
      setOpen(false);
    },
    [onChange, onSelect]
  );

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('relative', className)}>
          <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={placeholder}
            className='pl-9 rounded-none border-r-0 border-l-0 border-t-0 border-b border-input outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            disabled={disabled}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (inputValue.length >= 2) {
                setOpen(true);
              }
            }}
          />
          {isLoading && (
            <IconLoader2 className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin' />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {isLoading ? (
              <div className='py-6 text-center text-sm text-muted-foreground'>
                Searching...
              </div>
            ) : !Array.isArray(results) || results.length === 0 ? (
              <CommandEmpty>
                {inputValue.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No locations found'}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((result) => {
                  const secondaryText = getSecondaryText(result);
                  return (
                    <CommandItem
                      key={result.placeId}
                      value={result.placeId}
                      onSelect={() => handleSelect(result)}
                      className='cursor-pointer'
                    >
                      <IconMapPin className='mr-2 h-4 w-4 text-muted-foreground flex-shrink-0' />
                      <div className='flex flex-col overflow-hidden'>
                        <span className='font-medium truncate'>
                          {result.name}
                        </span>
                        {secondaryText && (
                          <span className='text-xs text-muted-foreground truncate'>
                            {secondaryText}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

