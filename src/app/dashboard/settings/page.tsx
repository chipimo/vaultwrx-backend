import PageContainer from '@/components/layout/page-container';
import { SettingsViewPage } from '@/features/settings';

export const metadata = {
  title: 'Dashboard : Settings'
};

export default function SettingsPage() {
  return (
    <div className='-mt-4 rounded-tr-xl bg-gray-50 p-2 dark:bg-background'>
      <PageContainer scrollable>
        <div className='flex flex-1 flex-col'>
          <div className='mx-auto w-full max-w-6xl px-2 sm:px-4 lg:px-6'>
            <SettingsViewPage />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
