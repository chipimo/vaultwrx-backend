'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface CommentsSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
  isLoading: boolean;
  isLoadingData: boolean;
}

export const CommentsSection = ({
  typeId,
  form,
  isLoading,
  isLoadingData
}: CommentsSectionProps) => {
  const commentsValue =
    form.watch('productData')?.[typeId]?.comments || '';
  const commentsLength = commentsValue.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments Or Delivery Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder='Let us know of anything urgent or time sensitive deadlines here'
          className='min-h-24'
          maxLength={1200}
          value={commentsValue}
          onChange={(e) => {
            const currentData = form.getValues('productData') || {};
            form.setValue('productData', {
              ...currentData,
              [typeId]: {
                ...currentData[typeId],
                comments: e.target.value
              }
            });
          }}
          disabled={isLoading || isLoadingData}
        />
        <div className='mt-2 text-right text-xs text-gray-500'>
          {commentsLength}/1200
        </div>
      </CardContent>
    </Card>
  );
};

