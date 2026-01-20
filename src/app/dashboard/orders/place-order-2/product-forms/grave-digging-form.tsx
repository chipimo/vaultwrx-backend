'use client';

import { UseFormReturn } from 'react-hook-form';
import { GraveTypeSection } from '../components/grave-type-section';
import { BurialDetailsSection } from '../components/burial-details-section';
import { AttachmentsSection } from '../components/attachments-section';
import { CommentsSection } from '../components/comments-section';

interface GraveDiggingFormProps {
  typeId: string;
  productType: { id: string; label: string; backendId: string } | undefined;
  form: UseFormReturn<any>;
  isLoading: boolean;
  isLoadingData: boolean;
  files: File[];
  setProductFiles: React.Dispatch<
    React.SetStateAction<Record<string, File[]>>
  >;
  customization: boolean;
  setCustomizationChecked: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export const GraveDiggingForm = ({
  typeId,
  productType,
  form,
  isLoading,
  isLoadingData,
  files,
  setProductFiles,
  customization,
  setCustomizationChecked
}: GraveDiggingFormProps) => {
  return (
    <div className='space-y-4 p-6'>
      {/* Grave Type Section */}
      <GraveTypeSection typeId={typeId} form={form} />

      {/* Burial Details Section */}
      <BurialDetailsSection typeId={typeId} form={form} />

      {/* Attachments Section */}
      <AttachmentsSection
        typeId={typeId}
        files={files}
        setProductFiles={setProductFiles}
      />

      {/* Comments Or Delivery Instructions Section */}
      <CommentsSection
        typeId={typeId}
        form={form}
        isLoading={isLoading}
        isLoadingData={isLoadingData}
      />
    </div>
  );
};
