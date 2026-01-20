'use client';

import { Card, CardContent } from '@/components/ui/card';
import { IconCalendar } from '@tabler/icons-react';
import { UseFormReturn } from 'react-hook-form';

interface CompletionDateSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
}

export const CompletionDateSection = ({ typeId, form }: CompletionDateSectionProps) => {
  const updateFormField = (field: string, value: any) => {
    const currentData = form.getValues('productData') || {};
    form.setValue('productData', {
      ...currentData,
      [typeId]: {
        ...currentData[typeId],
        [field]: value
      }
    });
  };

  return (
    <Card className='rounded-none shadow-none'>
      <CardContent className='space-y-3 px-4 py-3'>
        <div className='text-sm font-semibold text-foreground'>Completion Date</div>
        
        {/* Requested Completion Date */}
        <div className='flex items-center gap-2 border-b border-input pb-1'>
          <span className='text-sm text-muted-foreground whitespace-nowrap flex-1'>
            Requested completion date
          </span>
          <div className='relative'>
            <input
              type='date'
              className='bg-transparent text-sm text-foreground outline-none [&::-webkit-calendar-picker-indicator]:opacity-0'
              value={form.watch('productData')?.[typeId]?.completionDate || ''}
              onChange={(e) => updateFormField('completionDate', e.target.value)}
            />
          </div>
          <IconCalendar className='h-4 w-4 shrink-0 text-muted-foreground' />
        </div>
      </CardContent>
    </Card>
  );
};


