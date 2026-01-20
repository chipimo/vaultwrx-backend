import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Dashboard: Variant Inventory'
};

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const sp = (await props.searchParams) ?? {};
  const variantParam = sp['variant'];
  const productParam = sp['product'];
  const variant = Array.isArray(variantParam)
    ? variantParam[0]
    : (variantParam ?? '');
  const product = Array.isArray(productParam)
    ? productParam[0]
    : (productParam ?? '');

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Variant Inventory'
            description='Add or adjust inventory for a specific variant. (Coming soon)'
          />
        </div>
        <Separator />
        {(product || variant) && (
          <div className='space-y-1 text-sm'>
            {product ? (
              <div>
                <span className='text-muted-foreground'>Product: </span>
                <span className='font-medium'>{product}</span>
              </div>
            ) : null}
            {variant ? (
              <div>
                <span className='text-muted-foreground'>Variant: </span>
                <span className='font-medium'>{variant}</span>
              </div>
            ) : null}
          </div>
        )}
        <div className='text-muted-foreground text-sm'>
          This page is a placeholder. Implement variant inventory editing here.
        </div>
      </div>
    </PageContainer>
  );
}


