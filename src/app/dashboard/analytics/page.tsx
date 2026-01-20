import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className='-mt-4 rounded-tr-xl bg-gray-50 p-2'>
      <PageContainer scrollable>
        <div className='flex flex-1 flex-col space-y-4'>
          <Heading
            title='ANALYTICS'
            description='View your analytics and insights'
          />
          <div className='mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6'>
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-500'>
                  Analytics dashboard coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
