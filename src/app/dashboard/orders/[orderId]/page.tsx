import { Suspense } from 'react';
import OrderDetailView from './order-detail-view';
import FormCardSkeleton from '@/components/form-card-skeleton';

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage(props: PageProps) {
  const params = await props.params;
  return (
    <Suspense fallback={<FormCardSkeleton />}>
      <OrderDetailView orderId={params.orderId} />
    </Suspense>
  );
}
