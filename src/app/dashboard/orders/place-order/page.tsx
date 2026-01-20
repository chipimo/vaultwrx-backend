import PageContainer from '@/components/layout/page-container';
import React from 'react';
import PlaceOrderForm from './form';

const PlaceOrderPage = () => {
  return (
    <div className='-mt-4 rounded-tr-xl bg-muted p-2'>
      <PageContainer scrollable>
        <div className='mx-auto w-full max-w-7xl'>
          <PlaceOrderForm />
        </div>
      </PageContainer>
    </div>
  );
};

export default PlaceOrderPage;
