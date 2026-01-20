'use client';

import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';

type ProductFormHeaderProps = {
  pageTitle: string;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
};

export function ProductFormHeader({
  pageTitle,
  isSaving,
  onBack,
  onSave
}: ProductFormHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={onBack}
          className='text-muted-foreground hover:text-foreground rounded p-1'
          aria-label='Back to product list'
        >
          <IconArrowLeft className='h-5 w-5' />
        </button>
        <h1 className='text-muted-foreground text-sm'>
          {(pageTitle || 'Add Product').toUpperCase()}
        </h1>
      </div>
      <Button onClick={onSave} type='button' disabled={isSaving}>
        {isSaving ? (
          <span className='inline-flex items-center gap-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Saving...
          </span>
        ) : (
          'Save'
        )}
      </Button>
    </div>
  );
}


