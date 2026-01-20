'use client';

import { UseFormReturn } from 'react-hook-form';
import UrnFormSection from './components/urn-form-section';
import { UrnEngraving } from '../components/urn-engraving';
import { UrnOrderExtras } from '../components/urn-order-extras';
import { UrnDeliverySection } from '../components/urn-delivery-section';
import { AttachmentsSection } from '../components/attachments-section';
import { CommentsSection } from '../components/comments-section';

interface UrnsFormProps {
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

export const UrnsForm = ({
  typeId,
  productType,
  form,
  isLoading,
  isLoadingData,
  files,
  setProductFiles,
  customization,
  setCustomizationChecked
}: UrnsFormProps) => {
  return (
    <div className='space-y-4 p-6'>
      {/* Choose An Urn Section */}
      <UrnFormSection
        typeId={typeId}
        form={form}
        isLoading={isLoading}
        isLoadingData={isLoadingData}
      />

      {/* Engraving Section */}
      <UrnEngraving typeId={typeId} form={form} />

      {/* Order Extras Section */}
      <UrnOrderExtras
        typeId={typeId}
        form={form}
        customization={customization}
        setCustomizationChecked={setCustomizationChecked}
      />

      {/* Delivery Location Section */}
      <UrnDeliverySection typeId={typeId} form={form} />

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
