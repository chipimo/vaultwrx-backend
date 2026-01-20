'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { LocationWithQty } from '@/types/catalog';

type ManageLocationsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: LocationWithQty[];
  onChange: (next: LocationWithQty[]) => void;
};

export function ManageLocationsDialog({
  open,
  onOpenChange,
  value,
  onChange
}: ManageLocationsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Locations</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='text-muted-foreground text-sm'>
            Dummy locations loaded from the API. You can edit quantities here; later
            you can wire this up to your backend.
          </div>

          <div className='rounded-md border'>
            <div className='grid grid-cols-12 gap-3 border-b px-3 py-2 text-sm font-medium'>
              <div className='col-span-7'>Location</div>
              <div className='col-span-5 text-right'>Quantity</div>
            </div>
            <div className='divide-y'>
              {value.map((loc, idx) => (
                <div key={loc.id} className='grid grid-cols-12 items-center gap-3 px-3 py-2'>
                  <div className='col-span-7'>
                    <div className='min-w-0'>
                      <div className='truncate text-sm'>{loc.name}</div>
                      <div className='text-muted-foreground truncate text-xs'>
                        {loc.id}
                      </div>
                    </div>
                  </div>
                  <div className='col-span-5'>
                    <Input
                      type='text'
                      inputMode='numeric'
                      className='text-right'
                      value={Number.isFinite(loc.qty) ? String(loc.qty) : '0'}
                      onChange={(e) => {
                        const raw = e.currentTarget.value.replace(/[^0-9]/g, '');
                        const nextQty = raw === '' ? 0 : parseInt(raw, 10);
                        const next = [...value];
                        next[idx] = { ...next[idx], qty: Number.isFinite(nextQty) ? nextQty : 0 };
                        onChange(next);
                      }}
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


