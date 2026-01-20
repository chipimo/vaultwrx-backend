import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import React from 'react';
import PlaceOrderForm from './form';

const PlaceOrderPage = () => {
  return (
    <div className='-mt-4 rounded-tr-xl bg-gray-50 p-2'>
      <PageContainer scrollable>
        <div className='flex flex-1 flex-col space-y-4'>
          <Heading title='PLACE ORDER' description='' />
          <div className='mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6'>
            <PlaceOrderForm />
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default PlaceOrderPage;
