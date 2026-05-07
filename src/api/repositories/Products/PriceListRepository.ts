import { PriceList } from '@api/models/Products/PriceList';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Company } from '@api/models/Company/Company';

@EntityRepository(PriceList)
export class PriceListRepository extends RepositoryBase<PriceList> {
  /**
   * List price lists for the retailer that owns the given company.
   * Each row is enriched with `itemsCount` derived from `price_list_products`
   * + `price_list_extras` so the products-page sidebar can show how many
   * entries each list contains without an extra round-trip.
   */
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    const retailerId = companyId ? await this.resolveRetailerId(companyId) : undefined;

    if (retailerId) {
      const queryBuilder = this.createQueryBuilder('priceList')
        .where('priceList.retailer_id = :retailerId', { retailerId });

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`priceList.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`priceList.${sort.field}`, sort.order);
          });
        }
        if (pagination) {
          queryBuilder.skip(pagination.skip).take(pagination.take);
        }
      }

      const [items, count] = await queryBuilder.getManyAndCount();

      // Compute itemsCount = (#products in list) + (#extras in list).
      // Done as a single grouped count query for both junction tables, then
      // merged in memory.
      const ids = items.map((p) => p.id);
      const counts = await this.computeItemsCounts(ids);

      // Attach itemsCount in-place so each row stays a real entity instance.
      for (const p of items) {
        (p as any).itemsCount = counts[p.id] ?? 0;
      }

      return {
        total_data: count,
        rows: items
      };
    }

    return await super.getManyAndCount(resourceOptions);
  }

  public async getOneById(id: string, _resourceOptions?: any, companyId?: string) {
    const retailerId = companyId ? await this.resolveRetailerId(companyId) : undefined;

    if (retailerId) {
      const queryBuilder = this.createQueryBuilder('priceList')
        .where('priceList.id = :id', { id })
        .andWhere('priceList.retailer_id = :retailerId', { retailerId });

      const row = await queryBuilder.getOne();
      if (!row) return undefined;

      // Attach the per-list product + extra rows so the edit form can
      // pre-populate selections and prices without a second fetch.
      const items = await this.manager.query(
        `SELECT plp.product_id::text AS "productId", plp.price::float AS price, p.name
           FROM price_list_products plp
           LEFT JOIN products p ON p.id::text = plp.product_id
          WHERE plp.price_list_id = $1
          ORDER BY p.name NULLS LAST`,
        [row.id]
      );
      const extras = await this.manager.query(
        `SELECT ple.service_extra_id::text AS "serviceExtraId",
                ple.order_extra_id::text   AS "orderExtraId",
                ple.price::float           AS price,
                COALESCE(se.name, oe.name) AS name
           FROM price_list_extras ple
           LEFT JOIN service_extras se ON se.id = ple.service_extra_id
           LEFT JOIN order_extras oe   ON oe.id = ple.order_extra_id
          WHERE ple.price_list_id = $1
          ORDER BY name NULLS LAST`,
        [row.id]
      );

      (row as any).items = items;
      (row as any).extras = extras;
      (row as any).itemsCount = (items?.length ?? 0) + (extras?.length ?? 0);
      return row;
    }

    return await super.getOneById(id as any);
  }

  public async createPriceList(
    data: {
      name: string;
      description?: string;
      isDefault?: boolean;
      isActive?: boolean;
      items?: Array<{ productId: string; price: number }>;
      extras?: Array<{ serviceExtraId?: string; orderExtraId?: string; price: number }>;
    },
    companyId?: string
  ) {
    const retailerId = companyId ? await this.resolveRetailerId(companyId) : undefined;
    if (!retailerId) {
      throw new Error('Cannot resolve retailer id for the active company.');
    }

    const entity = new PriceList();
    entity.name = data.name;
    entity.isDefault = Boolean(data.isDefault);
    entity.isActive = data.isActive ?? true;
    entity.retailerId = retailerId;

    if (entity.isDefault) {
      await this.createQueryBuilder()
        .update(PriceList)
        .set({ isDefault: false })
        .where('retailer_id = :retailerId AND is_default = true', { retailerId })
        .execute();
    }

    const saved = await this.save(entity);

    // Insert linked items + extras after the parent row is saved. Best-effort
    // (logged) so a partial failure here doesn't drop the price-list row.
    if (data.items && data.items.length > 0) {
      try {
        for (const i of data.items) {
          if (!i?.productId) continue;
          await this.manager.query(
            `INSERT INTO price_list_products (id, price_list_id, product_id, price, created_at, updated_at)
             VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW())`,
            [saved.id, String(i.productId), Number(i.price ?? 0)]
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[PriceListRepository] failed to insert price_list_products', err);
      }
    }

    if (data.extras && data.extras.length > 0) {
      try {
        for (const e of data.extras) {
          if (!e || (!e.serviceExtraId && !e.orderExtraId)) continue;
          await this.manager.query(
            `INSERT INTO price_list_extras (id, price_list_id, service_extra_id, order_extra_id, price, created_at, updated_at)
             VALUES (uuid_generate_v4(), $1, $2, $3, $4, NOW(), NOW())`,
            [saved.id, e.serviceExtraId ?? null, e.orderExtraId ?? null, Number(e.price ?? 0)]
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[PriceListRepository] failed to insert price_list_extras', err);
      }
    }

    return saved;
  }

  public async updatePriceList(
    priceList: PriceList,
    data: {
      name?: string;
      description?: string;
      isDefault?: boolean;
      isActive?: boolean;
      items?: Array<{ productId: string; price: number }>;
      extras?: Array<{ serviceExtraId?: string; orderExtraId?: string; price: number }>;
    }
  ) {
    if (data.name !== undefined) priceList.name = data.name;
    if (data.isDefault !== undefined) priceList.isDefault = data.isDefault;
    if (data.isActive !== undefined) priceList.isActive = data.isActive;

    if (data.isDefault === true && priceList.retailerId) {
      await this.createQueryBuilder()
        .update(PriceList)
        .set({ isDefault: false })
        .where('retailer_id = :retailerId AND id != :id AND is_default = true', {
          retailerId: priceList.retailerId,
          id: priceList.id
        })
        .execute();
    }

    const saved = await priceList.save();

    // Replace-all semantics for items + extras: caller sends the full
    // desired set, we drop the existing rows and reinsert. Simpler than a
    // diff and safe because both junction tables only have `price` payload.
    if (data.items !== undefined) {
      try {
        await this.manager.query(
          `DELETE FROM price_list_products WHERE price_list_id = $1`,
          [saved.id]
        );
        for (const i of data.items) {
          if (!i?.productId) continue;
          await this.manager.query(
            `INSERT INTO price_list_products (id, price_list_id, product_id, price, created_at, updated_at)
             VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW())`,
            [saved.id, String(i.productId), Number(i.price ?? 0)]
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[PriceListRepository] failed to update price_list_products', err);
      }
    }

    if (data.extras !== undefined) {
      try {
        await this.manager.query(
          `DELETE FROM price_list_extras WHERE price_list_id = $1`,
          [saved.id]
        );
        for (const e of data.extras) {
          if (!e || (!e.serviceExtraId && !e.orderExtraId)) continue;
          await this.manager.query(
            `INSERT INTO price_list_extras (id, price_list_id, service_extra_id, order_extra_id, price, created_at, updated_at)
             VALUES (uuid_generate_v4(), $1, $2, $3, $4, NOW(), NOW())`,
            [saved.id, e.serviceExtraId ?? null, e.orderExtraId ?? null, Number(e.price ?? 0)]
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[PriceListRepository] failed to update price_list_extras', err);
      }
    }

    return saved;
  }

  /** Look up the retailer id that owns a given company. */
  private async resolveRetailerId(companyId: string): Promise<string | undefined> {
    const company = await this.manager.findOne(Company, { where: { id: companyId } });
    return company?.retailer_id;
  }

  /**
   * Returns a map of priceListId -> total item count, summing rows from
   * `price_list_products` and `price_list_extras`. Empty input returns {}.
   */
  private async computeItemsCounts(
    priceListIds: string[]
  ): Promise<Record<string, number>> {
    if (priceListIds.length === 0) return {};

    const [productCounts, extraCounts] = await Promise.all([
      this.manager.query(
        `SELECT price_list_id::text AS id, COUNT(*)::int AS c
         FROM price_list_products WHERE price_list_id = ANY($1) GROUP BY price_list_id`,
        [priceListIds]
      ),
      this.manager.query(
        `SELECT price_list_id::text AS id, COUNT(*)::int AS c
         FROM price_list_extras WHERE price_list_id = ANY($1) GROUP BY price_list_id`,
        [priceListIds]
      )
    ]);

    const result: Record<string, number> = {};
    for (const row of [...productCounts, ...extraCounts]) {
      result[row.id] = (result[row.id] ?? 0) + Number(row.c ?? 0);
    }
    return result;
  }
}
