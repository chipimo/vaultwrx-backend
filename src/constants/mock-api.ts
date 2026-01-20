////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { matchSorter } from 'match-sorter'; // For filtering

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

declare global {
  // eslint-disable-next-line no-var
  var __VW_FAKE_PRODUCTS_RECORDS: Product[] | undefined;
  // eslint-disable-next-line no-var
  var __VW_FAKE_PRODUCTS_INITIALIZED: boolean | undefined;
}

function getGlobalRecords(): Product[] {
  if (!globalThis.__VW_FAKE_PRODUCTS_RECORDS) {
    globalThis.__VW_FAKE_PRODUCTS_RECORDS = [];
  }
  return globalThis.__VW_FAKE_PRODUCTS_RECORDS;
}

// Define the shape of Product data
export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
  // Persisted product form details (so edit form doesn't lose data)
  status?: string;
  trackQuantity?: boolean;
  locations?: { id: string; name: string; qty: number }[];
  stockMax?: number;
  stockMin?: number;
  // Selected retailer price lists (store only those included)
  priceLists?: { id: string; name: string; price: number }[];
  // Optional fields to support variants as child "products"
  parent_id?: number;
  variant_label?: string;
};

// Mock product data store
export const fakeProducts = {
  // Holds the list of product objects (backed by a global singleton so API routes + pages share it)
  records: getGlobalRecords(),

  getNextId() {
    const maxId = this.records.reduce((max, p) => Math.max(max, p.id), 0);
    return maxId + 1;
  },

  createProduct(input: {
    name: string;
    category: string;
    description?: string;
    price: number;
    photo_url?: string;
    status?: string;
    trackQuantity?: boolean;
    locations?: { id: string; name: string; qty: number }[];
    stockMax?: number;
    stockMin?: number;
    priceLists?: { id: string; name: string; price: number }[];
    parent_id?: number;
    variant_label?: string;
  }) {
    const now = new Date().toISOString();
    const id = this.getNextId();
    const photo_url =
      input.photo_url ??
      `https://api.slingacademy.com/public/sample-products/${((id - 1) % 20) + 1}.png`;

    const product: Product = {
      id,
      name: input.name,
      category: input.category,
      description: input.description ?? '',
      price: input.price,
      photo_url,
      created_at: now,
      updated_at: now,
      status: input.status,
      trackQuantity: input.trackQuantity,
      locations: input.locations,
      stockMax: input.stockMax,
      stockMin: input.stockMin,
      priceLists: input.priceLists,
      parent_id: input.parent_id,
      variant_label: input.variant_label
    };

    this.records.unshift(product);
    return product;
  },

  deleteVariantsForParent(parentId: number) {
    const next = this.records.filter((p) => p.parent_id !== parentId);
    this.records.length = 0;
    this.records.push(...next);
  },

  deleteProduct(
    id: number
  ): { ok: true } | { ok: false; reason: 'not_found' | 'has_variants' } {
    const existing = this.records.find((p) => p.id === id);
    if (!existing) return { ok: false, reason: 'not_found' };

    const isParent = !existing.parent_id;

    // Business rule: you cannot delete a product that still has variants.
    // Variants must be deleted first.
    if (isParent && this.records.some((p) => p.parent_id === id)) {
      return { ok: false, reason: 'has_variants' };
    }

    const next = this.records.filter((p) => p.id !== id);

    this.records.length = 0;
    this.records.push(...next);
    return { ok: true };
  },

  updateProduct(
    id: number,
    input: Partial<
      Pick<
        Product,
        | 'name'
        | 'category'
        | 'description'
        | 'price'
        | 'photo_url'
        | 'status'
        | 'trackQuantity'
        | 'locations'
        | 'stockMax'
        | 'stockMin'
        | 'priceLists'
      >
    >
  ) {
    const idx = this.records.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const next: Product = {
      ...this.records[idx],
      ...input,
      updated_at: now
    };
    this.records[idx] = next;
    return next;
  },

  // Initialize with sample data
  initialize() {
    // Only initialize once per server process so "saved" products persist across requests
    if (globalThis.__VW_FAKE_PRODUCTS_INITIALIZED) return;
    globalThis.__VW_FAKE_PRODUCTS_INITIALIZED = true;

    // No seeding: show only user-created products.
    // Clear any prior seeded data from earlier versions on first init.
    this.records.length = 0;
  },

  // Get all products with optional category filtering and search
  async getAll({
    categories = [],
    search
  }: {
    categories?: string[];
    search?: string;
  }) {
    let products = [...this.records];

    // Filter products based on selected categories
    if (categories.length > 0) {
      products = products.filter((product) =>
        categories.includes(product.category)
      );
    }

    // Search functionality across multiple fields
    if (search) {
      products = matchSorter(products, search, {
        keys: ['name', 'description', 'category']
      });
    }

    return products;
  },

  // Get paginated results with optional category filtering and search
  async getProducts({
    page = 1,
    limit = 10,
    categories,
    search
  }: {
    page?: number;
    limit?: number;
    categories?: string;
    search?: string;
  }) {
    await delay(1000);
    const categoriesArray = categories ? categories.split('.') : [];
    const allProducts = await this.getAll({
      categories: categoriesArray,
      search
    });

    // NOTE: Temporarily disabled.
    // Business idea: If a product has variants, only show its variants in the list
    // (hide the parent row once it has children with parent_id == parent.id).
    //
    // const parentIdsWithVariants = new Set<number>();
    // for (const p of allProducts) {
    //   const parentId = Number((p as any)?.parent_id);
    //   if (Number.isFinite(parentId)) parentIdsWithVariants.add(parentId);
    // }
    //
    // const visibleProducts = allProducts.filter((p) => {
    //   const isVariant = Number.isFinite(Number((p as any)?.parent_id));
    //   if (isVariant) return true; // always show variants
    //   return !parentIdsWithVariants.has(p.id); // only show parent if it has no variants
    // });
    //
    // const totalProducts = visibleProducts.length;

    const totalProducts = allProducts.length;

    // Pagination logic
    const offset = (page - 1) * limit;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    // Mock current time
    const currentTime = new Date().toISOString();

    // Return paginated response
    return {
      success: true,
      time: currentTime,
      message: 'Sample data for testing and learning purposes',
      total_products: totalProducts,
      offset,
      limit,
      products: paginatedProducts
    };
  },

  // Get a specific product by its ID
  async getProductById(id: number) {
    await delay(1000); // Simulate a delay

    // Find the product by its ID
    const product = this.records.find((product) => product.id === id);

    if (!product) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }

    // Mock current time
    const currentTime = new Date().toISOString();

    return {
      success: true,
      time: currentTime,
      message: `Product with ID ${id} found`,
      product
    };
  }
};

// Initialize sample products
fakeProducts.initialize();
