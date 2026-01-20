import { Product } from '@/constants/data';
import { fakeProducts } from '@/constants/mock-api';
import { searchParamsCache } from '@/lib/searchparams';
import { ProductTable } from './product-tables';
import { columns } from './product-tables/columns';

type ProductListingPage = {};

export default async function ProductListingPage({}: ProductListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const categories = searchParamsCache.get('category');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories })
  };

  const data = await fakeProducts.getProducts(filters);
  const totalProducts = data.total_products;
  const products: Product[] = data.products;

  // Compute variant counts per parent product so the UI can prevent deleting a parent
  // until all variants are deleted.
  const variantCountByParentId = new Map<number, number>();
  const inventoryTotalByProductId = new Map<number, number>();
  // Use the full store so counts stay correct regardless of pagination/filtering.
  for (const p of fakeProducts.records as any[]) {
    const parentId = Number(p?.parent_id);
    if (Number.isFinite(parentId)) {
      variantCountByParentId.set(
        parentId,
        (variantCountByParentId.get(parentId) ?? 0) + 1
      );
    }

    const id = Number(p?.id);
    if (Number.isFinite(id)) {
      const track = Boolean(p?.trackQuantity ?? false);
      const locs = Array.isArray(p?.locations) ? (p.locations as any[]) : [];
      const total = track
        ? locs.reduce((sum, l) => sum + Number(l?.qty ?? 0), 0)
        : 0;
      inventoryTotalByProductId.set(id, Number.isFinite(total) ? total : 0);
    }
  }

  const productsWithVariantCounts = (products as any[]).map((p) => ({
    ...p,
    variantsCount: variantCountByParentId.get(Number(p.id)) ?? 0
  })) as Product[];

  // Attach inventory totals/labels for UI display.
  const productsWithInventory = (productsWithVariantCounts as any[]).map((p) => {
    const id = Number(p.id);
    const variantsCount = Number(p?.variantsCount ?? 0);
    const isParentWithVariants = variantsCount > 0 && !Number.isFinite(Number(p?.parent_id));

    if (isParentWithVariants) {
      // Sum inventory across variant children.
      let variantsTotal = 0;
      for (const child of fakeProducts.records as any[]) {
        if (Number(child?.parent_id) === id) {
          variantsTotal += inventoryTotalByProductId.get(Number(child?.id)) ?? 0;
        }
      }
      return {
        ...p,
        inventoryTotal: variantsTotal,
        inventoryLabel: `${variantsTotal} in Stock for ${variantsCount} Variant${
          variantsCount === 1 ? '' : 's'
        }`
      };
    }

    const total = inventoryTotalByProductId.get(id) ?? 0;
    return {
      ...p,
      inventoryTotal: total,
      inventoryLabel: `${total} in Stock`
    };
  }) as Product[];

  return (
    <ProductTable
      data={productsWithInventory}
      totalItems={totalProducts}
      columns={columns}
    />
  );
}
