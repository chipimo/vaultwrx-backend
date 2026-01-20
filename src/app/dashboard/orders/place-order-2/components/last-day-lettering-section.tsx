'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';

interface LastDayLetteringSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
}

export const LastDayLetteringSection = ({ typeId, form }: LastDayLetteringSectionProps) => {
  const lastDayLettering = form.watch('productData')?.[typeId]?.lastDayLettering;
  const proceedToChooseProduct = lastDayLettering === false || lastDayLettering === undefined ? true : !lastDayLettering;

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
      <CardContent className='space-y-4 px-4 py-3'>
        <div className='text-sm font-semibold text-foreground'>Last Day Lettering</div>
        
        {/* Yes / No Checkboxes */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id={`last-day-lettering-yes-${typeId}`}
              checked={lastDayLettering === true}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateFormField('lastDayLettering', true);
                }
              }}
            />
            <Label htmlFor={`last-day-lettering-yes-${typeId}`} className='text-sm'>
              Yes
            </Label>
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox
              id={`last-day-lettering-no-${typeId}`}
              checked={lastDayLettering === false || lastDayLettering === undefined}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateFormField('lastDayLettering', false);
                }
              }}
            />
            <Label htmlFor={`last-day-lettering-no-${typeId}`} className='text-sm'>
              No, Proceed To Choose Product
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


