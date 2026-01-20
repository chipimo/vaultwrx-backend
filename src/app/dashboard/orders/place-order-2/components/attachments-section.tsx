'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
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
        />
        <p className='text-center text-xs text-gray-500'>
          Accepts .gif, .jpg, .png and .pdf
        </p>
        {files.length > 0 && (
          <div className='space-y-2'>
            {files.map((file, index) => (
              <div
                key={index}
                className='flex items-center justify-between rounded-lg border border-gray-200 p-2'
              >
                <div className='flex items-center gap-2'>
                  <IconFile className='h-4 w-4 text-gray-400' />
                  <span className='text-sm text-gray-700'>{file.name}</span>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={() => {
                    const newFiles = files.filter((_, i) => i !== index);
                    setProductFiles((prev) => ({
                      ...prev,
                      [typeId]: newFiles
                    }));
                  }}
                >
                  <IconTrash className='h-4 w-4 text-gray-400' />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

