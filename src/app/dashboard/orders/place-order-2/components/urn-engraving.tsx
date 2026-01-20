'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface UrnEngravingProps {
  typeId: string;
  form: UseFormReturn<any>;
}

const MAX_MESSAGE_LENGTH = 1200;

export const UrnEngraving = ({ typeId, form }: UrnEngravingProps) => {
  const message = form.watch('productData')?.[typeId]?.engraving?.message || '';
  const messageLength = message.length;

  return (
    <Card className='rounded-none shadow-none'>
      <CardContent className='space-y-4 px-4 py-3'>
        <div className='text-sm font-semibold text-foreground'>Engraving</div>
        
        {/* Add Engraving Checkbox */}
        <div className='flex items-center gap-2'>
          <Checkbox
            id={`engraving-${typeId}`}
            checked={
              form.watch('productData')?.[typeId]?.engraving?.enabled || false
            }
            onCheckedChange={(checked) => {
              const currentData = form.getValues('productData') || {};
              form.setValue('productData', {
                ...currentData,
                [typeId]: {
                  ...currentData[typeId],
                  engraving: {
                    ...currentData[typeId]?.engraving,
                    enabled: checked as boolean
                  }
                }
              });
            }}
          />
          <Label htmlFor={`engraving-${typeId}`} className='text-sm font-medium'>
            Add Engraving
          </Label>
        </div>

        {form.watch('productData')?.[typeId]?.engraving?.enabled && (
          <div className='space-y-4'>
            {/* Position Radio Buttons */}
            <div className='flex gap-8'>
              <div className='flex items-center gap-2'>
                <input
                  type='radio'
                  id={`engraving-top-${typeId}`}
                  name={`engraving-position-${typeId}`}
                  value='top'
                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
                  checked={
                    form.watch('productData')?.[typeId]?.engraving?.position === 'top'
                  }
                  onChange={(e) => {
                    const currentData = form.getValues('productData') || {};
                    form.setValue('productData', {
                      ...currentData,
                      [typeId]: {
                        ...currentData[typeId],
                        engraving: {
                          ...currentData[typeId]?.engraving,
                          position: e.target.value
                        }
                      }
                    });
                  }}
                />
                <Label htmlFor={`engraving-top-${typeId}`} className='text-sm'>Top</Label>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  type='radio'
                  id={`engraving-front-${typeId}`}
                  name={`engraving-position-${typeId}`}
                  value='front'
                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
                  checked={
                    form.watch('productData')?.[typeId]?.engraving?.position === 'front'
                  }
                  onChange={(e) => {
                    const currentData = form.getValues('productData') || {};
                    form.setValue('productData', {
                      ...currentData,
                      [typeId]: {
                        ...currentData[typeId],
                        engraving: {
                          ...currentData[typeId]?.engraving,
                          position: e.target.value
                        }
                      }
                    });
                  }}
                />
                <Label htmlFor={`engraving-front-${typeId}`} className='text-sm'>Front</Label>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <Input
                placeholder='Type your message here'
                className='rounded-none border-0 border-b border-input bg-transparent px-0 shadow-none focus-visible:ring-0'
                value={message}
                onChange={(e) => {
                  const currentData = form.getValues('productData') || {};
                  form.setValue('productData', {
                    ...currentData,
                    [typeId]: {
                      ...currentData[typeId],
                      engraving: {
                        ...currentData[typeId]?.engraving,
                        message: e.target.value
                      }
                    }
                  });
                }}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <div className='mt-1 text-right'>
                <span className='text-xs text-muted-foreground'>
                  {messageLength}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            {/* Font and Fill Color Row */}
            <div className='grid grid-cols-2 gap-4'>
              {/* Font Dropdown */}
              <div className='border-b border-input pb-1'>
                <Select
                  value={form.watch('productData')?.[typeId]?.engraving?.font || ''}
                  onValueChange={(value) => {
                    const currentData = form.getValues('productData') || {};
                    form.setValue('productData', {
                      ...currentData,
                      [typeId]: {
                        ...currentData[typeId],
                        engraving: {
                          ...currentData[typeId]?.engraving,
                          font: value
                        }
                      }
                    });
                  }}
                >
                  <SelectTrigger className='h-8 w-full border-0 bg-transparent px-0 shadow-none focus:ring-0'>
                    <SelectValue placeholder='Font' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Arial'>Arial</SelectItem>
                    <SelectItem value='Times New Roman'>Times New Roman</SelectItem>
                    <SelectItem value='Helvetica'>Helvetica</SelectItem>
                    <SelectItem value='Georgia'>Georgia</SelectItem>
                    <SelectItem value='Verdana'>Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fill Color Input */}
              <div className='border-b border-input pb-1'>
                <Input
                  placeholder='Fill Color (If Applicable)'
                  className='h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0'
                  value={form.watch('productData')?.[typeId]?.engraving?.fillColor || ''}
                  onChange={(e) => {
                    const currentData = form.getValues('productData') || {};
                    form.setValue('productData', {
                      ...currentData,
                      [typeId]: {
                        ...currentData[typeId],
                        engraving: {
                          ...currentData[typeId]?.engraving,
                          fillColor: e.target.value
                        }
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
