'use client';

import { UseFormReturn } from 'react-hook-form';
import { OrderExtras } from '../components/order-extras';
import { FuneralServiceSection } from './components/funeral-service-section';
import { DeliverySection } from '../components/delivery-section';
import { AttachmentsSection } from '../components/attachments-section';
import { CommentsSection } from '../components/comments-section';
import VaultFormSection from './components/vault-form-section';

interface VaultsFormProps {
  typeId: string;
  productType: { id: string; label: string; backendId: string } | undefined;
  form: UseFormReturn<any>;
  isLoading: boolean;
  isLoadingData: boolean;
  files: File[];
  setProductFiles: React.Dispatch<React.SetStateAction<Record<string, File[]>>>;
  customization: boolean;
  setCustomizationChecked: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export const VaultsForm = ({
  typeId,
  form,
  isLoading,
  isLoadingData,
  files,
  setProductFiles,
  customization,
  setCustomizationChecked
}: VaultsFormProps) => {
  return (
    <div className='space-y-3 p-2'>
      {/* Product Selection Section */}
      <VaultFormSection
        typeId={typeId}
        form={form}
        isLoading={isLoading}
        isLoadingData={isLoadingData}
      />

      {/* Funeral Service Details Section */}
      <FuneralServiceSection
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
