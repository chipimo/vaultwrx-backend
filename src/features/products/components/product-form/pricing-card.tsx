'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { IconChevronDown, IconX } from '@tabler/icons-react';
import { ManagePriceListsDialog } from '@/features/products/components/product-form/manage-price-lists-dialog';
import { Button } from '@/components/ui/button';
import type { PriceListEntry } from '@/types/catalog';

type PricingCardProps = {
  form: any;
  priceListOpen: boolean;
  setPriceListOpen: (open: boolean) => void;
};

export function PricingCard({
  form,
  priceListOpen,
  setPriceListOpen
}: PricingCardProps) {
  const [manageOpen, setManageOpen] = React.useState(false);
  const priceListValue = (form.watch('priceLists') ?? []) as PriceListEntry[];
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Pricing</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={form.control}
          name='standardPrice'
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Standard Price</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  inputMode='decimal'
                  placeholder='0.00'
                  className='rounded-none border-0 border-b px-0 focus-visible:ring-0'
                  value={
                    field.value === null ||
                    field.value === undefined ||
                    !Number.isFinite(Number(field.value))
                      ? ''
                      : String(field.value)
                  }
                  onChange={(e) => {
                    const raw = e.currentTarget.value;
                    const normalized = raw.replace(/[^0-9.]/g, '');
                    // allow user to type freely; commit numeric value to form state
                    const next =
                      normalized.trim() === '' ? 0 : Number.parseFloat(normalized);
                    field.onChange(Number.isFinite(next) ? next : 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-1'>
          <div className='flex items-center justify-between gap-2'>
            <div className='text-muted-foreground text-sm'>Add to Price Lists</div>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-7 px-2'
              onClick={() => setManageOpen(true)}
            >
              Manage
            </Button>
          </div>
          <Popover open={priceListOpen} onOpenChange={setPriceListOpen}>
            <PopoverTrigger asChild>
              <div className='w-full'>
                <button
                  type='button'
                  className='text-muted-foreground hover:text-foreground flex h-9 w-full items-center justify-between rounded-none border-0 border-b px-0 text-left text-sm focus-visible:ring-0'
                >
                  <span className='truncate'>
                    {(() => {
                      const count = form
                        .watch('priceLists')
                        .filter((p: any) => p.include).length;
                      return count > 0 ? `${count} price list(s) selected` : '';
                    })()}
                  </span>
                  <IconChevronDown className='h-4 w-4 opacity-50' />
                </button>
              </div>
            </PopoverTrigger>

            <PopoverContent className='w-[520px]'>
              <div className='space-y-3'>
                <div className='-mt-1 -mr-1 flex items-center justify-end'>
                  <button
                    type='button'
                    onClick={() => setPriceListOpen(false)}
                    aria-label='Close'
                    className='text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded-md'
                  >
                    <IconX className='h-4 w-4' />
                  </button>
                </div>

                <div className='grid grid-cols-12 items-center gap-3'>
                  <div className='col-span-8'>
                    <div className='flex items-center gap-3'>
                      <Checkbox
                        checked={form.watch('priceLists').every((p: any) => p.include)}
                        onCheckedChange={(checked) => {
                          const next = form.watch('priceLists').map((p: any) => ({
                            ...p,
                            include: !!checked
                          }));
                          form.setValue('priceLists', next, { shouldDirty: true });
                        }}
                      />
                      <span className='text-sm font-medium'>Select all Price Lists</span>
                    </div>
                  </div>
                  <div className='text-muted-foreground col-span-4 text-right text-sm'>
                    Edit Standard Price
                  </div>
                </div>

                <div className='space-y-2'>
                  {form.watch('priceLists').map((pl: any, idx: number) => (
                    <div key={pl.id} className='grid grid-cols-12 items-center gap-3'>
                      <div className='col-span-8'>
                        <div className='flex items-center gap-3'>
                          <Checkbox
                            checked={pl.include}
                            onCheckedChange={(checked) => {
                              const next = [...form.watch('priceLists')];
                              next[idx] = { ...next[idx], include: !!checked };
                              form.setValue('priceLists', next, { shouldDirty: true });
                            }}
                          />
                          <span className='text-sm'>{pl.name}</span>
                        </div>
                      </div>
                      <div className='col-span-4'>
                        <Input
                          type='text'
                          inputMode='decimal'
                          placeholder='0.00'
                          className='rounded-none border-0 border-b px-0 text-right focus-visible:ring-0'
                          value={
                            pl.price === null ||
                            pl.price === undefined ||
                            !Number.isFinite(Number(pl.price))
                              ? ''
                              : String(pl.price)
                          }
                          onChange={(e) => {
                            const raw = e.currentTarget.value;
                            const normalized = raw.replace(/[^0-9.]/g, '');
                            const next = [...form.watch('priceLists')];
                            next[idx] = {
                              ...next[idx],
                              price:
                                normalized.trim() === ''
                                  ? 0
                                  : Number.parseFloat(normalized)
                            };
                            form.setValue('priceLists', next, { shouldDirty: true });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <ManagePriceListsDialog
          open={manageOpen}
          onOpenChange={setManageOpen}
          value={priceListValue}
          onChange={(next) => form.setValue('priceLists', next, { shouldDirty: true })}
        />

        {form.watch('priceLists').some((p: any) => p.include) && (
          <div className='flex flex-wrap items-center gap-2'>
            {form
              .watch('priceLists')
              .filter((p: any) => p.include)
              .map((pl: any) => (
                <span
                  key={pl.id}
                  className='bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs'
                >
                  <span className='font-medium'>{pl.name}</span>
                  <span className='text-muted-foreground'>
                    {Number.isFinite(pl.price) ? pl.price : 0}
                  </span>
                  <button
                    type='button'
                    className='text-muted-foreground hover:text-foreground'
                    aria-label={`Remove ${pl.name}`}
                    onClick={() => {
                      const next = [...form.watch('priceLists')];
                      const i = next.findIndex((x: any) => x.id === pl.id);
                      if (i !== -1) {
                        next[i] = { ...next[i], include: false };
                        form.setValue('priceLists', next, { shouldDirty: true });
                      }
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


