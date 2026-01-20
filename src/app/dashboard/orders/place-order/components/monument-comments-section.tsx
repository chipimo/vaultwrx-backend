'use client';

import { Card, CardContent } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';

interface MonumentCommentsSectionProps {
  typeId: string;
  form: UseFormReturn<any>;
}

const MAX_COMMENT_LENGTH = 1200;

export const MonumentCommentsSection = ({ typeId, form }: MonumentCommentsSectionProps) => {
  const comments = form.watch('productData')?.[typeId]?.comments || '';
  const commentsLength = comments.length;

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
        <div className='text-sm font-semibold text-foreground'>Comments Or Delivery Instructions</div>
        
        {/* Comments Textarea */}
        <div>
          <textarea
            placeholder='Let us know of anything urgent or time sensitive deadlines here'
            className='w-full min-h-[80px] rounded-none border-0 border-b border-input bg-transparent px-0 text-sm shadow-none resize-none focus:outline-none focus:ring-0'
            value={comments}
            onChange={(e) => updateFormField('comments', e.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
          />
          <div className='mt-1 text-right'>
            <span className='text-xs text-muted-foreground'>
              {commentsLength}/{MAX_COMMENT_LENGTH}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


