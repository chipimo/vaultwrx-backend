import { OrderExtra } from '@api/models/Products/OrderExtra';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Company } from '@api/models/Company/Company';

@EntityRepository(OrderExtra)
export class OrderExtraRepository extends RepositoryBase<OrderExtra> {
  /**
   * Lists order-extra templates for the retailer that owns the given company.
   * `extra.categoryId` (when provided) filters by `order_extras.category_id`
   * — a direct FK to retailer_categories. The controller pulls this from
   * `?categoryId=<uuid>` directly to bypass the unreliable filters[…] parser.
   */
  public async getManyAndCount(
    resourceOptions?: any,
    companyId?: string,
    extra?: { categoryId?: string; skip?: number; take?: number }
  ) {
    const retailerId = companyId ? await this.resolveRetailerId(companyId) : undefined;

    if (retailerId) {
      const queryBuilder = this.createQueryBuilder('orderExtra')
        .where('orderExtra.retailer_id = :retailerId', { retailerId });

      if (extra?.categoryId) {
        queryBuilder.andWhere('orderExtra.category_id = :categoryId', {
          categoryId: extra.categoryId,
        });
      }

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters && !Array.isArray(filters)) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`orderExtra.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`orderExtra.${sort.field}`, sort.order);
          });
        }
        if (pagination) {
          queryBuilder.skip(pagination.skip).take(pagination.take);
        }
      }

      if (extra?.skip !== undefined) queryBuilder.skip(extra.skip);
      if (extra?.take !== undefined) queryBuilder.take(extra.take);

      const [items, count] = await queryBuilder.getManyAndCount();

      // Attach price-list links per row so the products-page popover can show
      // which lists each order-extra is in, plus its per-list price.
      await this.attachPriceLists(items);

      return { total_data: count, rows: items };
    }

    return await super.getManyAndCount(resourceOptions);
  }

  private async attachPriceLists(items: OrderExtra[]): Promise<void> {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id);
    const rows: Array<{
      item_id: string;
      id: string;
      name: string;
      price: string;
      is_default: boolean;
    }> = await this.manager.query(
      `SELECT ple.order_extra_id AS item_id,
              pl.id, pl.name, ple.price, pl.is_default
         FROM price_list_extras ple
         JOIN price_lists pl ON pl.id = ple.price_list_id
        WHERE ple.order_extra_id = ANY($1)
        ORDER BY pl.is_default DESC, pl.name ASC`,
      [ids]
    );

    const byItem = new Map<string, Array<{ id: string; name: string; price: number; isDefault: boolean }>>();
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
      (item as any).priceLists = byItem.get(item.id) ?? [];
    }
  }

  public async getOneById(id: string, _resourceOptions?: any, companyId?: string) {
    const retailerId = companyId ? await this.resolveRetailerId(companyId) : undefined;

    if (retailerId) {
      return await this.createQueryBuilder('orderExtra')
        .where('orderExtra.id = :id', { id })
        .andWhere('orderExtra.retailer_id = :retailerId', { retailerId })
        .getOne();
    }

    return await super.getOneById(id as any);
  }

  /**
   * Create an order-extra template for the active company's retailer, plus
   * the master-price-list link so the new extra shows its price in the
   * default list immediately.
   */
  public async createOrderExtra(
    data: { name: string; categoryId: string; description?: string; price: number; isActive?: boolean },
    companyId: string
  ): Promise<OrderExtra> {
    const retailerId = await this.resolveRetailerId(companyId);
    if (!retailerId) {
      throw new Error('Cannot resolve retailer id for the active company.');
    }

    const entity = new OrderExtra();
    entity.name = data.name;
    entity.categoryId = data.categoryId;
    entity.description = data.description ?? '';
    entity.isActive = data.isActive ?? true;
    entity.retailerId = retailerId;
    const saved = await this.save(entity);

    // Insert master-price-list link so the new extra carries its master price
    // in the price_list_extras junction. Best effort — skip silently if no
    // default list exists yet, the row is still usable.
    try {
      const master = await this.manager.query(
        `SELECT id FROM price_lists
          WHERE retailer_id = $1 AND is_default = true AND is_active = true
          LIMIT 1`,
        [retailerId]
      );
      const masterId = master?.[0]?.id;
      if (masterId) {
        await this.manager.query(
          `INSERT INTO price_list_extras (id, price_list_id, order_extra_id, price, created_at, updated_at)
           VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW())`,
          [masterId, saved.id, data.price]
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[OrderExtraRepository] failed to create master price-list link', err);
    }

    return saved;
  }

  private async resolveRetailerId(companyId: string): Promise<string | undefined> {
    const company = await this.manager.findOne(Company, { where: { id: companyId } });
    return company?.retailer_id;
  }
}
