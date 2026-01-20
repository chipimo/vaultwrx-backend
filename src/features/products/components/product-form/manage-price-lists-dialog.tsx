'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PriceListEntry } from '@/types/catalog';

type ManagePriceListsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: PriceListEntry[];
  onChange: (next: PriceListEntry[]) => void;
};

export function ManagePriceListsDialog({
  open,
  onOpenChange,
  value,
  onChange
}: ManagePriceListsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Price Lists</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='flex items-center justify-between gap-2'>
            <div className='text-muted-foreground text-sm'>
              Select which retailer price lists apply and set their prices.
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                const allSelected = value.every((p) => p.include);
                onChange(value.map((p) => ({ ...p, include: !allSelected })));
              }}
            >
              Toggle all
            </Button>
          </div>

          <div className='rounded-md border'>
            <div className='grid grid-cols-12 gap-3 border-b px-3 py-2 text-sm font-medium'>
              <div className='col-span-7'>Price List</div>
              <div className='col-span-5 text-right'>Price</div>
            </div>
            <div className='divide-y'>
              {value.map((pl, idx) => (
                <div key={pl.id} className='grid grid-cols-12 items-center gap-3 px-3 py-2'>
                  <div className='col-span-7'>
                    <div className='flex items-center gap-3'>
                      <Checkbox
                        checked={pl.include}
                        onCheckedChange={(checked) => {
                          const next = [...value];
                          next[idx] = { ...next[idx], include: !!checked };
                          onChange(next);
                        }}
                      />
                      <div className='min-w-0'>
                        <div className='truncate text-sm'>{pl.name}</div>
                        <div className='text-muted-foreground truncate text-xs'>
                          {pl.id}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-span-5'>
                    <Input
                      type='text'
                      inputMode='decimal'
                      placeholder='0.00'
                      className='text-right'
                      value={
                        pl.price === null ||
                        pl.price === undefined ||
                        !Number.isFinite(Number(pl.price))
                          ? ''
                          : String(pl.price)
                      }
                      onChange={(e) => {
                        const normalized = e.currentTarget.value.replace(/[^0-9.]/g, '');
                        const nextPrice =
                          normalized.trim() === '' ? 0 : Number.parseFloat(normalized);
                        const next = [...value];
                        next[idx] = {
                          ...next[idx],
                          price: Number.isFinite(nextPrice) ? nextPrice : 0
                        };
                        onChange(next);
                      }}
                      disabled={!pl.include}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-end'>
            <Button type='button' onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


