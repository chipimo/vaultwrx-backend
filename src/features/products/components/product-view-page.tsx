import { fakeProducts, Product } from '@/constants/mock-api';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';

type TProductViewPageProps = {
  productId: string;
};

export default async function ProductViewPage({
  productId
}: TProductViewPageProps) {
  let product: Product | null = null;
  let pageTitle = 'Add Product';
  let variants: Product[] = [];

  if (productId !== 'new') {
    const data = await fakeProducts.getProductById(Number(productId));
    product = data.product as Product;
    if (!product) {
      notFound();
    }
    pageTitle = `Edit Product`;

    // If this is a parent product, collect its variant children so the form can display them.
    if (!(product as any)?.parent_id) {
      variants = fakeProducts.records.filter(
        (p) => (p as any)?.parent_id === (product as any)?.id
      );
    }
  }

  return (
    <ProductForm
      initialData={product}
      initialVariants={variants}
      pageTitle={pageTitle}
    />
  );
}
