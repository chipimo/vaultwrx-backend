import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Dashboard: Product Transfers'
};

export default async function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Transfers'
            description='Manage inventory transfers between locations. (Coming soon)'
          />
        </div>
        <Separator />
        <div className='text-muted-foreground text-sm'>
          This page is a placeholder. Implement transfers management here.
        </div>
      </div>
    </PageContainer>
  );
}


