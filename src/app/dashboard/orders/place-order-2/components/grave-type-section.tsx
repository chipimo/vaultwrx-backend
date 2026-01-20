'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';

interface GraveTypeSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
}

export const GraveTypeSection = ({ typeId, form }: GraveTypeSectionProps) => {
  const graveType = form.watch('productData')?.[typeId]?.graveType || 'traditional';
  const graveOpeningAndClosing = form.watch('productData')?.[typeId]?.graveOpeningAndClosing || false;
  const graveOpeningOnly = form.watch('productData')?.[typeId]?.graveOpeningOnly || false;
  const graveClosingOnly = form.watch('productData')?.[typeId]?.graveClosingOnly || false;

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
        <div className='text-sm font-semibold text-foreground'>Grave Type</div>
        
        {/* Traditional / Cremation Radio Buttons */}
        <div className='flex gap-8'>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              id={`grave-type-traditional-${typeId}`}
              name={`grave-type-${typeId}`}
              value='traditional'
              className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
              checked={graveType === 'traditional'}
              onChange={() => updateFormField('graveType', 'traditional')}
            />
            <Label htmlFor={`grave-type-traditional-${typeId}`} className='text-sm'>
              Traditional
            </Label>
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              id={`grave-type-cremation-${typeId}`}
              name={`grave-type-${typeId}`}
              value='cremation'
              className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
              checked={graveType === 'cremation'}
              onChange={() => updateFormField('graveType', 'cremation')}
            />
            <Label htmlFor={`grave-type-cremation-${typeId}`} className='text-sm'>
              Cremation
            </Label>
          </div>
        </div>

        {/* Opening/Closing Checkboxes */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id={`grave-opening-closing-${typeId}`}
              checked={graveOpeningAndClosing}
              onCheckedChange={(checked) => updateFormField('graveOpeningAndClosing', checked)}
            />
            <Label htmlFor={`grave-opening-closing-${typeId}`} className='text-sm'>
              Grave Opening And Closing
            </Label>
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox
              id={`grave-opening-only-${typeId}`}
              checked={graveOpeningOnly}
              onCheckedChange={(checked) => updateFormField('graveOpeningOnly', checked)}
            />
            <Label htmlFor={`grave-opening-only-${typeId}`} className='text-sm'>
              Grave Opening Only
            </Label>
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox
              id={`grave-closing-only-${typeId}`}
              checked={graveClosingOnly}
              onCheckedChange={(checked) => updateFormField('graveClosingOnly', checked)}
            />
            <Label htmlFor={`grave-closing-only-${typeId}`} className='text-sm'>
              Grave Closing Only
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

