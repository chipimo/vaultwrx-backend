import { Product, ProductType } from '@api/models/Products/Product';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Retailer } from '@api/models/Users/Retailer';
import { Company } from '@api/models/Company/Company';
import { RetailerCategory } from '@api/models/Products/RetailerCategory';

/**
 * Maps `retailer_categories.key` values to the matching `Product.type` enum
 * value. Hardcoded because the two columns drifted independently:
 *   retailer_categories.key:  vaults, monuments, precasts, urns, cremation, ...
 *   Product.type:             vault,  monument,  bulk_precast, urn, cremation, ...
 * Fallback for unknown keys: passthrough (so future categories that share
 * the same name on both sides "just work").
 */
const CATEGORY_KEY_TO_PRODUCT_TYPE: Record<string, string> = {
  vaults: 'vault',
  caskets: 'casket',
  urns: 'urn',
  grave_digging: 'grave_digging',
  cremation: 'cremation',
  monuments: 'monument',
  precasts: 'bulk_precast',
};

@EntityRepository(Product)
export class ProductRepository extends RepositoryBase<Product> {
  /**
   * `extra` lets the controller pass scoped filters that came in as direct
   * query params (e.g. `?retailerCategoryId=<uuid>`). We bypass the project's
   * `RequestQueryParser` for these because the parser strips `filters[…]`
   * brackets in some configurations and returns an array shape that the
   * existing repo loops weren't written to handle.
   */
  public async getManyAndCount(
    resourceOptions?: any,
    companyId?: string,
    extra?: { retailerCategoryId?: string; type?: string; skip?: number; take?: number }
  ) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('product')
        .where('product.company_id = :companyId', { companyId })
        // Hide soft-deleted products. Hard delete isn't supported (see
        // ProductService.deleteOneById) so this is the only way deleted
        // products disappear from the listing.
        .andWhere('product.is_active = true');

      // Translate retailer_category_id → product type via the key map.
      if (extra?.retailerCategoryId) {
        const productType = await this.resolveProductTypeFromCategoryId(
          extra.retailerCategoryId
        );
        if (productType) {
          queryBuilder.andWhere('product.type = :type', { type: productType });
        } else {
          // Unknown category id: return no rows rather than silently
          // dropping the filter (which would leak every product to the user).
          queryBuilder.andWhere('1 = 0');
        }
      } else if (extra?.type) {
        queryBuilder.andWhere('product.type = :type', { type: extra.type });
      }

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        // Defensive: only iterate plain-object filters. The parser sometimes
        // returns an array shape that breaks `Object.keys` semantics here.
        if (filters && !Array.isArray(filters)) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`product.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`product.${sort.field}`, sort.order);
          });
        }
        if (pagination) {
          queryBuilder.skip(pagination.skip).take(pagination.take);
        }
      }

      // Direct skip/take from the controller wins over the parser's pagination.
      if (extra?.skip !== undefined) queryBuilder.skip(extra.skip);
      if (extra?.take !== undefined) queryBuilder.take(extra.take);

      const [items, count] = await queryBuilder.getManyAndCount();

      // Attach the price lists each product belongs to (via the
      // price_list_products junction). One grouped query so the products
      // table can render its Price Lists popover without an N+1 fetch.
      await this.attachPriceLists(items);

      return {
        total_data: count,
        rows: items,
      };
    }

    return await super.getManyAndCount(resourceOptions);
  }

  /**
   * For each row in `items`, attach a `priceLists` array of
   * `{ id, name, price, isDefault }` from the `price_list_products`
   * junction joined with `price_lists`. Mutates rows in place. Mirrors
   * ServiceExtraRepository / OrderExtraRepository attachPriceLists.
   *
   * Note: `price_list_products.product_id` is `varchar` while
   * `products.id` is `uuid` — we compare via text cast so the join works
   * across the type boundary the live schema currently has.
   */
  private async attachPriceLists(items: Product[]): Promise<void> {
    if (items.length === 0) return;
    const ids = items.map((i) => String(i.id));

    const rows: Array<{
      item_id: string;
      id: string;
      name: string;
      price: string;
      is_default: boolean;
    }> = await this.manager.query(
      `SELECT plp.product_id::text AS item_id,
              pl.id, pl.name, plp.price, pl.is_default
         FROM price_list_products plp
         JOIN price_lists pl ON pl.id = plp.price_list_id
        WHERE plp.product_id::text = ANY($1)
        ORDER BY pl.is_default DESC, pl.name ASC`,
      [ids]
    );

    const byItem = new Map<
      string,
      Array<{ id: string; name: string; price: number; isDefault: boolean }>
    >();
    for (const r of rows) {
      const arr = byItem.get(r.item_id) ?? [];
      arr.push({
        id: r.id,
        name: r.name,
        price: Number(r.price ?? 0),
        isDefault: Boolean(r.is_default),
      });
      byItem.set(r.item_id, arr);
    }

    for (const item of items) {
      (item as any).priceLists = byItem.get(String(item.id)) ?? [];
    }
  }

  /**
   * Look up a retailer category by id and return the matching `Product.type`
   * enum value (e.g. retailer_categories[key=vaults] → "vault"). Returns
   * undefined when the category id doesn't exist.
   */
  private async resolveProductTypeFromCategoryId(
    retailerCategoryId: string
  ): Promise<string | undefined> {
    const category = await this.manager.findOne(RetailerCategory, {
      where: { id: retailerCategoryId },
    });
    if (!category?.key) return undefined;
    return CATEGORY_KEY_TO_PRODUCT_TYPE[category.key] ?? category.key;
  }

  public async getOneById(id: string, resourceOptions?: any, companyId?: string) {
    if (companyId) {
      // Filter products by company using direct company_id
      const queryBuilder = this.createQueryBuilder('product')
        .where('product.id = :id', { id })
        .andWhere('product.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`product.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createProduct(data: object, companyId?: string) {
    let entity = new Product();

    Object.assign(entity, data);

    // Set company_id if provided
    if (companyId) {
      entity.companyId = companyId;

      // If retailerId is not provided, find the retailer for this company
      if (!entity.retailerId) {
        const company = await this.manager.findOne(Company, {
          where: { id: companyId },
        });
        if (company && company.retailer_id) {
          entity.retailerId = company.retailer_id;
        }
      } else {
        // If retailerId is provided, ensure the retailer belongs to that company
        const company = await this.manager.findOne(Company, {
          where: { id: companyId },
        });
        if (company && company.retailer_id !== entity.retailerId) {
          throw new Error('Retailer does not belong to the specified company');
        }
      }
    }

    const saved = await this.save(entity);

    // Auto-link the new product to the retailer's default price list with
    // its standard price. Mirrors the behavior already in place for
    // order-extras: every new product belongs to Master by default; users
    // can attach it to additional lists later via the price-list editor.
    if (saved.retailerId) {
      try {
        const master = await this.manager.query(
          `SELECT id FROM price_lists
            WHERE retailer_id = $1 AND is_default = true AND is_active = true
            LIMIT 1`,
          [saved.retailerId]
        );
        const masterId = master?.[0]?.id;
        const price = Number(saved.price ?? 0) || 0;
        if (masterId) {
          await this.manager.query(
            `INSERT INTO price_list_products (id, price_list_id, product_id, price, created_at, updated_at)
             VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW())`,
            [masterId, String(saved.id), price]
          );
        }
      } catch (err) {
        // Best-effort: a missing master list shouldn't block the create.
        // eslint-disable-next-line no-console
        console.warn('[ProductRepository] failed to auto-link to master price list', err);
      }
    }

    return saved;
  }

  public async updateProduct(product: Product, data: object) {
    Object.assign(product, data);

    return await product.save(data);
  }

  /**
   * Get products grouped by product type
   * Returns an object with product types as keys and arrays of products as values
   */
  public async getProductsGroupedByType(companyId?: string, resourceOptions?: any) {
    const queryBuilder = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.company', 'company')
      .leftJoinAndSelect('product.retailer', 'retailer')
      .where('product.is_active = :isActive', { isActive: true });

    if (companyId) {
      queryBuilder.andWhere('product.company_id = :companyId', { companyId });
    }

    // Apply additional filters if provided
    if (resourceOptions?.filters) {
      const { filters } = resourceOptions;
      Object.keys(filters).forEach((key) => {
        if (key !== 'type') { // Don't filter by type since we're grouping by it
          queryBuilder.andWhere(`product.${key} = :${key}`, { [key]: filters[key] });
        }
      });
    }

    // Apply sorting if provided
    if (resourceOptions?.sorts) {
      resourceOptions.sorts.forEach((sort: any) => {
        queryBuilder.addOrderBy(`product.${sort.field}`, sort.order);
      });
    }

    const products = await queryBuilder.getMany();

    // Group products by type
    const grouped: Record<string, Product[]> = {
      vaults: [],
      caskets: [],
      urns: [],
      grave_diggings: [],
      cremations: [],
      monuments: [],
      bulk_precasts: [],
    };

    products.forEach((product) => {
      if (product.type) {
        const typeKey = product.type.toLowerCase();
        // Map enum values to the keys we want in the response (plural forms)
        const keyMap: Record<string, string> = {
          vault: 'vaults',
          casket: 'caskets',
          urn: 'urns',
          grave_digging: 'grave_diggings',
          cremation: 'cremations',
          monument: 'monuments',
          bulk_precast: 'bulk_precasts',
        };

        const mappedKey = keyMap[typeKey] || typeKey;
        if (grouped[mappedKey]) {
          grouped[mappedKey].push(product);
        }
      }
    });

    return grouped;
  }
}

