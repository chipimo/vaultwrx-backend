'use client';

import { UseFormReturn } from 'react-hook-form';
import CasketFormSection from './components/casket-form-section';
import { OrderExtras } from '../components/order-extras';
import { DeliverySection } from '../components/delivery-section';
import { AttachmentsSection } from '../components/attachments-section';
import { CommentsSection } from '../components/comments-section';

interface CasketFormProps {
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

export const CasketForm = ({
  typeId,
  productType,
  form,
  isLoading,
  isLoadingData,
  files,
  setProductFiles,
  customization,
  setCustomizationChecked
}: CasketFormProps) => {
  return (
    <div className='space-y-6 p-6'>
      {/* Product Selection Section */}
      <CasketFormSection
        typeId={typeId}
        form={form}
        isLoading={isLoading}
        isLoadingData={isLoadingData}
      />

      {/* Order Extras Section */}
      <OrderExtras
        typeId={typeId}
        form={form}
        customization={customization}
        setCustomizationChecked={setCustomizationChecked}
      />

      {/* Delivery Section */}
      <DeliverySection typeId={typeId} form={form} />

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

