'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type VariantEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantName: string;
  productName: string;
  children: React.ReactNode;
  contentClassName?: string;
};

export function VariantEditDialog({
  open,
  onOpenChange,
  variantName,
  productName,
  children,
  contentClassName
}: VariantEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[85vh] flex-col sm:max-w-4xl md:max-w-5xl',
          contentClassName
        )}
      >
        {/* Header is outside the scrollable region so it stays pinned while the modal body scrolls */}
        <DialogHeader className='-mx-6 -mt-6 shrink-0 border-b bg-muted/40 px-12 py-4 text-center shadow-sm backdrop-blur'>
          <DialogTitle className='text-center text-lg font-semibold'>
            {variantName}
          </DialogTitle>
          <div className='text-muted-foreground text-center text-sm'>
            {productName}
          </div>
        </DialogHeader>
        <div className='-mx-6 flex-1 overflow-auto px-6 pb-6 pt-2'>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}


