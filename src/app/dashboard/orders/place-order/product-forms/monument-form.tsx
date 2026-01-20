'use client';

import { UseFormReturn } from 'react-hook-form';
import { LastDayLetteringSection } from '../components/last-day-lettering-section';
import MonumentFormSection from './components/monument-form-section';
import { MonumentBurialDetails } from '../components/monument-burial-details';
import { CompletionDateSection } from '../components/completion-date-section';
import { MonumentOrderExtras } from '../components/monument-order-extras';
import { MonumentCommentsSection } from '../components/monument-comments-section';

interface MonumentFormProps {
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

export const MonumentForm = ({
  typeId,
  productType,
  form,
  isLoading,
  isLoadingData,
  files,
  setProductFiles,
  customization,
  setCustomizationChecked
}: MonumentFormProps) => {
  return (
    <div className='space-y-4 p-6'>
      {/* Last Day Lettering Section */}
      <LastDayLetteringSection typeId={typeId} form={form} />

      {/* Choose A Monument Section */}
      <MonumentFormSection
        typeId={typeId}
        form={form}
        isLoading={isLoading}
        isLoadingData={isLoadingData}
      />

      {/* Burial Details Section */}
      <MonumentBurialDetails typeId={typeId} form={form} />

      {/* Completion Date Section */}
      <CompletionDateSection typeId={typeId} form={form} />

      {/* Order Extras Section */}
      <MonumentOrderExtras typeId={typeId} form={form} />

      {/* Comments Or Delivery Instructions Section */}
      <MonumentCommentsSection typeId={typeId} form={form} />
    </div>
  );
};
