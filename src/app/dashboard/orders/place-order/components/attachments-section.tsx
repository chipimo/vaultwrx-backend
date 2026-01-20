'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/file-uploader';
import { IconFile, IconTrash } from '@tabler/icons-react';

interface AttachmentsSectionProps {
  typeId: string;
  files: File[];
  setProductFiles: React.Dispatch<
    React.SetStateAction<Record<string, File[]>>
  >;
}

export const AttachmentsSection = ({
  typeId,
  files,
  setProductFiles
}: AttachmentsSectionProps) => {
  return (
    <Card className='rounded-none shadow-none'>
      <CardContent className='space-y-2 px-4 py-2'>
      <div className='text-sm font-semibold text-foreground'>Attachments</div>
        <FileUploader
          value={files}
          onValueChange={(newFiles) => {
            setProductFiles((prev) => ({
              ...prev,
              [typeId]: Array.isArray(newFiles)
                ? newFiles
                : typeof newFiles === 'function'
                  ? newFiles(prev[typeId] || [])
                  : []
            }));
          }}
          accept={{
            'image/*': ['.gif', '.jpg', '.png'],
            'application/pdf': ['.pdf']
          }}
          multiple
          maxFiles={10}
          className='h-14'
        />
        <p className='text-center text-[10px] text-muted-foreground'>
          Accepts .gif, .jpg, .png and .pdf
        </p>
        {files.length > 0 && (
          <div className='space-y-1'>
            {files.map((file, index) => (
              <div
                key={index}
                className='flex items-center justify-between rounded border border-border px-2 py-1'
              >
                <div className='flex items-center gap-2'>
                  <IconFile className='h-3.5 w-3.5 text-muted-foreground' />
                  <span className='text-xs text-foreground'>{file.name}</span>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-5 w-5'
                  onClick={() => {
                    const newFiles = files.filter((_, i) => i !== index);
                    setProductFiles((prev) => ({
                      ...prev,
                      [typeId]: newFiles
                    }));
                  }}
                >
                  <IconTrash className='h-3.5 w-3.5 text-muted-foreground' />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

