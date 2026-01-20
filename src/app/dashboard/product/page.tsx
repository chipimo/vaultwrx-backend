import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Button } from '@/components/ui/button';
import { searchParamsCache } from '@/lib/searchparams';
import ProductListingPage from '@/features/products/components/product-listing';
import ProductsListHeader from '@/features/products/components/products-list-header';
import { SearchParams } from 'nuqs/server';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Products'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col gap-4'>
        <ProductsListHeader />

        <div className='flex items-center justify-end gap-2'>
          <Button variant='secondary' size='sm'>
            Export
          </Button>
          <Button
            asChild
            size='sm'
            className='bg-emerald-600 text-white hover:bg-emerald-700'
          >
            <Link href='/dashboard/product/new'>Add Product</Link>
          </Button>
        </div>

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={8} filterCount={0} />
          }
        >
          <ProductListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
