import { apiRequest, ApiResponse, ApiClientError } from '@/lib/api-client';

export interface Product {
  id: string;
  name: string;
  photo_url?: string;
  description?: string;
  type?: string;
  [key: string]: any; // Allow additional product properties
}

export type ProductType =
  | 'vault'
  | 'casket'
  | 'urn'
  | 'grave_digging'
  | 'cremation'
  | 'monument'
  | 'bulk_precast';

export interface GetProductsParams {
  productType?: ProductType;
  filters?: Record<string, any>;
  sorts?: Array<{ field: string; order: 'ASC' | 'DESC' }>;
  pagination?: { skip: number; take: number };
  search?: string;
}

export interface GroupedProductsResponse {
  vaults: Product[];
  caskets: Product[];
  urns: Product[];
  grave_diggings: Product[];
  cremations: Product[];
  monuments: Product[];
  bulk_precasts: Product[];
}

// Map product types to response keys
const PRODUCT_TYPE_MAP: Record<ProductType, keyof GroupedProductsResponse> = {
  vault: 'vaults',
  casket: 'caskets',
  urn: 'urns',
  grave_digging: 'grave_diggings',
  cremation: 'cremations',
  monument: 'monuments',
  bulk_precast: 'bulk_precasts'
};

/**
 * Fetch products from the backend using grouped-by-type endpoint
 * @param params - Query parameters including productType, filters, sorts, pagination
 * @returns Promise with products data
 */
export async function getProducts(
  params?: GetProductsParams
): Promise<ApiResponse<{ rows: Product[] }>> {
  try {
    // Build query parameters for RequestQueryParser format
    const queryParams = new URLSearchParams();
    
    // Add filters if provided
    if (params?.filters) {
      Object.keys(params.filters).forEach((key) => {
        queryParams.append(`filters[${key}]`, params.filters![key]);
      });
    }
    
    // Add sorts if provided
    if (params?.sorts) {
      params.sorts.forEach((sort, index) => {
        queryParams.append(`sorts[${index}][field]`, sort.field);
        queryParams.append(`sorts[${index}][order]`, sort.order);
      });
    }
    
    // Add pagination if provided
    if (params?.pagination) {
      queryParams.append('pagination[skip]', params.pagination.skip.toString());
      queryParams.append('pagination[take]', params.pagination.take.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/products/grouped-by-type${queryString ? `?${queryString}` : ''}`;

    const response = await apiRequest<GroupedProductsResponse>(endpoint, {
      method: 'GET'
    });

    if (response.success && response.data) {
      // Extract products based on productType, or return all if no type specified
      let products: Product[] = [];
      
      if (params?.productType) {
        const responseKey = PRODUCT_TYPE_MAP[params.productType];
        products = response.data[responseKey] || [];
      } else {
        // If no productType specified, return all products flattened
        products = [
          ...(response.data.vaults || []),
          ...(response.data.caskets || []),
          ...(response.data.urns || []),
          ...(response.data.grave_diggings || []),
          ...(response.data.cremations || []),
          ...(response.data.monuments || []),
          ...(response.data.bulk_precasts || [])
        ];
      }

      return {
        data: {
          rows: products
        },
        success: true
      };
    }

    return {
      data: { rows: [] },
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError('Failed to fetch products'),
      success: false
    };
  }
}

/**
 * @deprecated Use getProducts({ productType: 'vault' }) instead
 * Fetch vaults from the backend
 */
export async function getVaults(
  params?: Omit<GetProductsParams, 'productType'>
): Promise<ApiResponse<{ rows: Product[] }>> {
  return getProducts({ ...params, productType: 'vault' });
}

// Export Product as Vault for backward compatibility
export type Vault = Product;

/**
 * Get a single vault by ID
 * @param vaultId - The vault ID
 * @returns Promise with vault data
 */
export async function getVaultById(
  vaultId: string
): Promise<ApiResponse<Vault>> {
  try {
    return await apiRequest<Vault>(`/api/products/${vaultId}`, {
      method: 'GET'
    });
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError('Failed to fetch vault'),
      success: false
    };
  }
}

// Product Option types
export interface ProductColor {
  id: string;
  name: string;
  hex_code?: string;
  is_active?: boolean;
}

export interface ProductEmblem {
  id: string;
  name: string;
  image_url?: string;
  category?: string;
  is_active?: boolean;
}

/**
 * Fetch available paint colors from the backend
 * @returns Promise with colors data
 */
export async function getColors(): Promise<ApiResponse<{ rows: ProductColor[] }>> {
  try {
    const response = await apiRequest<ProductColor[] | { rows: ProductColor[] }>('/api/colors', {
      method: 'GET'
    });

    if (response.success && response.data) {
      // Handle both array and object with rows
      const colors = Array.isArray(response.data) ? response.data : (response.data.rows || []);
      return {
        data: { rows: colors },
        success: true
      };
    }

    return {
      data: { rows: [] },
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError('Failed to fetch colors'),
      success: false
    };
  }
}

/**
 * Fetch available emblems from the backend
 * @returns Promise with emblems data
 */
export async function getEmblems(): Promise<ApiResponse<{ rows: ProductEmblem[] }>> {
  try {
    const response = await apiRequest<ProductEmblem[] | { rows: ProductEmblem[] }>('/api/emblems', {
      method: 'GET'
    });

    if (response.success && response.data) {
      // Handle both array and object with rows
      const emblems = Array.isArray(response.data) ? response.data : (response.data.rows || []);
      return {
        data: { rows: emblems },
        success: true
      };
    }

    return {
      data: { rows: [] },
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError('Failed to fetch emblems'),
      success: false
    };
  }
}

